const dict = () => (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};

let cartItems = [];
let termsAccepted = false;

const listEl = document.getElementById("cartList");
const remitCountEl = document.getElementById("cartRemitCount");
const fxTab = document.getElementById("cartFxTab");
const totalEl = document.getElementById("cartPayTotal");
const termsEl = document.getElementById("cartTerms");
const payBtn = document.getElementById("cartPayBtn");
const paySheet = document.getElementById("paySheet");
const paySheetBackdrop = document.getElementById("paySheetBackdrop");
const paySheetClose = document.getElementById("paySheetClose");
const payOk = document.getElementById("payOk");
const payOkExit = document.getElementById("payOkExit");
const payOkDownload = document.getElementById("payOkDownload");
const payOkShare = document.getElementById("payOkShare");
const payOkNew = document.getElementById("payOkNew");
const payOkLottieEl = document.getElementById("payOkLottie");
const payOkFailIcon = document.getElementById("payOkFailIcon");
const payOkFailVideo = document.getElementById("payOkFailVideo");
const payOkPendingAnim = document.getElementById("payOkPendingAnim");
const payOkPendingVideo = document.getElementById("payOkPendingVideo");
const payOkPendingIcon = document.getElementById("payOkPendingIcon");
const payOkPendingHero = document.getElementById("payOkPendingHero");
const payOkPending = document.getElementById("payOkPending");
const payOkKiosk = document.getElementById("payOkKiosk");
const payOkKioskActions = document.getElementById("payOkKioskActions");
const payOkAccount = document.getElementById("payOkAccount");
const payOkPendingMarkImg = document.getElementById("payOkPendingMarkImg");
const payOkPendingTitleBranch = document.getElementById("payOkPendingTitleBranch");
const payOkPendingTitleKiosk = document.getElementById("payOkPendingTitleKiosk");
const payOkPendingLeadBranch = document.getElementById("payOkPendingLeadBranch");
const payOkPendingLeadKiosk = document.getElementById("payOkPendingLeadKiosk");
const payOkCopyAll = document.getElementById("payOkCopyAll");
const payOkTxnCard = document.getElementById("payOkTxnCard");
const payOkAppId = document.getElementById("payOkAppId");
const payOkAppIdValue = document.getElementById("payOkAppIdValue");
const payOkPendingStep4 = document.getElementById("payOkPendingStep4");
const payOkTitle = document.getElementById("payOkTitle");
const payOkLead = document.getElementById("payOkLead");
const payOkFailCode = document.getElementById("payOkFailCode");
const payOkFailCodeNum = document.getElementById("payOkFailCodeNum");
const payOkFailCodeMsg = document.getElementById("payOkFailCodeMsg");
const payOkPerks = document.getElementById("payOkPerks");
const payOkAssist = document.getElementById("payOkAssist");
const payOkBadgeLabel = document.getElementById("payOkBadgeLabel");
const payOkBadgeOk = document.querySelector(".pay-ok__badge-ok");
const payOkBadgeFail = document.querySelector(".pay-ok__badge-fail");
const payPathBtn = document.getElementById("payPathBtn");
const payPathMenu = document.getElementById("payPathMenu");
const payPathBtnLabel = document.getElementById("payPathBtnLabel");
const paySheetTitle = document.getElementById("paySheetTitle");
const paySheetLead = document.getElementById("paySheetLead");
const paySheetMethods = document.getElementById("paySheetMethods");
const paySheetDest = document.getElementById("paySheetDest");
const paySheetOtp = document.getElementById("paySheetOtp");
const paySheetStages = document.getElementById("paySheetStages");
const payOtpForm = document.getElementById("payOtpForm");
const payOtpInputs = [...document.querySelectorAll("#payOtpInputs input")];
const payOtpSubmit = document.getElementById("payOtpSubmit");
const payOtpBack = document.getElementById("payOtpBack");
const payOtpResend = document.getElementById("payOtpResend");
const payOtpTimer = document.getElementById("payOtpTimer");
const payOtpSand = document.getElementById("payOtpSand");
const payOtpNoteIcon = document.getElementById("payOtpNoteIcon");
const payOtpChannelLabel = document.getElementById("payOtpChannelLabel");
const payOtpMask = document.getElementById("payOtpMask");
const payOtpArtImg = document.getElementById("payOtpArtImg");
const payOtpError = document.getElementById("payOtpError");
const payOtpErrorText = document.getElementById("payOtpErrorText");
const payDestBack = document.getElementById("payDestBack");
const PAY_PATH_KEY = "ame-pay-path";
const PAY_OTP_MASKS = {
  mobile: "699****666",
  whatsapp: "699****666",
  email: "*****GopalKrishna@gmail.com",
};
const PAY_OTP_ART = {
  mobile: "assets/images/otp/mobile.png",
  whatsapp: "assets/images/otp/whatsapp.png",
  email: "assets/images/otp/email.png",
};
const PAY_OTP_ICONS = {
  mobile: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="18.2" r="0.9" fill="currentColor"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M12 3.5a8.2 8.2 0 0 0-7 12.5L4 20.5l4.7-1.2A8.2 8.2 0 1 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.2 9.4c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .5-.2.6l-.5.4a6 6 0 0 0 2.6 2.6l.4-.5c.2-.2.4-.3.6-.2l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .5-.5.7A7 7 0 0 1 9.2 9.4Z" fill="currentColor"/></svg>',
  email: '<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
};
let payOkSound = null;
let payOkPendingSound = null;
let payOkLottieAnim = null;
let payPath = "happy";
let payOtpSeconds = 240;
let payOtpClock = null;
let pendingPayMethod = null;
let pendingPayChannel = null;

function normalizePayPath(path) {
  if (path === "sad" || path === "otp") return path;
  return "happy";
}

function getPayPath() {
  try {
    return normalizePayPath(localStorage.getItem(PAY_PATH_KEY));
  } catch {
    return "happy";
  }
}

function payPathLabel(path) {
  const d = dict();
  if (path === "sad") return d.payPathSad || "Sad path";
  if (path === "otp") return d.payPathOtp || "OTP error";
  return d.payPathHappy || "Happy path";
}

function syncPayPathUi(path) {
  payPath = normalizePayPath(path);
  if (payPathBtnLabel) {
    payPathBtnLabel.textContent = payPathLabel(payPath);
  }
  document.querySelectorAll("[data-set-pay-path]").forEach((opt) => {
    const on = opt.getAttribute("data-set-pay-path") === payPath;
    opt.classList.toggle("is-on", on);
    opt.setAttribute("aria-selected", on ? "true" : "false");
  });
}

function setPayPath(next) {
  payPath = normalizePayPath(next);
  try {
    localStorage.setItem(PAY_PATH_KEY, payPath);
  } catch {
    /* ignore */
  }
  syncPayPathUi(payPath);
}

function getPayOkPendingKind(method) {
  if (method === "branch" || method === "bank" || method === "kiosk") return method;
  return null;
}

function applyPayOkPendingHero(pendingKind) {
  if (payOkPendingMarkImg) {
    if (pendingKind === "kiosk") {
      payOkPendingMarkImg.src = "assets/images/pay/kiosk.png?v=61";
    } else if (pendingKind === "bank") {
      payOkPendingMarkImg.src = "assets/images/pay/bank.png?v=61";
    } else if (pendingKind === "branch") {
      payOkPendingMarkImg.src = "assets/images/pay/branch.png?v=68";
    }
  }
  const isBank = pendingKind === "bank";
  const isKiosk = pendingKind === "kiosk";
  if (payOkPendingTitleBranch) payOkPendingTitleBranch.hidden = !isBank;
  if (payOkPendingTitleKiosk) payOkPendingTitleKiosk.hidden = true;
  if (payOkPendingLeadBranch) payOkPendingLeadBranch.hidden = !isBank;
  if (payOkPendingLeadKiosk) payOkPendingLeadKiosk.hidden = !isKiosk;
}

