/* Add Beneficiary wizard — keep top-level names prefixed to avoid
   clashing with app.js script-scope bindings (e.g. `dots`). */

const abState = {
  step: "corridor",
  type: null,
  channel: null,
  agent: null,
  upiId: "",
  visaCard: "",
  otpDest: "mobile",
  otpSeconds: 240,
  otpVerified: false,
  detailsExtra: false,
};

const AB_ACC_ORDER = ["corridor", "channel", "visa", "bank", "details"];

const AB_CHANNEL_LABELS = {
  bank: "abChannelBank",
  cash: "abChannelCash",
  visa: "abChannelVisa",
  upi: "abChannelUpi",
};

const AB_CASH_AGENTS = {
  transfast: { name: "Transfast", mark: "TF", markClass: "ab-agent__mark--tf" },
  "western-union": { name: "Western Union", mark: "WU", markClass: "ab-agent__mark--wu" },
};

let abOtpTimer = null;
let abCashWaitTimer = null;
const abUnlocked = new Set();
let abOpen = null;
const abDone = new Set();

const abPanels = [...document.querySelectorAll("[data-ab-step]")];
const abTitleEl = document.getElementById("abTitle");
const abBackEl = document.getElementById("abBack");
const abOtpInputs = [...document.querySelectorAll("#abOtpInputs input")];
const abOtpSingle = document.getElementById("abOtpSingle");
const abOtpClock = document.getElementById("abOtpClock");
const abOtpResend = document.getElementById("abOtpResend");
const abOtpSubmit = document.getElementById("abOtpSubmit");
const abFooterSubmit = document.getElementById("abFooterSubmit");

function abCopy() {
  return (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};
}

function abT(key, fallback) {
  return abCopy()[key] || fallback || key;
}

function abFmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function abPanel(step) {
  return document.querySelector(`[data-ab-step="${step}"]`);
}

function abAccItem(key) {
  return document.querySelector(`[data-ab-acc="${key}"]`);
}

function abScrollParent() {
  return document.querySelector(".page-add-bene .ab-page") || document.scrollingElement || document.documentElement;
}

/** Scroll a field / section into the comfortable upper area of the page scroller. */
function abScrollElIntoView(target, { bias = 0.22 } = {}) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;
  if (el.closest?.(".ab-sheet, .ab-picker, .ab-modal")) return;
  const scroller = abScrollParent();
  const sticky = document.querySelector(".page-add-bene .ab-head");
  const stickyH = sticky ? sticky.getBoundingClientRect().height : 0;
  const sRect = scroller.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const idealTop = sRect.top + stickyH + 12 + Math.max(0, sRect.height * bias - stickyH);
  const delta = eRect.top - idealTop;
  if (Math.abs(delta) < 18) return;
  scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + delta), behavior: "smooth" });
}

/** Focus a control (or its custom dropdown trigger) and scroll it into view. */
function abFocusField(target, { delay = 0, bias = 0.22 } = {}) {
  const run = () => {
    let el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) return;
    if (el.hidden || el.closest?.("[hidden]")) return;
    if (el.disabled) return;

    const field = el.closest?.(".field") || null;
    const focusEl =
      (el.tagName === "SELECT" && field?.querySelector(".ab-dd-trigger")) ||
      (el.matches?.("input, select, textarea, button, .ab-dd-trigger") ? el : null) ||
      field?.querySelector(".ab-dd-trigger, input, select, textarea, button");
    if (!focusEl || focusEl.disabled) return;

    const scrollTarget = field || focusEl;
    abScrollElIntoView(scrollTarget, { bias });
    try {
      focusEl.focus({ preventScroll: true });
    } catch {
      focusEl.focus();
    }
  };

  if (delay > 0) {
    if (abMotionOk() && typeof gsap !== "undefined") gsap.delayedCall(delay, run);
    else setTimeout(run, Math.round(delay * 1000));
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(run));
}

const AB_FIELD_FLOW = [
  "abIfsc",
  "abAccount",
  "abAccountRe",
  "abGiven",
  "abLast",
  "abNationality",
  "abRelationship",
  "abPrefix",
  "abMobile",
];

function abFieldVisible(el) {
  if (!el || el.disabled) return false;
  if (el.hidden) return false;
  const host = el.closest(".field, .ab-bank-rest, .ab-details-extra, .ab-acc__body, [data-ab-step]");
  if (host?.hidden) return false;
  if (el.closest("[hidden]")) return false;
  return true;
}

function abNextFieldId(currentId) {
  const idx = AB_FIELD_FLOW.indexOf(currentId);
  if (idx < 0) return null;
  for (let i = idx + 1; i < AB_FIELD_FLOW.length; i += 1) {
    const id = AB_FIELD_FLOW[i];
    const el = document.getElementById(id);
    if (!abFieldVisible(el)) continue;
    /* Prefix already defaults to +91 — jump to mobile number */
    if (id === "abPrefix" && String(el.value || "").trim()) continue;
    /* Nationality is optional — still land there first; user can skip via Tab */
    return id;
  }
  return null;
}

function abFocusNextField(currentId, opts = {}) {
  const nextId = abNextFieldId(currentId);
  if (!nextId) return false;
  abFocusField(nextId, opts);
  return true;
}

function abMotionOk() {
  return (
    typeof gsap !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function abAnimateHeight(el, open, { duration = 0.34 } = {}) {
  if (!el) return;
  if (!abMotionOk()) {
    el.hidden = !open;
    el.classList.remove("is-animating");
    el.style.height = "";
    el.style.opacity = "";
    el.style.overflow = "";
    return;
  }
  gsap.killTweensOf(el);
  if (open) {
    el.hidden = false;
    el.classList.add("is-animating");
    el.style.overflow = "hidden";
    el.style.height = "0px";
    el.style.opacity = "0";
    const target = el.scrollHeight;
    gsap.to(el, {
      height: target,
      opacity: 1,
      duration,
      ease: "power2.out",
      onComplete: () => {
        el.style.height = "";
        el.style.opacity = "";
        el.style.overflow = "";
        el.classList.remove("is-animating");
      },
    });
  } else {
    el.hidden = false;
    el.classList.add("is-animating");
    el.style.overflow = "hidden";
    const current = el.scrollHeight;
    gsap.fromTo(
      el,
      { height: current, opacity: 1 },
      {
        height: 0,
        opacity: 0,
        duration: Math.max(0.22, duration - 0.06),
        ease: "power2.in",
        onComplete: () => {
          el.hidden = true;
          el.style.height = "";
          el.style.opacity = "";
          el.style.overflow = "";
          el.classList.remove("is-animating");
        },
      }
    );
  }
}

function abRevealBlock(el) {
  if (!el) return;
  if (!el.hidden && !el.classList.contains("is-animating")) return;
  abAnimateHeight(el, true, { duration: 0.32 });
}

function abGoBeneficiaries() {
  if (typeof ameNavigate === "function") ameNavigate("beneficiaries.html");
  else location.href = "beneficiaries.html";
}

function abIsCash() {
  return abState.channel === "cash";
}

function abIsVisa() {
  return abState.channel === "visa";
}

function abIsUpi() {
  return abState.channel === "upi";
}

function abCashAgentMeta() {
  return AB_CASH_AGENTS[abState.agent] || AB_CASH_AGENTS["western-union"];
}

function abPaintCashAgentBlock() {
  const block = document.getElementById("abCashAgentBlock");
  if (!block) return;
  const show = abState.type === "individual" && abState.channel === "cash";
  block.hidden = !show;
  if (!show) {
    abState.agent = null;
    document.querySelectorAll("[data-ab-agent]").forEach((b) => {
      b.classList.remove("is-on");
      b.setAttribute("aria-selected", "false");
    });
  }
  abPaintVisaCardBlock();
}

function abClearVisaCardInputs() {
  ["abVisaCard", "abVisaCardRe"].forEach((prefix) => {
    abVisaCardParts(prefix).forEach((el) => {
      if (el) el.value = "";
    });
  });
  abState.visaCard = "";
  abSyncVisaCardNext();
}

function abPaintVisaCardBlock() {
  if (!(abState.type === "individual" && abIsVisa())) {
    abClearVisaCardInputs();
  }
}

function abVisaCardParts(prefix) {
  return [1, 2, 3, 4].map((n) => document.getElementById(`${prefix}${n}`));
}

function abVisaCardValue(prefix) {
  return abVisaCardParts(prefix)
    .map((el) => (el?.value || "").replace(/\D/g, ""))
    .join("");
}

function abSyncVisaCardNext() {
  const btn = document.getElementById("abVisaCardNext");
  const a = abVisaCardValue("abVisaCard");
  const b = abVisaCardValue("abVisaCardRe");
  if (btn) btn.disabled = !(a.length === 16 && b.length === 16);
}

function abWireVisaCardInputs(prefix) {
  const parts = abVisaCardParts(prefix);
  parts.forEach((input, i) => {
    if (!input || input.dataset.abVisaWired) return;
    input.dataset.abVisaWired = "1";
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 4);
      if (input.value.length === 4 && parts[i + 1]) parts[i + 1].focus();
      abSyncVisaCardNext();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && parts[i - 1]) {
        parts[i - 1].focus();
      }
    });
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 16);
      [...text].forEach((ch, n) => {
        if (parts[n]) parts[n].value = (parts[n].value + ch).slice(0, 4);
      });
      const fill = Math.min(Math.ceil(text.length / 4), 4) - 1;
      parts[Math.max(0, fill)]?.focus();
      abSyncVisaCardNext();
    });
  });
}

function abOpenVisaBlockSheet() {
  abOpenSheetEl(document.getElementById("abVisaBlockSheet"));
}

function abCloseVisaBlockSheet() {
  abCloseSheetEl(document.getElementById("abVisaBlockSheet"));
}

function abGoVisaDetails() {
  if (!abValidateChannel()) return false;
  const a = abVisaCardValue("abVisaCard");
  const b = abVisaCardValue("abVisaCardRe");
  if (a.length !== 16 || b.length !== 16) {
    abToast(abT("abNeedVisaCard", "Enter the full 16-digit Visa debit card number twice."), "error");
    return false;
  }
  if (a !== b) {
    abToast(abT("abVisaCardMismatch", "Visa card numbers do not match."), "error");
    return false;
  }
  // Demo blocked series (e.g. 1234…) — show info sheet from screenshots
  if (a.startsWith("1234")) {
    abOpenVisaBlockSheet();
    return false;
  }
  abState.visaCard = a;
  abDone.add("channel");
  abDone.add("visa");
  abUnlocked.add("details");
  abPaintBankAccVisibility();
  abPaintCashProviderBar();
  abPaintSums();
  abOpenAcc("details");
  return true;
}