function applyPayOkMode(isFail, pendingKind) {
  if (!payOk) return;
  const d = dict();
  const fail = Boolean(isFail);
  const isKiosk = !fail && pendingKind === "kiosk";
  const isBank = !fail && pendingKind === "bank";
  const isBranch = !fail && pendingKind === "branch";
  /* Branch uses K-Net success shell; only bank/kiosk use pending layout */
  const pending = isBank || isKiosk;
  payOk.classList.toggle("is-fail", fail);
  payOk.classList.toggle("is-pending", pending);
  payOk.classList.toggle("is-pending-branch", isBranch);
  payOk.classList.toggle("is-pending-bank", isBank);
  payOk.classList.toggle("is-pending-kiosk", isKiosk);
  if (isBank || isKiosk) applyPayOkPendingHero(pendingKind);
  else if (payOkPendingLeadKiosk) payOkPendingLeadKiosk.hidden = true;

  if (payOkTitle) {
    if (fail) {
      payOkTitle.hidden = false;
      payOkTitle.textContent = d.txFail || "Transaction Failed!";
      payOkTitle.removeAttribute("data-i18n");
    } else if (isBank) {
      payOkTitle.hidden = true;
    } else if (isBranch) {
      payOkTitle.hidden = false;
      payOkTitle.textContent = d.txSuccessBang || d.txSuccess || "Transaction Success!";
      payOkTitle.removeAttribute("data-i18n");
    } else {
      payOkTitle.hidden = false;
      payOkTitle.textContent = d.txSuccess || "Transaction Successful";
      payOkTitle.removeAttribute("data-i18n");
    }
  }
  if (payOkLead) {
    if (fail || isBank || isKiosk) {
      payOkLead.hidden = true;
    } else if (isBranch) {
      payOkLead.hidden = false;
      payOkLead.textContent = d.txBranchSuccessLead || "Pay at your nearest Al Mulla Exchange Branch. Click Locate Branch to view branch list.";
      payOkLead.removeAttribute("data-i18n");
    } else {
      payOkLead.hidden = false;
      payOkLead.textContent = d.txSuccessLead || "Your payment has been completed successfully.";
      payOkLead.removeAttribute("data-i18n");
    }
  }
  if (payOkPendingHero) {
    payOkPendingHero.hidden = !isBank;
  }
  if (payOkAppId) {
    payOkAppId.hidden = !isBank;
  }
  if (payOkAccount) {
    payOkAccount.hidden = !isBank;
    payOkAccount.setAttribute("aria-hidden", isBank ? "false" : "true");
  }
  if (payOkFailCode) {
    payOkFailCode.hidden = !fail;
  }
  if (fail) {
    if (payOkFailCodeNum) payOkFailCodeNum.textContent = "100080";
    if (payOkFailCodeMsg) {
      payOkFailCodeMsg.textContent = d.txFailCodeMsg || "The transaction has been cancelled";
      payOkFailCodeMsg.removeAttribute("data-i18n");
    }
  }
  if (payOkBadgeLabel) {
    payOkBadgeLabel.textContent = fail ? (d.txFailed || "Failed") : (d.txSuccessful || "Successful");
    payOkBadgeLabel.removeAttribute("data-i18n");
  }
  if (payOkBadgeOk) payOkBadgeOk.hidden = fail;
  if (payOkBadgeFail) {
    payOkBadgeFail.hidden = !fail;
    payOkBadgeFail.setAttribute("aria-hidden", fail ? "false" : "true");
  }
  if (payOkPerks) payOkPerks.hidden = fail || isBank;
  if (payOkAssist) {
    payOkAssist.hidden = !fail;
  }
  if (payOkFailIcon) {
    payOkFailIcon.hidden = !fail;
    payOkFailIcon.setAttribute("aria-hidden", fail ? "false" : "true");
  }
  if (payOkPendingAnim) {
    payOkPendingAnim.hidden = !isBank;
    payOkPendingAnim.setAttribute("aria-hidden", isBank ? "false" : "true");
  }
  if (payOkPendingIcon) {
    payOkPendingIcon.hidden = true;
    payOkPendingIcon.setAttribute("aria-hidden", "true");
  }
  if (payOkLottieEl) payOkLottieEl.hidden = fail || isBank;
  if (payOkTxnCard) {
    payOkTxnCard.hidden = isBank || isKiosk;
    payOkTxnCard.setAttribute("aria-hidden", payOkTxnCard.hidden ? "true" : "false");
  }
  if (payOkPending) {
    payOkPending.hidden = !isBank;
    payOkPending.setAttribute("aria-hidden", isBank ? "false" : "true");
  }
  if (payOkKiosk) {
    payOkKiosk.hidden = !isKiosk;
    payOkKiosk.setAttribute("aria-hidden", isKiosk ? "false" : "true");
  }
  if (payOkKioskActions) {
    payOkKioskActions.hidden = !isKiosk;
    payOkKioskActions.setAttribute("aria-hidden", isKiosk ? "false" : "true");
  }
  const payOkAppIdRow = document.getElementById("payOkAppIdRow");
  if (payOkAppIdRow) payOkAppIdRow.hidden = !(isBranch || fail);
  const payOkBranchLocate = document.getElementById("payOkBranchLocate");
  if (payOkBranchLocate) {
    payOkBranchLocate.hidden = !isBranch;
    if (!isBranch) payOkBranchLocate.setAttribute("hidden", "");
  }
  if (payOkDownload) payOkDownload.hidden = fail || pending || isBranch;
  if (payOkShare) payOkShare.hidden = fail || pending || isBranch;
  if (payOkNew) payOkNew.hidden = fail || pending;
}

function playPayOkSound() {
  try {
    stopPayOkPendingSound();
    if (!payOkSound) {
      payOkSound = new Audio("assets/sounds/payment-success.wav");
      payOkSound.preload = "auto";
      payOkSound.volume = 0.7;
    }
    payOkSound.pause();
    payOkSound.currentTime = 0;
    const play = payOkSound.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  } catch (e) {
    /* ignore autoplay / audio errors */
  }
}

function playPayOkPendingSound() {
  try {
    if (payOkSound) {
      payOkSound.pause();
      payOkSound.currentTime = 0;
    }
    if (!payOkPendingSound) {
      payOkPendingSound = new Audio("assets/sounds/payment-pending.wav?v=2");
      payOkPendingSound.preload = "auto";
      payOkPendingSound.volume = 0.55;
    }
    payOkPendingSound.loop = false;
    payOkPendingSound.pause();
    payOkPendingSound.currentTime = 0;
    const play = payOkPendingSound.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  } catch (e) {
    /* ignore autoplay / audio errors */
  }
}

function stopPayOkPendingSound() {
  if (!payOkPendingSound) return;
  try {
    payOkPendingSound.pause();
    payOkPendingSound.currentTime = 0;
  } catch (e) {
    /* ignore */
  }
}

function destroyPayOkLottie() {
  if (payOkLottieAnim) {
    try {
      payOkLottieAnim.destroy();
    } catch (e) {
      /* ignore */
    }
    payOkLottieAnim = null;
  }
  if (payOkLottieEl) payOkLottieEl.innerHTML = "";
  stopPayOkFailVideo();
  stopPayOkPendingVideo();
}

function stopPayOkFailVideo() {
  if (!payOkFailVideo) return;
  try {
    payOkFailVideo.pause();
    payOkFailVideo.currentTime = 0;
  } catch (e) {
    /* ignore */
  }
}

function playPayOkFailVideo() {
  if (!payOkFailVideo) return;
  try {
    payOkFailVideo.pause();
    payOkFailVideo.currentTime = 0;
    const play = payOkFailVideo.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  } catch (e) {
    /* ignore autoplay errors */
  }
}

function stopPayOkPendingVideo() {
  if (!payOkPendingVideo) return;
  try {
    payOkPendingVideo.pause();
    payOkPendingVideo.currentTime = 0;
  } catch (e) {
    /* ignore */
  }
}

function playPayOkPendingVideo() {
  if (!payOkPendingVideo) return;
  try {
    payOkPendingVideo.pause();
    payOkPendingVideo.currentTime = 0;
    const play = payOkPendingVideo.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  } catch (e) {
    /* ignore autoplay errors */
  }
}

function playPayOkLottie() {
  if (!payOkLottieEl || typeof lottie === "undefined") return;
  const data = window.PAY_OK_ANIMATION;
  if (!data) return;
  try {
    destroyPayOkLottie();
    // Clone so lottie-web does not mutate the shared global payload
    const animationData = typeof structuredClone === "function"
      ? structuredClone(data)
      : JSON.parse(JSON.stringify(data));
    payOkLottieAnim = lottie.loadAnimation({
      container: payOkLottieEl,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData,
    });
  } catch (e) {
    /* ignore load / play errors */
  }
}

let payCloseTimer = null;
let lastReceipt = null;
const PAY_ANIM_MS = 420;

const PAY_LABELS = {
  knet: "payKnet",
  branch: "payBranch",
  kiosk: "payKiosk",
  bank: "payBank",
};

const ICON_USER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.2c1.2-3.2 3.6-4.8 6.5-4.8s5.3 1.6 6.5 4.8"/></svg>`;
const ICON_BANK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M4 18.5h16M12 4 4 9h16L12 4Z"/></svg>`;
const ICON_PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z"/><circle cx="12" cy="10.8" r="2.2"/></svg>`;
const ICON_CARD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M3.5 10.5h17M7 15h4"/></svg>`;
const ICON_FUNDS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3.8 5 7.2v4.6c0 4.2 2.9 7.1 7 8.4 4.1-1.3 7-4.2 7-8.4V7.2L12 3.8Z"/><path d="M9.2 12.2h5.6M12 9.8v4.8"/></svg>`;
const ICON_PURPOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.4"/></svg>`;
const ICON_SEND = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 19V6.5M7.5 10.5 12 6l4.5 4.5"/></svg>`;
const ICON_FEE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m9 15 6-6M9.5 9.5h.1M14.5 14.5h.1"/></svg>`;
const ICON_NET = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 4.5h7.5L19 9v10.5H7V4.5Z"/><path d="M14.5 4.5V9H19"/><path d="M10 13h6M10 16.5h4"/></svg>`;

function cartLine(label, value, icon, strong) {
  const mark = icon ? `<span class="cart-line__icon">${icon}</span>` : "";
  return `<div class="cart-line${strong ? " is-strong" : ""}">${mark}<span class="cart-line__label">${label}</span><span class="cart-line__value">${value}</span></div>`;
}

function cartMeta(label, value, opts = {}) {
  const sep = `<span class="cart-meta__sep" aria-hidden="true">–</span>`;
  if (opts.stack) {
    return `<div class="cart-meta cart-meta--stack"><span class="cart-meta__lead"><span class="cart-meta__label">${label}</span>${sep}</span><span class="cart-meta__value">${value}</span></div>`;
  }
  return `<div class="cart-meta"><span class="cart-meta__label">${label}</span>${sep}<span class="cart-meta__value">${value}</span></div>`;
}

function cartMoney(label, value, opts = {}) {
  const cls = ["cart-money"];
  if (opts.strong) cls.push("is-strong");
  if (opts.sub) cls.push("is-sub");
  if (opts.head) cls.push("is-head");
  if (opts.regular) cls.push("is-regular");
  return `<div class="${cls.join(" ")}"><span class="cart-money__label">${label}</span><span class="cart-money__value">${value}</span></div>`;
}

function itemTotals(item, b) {
  const sendKwd = sendParseAmt(item.amount);
  const fee = b.fee || 1;
  const youPay = sendKwd + fee;
  const recv = sendKwd * b.rate;
  return { sendKwd, fee, youPay, recv };
}

function renderItem(item, index) {
  const b = getSendBeneficiary(item.id);
  if (!b) return "";
  const d = dict();
  const { sendKwd, fee, youPay, recv } = itemTotals(item, b);
  const invRate = b.rate ? 1 / b.rate : 0;
  const appId = item.appId || sendAppId(item.id);
  const bankLine = [b.bank, b.branch].filter(Boolean).join(", ");
  const promo = Number(b.promoDiscount) || 0;
  const netFee = Math.max(0, fee - promo);
  const feeSign = (n) => (n > 0 ? `+ ${sendFmt(n, 3)}` : n < 0 ? `- ${sendFmt(Math.abs(n), 3)}` : `- ${sendFmt(0, 0)}`);

  return `<li>
    <article class="cart-card" data-id="${item.id}">
      <button class="cart-card__delete" type="button" data-remove="${item.id}" data-index="${index}" aria-label="${d.cartRemove || "Remove"}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M5 7h14"/>
          <path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7"/>
          <path d="M7.5 7v12.2A1.8 1.8 0 0 0 9.3 21h5.4a1.8 1.8 0 0 0 1.8-1.8V7"/>
          <path d="M10 11v6M14 11v6"/>
        </svg>
      </button>
      <div class="cart-card__grid">
        <div class="cart-card__info">
          <span class="cart-card__app">${d.cartApplication || "Application #"} ${appId}</span>
          ${cartMeta(d.beneficiary || "Beneficiary", b.name, { stack: true })}
          ${cartMeta(d.accountNumber || "Account Number", b.account, { stack: true })}
          ${cartMeta(d.sourceOfFunds || "Source of Funds", b.source || "Salary", { stack: true })}
          ${cartMeta(d.bank || "Bank", bankLine, { stack: true })}
          ${cartMeta(d.purposeOfTransaction || "Purpose of Transaction", b.purpose || "Family Maintenance / Savings", { stack: true })}
        </div>
        <div class="cart-card__finance">
          <div class="cart-card__rates">
            <div class="cart-rate">
              <span class="cart-rate__pair">${b.currency} → KWD</span>
              <span class="cart-rate__val">${sendFmt(invRate, 5)}</span>
            </div>
            <div class="cart-rate">
              <span class="cart-rate__pair">KWD → ${b.currency}</span>
              <span class="cart-rate__val">${sendFmt(b.rate, 6)}</span>
            </div>
          </div>
          ${cartMoney(d.youSend || "You Send", `${sendFmt(sendKwd, 0)} KWD`)}
          ${cartMoney(`${d.elementsOfTransactionFee || "Elements of Transaction Fee"}:`, "", { head: true })}
          ${cartMoney(d.transactionFees || "Transaction Fees", `${feeSign(fee)} KWD`, { regular: true })}
          ${cartMoney(d.promotionDiscount || "Promotion Discount", `${promo > 0 ? `- ${sendFmt(promo, 3)}` : `- ${sendFmt(0, 0)}`} KWD`, { regular: true })}
          ${cartMoney(d.netTransactionFees || "Net Transaction Fees", `${feeSign(netFee)} KWD`, { regular: true })}
          <div class="cart-payline">
            <div class="cart-payline__item">
              <span class="cart-payline__label">${d.receive || "Receive"}</span>
              <span class="cart-payline__value">${sendFmt(recv, 0)} ${b.currency}</span>
            </div>
            <div class="cart-payline__item">
              <span class="cart-payline__label">${d.youPay || "You Pay"}</span>
              <span class="cart-payline__value">${sendFmt(youPay, 0)} KWD</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  </li>`;
}

function totalPay() {
  return cartItems.reduce((sum, item) => {
    const b = getSendBeneficiary(item.id);
    if (!b) return sum;
    return sum + itemTotals(item, b).youPay;
  }, 0);
}

function cartTotals() {
  return cartItems.reduce(
    (acc, item) => {
      const b = getSendBeneficiary(item.id);
      if (!b) return acc;
      const t = itemTotals(item, b);
      acc.amount += t.sendKwd;
      acc.fees += t.fee;
      acc.total += t.youPay;
      return acc;
    },
    { amount: 0, fees: 0, total: 0 }
  );
}

function updateSummary() {
  const box = document.getElementById("cartSummary");
  if (!box) return;
  if (!cartItems.length) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  const { amount, fees, total } = cartTotals();
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set("cartSumAmount", `${sendFmt(amount, 3)} KWD`);
  set("cartSumFees", `+${sendFmt(fees, 3)} KWD`);
  set("cartSumNetFees", `${sendFmt(fees, 3)} KWD`);
  const totalElSum = document.getElementById("cartSumTotal");
  if (totalElSum) totalElSum.textContent = `${sendFmt(total, 3)} KWD`;
}

function updateTabs() {
  if (remitCountEl) remitCountEl.textContent = `(${cartItems.length})`;
}

function updatePayBtn() {
  const total = totalPay();
  if (totalEl) totalEl.textContent = `${sendFmt(total, 3)} KWD`;
  if (payBtn) payBtn.disabled = !termsAccepted || cartItems.length === 0;
  updateSummary();
}

function persistCart() {
  const quoteCcy = Object.fromEntries(cartItems.map((i) => [i.id, i.quoteCcy || "KWD"]));
  saveSendCart(cartItems.map((i) => i.id), quoteCcy);
  if (typeof paintHeaderCartBadge === "function") paintHeaderCartBadge();
}

let pendingDeleteId = null;
const cartConsent = document.getElementById("cartConsent");
const cartConsentMsg = document.getElementById("cartConsentMsg");
const cartConsentYes = document.getElementById("cartConsentYes");
const cartConsentNo = document.getElementById("cartConsentNo");
const cartConsentBackdrop = document.getElementById("cartConsentBackdrop");

function removeCartItem(id, index) {
  const at = Number(index);
  if (Number.isInteger(at) && cartItems[at] && cartItems[at].id === id) {
    cartItems.splice(at, 1);
  } else {
    const found = cartItems.findIndex((item) => item.id === id);
    if (found < 0) return;
    cartItems.splice(found, 1);
  }
  persistCart();
  render();
}

function closeDeleteConsent() {
  pendingDeleteId = null;
  if (!cartConsent) return;
  cartConsent.classList.remove("is-open");
  document.body.classList.remove("cart-consent-open");
  const finish = () => {
    cartConsent.hidden = true;
    cartConsent.setAttribute("aria-hidden", "true");
  };
  cartConsent.addEventListener("transitionend", finish, { once: true });
  setTimeout(finish, 280);
}

function confirmDeleteConsent() {
  if (!pendingDeleteId) {
    closeDeleteConsent();
    return;
  }
  const id = pendingDeleteId;
  cartItems = cartItems.filter((i) => i.id !== id);
  persistCart();
  closeDeleteConsent();
  render();
}