function abPaintCashProviderBar() {
  const bar = document.getElementById("abCashProviderBar");
  const hint = document.getElementById("abNameHintText");
  const mark = document.getElementById("abCashProviderMark");
  const name = document.getElementById("abCashProviderName");
  const cash = abIsCash() && abState.agent;
  const visa = abIsVisa() && abState.visaCard;
  if (bar) bar.hidden = !cash;
  if (cash) {
    const meta = abCashAgentMeta();
    if (mark) {
      mark.textContent = meta.mark;
      mark.className = `ab-cash-provider__mark ${meta.markClass}`;
    }
    if (name) name.textContent = meta.name;
    if (hint) {
      hint.removeAttribute("data-i18n");
      hint.textContent = abT(
        "abCashNameHint",
        "Please enter the beneficiary's full name exactly as it appears on their government issued ID cards. Any mismatch may result in delay in receiving the cash payout."
      );
    }
  } else if (visa) {
    if (hint) {
      hint.removeAttribute("data-i18n");
      hint.textContent = abT(
        "abVisaNameHint",
        "Please enter the beneficiary name exactly as it appears on their Visa Debit Card."
      );
    }
  } else if (hint) {
    hint.setAttribute("data-i18n", "abNameHint");
    hint.textContent = abT(
      "abNameHint",
      "Please enter the beneficiary's full name in English, exactly as registered on their ID in the beneficiary country."
    );
  }
  abPaintDetailsLayout();
}

function abPaintDetailsLayout() {
  const cash = abIsCash();
  const visa = abIsVisa();
  const nameActions = document.getElementById("abNameActions");
  const extra = document.getElementById("abDetailsExtra");
  const lastField = document.getElementById("abLastField");
  const nameRow = document.getElementById("abNameRow");
  const givenLabel = document.getElementById("abGivenLabel");
  if (!extra) return;

  if (cash || visa) {
    if (nameActions) nameActions.hidden = true;
    extra.hidden = false;
    abState.detailsExtra = true;
  } else {
    if (nameActions) nameActions.hidden = !!abState.detailsExtra;
    extra.hidden = !abState.detailsExtra;
  }

  if (lastField) lastField.hidden = visa;
  if (nameRow) nameRow.classList.toggle("ab-field-row--visa-name", visa);
  if (givenLabel) {
    if (visa) {
      givenLabel.removeAttribute("data-i18n");
      givenLabel.textContent = abT("abVisaBeneName", "Enter Beneficiary Name");
    } else {
      givenLabel.setAttribute("data-i18n", "abGivenName");
      givenLabel.textContent = abT(
        "abGivenName",
        "Enter Beneficiary Given Names Without Last Name"
      );
    }
  }
  abSyncActionButtons();
}

function abFinishDetailsToOverview() {
  abDone.add("details");
  abOpen = null;
  abPaintAcc();
  abShowOverview();
}

function abFinishDetailsToOtp() {
  abDone.add("details");
  abOpen = null;
  abPaintAcc();
  abOpenOtpDestModal();
}

function abFinishDetailsOrCashSheets() {
  if (!abValidateDetailsMobile()) return;
  // Both cash and bank: review overview first, then OTP from overview Submit.
  abFinishDetailsToOverview();
}

function abResetDownstreamFromChannel() {
  abUnlocked.delete("visa");
  abUnlocked.delete("bank");
  abUnlocked.delete("details");
  abDone.delete("visa");
  abDone.delete("bank");
  abDone.delete("channel");
  abDone.delete("details");
  abState.detailsExtra = false;
  abState.agent = null;
  abState.upiId = "";
  abClearVisaCardInputs();
  if (abOpen === "visa" || abOpen === "bank" || abOpen === "details") abOpen = "channel";
}

function abPaintBankAccVisibility() {
  const visaItem = abAccItem("visa");
  const bankItem = abAccItem("bank");
  const detailsItem = abAccItem("details");
  const ch = abState.channel;
  const showVisa = ch === "visa" && abUnlocked.has("visa");
  const showBank = ch === "bank" && abUnlocked.has("bank");
  const showDetails =
    (ch === "bank" || ch === "cash" || ch === "visa") && abUnlocked.has("details");

  if (visaItem) visaItem.hidden = !showVisa;
  if (bankItem) bankItem.hidden = !showBank;
  if (detailsItem) detailsItem.hidden = !showDetails;

  if (!showVisa && abOpen === "visa") abOpen = "channel";
  if (!showBank && abOpen === "bank") abOpen = showVisa ? "visa" : "channel";
  if (!showDetails && abOpen === "details") {
    abOpen = showBank ? "bank" : showVisa ? "visa" : "channel";
  }
}

function abGoCashDetails() {
  if (!abValidateChannel()) return false;
  if (!abState.agent) {
    abToast(abT("abNeedCashAgent", "Please select a cash payout agent."), "error");
    return false;
  }
  abDone.add("channel");
  abDone.add("bank");
  abUnlocked.add("details");
  abPaintBankAccVisibility();
  abPaintCashProviderBar();
  abPaintSums();
  abOpenAcc("details");
  return true;
}

function abOpenCashExtraSheet() {
  const phone = document.getElementById("abBenePhone");
  const mobile = document.getElementById("abMobile")?.value.trim() || "";
  if (phone && !phone.value.trim() && mobile) {
    phone.value = mobile;
    phone.closest(".field")?.classList.add("has-value");
  }
  abOpenSheetEl(document.getElementById("abCashExtraSheet"));
}

function abCloseCashExtraSheet() {
  abCloseSheetEl(document.getElementById("abCashExtraSheet"));
}

function abOpenCashPromoSheet() {
  abCloseCashExtraSheet();
  window.setTimeout(() => abOpenSheetEl(document.getElementById("abCashPromoSheet")), 180);
}

function abCloseCashPromoSheet() {
  abCloseSheetEl(document.getElementById("abCashPromoSheet"));
}

function abSyncUpiVerify() {
  const btn = document.getElementById("abUpiVerify");
  const val = document.getElementById("abUpiId")?.value.trim() || "";
  if (btn) btn.disabled = !val;
}

function abOpenUpiSheet() {
  const input = document.getElementById("abUpiId");
  if (input && abState.upiId) {
    input.value = abState.upiId;
    input.closest(".field")?.classList.add("has-value");
  }
  abSyncUpiVerify();
  abOpenSheetEl(document.getElementById("abUpiSheet"));
  requestAnimationFrame(() => input?.focus());
}

function abCloseUpiSheet() {
  abCloseSheetEl(document.getElementById("abUpiSheet"));
}

function abAppendUpiHandle(handle) {
  const input = document.getElementById("abUpiId");
  if (!input || !handle) return;
  let val = input.value.trim();
  const at = val.indexOf("@");
  if (at >= 0) val = val.slice(0, at);
  input.value = `${val}${handle}`;
  input.closest(".field")?.classList.add("has-value");
  abSyncUpiVerify();
  input.focus();
}

function abGoUpiDetails() {
  if (!abValidateChannel()) return false;
  const upi = document.getElementById("abUpiId")?.value.trim() || "";
  if (!upi) {
    abToast(abT("abNeedUpi", "Please enter UPI ID."), "error");
    return false;
  }
  if (!upi.includes("@") || upi.startsWith("@") || upi.endsWith("@")) {
    abToast(abT("abInvalidUpi", "Enter a valid UPI ID (e.g. name@bank)."), "error");
    return false;
  }
  abState.upiId = upi;
  abCloseUpiSheet();
  abToast(abT("abUpiSaved", "UPI ID verified and saved."), "success");
  window.setTimeout(() => abGoBeneficiaries(), 180);
  return true;
}

function abStopThanksTimer() {
  if (abCashWaitTimer) clearInterval(abCashWaitTimer);
  abCashWaitTimer = null;
}

function abStartThanksTimer() {
  abStopThanksTimer();
  const wrap = document.getElementById("abThanksTimer");
  const clock = document.getElementById("abThanksClock");
  const arc = document.getElementById("abThanksArc");
  const ok = document.getElementById("abThanksOk");
  const check = document.querySelector(".ab-thanks__check");
  if (wrap) wrap.hidden = false;
  if (check) check.hidden = true;
  if (ok) ok.disabled = true;
  let left = 60;
  const circ = 2 * Math.PI * 54;
  const tick = () => {
    if (clock) clock.textContent = abFmtTime(left);
    if (arc) arc.setAttribute("stroke-dashoffset", String(circ * (1 - left / 60)));
    if (left <= 0) {
      abStopThanksTimer();
      if (ok) ok.disabled = false;
      return;
    }
    left -= 1;
  };
  tick();
  abCashWaitTimer = setInterval(tick, 1000);
}

function abOpenCashWaitModal() {
  // Popup timer removed — cash wait runs on the thank-you page instead.
  abShowThanks();
}

function abShowThanks() {
  abState.step = "thanks";
  abOpen = null;
  if (abTitleEl) {
    abTitleEl.textContent = "";
    abTitleEl.hidden = true;
  }
  if (abBackEl) abBackEl.hidden = true;

  const copy = document.getElementById("abThanksCopy");
  if (abIsCash()) {
    if (copy) {
      copy.removeAttribute("data-i18n");
      copy.textContent = abT(
        "abCashWaitBody",
        "Your beneficiary has been successfully created. You can remit money to this beneficiary after 1 minutes. You can transfer up to KWD 30,000 per day."
      );
    }
  } else if (copy) {
    copy.setAttribute("data-i18n", "abThankYouDesc");
    copy.textContent = abT(
      "abThankYouDesc",
      "Your new beneficiary has been successfully created. You can remit money to this beneficiary after 1 minute(s). For safety reasons, there is a limit of KWD 30,000 for your first bank account transfer to this beneficiary. Once the amount is credited, the limit will be removed and you can remit upto KWD 10,000."
    );
  }

  abStartThanksTimer();

  abShowStep("thanks");
  const scroller = abScrollParent();
  scroller.scrollTo({ top: 0, behavior: "smooth" });
  if (!abMotionOk()) return;
  const thanks = document.querySelector(".ab-thanks");
  if (!thanks) return;
  gsap.fromTo(
    [...thanks.children].filter((el) => !el.hidden),
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.12,
      clearProps: "opacity,y",
    }
  );
}