cartConsentYes?.addEventListener("click", confirmDeleteConsent);
cartConsentNo?.addEventListener("click", closeDeleteConsent);
document.getElementById("cartConsentClose")?.addEventListener("click", closeDeleteConsent);
cartConsentBackdrop?.addEventListener("click", closeDeleteConsent);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && cartConsent?.classList.contains("is-open")) {
    closeDeleteConsent();
  }
});

function render() {
  const d = dict();
  updateTabs();
  if (!cartItems.length) {
    listEl.innerHTML = `<li><p class="cart-empty">${d.cartEmptyPage || "Your cart is empty."}</p></li>`;
    updatePayBtn();
    return;
  }
  listEl.innerHTML = cartItems.map((item, index) => renderItem(item, index)).join("");
  listEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeCartItem(btn.dataset.remove, btn.dataset.index);
    });
  });
  updatePayBtn();
}

function loadCart() {
  const data = loadSendCart();
  cartItems = data.items.map((item) => {
    const b = getSendBeneficiary(item.id);
    if (b && item.amount) b.amount = item.amount;
    return { ...item };
  });
}

termsEl?.addEventListener("change", () => {
  termsAccepted = termsEl.checked;
  updatePayBtn();
  syncFxPay();
});

document.getElementById("cartAddBtn")?.addEventListener("click", () => {
  if (typeof ameNavigate === "function") ameNavigate("send.html");
  else location.href = "send.html";
});

function stopPayOtpTimer() {
  if (payOtpClock) {
    clearInterval(payOtpClock);
    payOtpClock = null;
  }
}

function renderPayOtpTimer() {
  if (!payOtpTimer) return;
  const m = Math.floor(payOtpSeconds / 60);
  const s = String(payOtpSeconds % 60).padStart(2, "0");
  payOtpTimer.textContent = `${m}:${s}`;
  if (payOtpResend) payOtpResend.disabled = payOtpSeconds > 0;
  payOtpSand?.classList.toggle("is-paused", payOtpSeconds <= 0);
}

function startPayOtpTimer() {
  stopPayOtpTimer();
  payOtpSeconds = 240;
  renderPayOtpTimer();
  payOtpClock = setInterval(() => {
    payOtpSeconds -= 1;
    if (payOtpSeconds <= 0) {
      payOtpSeconds = 0;
      stopPayOtpTimer();
    }
    renderPayOtpTimer();
  }, 1000);
}

function payOtpValue() {
  return payOtpInputs.map((input) => input.value).join("");
}

function syncPayOtpSubmit() {
  if (payOtpSubmit) payOtpSubmit.disabled = payOtpValue().length !== 6;
}

function clearPayOtpInputs() {
  payOtpInputs.forEach((input) => {
    input.value = "";
  });
  clearPayOtpError();
  syncPayOtpSubmit();
}

function clearPayOtpError() {
  if (payOtpError) {
    payOtpError.hidden = true;
  }
  payOtpForm?.classList.remove("is-otp-error");
  document.getElementById("payOtpInputs")?.classList.remove("is-error");
}

function showPayOtpError() {
  const d = dict();
  const msg = d.otpIncorrect || "OTP entered is incorrect. Please try again.";
  if (payOtpError) payOtpError.hidden = false;
  if (payOtpErrorText) {
    payOtpErrorText.textContent = msg;
    payOtpErrorText.removeAttribute("data-i18n");
  }
  payOtpForm?.classList.add("is-otp-error");
  const box = document.getElementById("payOtpInputs");
  box?.classList.remove("is-error");
  // re-trigger shake
  void box?.offsetWidth;
  box?.classList.add("is-error");
  if (typeof toast === "function") toast(msg, "error");
}

function completePayAfterOtp() {
  if (!pendingPayMethod || !lastReceipt) return;
  if (getPayPath() === "otp") {
    // Keep wrong digits visible so the error state is obvious
    showPayOtpError();
    requestAnimationFrame(() => {
      payOtpInputs[0]?.focus({ preventScroll: true });
      payOtpInputs[0]?.select?.();
    });
    return;
  }
  const isFail = getPayPath() === "sad";
  fillPayOk(lastReceipt, isFail);
  stopPayOtpTimer();
  closePaySheet();
  window.setTimeout(() => openPayOk(), 120);
}

function setPaySheetHead(step) {
  const d = dict();
  const isDest = step === "dest";
  const isOtp = step === "otp";
  if (paySheetTitle) {
    if (isOtp) {
      paySheetTitle.textContent = d.verifyTitle || "Verify";
      paySheetTitle.removeAttribute("data-i18n");
    } else if (isDest) {
      paySheetTitle.textContent = d.destTitle || "Destination of OTP to be sent";
      paySheetTitle.removeAttribute("data-i18n");
    } else {
      paySheetTitle.textContent = d.payMethodTitle || "Choose a Payment Method";
      paySheetTitle.setAttribute("data-i18n", "payMethodTitle");
    }
  }
  if (paySheetLead) {
    if (isOtp) {
      paySheetLead.hidden = false;
      paySheetLead.textContent = d.payOtpLead || "Enter the OTP sent to your selected destination.";
      paySheetLead.removeAttribute("data-i18n");
    } else if (isDest) {
      paySheetLead.hidden = false;
      paySheetLead.textContent = d.payDestLead || "Choose where we should send the one-time password.";
      paySheetLead.removeAttribute("data-i18n");
    } else {
      paySheetLead.hidden = true;
      paySheetLead.textContent = "";
      paySheetLead.removeAttribute("data-i18n");
    }
  }
}

function lockPaySheetStageHeight() {
  if (!paySheet || !paySheetStages || !paySheetMethods) return;
  if (paySheet.classList.contains("is-sized")) return;
  const h = Math.ceil(paySheetMethods.getBoundingClientRect().height);
  if (h > 0) {
    paySheetStages.style.setProperty("--pay-stage-h", `${h}px`);
    paySheet.classList.add("is-sized");
  }
}

function clearPaySheetStageHeight() {
  paySheet?.classList.remove("is-sized");
  paySheetStages?.style.removeProperty("--pay-stage-h");
}

function setPaySheetStep(step) {
  if (!paySheet) return;
  paySheet.classList.toggle("is-dest", step === "dest");
  paySheet.classList.toggle("is-otp", step === "otp");
  [paySheetMethods, paySheetDest, paySheetOtp].forEach((el) => {
    if (!el) return;
    const on = el.getAttribute("data-pay-stage") === step;
    el.classList.toggle("is-active", on);
    el.setAttribute("aria-hidden", on ? "false" : "true");
  });
  setPaySheetHead(step);
}

function clearPayChannels() {
  paySheet?.querySelectorAll("[data-pay-channel]").forEach((btn) => {
    btn.classList.remove("is-on");
    btn.setAttribute("aria-checked", "false");
  });
  pendingPayChannel = null;
}

function applyPayOtpChannel(channel) {
  const d = dict();
  const name = channel === "email" || channel === "whatsapp" ? channel : "mobile";
  const labelKey = name === "email" ? "emailAddress" : name === "whatsapp" ? "whatsappNumber" : "mobileNumber";
  if (payOtpChannelLabel) {
    payOtpChannelLabel.textContent = d[labelKey] || labelKey;
    payOtpChannelLabel.removeAttribute("data-i18n");
  }
  if (payOtpMask) payOtpMask.textContent = PAY_OTP_MASKS[name] || PAY_OTP_MASKS.mobile;
  if (payOtpNoteIcon) {
    payOtpNoteIcon.innerHTML = PAY_OTP_ICONS[name] || PAY_OTP_ICONS.mobile;
  }
  if (payOtpArtImg) {
    const nextSrc = PAY_OTP_ART[name] || PAY_OTP_ART.mobile;
    if (payOtpArtImg.getAttribute("src") !== nextSrc) {
      payOtpArtImg.setAttribute("src", nextSrc);
    }
  }
}

function showPaySheetMethods() {
  if (!paySheet) return;
  setPaySheetStep("methods");
  stopPayOtpTimer();
  clearPayOtpInputs();
  clearPayChannels();
  pendingPayMethod = null;
}

function showPaySheetDest() {
  if (!paySheet) return;
  lockPaySheetStageHeight();
  setPaySheetStep("dest");
  stopPayOtpTimer();
  clearPayOtpInputs();
  clearPayChannels();
}

function showPaySheetOtp(channel) {
  if (!paySheet) return;
  lockPaySheetStageHeight();
  pendingPayChannel = channel;
  applyPayOtpChannel(channel);
  setPaySheetStep("otp");
  clearPayOtpInputs();
  startPayOtpTimer();
  if (typeof toast === "function") toast(dict().otpSent || "OTP sent to your registered mobile number.", "info");
  requestAnimationFrame(() => payOtpInputs[0]?.focus({ preventScroll: true }));
}