function abPaintSums() {
  const country =
    document.querySelector("#abCountryBtn .field__country")?.textContent?.trim() || "India";
  const currencyRaw =
    document.querySelector("#abCurrencyBtn .field__country")?.textContent?.trim() || "INR";
  const currency = (currencyRaw.split(/[—\-]/)[0].trim() || "INR").toUpperCase();
  const flagSrc =
    document.querySelector("#abCountryBtn .field__flag")?.getAttribute("src") ||
    "https://flagcdn.com/w40/in.png";

  const corridorSumText = document.getElementById("abAccCorridorSumText");
  const corridorFlag = document.getElementById("abAccCorridorFlag");
  const corridorSum = document.getElementById("abAccCorridorSum");
  if (corridorSumText) {
    corridorSumText.textContent = `${String(country).toUpperCase()} - ${currency}`;
  } else if (corridorSum) {
    corridorSum.textContent = `${String(country).toUpperCase()} - ${currency}`;
  }
  if (corridorFlag) corridorFlag.src = flagSrc;

  const channelSum = document.getElementById("abAccChannelSum");
  if (channelSum) {
    if (abDone.has("channel") && abState.type && abState.channel) {
      const typeLabel = abTitleCaseWords(
        abState.type === "individual"
          ? abT("abIndividual", "Individual")
          : abT("abNonIndividual", "Non-individual")
      );
      const channelLabel = abTitleCaseWords(
        abT(AB_CHANNEL_LABELS[abState.channel], abState.channel)
      );
      if (abIsCash() && abState.agent) {
        channelSum.textContent = `${typeLabel} - ${channelLabel} · ${abCashAgentMeta().name}`;
      } else if (abIsUpi() && abState.upiId) {
        channelSum.textContent = `${typeLabel} - ${channelLabel} · ${abState.upiId}`;
      } else {
        channelSum.textContent = `${typeLabel} - ${channelLabel}`;
      }
      channelSum.removeAttribute("data-i18n");
    } else if (!abDone.has("channel")) {
      channelSum.textContent = abT("abAccChannelSub", "Select beneficiary type and transfer method.");
    }
  }

  const visaSum = document.getElementById("abAccVisaSum");
  if (visaSum) {
    if (abDone.has("visa") && abState.visaCard) {
      visaSum.textContent = `****${abState.visaCard.slice(-4)}`;
      visaSum.removeAttribute("data-i18n");
    } else {
      visaSum.textContent = abT("abAccVisaSub", "Enter and confirm the Visa debit card number.");
    }
  }

  const bankSum = document.getElementById("abAccBankSum");
  if (bankSum) {
    if (abDone.has("bank")) {
      const bankRaw = document.getElementById("abBank")?.value || "—";
      const bank =
        abBranchSheetState.bankLabel ||
        abFormatBankLabel(abBranchSheetState.bank, bankRaw) ||
        abTitleCaseWords(bankRaw);
      const ifsc = String(document.getElementById("abIfsc")?.value || "—").toUpperCase();
      const account =
        document.getElementById("abAccountRe")?.value ||
        document.getElementById("abAccount")?.value ||
        "—";
      const branchRaw = document.getElementById("abBranch")?.value || "—";
      const branch =
        (abBranchSheetState.branch && abBranchDisplay(abBranchSheetState.branch)) ||
        abTitleCaseWords(branchRaw);
      bankSum.textContent =
        abT("abBankSumPrefix", "Your bank branch details are:") +
        ` Bank: ${bank} IFSC/Swift code: ${ifsc} Account number: ${account} Branch: ${branch}`;
      bankSum.removeAttribute("data-i18n");
    } else {
      bankSum.textContent = abT("abAccBankSub", "Enter beneficiary bank information.");
    }
  }

  const detailsSum = document.getElementById("abAccDetailsSum");
  if (detailsSum) {
    if (abDone.has("details")) {
      const given = abTitleCaseWords(document.getElementById("abGiven")?.value.trim() || "");
      const last = abTitleCaseWords(document.getElementById("abLast")?.value.trim() || "");
      detailsSum.textContent = `${given} ${last}`.trim() || "—";
      detailsSum.removeAttribute("data-i18n");
    } else {
      detailsSum.textContent = abT("abAccDetailsSub", "Provide beneficiary's personal information.");
    }
  }

  if (abFooterSubmit) {
    abFooterSubmit.disabled = !(abState.detailsExtra && abCanUpdateMobile());
  }
}

function abPaintAcc() {
  AB_ACC_ORDER.forEach((key) => {
    const item = abAccItem(key);
    if (!item) return;
    const unlocked = abUnlocked.has(key);
    const open = abOpen === key;
    const wasOpen = item.classList.contains("is-open");
    item.classList.toggle("is-pending", !unlocked);
    item.classList.toggle("is-open", open);
    item.classList.toggle("is-done", abDone.has(key));
    const head = item.querySelector(".ab-acc__head");
    const body = item.querySelector(".ab-acc__body");
    if (head) head.setAttribute("aria-expanded", open ? "true" : "false");
    if (!body) return;
    if (open === wasOpen && !body.classList.contains("is-animating")) {
      body.hidden = !open;
      return;
    }
    if (open && !wasOpen) abAnimateHeight(body, true);
    else if (!open && wasOpen) abAnimateHeight(body, false);
    else body.hidden = !open;
  });
  abPaintSums();
}

function abScrollAccIntoView(key) {
  const item = abAccItem(key);
  if (!item) return;
  const run = () => abScrollElIntoView(item, { bias: 0.08 });
  if (abMotionOk()) {
    gsap.delayedCall(0.42, run);
  } else {
    requestAnimationFrame(() => requestAnimationFrame(run));
  }
}

function abOpenAcc(key, { scroll = true } = {}) {
  if (!abUnlocked.has(key)) return;
  if (key === "corridor") {
    abShowCorridorPage();
    return;
  }
  abOpen = key;
  abState.step = key;
  abPaintAcc();
  if (key === "details") abPaintDetailsLayout();
  if (!scroll) return;
  abScrollAccIntoView(key);
  if (key === "bank") abFocusField("abIfsc", { delay: 0.45, bias: 0.18 });
  if (key === "details") abFocusField("abGiven", { delay: 0.45, bias: 0.18 });
  if (key === "channel") {
    const typeBtn = document.querySelector("[data-ab-type].is-on") || document.querySelector("[data-ab-type]");
    if (typeBtn) abFocusField(typeBtn, { delay: 0.4, bias: 0.12 });
  }
}

function abShowStep(step) {
  const next = abPanel(step);
  if (!next) return;
  const current = abPanels.find((panel) => !panel.hidden && panel !== next);

  const activateOnly = () => {
    abPanels.forEach((panel) => {
      const on = panel === next;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
  };

  if (!current || current === next) {
    activateOnly();
    if (abMotionOk()) {
      gsap.fromTo(
        next,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.34, ease: "power2.out", clearProps: "opacity,y" }
      );
    }
    return;
  }

  if (!abMotionOk()) {
    activateOnly();
    return;
  }

  current.classList.remove("is-active");
  gsap.to(current, {
    opacity: 0,
    y: -12,
    duration: 0.22,
    ease: "power1.in",
    onComplete: () => {
      current.hidden = true;
      gsap.set(current, { clearProps: "opacity,y" });
      next.hidden = false;
      next.classList.add("is-active");
      gsap.fromTo(
        next,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.38, ease: "power2.out", clearProps: "opacity,y" }
      );
    },
  });
}

function abShowCorridorPage() {
  abState.step = "corridor";
  abOpen = null;
  abShowStep("corridor");
  abPaintAcc();
  const scroller = abScrollParent();
  scroller.scrollTo({ top: 0, behavior: "smooth" });
}

function abSelectLabel(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  if (el.tagName === "SELECT") {
    const opt = el.selectedOptions?.[0];
    const text = (opt?.textContent || el.value || "").trim();
    if (!text || opt?.disabled || opt?.value === "") return "";
    return text;
  }
  return String(el.value || "").trim();
}

function abPaintOverview() {
  const cash = abIsCash();
  const upi = abIsUpi();
  const visa = abIsVisa();
  const bankSec = document.getElementById("abOvBankSection");
  const cashSec = document.getElementById("abOvCashSection");
  if (bankSec) bankSec.hidden = cash || upi || visa;
  if (cashSec) cashSec.hidden = !(cash || upi || visa);

  const bank =
    abBranchSheetState.bankName ||
    abSelectLabel("abBank") ||
    "—";
  const ifsc = document.getElementById("abIfsc")?.value.trim() || "—";
  const account =
    document.getElementById("abAccountRe")?.value.trim() ||
    document.getElementById("abAccount")?.value.trim() ||
    "—";
  const branch =
    (abBranchSheetState.branch && abBranchDisplay(abBranchSheetState.branch)) ||
    abSelectLabel("abBranch") ||
    "—";
  const given = document.getElementById("abGiven")?.value.trim() || "";
  const last = document.getElementById("abLast")?.value.trim() || "";
  const name = visa ? given || "—" : `${given} ${last}`.trim() || "—";
  const prefix = document.getElementById("abPrefix")?.value.trim() || "";
  const mobileRaw = document.getElementById("abMobile")?.value.trim() || "";
  const mobile = mobileRaw ? `${prefix} ${mobileRaw}`.trim() : "—";
  const typeLabel =
    abState.type === "individual"
      ? abT("abIndividual", "Individual")
      : abState.type === "non-individual"
        ? abT("abNonIndividual", "Non-individual")
        : "—";

  const set = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };
  set("abOvBank", bank);
  set("abOvIfsc", ifsc);
  set("abOvAccount", account);
  set("abOvBranch", branch);
  set("abOvName", name);
  set("abOvType", typeLabel);
  set("abOvMobile", mobile);

  if (cash) {
    const meta = abCashAgentMeta();
    const mark = document.getElementById("abOvProviderMark");
    const pname = document.getElementById("abOvProviderName");
    if (mark) {
      mark.textContent = meta.mark;
      mark.className = `ab-overview__provider-mark ${meta.markClass}`;
    }
    if (pname) pname.textContent = meta.name.toUpperCase();
  } else if (upi) {
    const mark = document.getElementById("abOvProviderMark");
    const pname = document.getElementById("abOvProviderName");
    if (mark) {
      mark.textContent = "UPI";
      mark.className = "ab-overview__provider-mark ab-overview__provider-mark--upi";
    }
    if (pname) pname.textContent = abState.upiId || "UPI";
  } else if (visa) {
    const mark = document.getElementById("abOvProviderMark");
    const pname = document.getElementById("abOvProviderName");
    const card = abState.visaCard || "";
    const masked = card.length === 16 ? `**** **** **** ${card.slice(-4)}` : "VISA";
    if (mark) {
      mark.textContent = "VISA";
      mark.className = "ab-overview__provider-mark ab-overview__provider-mark--visa";
    }
    if (pname) pname.textContent = masked;
  }
}

function abShowOverview() {
  abState.step = "overview";
  abOpen = null;
  abPaintOverview();
  if (abTitleEl) {
    abTitleEl.hidden = false;
    abTitleEl.textContent = abT("abOverviewTitle", "Overview Of Beneficiary Details");
  }
  if (abBackEl) abBackEl.hidden = false;
  abShowStep("overview");
  const scroller = abScrollParent();
  scroller.scrollTo({ top: 0, behavior: "smooth" });
  if (!abMotionOk()) return;
  const overview = document.querySelector(".ab-overview");
  if (!overview) return;
  gsap.fromTo(
    overview.children,
    { opacity: 0, y: 14 },
    {
      opacity: 1,
      y: 0,
      duration: 0.36,
      stagger: 0.06,
      ease: "power2.out",
      clearProps: "opacity,y",
    }
  );
}

function abReturnToFlow(accKey) {
  abState.step = "flow";
  if (abTitleEl) {
    abTitleEl.hidden = false;
    abTitleEl.textContent = abT("addBeneficiary", "Add Beneficiary");
  }
  if (abBackEl) abBackEl.hidden = false;
  abShowStep("flow");
  if (accKey) abOpenAcc(accKey);
  else {
    abOpen = null;
    abPaintAcc();
  }
}