function openPaySheet() {
  if (!paySheet) return;
  if (payCloseTimer) {
    clearTimeout(payCloseTimer);
    payCloseTimer = null;
  }
  paySheet.querySelectorAll(".pay-opt").forEach((btn) => {
    btn.classList.remove("is-on");
    btn.setAttribute("aria-checked", "false");
  });
  clearPaySheetStageHeight();
  showPaySheetMethods();
  paySheet.hidden = false;
  paySheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("pay-sheet-open");
  requestAnimationFrame(() => {
    paySheet.classList.add("is-open");
    requestAnimationFrame(() => lockPaySheetStageHeight());
  });
  paySheetClose?.focus();
}

function closePaySheet() {
  if (!paySheet || paySheet.hidden || !paySheet.classList.contains("is-open")) return;
  paySheet.classList.remove("is-open");
  paySheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("pay-sheet-open");
  stopPayOtpTimer();
  if (payCloseTimer) clearTimeout(payCloseTimer);
  payCloseTimer = window.setTimeout(() => {
    paySheet.hidden = true;
    clearPaySheetStageHeight();
    showPaySheetMethods();
    payCloseTimer = null;
  }, PAY_ANIM_MS);
}

function receiptText(meta) {
  const d = dict();
  if (meta?.kind === "fx") {
    const lines = [
      "Al Mulla Exchange",
      d.txSuccessBang || d.txSuccess || "Transaction Success!",
      `${d.txAmount || "Amount"}: ${meta.amount}`,
      `${d.txReceiptNo || "Receipt no"}: ${meta.receipt}`,
      `${d.txTxnId || "Transaction ID"}: ${meta.txn}`,
      `${d.txRefId || "Reference ID"}: ${meta.ref}`,
      `${d.payMethodTitle || "Payment"}: ${meta.method}`,
    ];
    if (meta.deliveryDate && meta.deliveryTime) {
      lines.push(
        (d.txFxDeliveryNote || "Your Order will be delivered on {date} between {time}")
          .replace("{date}", meta.deliveryDate)
          .replace("{time}", meta.deliveryTime)
      );
    }
    return lines.join("\n");
  }
  return [
    "Al Mulla Exchange",
    d.txSuccess || "Transaction Success!",
    `${d.txAmount || "Amount"}: ${meta.amount}`,
    `${d.txReceiptNo || "Receipt no"}: ${meta.receipt}`,
    `${d.txTxnId || "Transaction ID"}: ${meta.txn}`,
    `${d.txRefId || "Reference ID"}: ${meta.ref}`,
    `${d.txReceive || "Receive"}: ${meta.recv}`,
    `${d.txPaidTo || "Paid to"}: ${meta.name}`,
    `${d.payMethodTitle || "Payment"}: ${meta.method}`,
  ].join("\n");
}

function buildReceipt(method) {
  const d = dict();
  const first = cartItems[0];
  const app = String(first?.appId || sendAppId(first?.id || "ame"));
  const year = new Date().getFullYear();
  const n = Number(app) || 98925000;
  const names = [];
  const recvByCcy = {};
  cartItems.forEach((item) => {
    const b = getSendBeneficiary(item.id);
    if (!b) return;
    names.push(b.name);
    const { recv } = itemTotals(item, b);
    recvByCcy[b.currency] = (recvByCcy[b.currency] || 0) + recv;
  });
  const recvParts = Object.entries(recvByCcy).map(([ccy, amt]) => {
    const digits = ["BDT", "INR", "PKR", "PHP"].includes(ccy) ? 0 : 3;
    return `${ccy} ${sendFmt(amt, digits)}`;
  });
  const extra = names.length > 1 ? ` ${(d.txAndMore || "and {n} more").replace("{n}", String(names.length - 1))}` : "";
  const methodKey = PAY_LABELS[method] || "payBank";
  return {
    amount: `KWD ${sendFmt(totalPay(), 3)}`,
    receipt: `${year}/${app}`,
    appId: app,
    txn: String(624510000000000 + (n % 99999999)),
    ref: `20370${year}${app}${String(Date.now()).slice(-6)}`,
    recv: recvParts.join(" · ") || "—",
    name: `${(names[0] || "—").toUpperCase()}${extra}`,
    method: d[methodKey] || method,
    payMethod: method,
  };
}

function fillPayOkPending(meta) {
  const d = dict();
  const appId = meta?.appId || "—";
  if (payOkAppIdValue) payOkAppIdValue.textContent = appId;
  const ibanEl = document.getElementById("payOkIban");
  if (ibanEl) {
    const raw = (ibanEl.getAttribute("data-iban") || ibanEl.textContent || "").replace(/\s+/g, "").toUpperCase();
    if (raw) {
      ibanEl.setAttribute("data-iban", raw);
      ibanEl.textContent = formatPayOkIban(raw);
    }
  }
  if (payOkPendingStep4) {
    const tpl = d.txPendingStep4 || "After the cooling period, transfer to the above Al Mulla account and mention the Application Id {id} in the remarks/comments.";
    const before = tpl.split("{id}")[0] || "";
    const after = tpl.includes("{id}") ? tpl.split("{id}").slice(1).join("{id}") : "";
    payOkPendingStep4.replaceChildren();
    if (before) payOkPendingStep4.append(document.createTextNode(before));
    const mark = document.createElement("strong");
    mark.className = "pay-ok__app-mark";
    mark.textContent = `${d.txAppIdShort || "Application Id"} ${appId}`;
    payOkPendingStep4.append(mark);
    if (after) payOkPendingStep4.append(document.createTextNode(after));
  }
}

function formatPayOkIban(value) {
  const raw = String(value || "").replace(/\s+/g, "").toUpperCase();
  if (!raw) return "";
  return raw.replace(/(.{4})/g, "$1 ").trim();
}

function getPayOkCopyValue(el) {
  if (!el) return "";
  const raw = el.getAttribute("data-iban");
  if (raw) return raw.replace(/\s+/g, "").toUpperCase();
  return el.textContent?.trim() || "";
}

function getPendingAccountText() {
  const name = document.getElementById("payOkAccountName")?.textContent?.trim() || "";
  const bank = document.getElementById("payOkAccountBank")?.textContent?.trim() || "";
  const no = document.getElementById("payOkAccountNo")?.textContent?.trim() || "";
  const iban = getPayOkCopyValue(document.getElementById("payOkIban"));
  return [name, bank, no, iban].filter(Boolean).join("\n");
}

async function copyPayOkText(text) {
  const d = dict();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (typeof toast === "function") toast(d.txCopied || "Copied", "success");
  } catch (e) {
    if (typeof toast === "function") toast(d.txCopyFail || "Could not copy", "error");
  }
}

function fillPayOk(meta, isFail) {
  const set = (id, val, isNil) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.classList.toggle("is-nil", Boolean(isNil));
  };
  const fail = Boolean(isFail);
  const fx = meta?.kind === "fx";
  const nil = dict().txNil || "Nil";
  set("payOkAmount", meta.amount, false);
  set("payOkRef", meta.ref, false);
  set("payOkReceipt", fail && !fx ? nil : meta.receipt, fail && !fx);
  set("payOkTxn", fail && !fx ? nil : meta.txn, fail && !fx);
  set("payOkRecv", fail || fx ? (fx ? "" : nil) : meta.recv, fail && !fx);
  set("payOkName", fail || fx ? (fx ? "" : nil) : meta.name, fail && !fx);
  set("payOkCardAppId", fail ? "797120282026" : (meta.appId || "—"), false);
  const remitFail = fail && !fx;
  const hideRow = (id, hidden) => {
    const row = document.getElementById(id);
    if (!row) return;
    row.hidden = hidden;
  };
  hideRow("payOkReceiptRow", remitFail);
  hideRow("payOkTxnRow", remitFail);
  hideRow("payOkRecvRow", remitFail || fx);
  hideRow("payOkNameRow", remitFail || fx);
  fillPayOkPending(meta);
}

function applyFxPayOkMode(isFail, meta) {
  if (!payOk) return;
  const d = dict();
  const fail = Boolean(isFail);
  payOk.classList.add("is-fx");

  const recvRow = document.getElementById("payOkRecvRow");
  const nameRow = document.getElementById("payOkNameRow");
  if (recvRow) recvRow.hidden = true;
  if (nameRow) nameRow.hidden = true;

  if (payOkTitle) {
    payOkTitle.hidden = false;
    payOkTitle.textContent = fail
      ? d.txFail || "Transaction Failed!"
      : d.txSuccessBang || "Transaction Success!";
    payOkTitle.removeAttribute("data-i18n");
  }

  if (payOkLead) {
    if (fail) {
      payOkLead.hidden = false;
      payOkLead.textContent = d.txFailPaidTo || "Could not be paid to Al Mulla Exchange";
      payOkLead.removeAttribute("data-i18n");
    } else {
      payOkLead.hidden = true;
    }
  }

  if (fail && payOkFailCodeMsg) {
    payOkFailCodeMsg.textContent =
      d.txFxFailCodeMsg || "The transaction could not be completed due to insufficient funds";
    payOkFailCodeMsg.removeAttribute("data-i18n");
  }

  const note = document.getElementById("payOkDeliveryNote");
  if (note) {
    if (!fail && meta) {
      const tpl =
        d.txFxDeliveryNote || "Your Order will be delivered on {date} between {time}";
      note.hidden = false;
      note.replaceChildren();
      const before = tpl.split("{date}")[0] || "";
      const mid = (tpl.split("{date}")[1] || "").split("{time}")[0] || "";
      const after = tpl.includes("{time}") ? tpl.split("{time}").slice(1).join("{time}") : "";
      if (before) note.append(document.createTextNode(before));
      const dateEl = document.createElement("strong");
      dateEl.textContent = meta.deliveryDate || "—";
      note.append(dateEl);
      if (mid) note.append(document.createTextNode(mid));
      const timeEl = document.createElement("strong");
      timeEl.textContent = meta.deliveryTime || "—";
      note.append(timeEl);
      if (after) note.append(document.createTextNode(after));
    } else {
      note.hidden = true;
      note.replaceChildren();
    }
  }

  if (payOkDownload) payOkDownload.hidden = fail;
  if (payOkShare) payOkShare.hidden = fail;
  if (payOkNew) payOkNew.hidden = true;
  if (payOkPerks) payOkPerks.hidden = true;
}

function resetFxPayOkMode() {
  payOk?.classList.remove("is-fx");
  const fail = getPayPath() === "sad";
  const recvRow = document.getElementById("payOkRecvRow");
  const nameRow = document.getElementById("payOkNameRow");
  if (recvRow) recvRow.hidden = fail;
  if (nameRow) nameRow.hidden = fail;
  const note = document.getElementById("payOkDeliveryNote");
  if (note) {
    note.hidden = true;
    note.replaceChildren();
  }
}

function openPayOk() {
  if (!payOk) return;
  const isFail = getPayPath() === "sad";
  const isFx = lastReceipt?.kind === "fx";
  const pendingKind = !isFail && !isFx ? getPayOkPendingKind(pendingPayMethod || lastReceipt?.payMethod) : null;
  const isPending = Boolean(pendingKind);
  applyPayOkMode(isFail, pendingKind);
  if (isFx) applyFxPayOkMode(isFail, lastReceipt);
  else resetFxPayOkMode();
  payOk.hidden = false;
  payOk.setAttribute("aria-hidden", "false");
  document.body.classList.add("pay-ok-open");
  requestAnimationFrame(() => {
    payOk.classList.add("is-open");
    if (typeof window.playPageBackVideos === "function") {
      window.playPageBackVideos(payOkExit || payOk);
    }
    if (isFail) {
      destroyPayOkLottie();
      stopPayOkPendingVideo();
      playPayOkFailVideo();
    } else if (pendingKind === "bank") {
      stopPayOkFailVideo();
      destroyPayOkLottie();
      playPayOkPendingVideo();
    } else {
      stopPayOkFailVideo();
      stopPayOkPendingVideo();
      playPayOkLottie();
    }
  });
  if (isFail) {
    stopPayOkPendingSound();
  } else if (pendingKind === "bank") {
    playPayOkPendingSound();
  } else {
    playPayOkSound();
  }
  payOkExit?.focus();
}

function closePayOk(dest) {
  if (!payOk || payOk.hidden) return;
  const wasFx = lastReceipt?.kind === "fx";
  payOk.classList.remove("is-open");
  payOk.setAttribute("aria-hidden", "true");
  document.body.classList.remove("pay-ok-open");
  destroyPayOkLottie();
  stopPayOkPendingSound();
  window.setTimeout(() => {
    payOk.hidden = true;
    applyPayOkMode(false, false);
    resetFxPayOkMode();
    if (wasFx) {
      try {
        sessionStorage.removeItem(FX_KEY);
      } catch {
        /* ignore */
      }
      fxOrder = null;
      paintFxCart();
    }
    if (!dest) return;
    if (!wasFx) {
      cartItems = [];
      persistCart();
    }
    const href = dest === "send" ? "send.html" : "dashboard.html";
    if (typeof ameNavigate === "function") ameNavigate(href);
    else location.href = href;
  }, 280);
}

function downloadReceipt() {
  if (!lastReceipt) return;
  const blob = new Blob([receiptText(lastReceipt)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AME-receipt-${lastReceipt.receipt.replace("/", "-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareReceipt() {
  if (!lastReceipt) return;
  const d = dict();
  const text = receiptText(lastReceipt);
  try {
    if (navigator.share) {
      await navigator.share({ title: d.txSuccess || "Transaction Success!", text });
      return;
    }
  } catch (err) {
    if (err && err.name === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(text);
    if (typeof toast === "function") toast(d.txCopied || "Receipt copied", "success");
  } catch (e) {
    downloadReceipt();
  }
}

/** Finish payment after method pick (no OTP). Sad path → fail screen; else success. */
function finishPayFromMethod() {
  if (!pendingPayMethod || !lastReceipt) return;
  const isFail = getPayPath() === "sad";
  fillPayOk(lastReceipt, isFail);
  closePaySheet();
  window.setTimeout(() => openPayOk(), 120);
}

function pickPayMethod(method) {
  paySheet?.querySelectorAll(".pay-opt").forEach((btn) => {
    const on = btn.dataset.pay === method;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-checked", on ? "true" : "false");
  });
  pendingPayMethod = method;
  lastReceipt = buildReceipt(method);
  // Payment method click skips OTP — use window.ameOtpFlow when OTP is needed elsewhere.
  window.setTimeout(() => finishPayFromMethod(), 160);
}

/**
 * Reusable OTP flow (destination → OTP entry → complete).
 * Not wired to payment-method click. Call when another screen needs the same flow:
 *   ameOtpFlow.startAfterMethod("knet")  // after method already chosen
 *   ameOtpFlow.showDest() / ameOtpFlow.showOtp("mobile") / ameOtpFlow.complete()
 */
const ameOtpFlow = {
  showDest: showPaySheetDest,
  showOtp: showPaySheetOtp,
  complete: completePayAfterOtp,
  showMethods: showPaySheetMethods,
  applyChannel: applyPayOtpChannel,
  clearInputs: clearPayOtpInputs,
  showError: showPayOtpError,
  clearError: clearPayOtpError,
  startAfterMethod(method) {
    if (method) {
      pendingPayMethod = method;
      lastReceipt = buildReceipt(method);
      paySheet?.querySelectorAll(".pay-opt").forEach((btn) => {
        const on = btn.dataset.pay === method;
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-checked", on ? "true" : "false");
      });
    }
    showPaySheetDest();
  },
};
window.ameOtpFlow = ameOtpFlow;

payBtn?.addEventListener("click", () => {
  if (!termsAccepted || !cartItems.length) return;
  openPaySheet();
});

paySheetClose?.addEventListener("click", closePaySheet);
paySheetBackdrop?.addEventListener("click", closePaySheet);

paySheet?.querySelectorAll("[data-pay]").forEach((btn) => {
  btn.addEventListener("click", () => pickPayMethod(btn.dataset.pay));
});

/* OTP flow UI handlers — kept for ameOtpFlow reuse (not entered from payment-method click). */
paySheet?.querySelectorAll("[data-pay-channel]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const channel = btn.getAttribute("data-pay-channel");
    paySheet.querySelectorAll("[data-pay-channel]").forEach((el) => {
      const on = el === btn;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-checked", on ? "true" : "false");
    });
    window.setTimeout(() => ameOtpFlow.showOtp(channel), 160);
  });
});

payDestBack?.addEventListener("click", () => {
  ameOtpFlow.showMethods();
  paySheet?.querySelectorAll(".pay-opt").forEach((btn) => {
    btn.classList.remove("is-on");
    btn.setAttribute("aria-checked", "false");
  });
});

payOtpInputs.forEach((input, i) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    clearPayOtpError();
    if (input.value && payOtpInputs[i + 1]) payOtpInputs[i + 1].focus();
    syncPayOtpSubmit();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && payOtpInputs[i - 1]) payOtpInputs[i - 1].focus();
  });
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    [...text].forEach((ch, n) => {
      if (payOtpInputs[n]) payOtpInputs[n].value = ch;
    });
    clearPayOtpError();
    payOtpInputs[Math.min(text.length, 5)]?.focus();
    syncPayOtpSubmit();
  });
});

payOtpForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (payOtpValue().length !== 6) return;
  ameOtpFlow.complete();
});