function abEnterFlow() {
  abUnlocked.add("corridor");
  abUnlocked.add("channel");
  abDone.add("corridor");
  abReturnToFlow("channel");
}

function abValidateBank() {
  const rest = document.getElementById("abBankRest");
  if (rest?.hidden) {
    abToast(abT("abNeedIfscSearch", "Enter IFSC / Swift code and search first."), "error");
    abFocusField("abIfsc");
    return false;
  }
  const a = document.getElementById("abAccount")?.value || "";
  const b = document.getElementById("abAccountRe")?.value || "";
  if (!document.getElementById("abIfsc")?.value.trim()) {
    abToast(abT("abNeedIfsc", "Enter IFSC / Swift code."), "error");
    abFocusField("abIfsc");
    return false;
  }
  if (!b) {
    abToast(abT("abNeedAccount", "Enter and confirm account number."), "error");
    abFocusField(a ? "abAccountRe" : "abAccount");
    return false;
  }
  if (a && b && a !== b) {
    abToast(abT("abAccountMismatch", "Account numbers do not match."), "error");
    return false;
  }
  return true;
}

function abValidateDetailsName() {
  if (abIsVisa()) {
    if (!document.getElementById("abGiven")?.value.trim()) {
      abToast(abT("abNeedVisaName", "Enter beneficiary name as on the Visa Debit Card."), "error");
      return false;
    }
    return true;
  }
  if (!document.getElementById("abGiven")?.value.trim() || !document.getElementById("abLast")?.value.trim()) {
    abToast(abT("abNeedName", "Enter beneficiary given name and last name."), "error");
    return false;
  }
  return true;
}

function abValidateDetailsMobile() {
  if (!abValidateDetailsName()) return false;
  if (!document.getElementById("abMobile")?.value.trim()) {
    abToast(abT("abNeedMobile", "Enter beneficiary mobile number."), "error");
    return false;
  }
  return true;
}

function abCanUpdateAccount() {
  const rest = document.getElementById("abBankRest");
  if (rest?.hidden) return false;
  const ifsc = document.getElementById("abIfsc")?.value.trim() || "";
  const bank = document.getElementById("abBank")?.value.trim() || "";
  const branch = document.getElementById("abBranch")?.value.trim() || "";
  const a = document.getElementById("abAccount")?.value || "";
  const b = document.getElementById("abAccountRe")?.value || "";
  return !!(ifsc && bank && branch && a && b && a === b);
}

function abCanUpdateName() {
  if (abIsVisa()) {
    return !!document.getElementById("abGiven")?.value.trim();
  }
  return !!(
    document.getElementById("abGiven")?.value.trim() &&
    document.getElementById("abLast")?.value.trim()
  );
}

function abCanUpdateMobile() {
  return abCanUpdateName() && !!document.getElementById("abMobile")?.value.trim();
}

function abSyncActionButtons() {
  const accountBtn = document.getElementById("abUpdateAccount");
  if (accountBtn) accountBtn.disabled = !abCanUpdateAccount();

  const nameBtn = document.getElementById("abUpdateName");
  if (nameBtn) nameBtn.disabled = !abCanUpdateName();

  if (abFooterSubmit) {
    abFooterSubmit.disabled = !(abState.detailsExtra && abCanUpdateMobile());
  }
  abSyncOtpSubmit();
}

function abToast(msg, kind) {
  if (typeof toast === "function") toast(msg, kind || "info");
}

function abStopOtpTimer() {
  if (abOtpTimer) clearInterval(abOtpTimer);
  abOtpTimer = null;
}

function abStartOtpTimer() {
  abStopOtpTimer();
  abState.otpSeconds = 240;
  if (abOtpResend) abOtpResend.disabled = true;
  const tick = () => {
    if (abOtpClock) abOtpClock.textContent = abFmtTime(abState.otpSeconds);
    if (abState.otpSeconds <= 0) {
      abStopOtpTimer();
      if (abOtpResend) abOtpResend.disabled = false;
      return;
    }
    abState.otpSeconds -= 1;
  };
  tick();
  abOtpTimer = setInterval(tick, 1000);
  abToast(abT("otpSent", "OTP sent to your registered mobile number."), "info");
}

function abOtpValue() {
  return abOtpInputs.map((i) => i.value).join("");
}

function abSyncOtpSubmit() {
  if (abOtpSubmit) abOtpSubmit.disabled = abOtpValue().length !== 6;
}

function abClearOtpInputs() {
  abOtpInputs.forEach((i) => {
    i.value = "";
  });
  if (abOtpSingle) abOtpSingle.value = "";
  abSyncOtpSubmit();
}

function abOpenModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  el.setAttribute("aria-hidden", "false");
  document.body.classList.add("ab-modal-open");
  const backdrop = el.querySelector(".ab-modal__backdrop");
  const panel = el.querySelector(".ab-modal__panel");
  if (!abMotionOk()) {
    el.classList.add("is-open");
    if (backdrop) backdrop.style.opacity = "1";
    if (panel) {
      panel.style.opacity = "1";
      panel.style.transform = "none";
    }
    return;
  }
  el.classList.add("is-animating");
  gsap.killTweensOf([backdrop, panel].filter(Boolean));
  gsap.set(backdrop, { opacity: 0 });
  gsap.set(panel, { opacity: 0, y: 18, scale: 0.98 });
  const tl = gsap.timeline({
    onComplete: () => {
      el.classList.add("is-open");
      el.classList.remove("is-animating");
    },
  });
  tl.to(backdrop, { opacity: 1, duration: 0.22, ease: "power1.out" }, 0);
  tl.to(panel, { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: "power2.out" }, 0.04);
}

function abCloseModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const finish = () => {
    el.hidden = true;
    el.classList.remove("is-open", "is-animating");
    el.setAttribute("aria-hidden", "true");
    if (![...document.querySelectorAll(".ab-modal")].some((m) => !m.hidden)) {
      document.body.classList.remove("ab-modal-open");
    }
  };
  if (!abMotionOk()) {
    finish();
    return;
  }
  const backdrop = el.querySelector(".ab-modal__backdrop");
  const panel = el.querySelector(".ab-modal__panel");
  el.classList.add("is-animating");
  el.classList.remove("is-open");
  gsap.killTweensOf([backdrop, panel].filter(Boolean));
  const tl = gsap.timeline({ onComplete: finish });
  tl.to(panel, { opacity: 0, y: 12, scale: 0.98, duration: 0.2, ease: "power1.in" }, 0);
  tl.to(backdrop, { opacity: 0, duration: 0.2, ease: "power1.in" }, 0);
}

function abOpenSheetEl(sheet) {
  if (!sheet) return;
  sheet.hidden = false;
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("ab-sheet-open");
  requestAnimationFrame(() => sheet.classList.add("is-open"));
}

function abCloseSheetEl(sheet) {
  if (!sheet || sheet.hidden) return;
  sheet.classList.remove("is-open");
  let closed = false;
  const done = () => {
    if (closed) return;
    closed = true;
    sheet.hidden = true;
    sheet.setAttribute("aria-hidden", "true");
    if (![...document.querySelectorAll(".ab-sheet")].some((s) => !s.hidden)) {
      document.body.classList.remove("ab-sheet-open");
    }
  };
  const panel = sheet.querySelector(".ab-sheet__panel");
  panel?.addEventListener("transitionend", done, { once: true });
  setTimeout(done, 400);
}

const AB_OTP_ART = {
  mobile: "assets/images/otp/mobile.png",
  whatsapp: "assets/images/otp/whatsapp.png",
  email: "assets/images/otp/email.png",
};

const AB_OTP_MASK = {
  mobile: "965****8886",
  whatsapp: "965****8886",
  email: "*****an87@gmail.com",
};

const AB_OTP_ICONS = {
  mobile:
    '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="18.2" r="0.9" fill="currentColor"/></svg>',
  whatsapp:
    '<svg viewBox="0 0 24 24"><path d="M12 3.5a8.2 8.2 0 0 0-7 12.5L4 20.5l4.7-1.2A8.2 8.2 0 1 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.2 9.4c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .5-.2.6l-.5.4a6 6 0 0 0 2.6 2.6l.4-.5c.2-.2.4-.3.6-.2l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .5-.5.7A7 7 0 0 1 9.2 9.4Z" fill="currentColor"/></svg>',
  email:
    '<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
};

function abOtpSheet() {
  return document.getElementById("abOtpSheet");
}

function abSetOtpStage(stage) {
  const sheet = abOtpSheet();
  if (!sheet) return;
  sheet.setAttribute("data-ab-otp-stage", stage);
  const dest = document.getElementById("abOtpStageDest");
  const verify = document.getElementById("abOtpStageVerify");
  if (dest) {
    dest.hidden = stage !== "dest";
    dest.classList.toggle("is-active", stage === "dest");
  }
  if (verify) {
    verify.hidden = stage !== "verify";
    verify.classList.toggle("is-active", stage === "verify");
  }

  const title = document.getElementById("abOtpSheetTitle");
  const lead = document.getElementById("abOtpSheetLead");
  if (stage === "verify") {
    if (title) title.textContent = abT("abVerifyOtpTitle", "Verify OTP");
    if (lead) lead.textContent = abT("payOtpLead", "Enter the OTP sent to your selected destination.");
  } else {
    if (title) title.textContent = abT("abOtpDestTitle", "Select Destination of OTP to be sent");
    if (lead) lead.textContent = abT("payDestLead", "Choose where we should send the one-time password.");
  }
}

function abPaintOtpChannelUI(channel) {
  const key = channel === "email" || channel === "whatsapp" ? channel : "mobile";
  const labelKey = key === "email" ? "emailAddress" : key === "whatsapp" ? "whatsappNumber" : "mobileNumber";
  const labelEl = document.getElementById("abOtpChannelLabel");
  const maskEl = document.getElementById("abOtpMask");
  const iconEl = document.getElementById("abOtpNoteIcon");
  const artEl = document.getElementById("abOtpArtImg");
  if (labelEl) labelEl.textContent = abT(labelKey, labelEl.textContent);
  if (maskEl) maskEl.textContent = AB_OTP_MASK[key] || AB_OTP_MASK.mobile;
  if (iconEl) iconEl.innerHTML = AB_OTP_ICONS[key] || AB_OTP_ICONS.mobile;
  if (artEl) {
    const next = AB_OTP_ART[key] || AB_OTP_ART.mobile;
    if (artEl.getAttribute("src") !== next) artEl.setAttribute("src", next);
  }

  document.querySelectorAll("[data-ab-otp-dest]").forEach((btn) => {
    const on = btn.getAttribute("data-ab-otp-dest") === key;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-checked", on ? "true" : "false");
  });
}

function abOpenOtpDestModal() {
  const sheet = abOtpSheet();
  if (!sheet) return;
  abStopOtpTimer();
  document.querySelectorAll("[data-ab-otp-dest]").forEach((btn) => {
    btn.classList.remove("is-on");
    btn.setAttribute("aria-checked", "false");
  });
  abSetOtpStage("dest");
  abOpenSheetEl(sheet);
}