payOtpBack?.addEventListener("click", () => {
  ameOtpFlow.clearError();
  ameOtpFlow.showDest();
});

payOtpResend?.addEventListener("click", () => {
  if (payOtpSeconds > 0) return;
  clearPayOtpInputs();
  startPayOtpTimer();
  if (typeof toast === "function") toast(dict().otpSent || "OTP sent to your registered mobile number.", "info");
  payOtpInputs[0]?.focus({ preventScroll: true });
});

payOkExit?.addEventListener("click", () => closePayOk("home"));
document.getElementById("payOkKioskLocate")?.addEventListener("click", () => {
  if (typeof ameNavigate === "function") ameNavigate("branches.html");
  else location.href = "branches.html";
});
document.getElementById("payOkKioskPending")?.addEventListener("click", () => closePayOk());
document.getElementById("payOkBranchLocate")?.addEventListener("click", () => {
  if (typeof ameNavigate === "function") ameNavigate("branches.html");
  else location.href = "branches.html";
});
payOkNew?.addEventListener("click", () => closePayOk("send"));
payOkDownload?.addEventListener("click", downloadReceipt);
payOkCopyAll?.addEventListener("click", () => copyPayOkText(getPendingAccountText()));
document.querySelectorAll(".pay-ok__copy[data-copy]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-copy");
    const el = id ? document.getElementById(id) : null;
    copyPayOkText(getPayOkCopyValue(el));
  });
});
payOkShare?.addEventListener("click", () => {
  shareReceipt();
});

payPathBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!payPathMenu) return;
  const open = payPathMenu.hidden;
  if (typeof closeAppearanceMenus === "function") closeAppearanceMenus();
  payPathMenu.hidden = !open;
  payPathBtn.setAttribute("aria-expanded", open ? "true" : "false");
});

payPathMenu?.addEventListener("click", (e) => e.stopPropagation());

document.querySelectorAll("[data-set-pay-path]").forEach((opt) => {
  opt.addEventListener("click", () => {
    setPayPath(opt.getAttribute("data-set-pay-path"));
    if (payPathMenu) payPathMenu.hidden = true;
    payPathBtn?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", () => {
  if (!payPathMenu || payPathMenu.hidden) return;
  payPathMenu.hidden = true;
  payPathBtn?.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (payOk && !payOk.hidden) {
    closePayOk("home");
    return;
  }
  if (paySheet && !paySheet.hidden && paySheet.classList.contains("is-otp")) {
    showPaySheetDest();
    return;
  }
  if (paySheet && !paySheet.hidden && paySheet.classList.contains("is-dest")) {
    showPaySheetMethods();
    paySheet.querySelectorAll(".pay-opt").forEach((btn) => {
      btn.classList.remove("is-on");
      btn.setAttribute("aria-checked", "false");
    });
    return;
  }
  closePaySheet();
});

const remitTab = document.getElementById("cartRemitTab");
const pendingTab = document.getElementById("cartPendingTab");
const FX_KEY = "ameFxCart";
let cartMode = "remit";
let fxOrder = null;

const PENDING_ITEMS = [
  {
    id: "p1",
    appId: "2604210001",
    name: "Rahul Sharma",
    method: "Bank Transfer",
    amount: "125.000 KWD",
    currency: "INR",
  },
  {
    id: "p2",
    appId: "2604210008",
    name: "Maria Santos",
    method: "Kiosk",
    amount: "50.000 KWD",
    currency: "PHP",
  },
];

function readFxOrder() {
  try {
    return JSON.parse(sessionStorage.getItem(FX_KEY) || "null");
  } catch {
    return null;
  }
}

function fmtFx(n, d) {
  return Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function paintFxCart() {
  fxOrder = readFxOrder();
  const count = document.getElementById("cartFxCount");
  if (count) count.textContent = fxOrder ? "(1)" : "";
  const pane = document.getElementById("cartFxPane");
  pane?.classList.toggle("is-empty", !fxOrder);
  const empty = document.getElementById("fxCartEmpty");
  if (empty) empty.hidden = Boolean(fxOrder);
  ["fxOrderCard", "fxCartOrder", "fxCartSide", "fxAddrCard", "fxDeliveryCard", "fxSummaryCard"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = !fxOrder;
  });
  if (!fxOrder) {
    syncFxPay();
    placeCheckout();
    return;
  }
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set("fxOrderId", `Order # ${fxOrder.id}`);
  set("fxCartPairA", `KWD → ${fxOrder.code}`);
  set("fxCartRateA", String(fxOrder.fromKwd));
  set("fxCartPairB", `${fxOrder.code} → KWD`);
  set("fxCartRateB", String(fxOrder.toKwd));
  set("fxCartSource", fxOrder.source);
  set("fxCartPurpose", fxOrder.purpose);
  set("fxCartDenom", fxOrder.denom);
  set("fxCartBuy", `${fxOrder.code} ${fmtFx(fxOrder.amount, 2)}`);
  set("fxCartSell", `KWD ${fmtFx(fxOrder.sell, 3)}`);
  set("fxSumPay", `${fmtFx(fxOrder.sell, 3)} KWD`);
  set("fxSumDelivery", `+ ${fmtFx(fxOrder.delivery, 3)} KWD`);
  set("fxSumTotal", `${fmtFx(fxOrder.total, 3)} KWD`);
  set("fxDeliverySlot", fxOrder.deliverySlot || "17/09/2026 | 12:00-14:00");
  syncFxPay();
  placeCheckout();
}

function syncFxPay() {
  const knet = document.getElementById("fxPayKnet");
  if (knet) knet.disabled = !(termsAccepted && fxOrder);
}

function paintPendingCart() {
  const d = dict();
  const list = document.getElementById("cartPendingList");
  const count = document.getElementById("cartPendingCount");
  if (count) count.textContent = PENDING_ITEMS.length ? `(${PENDING_ITEMS.length})` : "";
  if (!list) return;
  if (!PENDING_ITEMS.length) {
    list.innerHTML = `<li><p class="cart-empty">${d.cartPendingEmpty || "No pending applications."}</p></li>`;
    return;
  }
  const status = d.cartPendingStatus || "Pending";
  const methodLabel = d.cartPendingPayMethod || "Payment method";
  list.innerHTML = PENDING_ITEMS.map(
    (item) => `<li>
      <article class="cart-card cart-card--pending" data-id="${item.id}">
        <div class="cart-card__head">
          <span class="cart-card__app">${d.cartApplication || "Application #"} ${item.appId}</span>
          <span class="cart-card__status">${status}</span>
        </div>
        <div class="cart-card__pending-body">
          ${cartLine(d.beneficiary || "Beneficiary", item.name, ICON_USER)}
          ${cartLine(methodLabel, item.method, ICON_CARD)}
          ${cartLine(d.amountToBePaid || "Amount To Be Paid", item.amount, ICON_NET, true)}
        </div>
      </article>
    </li>`
  ).join("");
}

function setCartMode(mode) {
  cartMode = mode === "fx" ? "fx" : mode === "pending" ? "pending" : "remit";
  const remitPane = document.getElementById("cartRemitPane");
  const fxPane = document.getElementById("cartFxPane");
  const pendingPane = document.getElementById("cartPendingPane");
  const summary = document.getElementById("cartSummary");
  const remitActions = document.getElementById("cartRemitActions");
  const fxActions = document.getElementById("cartFxActions");
  const pendingActions = document.getElementById("cartPendingActions");
  const addBtn = document.getElementById("cartAddBtn");
  const fxAddBtn = document.getElementById("fxAddCurrency");
  const terms = document.querySelector(".cart-terms");

  remitTab?.classList.toggle("is-on", cartMode === "remit");
  fxTab?.classList.toggle("is-on", cartMode === "fx");
  pendingTab?.classList.toggle("is-on", cartMode === "pending");
  remitTab?.setAttribute("aria-selected", cartMode === "remit" ? "true" : "false");
  fxTab?.setAttribute("aria-selected", cartMode === "fx" ? "true" : "false");
  pendingTab?.setAttribute("aria-selected", cartMode === "pending" ? "true" : "false");

  if (remitPane) remitPane.hidden = cartMode !== "remit";
  if (fxPane) fxPane.hidden = cartMode !== "fx";
  if (pendingPane) pendingPane.hidden = cartMode !== "pending";
  if (summary) summary.hidden = cartMode !== "remit" || !cartItems.length;
  if (remitActions) remitActions.hidden = cartMode !== "remit";
  if (fxActions) fxActions.hidden = cartMode !== "fx";
  if (pendingActions) pendingActions.hidden = cartMode !== "pending";
  if (terms) terms.hidden = cartMode === "pending";
  if (addBtn) {
    addBtn.hidden = cartMode !== "remit";
    addBtn.setAttribute("aria-hidden", cartMode !== "remit" ? "true" : "false");
  }
  if (fxAddBtn) {
    fxAddBtn.hidden = cartMode !== "fx";
    fxAddBtn.setAttribute("aria-hidden", cartMode !== "fx" ? "true" : "false");
  }
  document.body.classList.toggle("is-fx-cart", cartMode === "fx");
  document.body.classList.toggle("is-pending-cart", cartMode === "pending");
  document.querySelector(".page-cart")?.classList.toggle("is-fx-cart", cartMode === "fx");
  document.querySelector(".page-cart")?.classList.toggle("is-pending-cart", cartMode === "pending");

  if (cartMode === "fx") paintFxCart();
  if (cartMode === "pending") paintPendingCart();
  placeCheckout();
}

function placeCheckout() {
  const checkout = document.getElementById("cartCheckout");
  const rail = document.getElementById("cartRail");
  const terms = document.querySelector(".cart-terms");
  const fxActions = document.getElementById("cartFxActions");
  if (!checkout || !rail) return;
  if (cartMode === "fx") {
    if (terms) terms.hidden = true;
    if (fxActions) fxActions.hidden = true;
    rail.appendChild(checkout);
    return;
  }
  if (terms) terms.hidden = cartMode === "pending";
  rail.appendChild(checkout);
}

function openFxSheet(id) {
  const sheet = document.getElementById(id);
  if (!sheet) return;
  sheet.hidden = false;
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("fx-sheet-open");
  requestAnimationFrame(() => sheet.classList.add("is-open"));
}

function closeFxSheet(id) {
  const sheet = document.getElementById(id);
  if (!sheet || sheet.hidden) return;
  sheet.classList.remove("is-open");
  let closed = false;
  const done = () => {
    if (closed) return;
    closed = true;
    sheet.hidden = true;
    sheet.setAttribute("aria-hidden", "true");
    if (![...document.querySelectorAll(".fx-sheet")].some((s) => !s.hidden)) {
      document.body.classList.remove("fx-sheet-open");
    }
  };
  sheet.querySelector(".ui-sheet__panel")?.addEventListener("transitionend", done, { once: true });
  window.setTimeout(done, 400);
}

function openFxAddrModal() {
  openFxSheet("fxAddrModal");
}

fxTab?.addEventListener("click", () => setCartMode("fx"));
remitTab?.addEventListener("click", () => setCartMode("remit"));
pendingTab?.addEventListener("click", () => setCartMode("pending"));

document.getElementById("fxAddCurrency")?.addEventListener("click", () => {
  location.href = "fx-order.html";
});

document.getElementById("fxPayKnet")?.addEventListener("click", () => {
  if (!termsAccepted || !fxOrder) return;
  const meta = buildFxReceipt();
  if (!meta) return;
  pendingPayMethod = "knet";
  lastReceipt = meta;
  const isFail = getPayPath() === "sad";
  fillPayOk(meta, isFail);
  window.setTimeout(() => openPayOk(), 120);
});

function buildFxReceipt() {
  const order = fxOrder || readFxOrder();
  if (!order) return null;
  const d = dict();
  const year = new Date().getFullYear();
  const total =
    Number(order.total) ||
    (Number(order.sell) || 0) + (Number(order.delivery) || 2);
  const slot =
    order.deliverySlot ||
    document.getElementById("fxDeliverySlot")?.textContent ||
    "17/09/2026 | 12:00-14:00";
  const match = String(slot).match(/(\d{2}\/\d{2}\/\d{4})\s*\|\s*(\d{2}:\d{2}-\d{2}:\d{2})/);
  const idNum = String(order.id || "1234").replace(/\D/g, "") || "1234";
  const stamp = String(Date.now()).slice(-6);
  return {
    kind: "fx",
    amount: `KWD ${fmtFx(total, 3)}`,
    receipt: `FX-${year}-${idNum.padStart(6, "0")}`,
    txn: `TXN-${stamp}${idNum.slice(-2)}`,
    ref: `REF-${stamp}`,
    appId: order.id || "—",
    recv: "",
    name: "",
    method: d.payKnet || "K-Net",
    payMethod: "knet",
    deliveryDate: match ? match[1] : "18/09/2026",
    deliveryTime: match ? match[2] : "12:00-14:00",
    deliverySlot: slot,
  };
}

document.getElementById("fxOrderDelete")?.addEventListener("click", () => {
  try {
    sessionStorage.removeItem(FX_KEY);
  } catch {
    /* ignore */
  }
  paintFxCart();
  if (typeof toast === "function") toast("FX order removed.", "info");
});

function openFxDeliveryModal() {
  const dateEl = document.getElementById("fxDeliveryDate");
  const slot = (fxOrder && fxOrder.deliverySlot) || document.getElementById("fxDeliverySlot")?.textContent || "";
  const match = slot.match(/(\d{2})\/(\d{2})\/(\d{4})\s*\|\s*(\d{2}:\d{2}-\d{2}:\d{2})/);
  if (match && dateEl) {
    dateEl.value = `${match[3]}-${match[2]}-${match[1]}`;
    const radio = document.querySelector(`input[name="fxSlot"][value="${match[4]}"]`);
    if (radio) radio.checked = true;
  } else if (dateEl && !dateEl.value) {
    dateEl.value = "2026-09-17";
  }
  dateEl?.closest(".field")?.classList.add("has-value");
  openFxSheet("fxDeliveryModal");
}

function formatFxDeliverySlot(isoDate, timeRange) {
  const [y, m, d] = String(isoDate || "").split("-");
  if (!y || !m || !d) return timeRange;
  return `${d}/${m}/${y} | ${timeRange}`;
}

function saveFxDeliverySlot(slotText) {
  const order = readFxOrder() || fxOrder;
  if (order) {
    order.deliverySlot = slotText;
    try {
      sessionStorage.setItem(FX_KEY, JSON.stringify(order));
    } catch {
      /* ignore */
    }
    fxOrder = order;
  }
  const el = document.getElementById("fxDeliverySlot");
  if (el) el.textContent = slotText;
}

document.getElementById("fxAddrAdd")?.addEventListener("click", openFxAddrModal);
document.getElementById("fxAddrEdit")?.addEventListener("click", openFxAddrModal);
document.getElementById("fxDeliveryEdit")?.addEventListener("click", openFxDeliveryModal);

document.querySelectorAll("[data-fx-sheet-close]").forEach((el) => {
  el.addEventListener("click", () => closeFxSheet(el.getAttribute("data-fx-sheet-close")));
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  ["fxAddrModal", "fxDeliveryModal"].forEach((id) => {
    const sheet = document.getElementById(id);
    if (sheet && !sheet.hidden) closeFxSheet(id);
  });
});

document.getElementById("fxDeliveryForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = document.getElementById("fxDeliveryDate")?.value;
  const time = document.querySelector('input[name="fxSlot"]:checked')?.value;
  if (!date || !time) {
    if (typeof toast === "function") toast("Select a delivery date and time slot.", "error");
    return;
  }
  const slotText = formatFxDeliverySlot(date, time);
  saveFxDeliverySlot(slotText);
  closeFxSheet("fxDeliveryModal");
  if (typeof toast === "function") toast("Delivery date and time updated.", "success");
});

document.getElementById("fxAddrForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = document.getElementById("fxAddrType")?.value || "Local Address";
  const block = document.getElementById("fxBlock")?.value.trim() || "—";
  const flat = document.getElementById("fxFlat")?.value.trim() || "—";
  const street = document.getElementById("fxStreet")?.value.trim() || "—";
  const house = document.getElementById("fxHouse")?.value.trim() || "—";
  const gov = document.getElementById("fxGov")?.value || "";
  const area = document.getElementById("fxArea")?.value || "";
  const line = `Street ${street}, Block ${block}, Flat ${flat}, House ${house}, City ${area}, ${gov}, KUWAIT`;
  const nameEl = document.getElementById("fxAddrName");
  const lineEl = document.getElementById("fxAddrLine");
  const tagEl = document.getElementById("fxAddrTag");
  if (lineEl) lineEl.textContent = line;
  if (tagEl) tagEl.textContent = type.includes("Local") ? "Local Address" : type;
  if (nameEl && !nameEl.textContent.trim()) nameEl.textContent = "Faruque Habibur Rahman";
  closeFxSheet("fxAddrModal");
  if (typeof toast === "function") toast("Shipping address saved.", "success");
});

document.getElementById("dashLogoutBtn")?.addEventListener("click", () => {
  if (typeof closeMenu === "function") closeMenu();
  if (typeof ameClearSession === "function") ameClearSession();
  if (typeof ameNavigate === "function") ameNavigate("index.html");
});

setPayPath(getPayPath());
loadCart();
render();
const startTab = new URLSearchParams(location.search).get("tab");
if (startTab === "fx") setCartMode("fx");
else if (startTab === "pending") setCartMode("pending");
else setCartMode("remit");