function abCloseOtpSheet() {
  abStopOtpTimer();
  abCloseSheetEl(abOtpSheet());
}

function abOpenOtpVerifyModal() {
  abPaintOtpChannelUI(abState.otpDest);
  abClearOtpInputs();
  abSetOtpStage("verify");
  abStartOtpTimer();
  requestAnimationFrame(() => abOtpInputs[0]?.focus());
}

function abCompleteOtpSuccess() {
  abStopOtpTimer();
  abCloseOtpSheet();
  abDone.add("details");
  abState.otpVerified = true;
  abOpen = null;
  abPaintAcc();
  abSyncActionButtons();
  abShowThanks();
}

function abPaintChannelBlock() {
  const block = document.getElementById("abChannelBlock");
  if (!block) return;
  const show = abState.type === "individual";
  block.hidden = !show;
  if (!show) {
    abState.channel = null;
    document.querySelectorAll("[data-ab-channel]").forEach((b) => {
      b.classList.remove("is-on");
      b.setAttribute("aria-selected", "false");
    });
  }
  abPaintCashAgentBlock();
  abPaintBankAccVisibility();
  abPaintAcc();
}

function abValidateChannel() {
  if (abState.type !== "individual") {
    abToast(abT("abNeedIndividual", "Please select Individual to continue."), "error");
    return false;
  }
  if (!abState.channel) {
    abToast(abT("abNeedChannel", "Please select a channel."), "error");
    return false;
  }
  return true;
}

function abValidateCashExtra() {
  if (!document.getElementById("abOccupation")?.value) {
    abToast(abT("abNeedOccupation", "Please select occupation."), "error");
    return false;
  }
  if (!document.getElementById("abPositionLevel")?.value) {
    abToast(abT("abNeedPosition", "Please select position level."), "error");
    return false;
  }
  if (!document.getElementById("abBenePhone")?.value.trim()) {
    abToast(abT("abNeedBenePhone", "Please enter beneficiary telephone/mobile number."), "error");
    return false;
  }
  return true;
}

function abAdvanceFrom(current, next) {
  if (next === "bank") {
    if (!abValidateChannel()) return false;
    if (abIsCash()) return abGoCashDetails();
    if (abIsVisa()) return abAdvanceFrom(current, "visa");
    if (abIsUpi()) {
      abOpenUpiSheet();
      return false;
    }
  }
  if (next === "visa") {
    if (!abValidateChannel()) return false;
    if (!abIsVisa()) return false;
  }
  if (next === "details") {
    if (current === "visa" || abIsVisa()) {
      return abGoVisaDetails();
    }
    if (abIsCash()) {
      if (!abState.agent) {
        abToast(abT("abNeedCashAgent", "Please select a cash payout agent."), "error");
        return false;
      }
    } else if (abIsUpi()) {
      if (!abState.upiId) {
        abToast(abT("abNeedUpi", "Please enter UPI ID."), "error");
        abOpenUpiSheet();
        return false;
      }
    } else if (!abValidateBank()) {
      return false;
    }
  }
  if (current) abDone.add(current);
  abUnlocked.add(next);
  abPaintBankAccVisibility();
  abPaintCashProviderBar();
  abOpenAcc(next);
  return true;
}

function abFooterBack() {
  const flow = abPanel("flow");
  if (!flow || flow.hidden) {
    abGoBeneficiaries();
    return;
  }
  if (abOpen && abOpen !== "channel") {
    const idx = AB_ACC_ORDER.indexOf(abOpen);
    if (idx > 0) {
      let prevIdx = idx - 1;
      const skipKeys = new Set();
      if (abIsCash() || abIsUpi()) {
        skipKeys.add("bank");
        skipKeys.add("visa");
      } else if (abIsVisa()) {
        skipKeys.add("bank");
      } else {
        skipKeys.add("visa");
      }
      while (prevIdx >= 0 && skipKeys.has(AB_ACC_ORDER[prevIdx])) prevIdx -= 1;
      const prev = AB_ACC_ORDER[prevIdx];
      if (prev && abUnlocked.has(prev)) {
        abOpenAcc(prev);
        return;
      }
    }
  }
  abShowCorridorPage();
}

/* —— Selection handlers —— */
document.querySelectorAll("[data-ab-type]").forEach((btn) => {
  btn.addEventListener("click", () => {
    abState.type = btn.getAttribute("data-ab-type");
    document.querySelectorAll("[data-ab-type]").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    abPaintChannelBlock();
    if (abState.type === "non-individual") {
      abToast(abT("abIndividualOnly", "Only Individual beneficiaries are supported in this flow."), "info");
    } else if (abState.type === "individual") {
      const channelBlock = document.getElementById("abChannelBlock");
      const firstChannel = document.querySelector("[data-ab-channel]");
      if (channelBlock) abScrollElIntoView(channelBlock, { bias: 0.2 });
      if (firstChannel) abFocusField(firstChannel, { delay: 0.28, bias: 0.28 });
    }
    abPaintSums();
  });
});

document.querySelectorAll("[data-ab-channel]").forEach((btn) => {
  btn.addEventListener("click", () => {
    abState.channel = btn.getAttribute("data-ab-channel");
    document.querySelectorAll("[data-ab-channel]").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (abState.type !== "individual" || !abState.channel) return;

    abResetDownstreamFromChannel();

    if (abState.channel === "cash") {
      document.querySelectorAll("[data-ab-agent]").forEach((b) => {
        b.classList.remove("is-on");
        b.setAttribute("aria-selected", "false");
      });
      abPaintCashAgentBlock();
      abPaintBankAccVisibility();
      abPaintCashProviderBar();
      abPaintAcc();
      abPaintSums();
      const agentBlock = document.getElementById("abCashAgentBlock");
      if (agentBlock) abScrollElIntoView(agentBlock, { bias: 0.25 });
      return;
    }

    if (abState.channel === "upi") {
      abPaintCashAgentBlock();
      abPaintBankAccVisibility();
      abPaintCashProviderBar();
      abPaintAcc();
      abPaintSums();
      abOpenUpiSheet();
      return;
    }

    if (abState.channel === "visa") {
      abPaintCashAgentBlock();
      abPaintBankAccVisibility();
      abPaintCashProviderBar();
      abPaintAcc();
      abPaintSums();
      abSyncVisaCardNext();
      abAdvanceFrom("channel", "visa");
      return;
    }

    abPaintCashAgentBlock();
    abPaintBankAccVisibility();
    abPaintCashProviderBar();
    abAdvanceFrom("channel", "bank");
  });
});

document.querySelectorAll("[data-ab-agent]").forEach((btn) => {
  btn.addEventListener("click", () => {
    abState.agent = btn.getAttribute("data-ab-agent");
    document.querySelectorAll("[data-ab-agent]").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    abPaintSums();
    abGoCashDetails();
  });
});

document.querySelectorAll("[data-ab-otp-dest]").forEach((btn) => {
  btn.addEventListener("click", () => {
    abState.otpDest = btn.getAttribute("data-ab-otp-dest");
    abOpenOtpVerifyModal();
  });
});

document.querySelectorAll('[data-ab-next="channel"]').forEach((btn) => {
  btn.addEventListener("click", () => abEnterFlow());
});

document.querySelectorAll("[data-ab-acc-next]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = btn.getAttribute("data-ab-acc-next");
    const current = btn.closest("[data-ab-acc]")?.getAttribute("data-ab-acc");
    abAdvanceFrom(current, next);
  });
});

document.getElementById("abUpdateName")?.addEventListener("click", () => {
  if (!abValidateDetailsName()) return;
  abState.detailsExtra = true;
  const extra = document.getElementById("abDetailsExtra");
  const actions = document.getElementById("abNameActions");
  if (actions) actions.hidden = true;
  if (typeof abRevealBlock === "function") abRevealBlock(extra);
  else if (extra) extra.hidden = false;
  abPaintSums();
  abSyncActionButtons();
  abFocusField("abNationality", { delay: 0.38, bias: 0.2 });
});

document.getElementById("abCashExtraNext")?.addEventListener("click", () => {
  if (!abValidateCashExtra()) return;
  abOpenCashPromoSheet();
});

document.getElementById("abCashPromoNext")?.addEventListener("click", () => {
  abCloseCashPromoSheet();
  window.setTimeout(() => abFinishDetailsToOtp(), 180);
});

document.querySelectorAll("[data-ab-cash-extra-close]").forEach((el) => {
  el.addEventListener("click", () => abCloseCashExtraSheet());
});

document.querySelectorAll("[data-ab-cash-promo-close]").forEach((el) => {
  el.addEventListener("click", () => abCloseCashPromoSheet());
});

document.querySelectorAll("[data-ab-upi-close]").forEach((el) => {
  el.addEventListener("click", () => abCloseUpiSheet());
});

document.querySelectorAll("[data-ab-upi-handle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    abAppendUpiHandle(btn.getAttribute("data-ab-upi-handle"));
  });
});

document.getElementById("abUpiId")?.addEventListener("input", () => {
  const el = document.getElementById("abUpiId");
  el?.closest(".field")?.classList.toggle("has-value", !!el.value.trim());
  abSyncUpiVerify();
});

document.getElementById("abUpiVerify")?.addEventListener("click", () => {
  abGoUpiDetails();
});

abWireVisaCardInputs("abVisaCard");
abWireVisaCardInputs("abVisaCardRe");
abSyncVisaCardNext();

document.getElementById("abVisaCardNext")?.addEventListener("click", () => {
  abGoVisaDetails();
});

document.querySelectorAll("[data-ab-visa-block-close]").forEach((el) => {
  el.addEventListener("click", () => abCloseVisaBlockSheet());
});

document.getElementById("abVisaBlockOk")?.addEventListener("click", () => {
  abCloseVisaBlockSheet();
});

document.getElementById("abVisaBlockCallback")?.addEventListener("click", () => {
  abCloseVisaBlockSheet();
  abToast(
    abT(
      "abVisaBlockCallbackOk",
      "Your call back request has been submitted. Our team will contact you shortly."
    ),
    "success"
  );
});

document.querySelectorAll(".ab-acc__head").forEach((head) => {
  head.addEventListener("click", () => {
    const item = head.closest("[data-ab-acc]");
    const key = item?.getAttribute("data-ab-acc");
    if (!key || !abUnlocked.has(key)) return;
    if (key === "corridor") {
      abShowCorridorPage();
      return;
    }
    if (abOpen === key) {
      abOpen = null;
      abState.step = "flow";
      abPaintAcc();
      return;
    }
    abOpenAcc(key);
  });
});

document.getElementById("abSearchIfsc")?.addEventListener("click", () => {
  abOpenBranchSheet();
});

const AB_BANK_NAMES = {
  SBI: "State Bank of India",
  HDFC: "HDFC Bank Limited",
  ICICI: "ICICI Bank Limited",
  AXIS: "Axis Bank Limited",
  PNB: "Punjab National Bank",
  BOB: "Bank of Baroda",
  BOI: "Bank of India",
  CANARA: "Canara Bank",
  UNBKIN: "Union Bank of India",
  FEDRAL: "Federal Bank Limited",
  IDBI: "IDBI Bank Limited",
  YES: "Yes Bank Limited",
  KOTAK: "Kotak Mahindra Bank",
  INDUS: "IndusInd Bank",
  IOB: "Indian Overseas Bank",
  CBI: "Central Bank of India",
  UCO: "UCO Bank",
  INDIAN: "Indian Bank",
  BOM: "Bank of Maharashtra",
  BANDHAN: "Bandhan Bank",
  IDFC: "IDFC First Bank",
  RBL: "RBL Bank",
  SIB: "South Indian Bank",
  KARUR: "Karur Vysya Bank",
  CSB: "CSB Bank",
  DCB: "DCB Bank",
  JKB: "Jammu & Kashmir Bank",
  AU: "AU Small Finance Bank",
  EQUITAS: "Equitas Small Finance Bank",
  CUB: "City Union Bank",
};

/* Bank logo domains + multi-API icon sources (circular avatars in bank picker) */
const AB_BANK_DOMAINS = {
  SBI: ["sbi.co.in", "onlinesbi.sbi", "bank.sbi"],
  HDFC: ["hdfcbank.com"],
  ICICI: ["icicibank.com"],
  AXIS: ["axisbank.com"],
  PNB: ["pnbindia.in"],
  BOB: ["bankofbaroda.in"],
  BOI: ["bankofindia.co.in"],
  CANARA: ["canarabank.com"],
  UNBKIN: ["unionbankofindia.co.in"],
  FEDRAL: ["federalbank.co.in"],
  IDBI: ["idbibank.in"],
  YES: ["yesbank.in"],
  KOTAK: ["kotak.com"],
  INDUS: ["indusind.com"],
  IOB: ["iob.in"],
  CBI: ["centralbankofindia.co.in"],
  UCO: ["ucobank.com"],
  INDIAN: ["indianbank.in"],
  BOM: ["bankofmaharashtra.in"],
  BANDHAN: ["bandhanbank.com"],
  IDFC: ["idfcfirstbank.com"],
  RBL: ["rblbank.com"],
  SIB: ["southindianbank.com"],
  KARUR: ["kvb.co.in"],
  CSB: ["csb.co.in"],
  DCB: ["dcbbank.com"],
  JKB: ["jkbank.com"],
  AU: ["aubank.in"],
  EQUITAS: ["equitasbank.com"],
  CUB: ["cityunionbank.com"],
};

function abBankIconSources(code) {
  const domains = AB_BANK_DOMAINS[code] || [];
  const urls = [];
  domains.forEach((domain) => {
    urls.push(
      `https://logos.hunter.io/${domain}`,
      `https://img.loadlogo.com/${domain}`,
      `https://logo.pubrio.com/${domain}`,
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`
    );
  });
  return urls;
}

function abBankInitials(code, label) {
  if (code && String(code).length <= 5) return String(code).slice(0, 3).toUpperCase();
  const parts = String(label || code || "?").replace(/[^A-Za-z0-9\s-]/g, " ").trim().split(/[\s-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(parts[0] || "?").slice(0, 2).toUpperCase();
}

function abCreateBankIconEl(code, label) {
  const wrap = document.createElement("span");
  wrap.className = "ab-picker__bank-icon";
  wrap.setAttribute("aria-hidden", "true");

  const fallback = document.createElement("span");
  fallback.className = "ab-picker__bank-icon-fallback";
  fallback.textContent = abBankInitials(code, label);

  const sources = abBankIconSources(code);
  if (!sources.length) {
    wrap.classList.add("is-fallback");
    wrap.appendChild(fallback);
    return wrap;
  }

  const img = document.createElement("img");
  img.className = "ab-picker__bank-icon-img";
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.dataset.sourceIndex = "0";
  img.src = sources[0];
  img.addEventListener("error", () => {
    const next = Number(img.dataset.sourceIndex || "0") + 1;
    if (next < sources.length) {
      img.dataset.sourceIndex = String(next);
      img.src = sources[next];
      return;
    }
    wrap.classList.add("is-fallback");
    img.remove();
    if (!wrap.contains(fallback)) wrap.appendChild(fallback);
  });
  img.addEventListener("load", () => {
    wrap.classList.remove("is-fallback");
    wrap.classList.add("is-loaded");
  });

  wrap.appendChild(img);
  wrap.appendChild(fallback);
  return wrap;
}

const AB_BRANCH_POOL = {
  SBI: [
    { place: "MIRA ROAD STATION.MUMBAI", ifsc: "SBIN0061691" },
    { place: "ANDHERI(WEST).MUMBAI", ifsc: "SBIN0000457" },
    { place: "CONNAUGHT PLACE.DELHI", ifsc: "SBIN0000691" },
    { place: "BANDRA(EAST).MUMBAI", ifsc: "SBIN0012345" },
    { place: "KORAMANGALA.BANGALORE", ifsc: "SBIN0007890" },
  ],
  FEDRAL: [
    { place: "FORT.MUMBAI", ifsc: "FDRL0001001" },
    { place: "MG ROAD.KOCHI", ifsc: "FDRL0001122" },
    { place: "KORAMANGALA.BANGALORE", ifsc: "FDRL0001456" },
    { place: "ANNA NAGAR.CHENNAI", ifsc: "FDRL0001789" },
  ],
  UNBKIN: [
    { place: "BANDRA(EAST).MUMBAI", ifsc: "UBIN0563536" },
    { place: "KAROL BAGH.DELHI", ifsc: "UBIN0531234" },
    { place: "ANNA NAGAR.CHENNAI", ifsc: "UBIN0535678" },
    { place: "BANJARA HILLS.HYDERABAD", ifsc: "UBIN0539012" },
    { place: "SALT LAKE.KOLKATA", ifsc: "UBIN0542100" },
  ],
  HDFC: [
    { place: "BKC.MUMBAI", ifsc: "HDFC0000240" },
    { place: "FC ROAD.PUNE", ifsc: "HDFC0000123" },
    { place: "CG ROAD.AHMEDABAD", ifsc: "HDFC0000456" },
    { place: "INDIRANAGAR.BANGALORE", ifsc: "HDFC0000789" },
  ],
  ICICI: [
    { place: "NARIMAN POINT.MUMBAI", ifsc: "ICIC0000001" },
    { place: "SECTOR 18.GURGAON", ifsc: "ICIC0001234" },
    { place: "PARK STREET.KOLKATA", ifsc: "ICIC0000567" },
    { place: "BANJARA HILLS.HYDERABAD", ifsc: "ICIC0000890" },
  ],
  AXIS: [
    { place: "WORLI.MUMBAI", ifsc: "UTIB0000001" },
    { place: "MI ROAD.JAIPUR", ifsc: "UTIB0000456" },
    { place: "CONNAUGHT PLACE.DELHI", ifsc: "UTIB0000789" },
  ],
  PNB: [
    { place: "CONNAUGHT PLACE.DELHI", ifsc: "PUNB0123456" },
    { place: "HAZRATGANJ.LUCKNOW", ifsc: "PUNB0456789" },
    { place: "SECTOR 17.CHANDIGARH", ifsc: "PUNB0789012" },
  ],
  BOB: [
    { place: "ALKAPURI.VADODARA", ifsc: "BARB0ALKAPU" },
    { place: "RING ROAD.SURAT", ifsc: "BARB0SURATR" },
    { place: "C G ROAD.AHMEDABAD", ifsc: "BARB0CGROAD" },
  ],
};

function abDefaultBranches(code) {
  const prefix = String(code || "BANK").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  const places = [
    "MAIN BRANCH.MUMBAI",
    "CONNAUGHT PLACE.DELHI",
    "MG ROAD.BANGALORE",
    "ANNA NAGAR.CHENNAI",
  ];
  return places.map((place, i) => ({
    place,
    ifsc: `${prefix}0${String(100000 + i).slice(1)}`,
  }));
}

Object.keys(AB_BANK_NAMES).forEach((code) => {
  if (!AB_BRANCH_POOL[code]) AB_BRANCH_POOL[code] = abDefaultBranches(code);
});

function abBuildBankMenu() {
  const menu = document.getElementById("abSheetBankMenu");
  if (!menu) return;
  menu.innerHTML = "";
  Object.keys(AB_BANK_NAMES).forEach((code, index) => {
    const label = abFormatBankLabel(code, `${code}-${AB_BANK_NAMES[code]}`);
    const btn = document.createElement("button");
    btn.className = "ab-sheet-menu__item" + (index === 0 ? " is-on" : "");
    btn.type = "button";
    btn.setAttribute("role", "option");
    btn.setAttribute("data-ab-bank", code);
    btn.setAttribute("data-ab-bank-label", `${code}-${AB_BANK_NAMES[code]}`);
    btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
    btn.textContent = label;
    menu.appendChild(btn);
  });
}

const abBranchSheetState = {
  bank: null,
  bankLabel: "",
  bankName: "",
  branch: null,
};

let abPickerSelect = null;
let abPickerMode = null;
let abPickerOnSelect = null;
let abPickerItemsAll = [];
let abPickerActiveValue = "";
let abBranchPickCache = { bank: null, picks: [] };

function abTitleCaseWords(str) {
  const raw = String(str || "");
  if (!raw) return "";
  /* Keep Arabic / non-Latin copy as-is */
  if (/[^\u0000-\u024F]/.test(raw)) return raw;
  const keepUpper = new Set([
    "SBI", "HDFC", "ICICI", "AXIS", "PNB", "BOB", "BOI", "FEDRAL", "UNBKIN",
    "IDBI", "YES", "KOTAK", "INDUS", "IOB", "CBI", "UCO", "BOM", "IDFC", "RBL",
    "SIB", "CSB", "DCB", "JKB", "AU", "CUB", "CANARA", "BANDHAN", "EQUITAS", "INDIAN", "KARUR",
    "INR", "IFSC", "ATM", "NRI", "BKC", "MG", "FC", "CG", "MI", "UPI",
  ]);
  return raw
    .toLowerCase()
    .split(/(\s+|-|\.|\/|\(|\))/)
    .map((part) => {
      if (!part || /^\s+$/.test(part) || part === "-" || part === "." || part === "/" || part === "(" || part === ")") {
        return part;
      }
      const upper = part.toUpperCase();
      if (keepUpper.has(upper)) return upper;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

function abFormatBankLabel(code, fullLabel) {
  const name = abBankDisplayName(code, fullLabel);
  const prettyName = AB_BANK_NAMES[code] || abTitleCaseWords(name);
  const codePart = (code || "").toUpperCase();
  if (!codePart) return prettyName;
  if (!prettyName) return codePart;
  return `${codePart} - ${prettyName}`;
}

function abBankDisplayName(code, fullLabel) {
  if (AB_BANK_NAMES[code]) return AB_BANK_NAMES[code];
  if (!fullLabel) return code || "";
  const i = String(fullLabel).indexOf("-");
  const raw = i >= 0 ? String(fullLabel).slice(i + 1).trim() : String(fullLabel);
  return abTitleCaseWords(raw);
}

function abBranchDisplay(branch) {
  if (!branch) return "";
  const place = abTitleCaseWords(branch.place || "");
  const ifsc = String(branch.ifsc || "").toUpperCase();
  if (place && ifsc) return `${place} - ${ifsc}`;
  return place || ifsc;
}

function abShuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function abSetSheetValue(el, text) {
  if (!el) return;
  const value = text || "";
  if ("value" in el) {
    el.value = value;
  } else {
    el.textContent = value;
  }
  el.closest(".field")?.classList.toggle("has-value", !!value.trim());
}

function abCloseSheetMenus() {
  document.querySelectorAll("#abBranchSheet .field").forEach((f) => f.classList.remove("is-open"));
  const bankInput = document.getElementById("abSheetBankValue");
  const branchInput = document.getElementById("abSheetBranchQuery");
  bankInput?.setAttribute("aria-expanded", "false");
  branchInput?.setAttribute("aria-expanded", "false");
  const bankMenu = document.getElementById("abSheetBankMenu");
  const branchMenu = document.getElementById("abSheetBranchMenu");
  if (bankMenu) bankMenu.hidden = true;
  if (branchMenu) branchMenu.hidden = true;
  const picker = document.getElementById("abPicker");
  if (picker && !picker.hidden && (abPickerMode === "bank" || abPickerMode === "branch")) {
    abClosePicker();
  }
}

function abPaintBranchMenu(query = "") {
  const field = document.getElementById("abSheetBranchField");
  const bank = abBranchSheetState.bank;
  const pool = bank ? AB_BRANCH_POOL[bank] || [] : [];
  const q = query.trim();
  if (!bank || q.length < 3) {
    field?.classList.remove("is-open");
    document.getElementById("abSheetBranchQuery")?.setAttribute("aria-expanded", "false");
    abBranchPickCache = { bank: null, picks: [] };
    if (abPickerMode === "branch") abClosePicker();
    return;
  }

  let picks = abBranchPickCache.bank === bank ? abBranchPickCache.picks : [];
  if (!picks.length) {
    picks = abShuffle(pool).slice(0, Math.min(5, pool.length));
    abBranchPickCache = { bank, picks };
  }

  if (!picks.length) {
    field?.classList.remove("is-open");
    document.getElementById("abSheetBranchQuery")?.setAttribute("aria-expanded", "false");
    if (abPickerMode === "branch") abClosePicker();
    return;
  }

  const title =
    document.querySelector("#abSheetBranchField .field__label")?.textContent?.trim() ||
    abT("abSheetBankBranch", "Branch");

  abOpenPickerList({
    title,
    mode: "branch",
    anchorField: field,
    activeValue: abBranchSheetState.branch?.ifsc || "",
    items: picks.map((b) => ({
      value: b.ifsc,
      label: abBranchDisplay(b),
      data: b,
    })),
    onSelect: (item) => abSelectSheetBranch(item.data),
  });
  document.getElementById("abSheetBranchQuery")?.setAttribute("aria-expanded", "true");
}

function abSetSelectValue(selectEl, value) {
  if (!selectEl || !value) return;
  selectEl.innerHTML = "";
  const opt = new Option(value, value, true, true);
  selectEl.add(opt);
  selectEl.value = value;
  selectEl.closest(".field")?.classList.add("has-value");
  abSyncFloat(selectEl);
}

function abApplyBranchSelection() {
  const bankName =
    abBranchSheetState.bankName || abBankDisplayName(abBranchSheetState.bank, abBranchSheetState.bankLabel);
  const branch = abBranchSheetState.branch;
  if (!bankName || !branch) return;

  const ifsc = document.getElementById("abIfsc");
  if (ifsc) {
    ifsc.value = branch.ifsc;
    document.getElementById("abIfscField")?.classList.add("has-value");
  }

  abSetSelectValue(document.getElementById("abBank"), bankName);
  abSetSelectValue(document.getElementById("abBranch"), abBranchDisplay(branch));

  const rest = document.getElementById("abBankRest");
  if (rest && rest.hidden) abRevealBlock(rest);
  else if (rest) rest.hidden = false;

  abCloseBranchSheet();
  abSyncActionButtons();
  abFocusField("abAccount", { delay: 0.2, bias: 0.2 });
}

function abSelectSheetBank(code, label) {
  abBranchSheetState.bank = code;
  abBranchSheetState.bankLabel = abFormatBankLabel(code, label);
  abBranchSheetState.bankName = abBankDisplayName(code, label);
  abBranchSheetState.branch = null;
  abBranchPickCache = { bank: null, picks: [] };
  abSetSheetValue(document.getElementById("abSheetBankValue"), abBranchSheetState.bankLabel);
  const q = document.getElementById("abSheetBranchQuery");
  if (q) {
    q.disabled = false;
    q.value = "";
    q.closest(".field")?.classList.remove("has-value");
  }
  document.querySelectorAll("#abSheetBankMenu .ab-sheet-menu__item").forEach((item) => {
    const on = item.getAttribute("data-ab-bank") === code;
    item.classList.toggle("is-on", on);
    item.setAttribute("aria-selected", on ? "true" : "false");
  });
  abCloseSheetMenus();
  requestAnimationFrame(() => abFocusField("abSheetBranchQuery", { delay: 0.12, bias: 0.25 }));
}

function abSelectSheetBranch(branch) {
  abBranchSheetState.branch = branch;
  abSetSheetValue(document.getElementById("abSheetBranchQuery"), abBranchDisplay(branch));
  abCloseSheetMenus();
  abApplyBranchSelection();
}

function abOpenBranchSheet() {
  const sheet = document.getElementById("abBranchSheet");
  if (!sheet) return;
  abBranchSheetState.bank = null;
  abBranchSheetState.bankLabel = "";
  abBranchSheetState.bankName = "";
  abBranchSheetState.branch = null;
  abSetSheetValue(document.getElementById("abSheetBankValue"), "");
  const q = document.getElementById("abSheetBranchQuery");
  if (q) {
    q.value = "";
    q.disabled = true;
    q.closest(".field")?.classList.remove("has-value");
  }
  abCloseSheetMenus();
  abOpenSheetEl(sheet);
}

function abCloseBranchSheet() {
  abCloseSheetMenus();
  abCloseSheetEl(document.getElementById("abBranchSheet"));
}

document.getElementById("abSheetBankValue")?.addEventListener("click", () => {
  abOpenSheetBankPicker();
});

document.getElementById("abSheetBankValue")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    abOpenSheetBankPicker();
  }
});

document.getElementById("abSheetBranchQuery")?.addEventListener("focus", () => {
  if (!abBranchSheetState.bank) return;
  abPaintBranchMenu(document.getElementById("abSheetBranchQuery")?.value || "");
});

document.getElementById("abSheetBranchQuery")?.addEventListener("input", (e) => {
  e.target.closest(".field")?.classList.toggle("has-value", !!e.target.value.trim());
  abPaintBranchMenu(e.target.value || "");
});

document.querySelectorAll("[data-ab-sheet-close]").forEach((el) => {
  el.addEventListener("click", () => abCloseBranchSheet());
});

document.querySelectorAll("[data-ab-otp-close]").forEach((el) => {
  el.addEventListener("click", () => abCloseOtpSheet());
});

document.getElementById("abOtpBack")?.addEventListener("click", () => {
  abStopOtpTimer();
  abClearOtpInputs();
  abSetOtpStage("dest");
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const picker = document.getElementById("abPicker");
  if (picker && !picker.hidden) {
    abClosePicker();
    return;
  }
  const branchSheet = document.getElementById("abBranchSheet");
  if (branchSheet && !branchSheet.hidden) {
    abCloseBranchSheet();
    return;
  }
  const otpSheet = abOtpSheet();
  if (otpSheet && !otpSheet.hidden) {
    abCloseOtpSheet();
  }
});

["abIfsc", "abAccount", "abAccountRe", "abGiven", "abLast", "abMobile"].forEach((id) => {
  const el = document.getElementById(id);
  el?.addEventListener("input", () => {
    el.closest(".field")?.classList.toggle("has-value", !!el.value.trim());
  });
  el?.addEventListener("focus", () => {
    abScrollElIntoView(el.closest(".field") || el, { bias: 0.24 });
  });
  el?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (id === "abIfsc") {
      if (el.value.trim()) document.getElementById("abSearchIfsc")?.click();
      return;
    }
    if (id === "abAccountRe" && abCanUpdateAccount()) {
      document.getElementById("abUpdateAccount")?.focus();
      abScrollElIntoView(document.getElementById("abUpdateAccount"), { bias: 0.35 });
      return;
    }
    if (id === "abLast" && abCanUpdateName()) {
      abFocusField("abNationality", { bias: 0.22 });
      return;
    }
    if (id === "abMobile" && abCanUpdateMobile()) {
      const btn = document.getElementById("abFooterSubmit");
      if (btn && !btn.disabled) {
        abFocusField(btn, { bias: 0.35 });
        return;
      }
    }
    abFocusNextField(id, { delay: 0.05, bias: 0.22 });
  });
});

document.getElementById("abCountryBtn")?.addEventListener("click", () => {
  abToast(abT("abIndiaOnly", "India corridor is selected for this demo."), "info");
});

document.getElementById("abCurrencyBtn")?.addEventListener("click", () => {
  abToast(abT("abIndiaOnly", "India corridor is selected for this demo."), "info");
});

abOtpInputs.forEach((input, i) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    if (input.value && abOtpInputs[i + 1]) abOtpInputs[i + 1].focus();
    abSyncOtpSubmit();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && abOtpInputs[i - 1]) abOtpInputs[i - 1].focus();
  });
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    [...text].forEach((ch, n) => {
      if (abOtpInputs[n]) abOtpInputs[n].value = ch;
    });
    abOtpInputs[Math.min(text.length, 5)]?.focus();
    abSyncOtpSubmit();
  });
});

document.getElementById("abOtpForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (abOtpValue().length !== 6) return;
  if (typeof getPayPath === "function" && getPayPath() === "otp") {
    abToast(abT("otpIncorrect", "OTP entered is incorrect. Please try again."), "error");
    return;
  }
  abCompleteOtpSuccess();
});

abOtpResend?.addEventListener("click", () => {
  abClearOtpInputs();
  abStartOtpTimer();
});

document.getElementById("abFooterCancel")?.addEventListener("click", () => abGoBeneficiaries());
document.getElementById("abFooterSubmit")?.addEventListener("click", () => {
  abFinishDetailsOrCashSheets();
});

document.getElementById("abOverviewSubmit")?.addEventListener("click", () => {
  abOpenOtpDestModal();
});

document.getElementById("abEditOverview")?.addEventListener("click", () => {
  abReturnToFlow(abIsCash() || abIsUpi() || abIsVisa() ? "details" : "channel");
});
document.getElementById("abTermsOk")?.addEventListener("click", () => {
  abCloseModal("abTerms");
  abShowThanks();
});

document.querySelectorAll("[data-ab-close]").forEach((el) => {
  el.addEventListener("click", () => {
    const which = el.getAttribute("data-ab-close");
    if (which === "terms") abCloseModal("abTerms");
  });
});

document.getElementById("abThanksOk")?.addEventListener("click", () => abGoBeneficiaries());

abBackEl?.addEventListener("click", (e) => {
  const thanks = abPanel("thanks");
  if (thanks && !thanks.hidden) {
    e.preventDefault();
    return;
  }
  const overview = abPanel("overview");
  if (overview && !overview.hidden) {
    e.preventDefault();
    abReturnToFlow(null);
    return;
  }
  const flow = abPanel("flow");
  if (flow && !flow.hidden) {
    e.preventDefault();
    abFooterBack();
    return;
  }
  e.preventDefault();
  if (typeof amePageBack === "function") amePageBack("beneficiaries.html");
  else if (typeof ameNavigate === "function") ameNavigate("beneficiaries.html");
  else location.href = "beneficiaries.html";
});

document.getElementById("dashLogoutBtn")?.addEventListener("click", () => {
  if (typeof closeMenu === "function") closeMenu();
  if (typeof ameClearSession === "function") ameClearSession();
  if (typeof ameNavigate === "function") ameNavigate("index.html");
});

document.addEventListener("ame:lang", () => {
  if (!abTitleEl) return;
  if (abState.step === "overview") {
    abTitleEl.textContent = abT("abOverviewTitle", "Overview Of Beneficiary Details");
    abPaintOverview();
  } else if (abState.step === "thanks") {
    if (abTitleEl) {
      abTitleEl.textContent = "";
      abTitleEl.hidden = true;
    }
    if (abBackEl) abBackEl.hidden = true;
  } else {
    abTitleEl.textContent = abT("addBeneficiary", abTitleEl.textContent);
  }
  abPaintSums();
});

function abSyncFloat(el) {
  const field = el.closest(".field");
  if (!field) return;
  const filled = "value" in el ? String(el.value || "").trim() !== "" : true;
  field.classList.toggle("has-value", filled);
  const triggerVal = field.querySelector(".ab-dd-trigger__value");
  if (triggerVal && el.tagName === "SELECT") {
    const opt = el.selectedOptions?.[0];
    const text = opt && !opt.disabled && opt.value !== "" ? (opt.textContent || "").trim() : "";
    triggerVal.textContent = text || "\u00a0";
  }
}

function abPickerEl() {
  return document.getElementById("abPicker");
}

function abClosePicker() {
  const picker = abPickerEl();
  if (!picker || picker.hidden) return;
  picker.classList.remove("is-open");
  document.body.classList.remove("ab-picker-open");
  document.querySelectorAll(".page-add-bene .field--dd.is-open, #abBranchSheet .field.is-open").forEach((f) => {
    f.classList.remove("is-open");
  });
  document.getElementById("abSheetBankValue")?.setAttribute("aria-expanded", "false");
  document.getElementById("abSheetBranchQuery")?.setAttribute("aria-expanded", "false");
  document.querySelectorAll(".page-add-bene .ab-dd-trigger").forEach((t) => t.setAttribute("aria-expanded", "false"));
  const done = () => {
    picker.hidden = true;
    picker.setAttribute("aria-hidden", "true");
    picker.classList.remove("ab-picker--sheet");
    abPickerSelect = null;
    abPickerMode = null;
    abPickerOnSelect = null;
    abPickerItemsAll = [];
    abPickerActiveValue = "";
    const search = document.getElementById("abPickerSearch");
    const searchWrap = document.getElementById("abPickerSearchWrap");
    if (search) search.value = "";
    if (searchWrap) searchWrap.hidden = true;
  };
  const panel = picker.querySelector(".ab-picker__panel");
  panel?.addEventListener("transitionend", done, { once: true });
  setTimeout(done, 340);
}

function abFilterPickerItems(query = "") {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return abPickerItemsAll;
  return abPickerItemsAll.filter((item) => {
    const label = String(item.label || "").toLowerCase();
    const value = String(item.value || "").toLowerCase();
    return label.includes(q) || value.includes(q);
  });
}

function abFillPickerList(items, activeValue) {
  const list = document.getElementById("abPickerList");
  if (!list) return;
  list.innerHTML = "";
  list.classList.toggle("ab-picker__list--banks", abPickerMode === "bank");
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "ab-picker__empty";
    empty.textContent = abT("abNoResults", "No results found");
    list.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ab-picker__item";
    if (abPickerMode === "bank") btn.classList.add("ab-picker__item--bank");
    btn.setAttribute("role", "option");
    btn.dataset.value = String(item.value ?? "");

    if (abPickerMode === "bank") {
      btn.appendChild(abCreateBankIconEl(item.value, item.label));
      const copy = document.createElement("span");
      copy.className = "ab-picker__item-label";
      copy.textContent = item.label || String(item.value ?? "");
      btn.appendChild(copy);
    } else {
      btn.textContent = item.label || String(item.value ?? "");
    }

    const on = activeValue != null && activeValue !== "" && String(activeValue) === String(item.value);
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
    btn.addEventListener("click", () => {
      const handler = abPickerOnSelect;
      abClosePicker();
      if (typeof handler === "function") handler(item);
    });
    list.appendChild(btn);
  });
}

function abOpenPickerList({ title, items, activeValue, onSelect, anchorField, mode }) {
  const picker = abPickerEl();
  const titleEl = document.getElementById("abPickerTitle");
  const searchWrap = document.getElementById("abPickerSearchWrap");
  const search = document.getElementById("abPickerSearch");
  if (!picker || !items?.length) return;

  if (mode !== "select") abPickerSelect = null;
  abPickerMode = mode || null;
  abPickerOnSelect = onSelect || null;
  abPickerItemsAll = items;
  abPickerActiveValue = activeValue ?? "";

  if (titleEl) titleEl.textContent = title || abT("continue", "Select");

  const sheetMode = mode === "bank" || mode === "branch";
  picker.classList.toggle("ab-picker--sheet", sheetMode);
  if (searchWrap) {
    searchWrap.hidden = !sheetMode;
  }
  if (search) {
    search.value = "";
    search.placeholder =
      mode === "bank"
        ? abT("abSearchBank", "Search bank")
        : mode === "branch"
          ? abT("abBranchSearchHint", "Please enter at least 3 characters to search branch")
          : abT("abSearch", "Search");
  }

  document
    .querySelectorAll(".page-add-bene .field--dd.is-open, #abBranchSheet .field.is-open")
    .forEach((f) => f.classList.remove("is-open"));
  anchorField?.classList.add("is-open");

  const alreadyOpen = !picker.hidden && picker.classList.contains("is-open");
  abFillPickerList(items, abPickerActiveValue);

  if (alreadyOpen) {
    if (sheetMode) requestAnimationFrame(() => search?.focus());
    return;
  }

  picker.hidden = false;
  picker.setAttribute("aria-hidden", "false");
  document.body.classList.add("ab-picker-open");
  requestAnimationFrame(() => {
    picker.classList.add("is-open");
    if (sheetMode) search?.focus();
  });
}

function abOpenPicker(selectEl) {
  if (!selectEl) return;
  const field = selectEl.closest(".field");
  const label =
    field?.querySelector(".field__label")?.textContent?.trim() ||
    selectEl.getAttribute("aria-label") ||
    abT("continue", "Select");

  const items = [...selectEl.options]
    .filter((opt) => !(opt.disabled && !opt.value) && !opt.hidden)
    .map((opt) => ({
      value: opt.value,
      label: (opt.textContent || "").trim() || opt.value,
    }))
    .filter((item) => item.value !== "");

  if (!items.length) return;

  abOpenPickerList({
    title: label,
    mode: "select",
    anchorField: field,
    activeValue: selectEl.value,
    items,
    onSelect: (item) => {
      selectEl.value = item.value;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      selectEl.dispatchEvent(new Event("input", { bubbles: true }));
      abSyncFloat(selectEl);
      abSyncActionButtons();
      if (selectEl.id) abFocusNextField(selectEl.id, { delay: 0.22, bias: 0.22 });
    },
  });
  abPickerSelect = selectEl;
  field?.querySelector(".ab-dd-trigger")?.setAttribute("aria-expanded", "true");
}

function abEnhanceSelect(selectEl) {
  if (!selectEl || selectEl.dataset.abDd === "1") return;
  const field = selectEl.closest(".field");
  if (!field) return;
  selectEl.dataset.abDd = "1";
  field.classList.add("field--dd", "field--select");

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "ab-dd-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  const valueSpan = document.createElement("span");
  valueSpan.className = "ab-dd-trigger__value";
  valueSpan.textContent = "\u00a0";
  trigger.appendChild(valueSpan);
  field.insertBefore(trigger, selectEl);

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectEl.disabled) return;
    if (selectEl.id === "abBank" || selectEl.id === "abBranch") {
      abOpenBranchSheet();
      return;
    }
    abOpenPicker(selectEl);
  });

  abSyncFloat(selectEl);
}

function abEnhanceAllSelects() {
  document
    .querySelectorAll(".page-add-bene .ab-shell select, .page-add-bene #abBranchSheet select")
    .forEach((sel) => abEnhanceSelect(sel));
}

function abOpenSheetBankPicker() {
  const field = document.getElementById("abSheetBankField");
  const items = Object.keys(AB_BANK_NAMES).map((code) => ({
    value: code,
    label: abFormatBankLabel(code, `${code}-${AB_BANK_NAMES[code]}`),
  }));
  const title =
    document.querySelector("#abSheetBankField .field__label")?.textContent?.trim() ||
    abT("abSheetBank", "Bank");
  document.getElementById("abSheetBankValue")?.setAttribute("aria-expanded", "true");
  abOpenPickerList({
    title,
    mode: "bank",
    anchorField: field,
    activeValue: abBranchSheetState.bank || "",
    items,
    onSelect: (item) => abSelectSheetBank(item.value, item.label),
  });
}

document.querySelectorAll("[data-ab-picker-close]").forEach((el) => {
  el.addEventListener("click", () => abClosePicker());
});

document.getElementById("abPickerSearch")?.addEventListener("input", (e) => {
  if (abPickerMode !== "bank" && abPickerMode !== "branch") return;
  abFillPickerList(abFilterPickerItems(e.target.value || ""), abPickerActiveValue);
});

document.querySelectorAll(".page-add-bene .field--float input, .page-add-bene .field--float select").forEach((el) => {
  abSyncFloat(el);
  el.addEventListener("input", () => {
    abSyncFloat(el);
    abSyncActionButtons();
  });
  el.addEventListener("change", () => {
    abSyncFloat(el);
    abSyncActionButtons();
  });
});

abBuildBankMenu();
abEnhanceAllSelects();

/* Start on dedicated country/currency page — accordion begins after Continue */
abShowCorridorPage();
abPaintBankAccVisibility();
abPaintSums();
abSyncActionButtons();
abEnhanceAllSelects();
