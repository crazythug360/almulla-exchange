const dict = () => (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};

const PRODUCTS = [
  { id: "bank", key: "productBank", extra: false, fee: 1, timeKey: "time5min", rateMult: 1, infoKey: "infoBank", tags: ["best", "fast"] },
  { id: "cash", key: "productCash", extra: false, fee: 1, timeKey: "time30min", rateMult: 0.995, infoKey: "infoCash", tags: [] },
  { id: "wallet", key: "productWallet", extra: true, fee: 0.75, timeKey: "timeInstant", rateMult: 1.002, infoKey: "infoWallet", tags: ["fast"] },
];

const ICON_BEST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 11v9H5.8A1.8 1.8 0 0 1 4 18.2V12.8A1.8 1.8 0 0 1 5.8 11H8Zm0 0 2.2-5.2A1.9 1.9 0 0 1 12 4.8h.3c.9 0 1.6.8 1.5 1.7l-.3 2.5h4a2 2 0 0 1 2 2.3l-.7 5.2a2.5 2.5 0 0 1-2.5 2.2H8" stroke-linejoin="round"/></svg>`;
const ICON_FAST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5.2 16.2a7.5 7.5 0 1 1 13.6 0"/><path d="M12 14.2 15.6 9" stroke-linecap="round"/><circle cx="12" cy="14.2" r="1.2" fill="currentColor" stroke="none"/></svg>`;

const SOURCES = [
  { id: "bonus", en: "Bonus", ar: "مكافأة" },
  { id: "business", en: "Business", ar: "أعمال" },
  { id: "settlement", en: "Final Settlement", ar: "تسوية نهائية" },
  { id: "gift", en: "Gift", ar: "هدية" },
  { id: "loan", en: "Loan", ar: "قرض" },
  { id: "lottery", en: "Lottery", ar: "يانصيب" },
  { id: "salary", en: "Salary", ar: "راتب" },
  { id: "savings", en: "Savings ( Accumulated Salary )", ar: "مدخرات ( راتب متراكم )" },
  { id: "share", en: "Share", ar: "حصة" },
];

const PURPOSES = [
  { id: "family", en: "Family Maintenance/savings", ar: "إعالة الأسرة / ادخار" },
  { id: "loan", en: "Loan / Repayment For Loan", ar: "قرض / سداد قرض" },
  { id: "own", en: "Transfer To Own Foreign Bank Ac", ar: "تحويل إلى حساب بنكي أجنبي خاص" },
  { id: "gift", en: "Gift / Gift Service", ar: "هدية / خدمة هدايا" },
  { id: "rent", en: "House Rent", ar: "إيجار منزل" },
  { id: "inheritance", en: "Inheritance", ar: "ميراث" },
  { id: "egyptian", en: "Egyptian Workers Remittance", ar: "تحويلات العمال المصريين" },
  { id: "salary", en: "Salary Payment/end Of Service Settlement/compensation Payments", ar: "دفع راتب / تسوية نهاية الخدمة / تعويضات" },
  { id: "profit", en: "Profit Share", ar: "حصة أرباح" },
];

const params = new URLSearchParams(location.search);
const beneId = params.get("bene");
let beneficiary =
  (typeof getSendBeneficiary === "function" && getSendBeneficiary(beneId)) ||
  (window.SEND_BENEFICIARIES || []).find((b) => b.id === beneId) ||
  (window.SEND_BENEFICIARIES || [])[0] ||
  null;

let productId = "bank";
let showExtra = false;
let lastEdited = "send";
let sourceId = "salary";
let purposeId = "family";

(function applyRatesPrefill() {
  let prefill = null;
  try {
    const raw = sessionStorage.getItem("ameRemitPrefill");
    if (raw) prefill = JSON.parse(raw);
  } catch (_) {}
  const amountParam = params.get("amount");
  const productParam = params.get("product");
  const rateParam = params.get("rate");
  if (prefill && prefill.bene && prefill.bene !== beneId) prefill = null;
  const amount = amountParam || prefill?.amount;
  const product = productParam || prefill?.product;
  const rate = rateParam || prefill?.rate;
  if (beneficiary && amount != null && String(amount).trim() !== "") {
    beneficiary.amount = String(amount);
  }
  if (beneficiary && rate != null && Number.isFinite(Number(rate))) {
    beneficiary.rate = Number(rate);
  }
  if (product && PRODUCTS.some((p) => p.id === product)) {
    productId = product;
  }
  try {
    sessionStorage.removeItem("ameRemitPrefill");
  } catch (_) {}
})();

const localInput = document.getElementById("remitLocal");
const foreignInput = document.getElementById("remitForeign");
const cardsEl = document.getElementById("remitRateCards");
const moreBtn = document.getElementById("remitMoreRates");
const nextBtn = document.getElementById("remitNext");
const backBtn = document.getElementById("remitBack");
const extraSheet = document.getElementById("remitExtraSheet");
const extraNext = document.getElementById("remitExtraNext");
const infoPanel = document.getElementById("rateInfo");
const infoOk = document.getElementById("rateInfoOk");
let infoOpener = null;
let infoHideTimer = 0;

function isAr() {
  return document.documentElement.lang === "ar";
}

function parseAmount(value) {
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatKwd(n) {
  return n.toFixed(3);
}

function formatFee(n) {
  return Number(n || 0).toFixed(3);
}

function formatRate(n) {
  if (n >= 100) return n.toFixed(2);
  if (n >= 10) return n.toFixed(3);
  return n.toFixed(4);
}

function formatReceive(n) {
  const locale = isAr() ? "ar" : "en-US";
  if (n >= 100) return n.toLocaleString(locale, { maximumFractionDigits: 0 });
  return n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatReceiveInput(n) {
  if (n >= 100) return String(Math.round(n));
  return (Math.round(n * 100) / 100).toFixed(2);
}

function rateBase() {
  return Number(beneficiary?.rate) || 296.007;
}

function ccy() {
  return beneficiary?.currency || "INR";
}

function product() {
  return PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
}

function quoteFor(prod) {
  const base = rateBase();
  const rate = base * prod.rateMult;
  const feeBase = Number(beneficiary?.fee);
  const fee = Number.isFinite(feeBase) && feeBase > 0
    ? feeBase * (prod.id === "wallet" ? 0.75 : prod.id === "cash" ? 1 : 1)
    : prod.fee;
  const send =
    lastEdited === "receive"
      ? parseAmount(foreignInput?.value) / rate || 0
      : parseAmount(localInput?.value);
  return {
    send,
    fee,
    netPay: send + fee,
    rate,
    receive: send * rate,
    time: dict()[prod.timeKey] || prod.timeKey,
    name: dict()[prod.key] || prod.id,
  };
}

function selectedQuote() {
  return quoteFor(product());
}

function applyQuoteToFields() {
  const q = selectedQuote();
  if (!localInput || !foreignInput) return;
  if (lastEdited === "send") {
    foreignInput.value = q.send > 0 ? formatReceiveInput(q.receive) : "";
  } else {
    localInput.value = q.receive > 0 ? formatKwd(q.send) : "";
  }
  localInput.closest(".field")?.classList.toggle("has-value", localInput.value.trim() !== "");
  foreignInput.closest(".field")?.classList.toggle("has-value", foreignInput.value.trim() !== "");
}

function renderBene() {
  if (!beneficiary) return;
  const nameEl = document.getElementById("remitBeneName");
  const metaEl = document.getElementById("remitBeneMeta");
  const ccyEl = document.getElementById("remitForeignCcy");

  if (nameEl) nameEl.textContent = beneficiary.name || "";
  const accountEl = document.getElementById("remitBeneAccount");
  if (accountEl) {
    const account = String(beneficiary.account || "").trim();
    accountEl.textContent = account;
    accountEl.hidden = !account;
  }
  if (metaEl) {
    metaEl.textContent = [beneficiary.bank, beneficiary.branch].filter(Boolean).join(" ") || "—";
  }
  if (ccyEl) {
    ccyEl.textContent = ccy();
  }
}

function cell(label, value, accent) {
  return `<div class="rate-card__cell">
    <span class="rate-card__label">${label}</span>
    <span class="rate-card__value${accent ? " rate-card__value--accent" : ""}">${value}</span>
  </div>`;
}

function tagsHtml(tags, t) {
  if (!tags || !tags.length) return `<div class="rate-card__tags" aria-hidden="true"></div>`;
  const parts = tags.map((tag) => {
    if (tag === "best") return `<span class="rate-card__tag">${ICON_BEST}${t.best || "Best"}</span>`;
    if (tag === "fast") return `<span class="rate-card__tag">${ICON_FAST}${t.fast || "Fast"}</span>`;
    return "";
  }).filter(Boolean);
  return `<div class="rate-card__tags">${parts.join('<span class="rate-card__sep" aria-hidden="true"></span>')}</div>`;
}

function cardHtml(item) {
  const t = dict();
  const q = quoteFor(item);
  const on = item.id === productId;
  const dest = ccy();
  return `<article class="rate-card${on ? " is-on" : ""}" data-product="${item.id}" role="radio" aria-checked="${on}" tabindex="0">
    <div class="rate-card__grid">
      ${cell(t.payAmount || "Pay Amount", `KWD ${formatKwd(q.send)}`)}
      ${cell(t.fees || "Fees", `KWD ${formatFee(q.fee)}`)}
      ${cell(t.netPay || "Net Pay", `KWD ${formatKwd(q.netPay)}`)}
      ${cell(t.deliveryTime || "Delivery Time", q.time)}
      ${cell(t.rateLabel || "Rate", `${dest} ${formatRate(q.rate)}`, !on)}
      ${cell(t.netReceive || "Net Receive", `${dest} ${formatReceive(q.receive)}`)}
    </div>
    <div class="rate-card__foot">
      <button class="rate-card__info" type="button" data-info="${item.id}">
        <img class="rate-card__info-i" src="assets/images/info2.svg" width="16" height="16" alt="" aria-hidden="true" />
        ${t.info || "Info"}
      </button>
      ${tagsHtml(item.tags, t)}
    </div>
  </article>`;
}

function renderCards() {
  if (!cardsEl) return;
  const visible = PRODUCTS.filter((item) => showExtra || !item.extra);
  cardsEl.innerHTML = visible.map(cardHtml).join("");
}

function updateSummary() {
  const q = selectedQuote();
  const dest = ccy();
  const youPay = document.getElementById("remitYouPay");
  const receive = document.getElementById("remitReceiveLine");
  const ourFee = document.getElementById("remitOurFee");
  const netFee = document.getElementById("remitNetFee");
  if (youPay) youPay.textContent = `${formatKwd(q.send)} KWD`;
  if (receive) receive.textContent = `${formatReceive(q.receive)} ${dest}`;
  if (ourFee) ourFee.textContent = `+ ${formatFee(q.fee)} KWD`;
  if (netFee) netFee.textContent = `${formatFee(q.fee)} KWD`;
}

function refresh() {
  applyQuoteToFields();
  renderCards();
  updateSummary();
  syncMoreSwitch();
}

function selectProduct(id) {
  if (!PRODUCTS.some((p) => p.id === id)) return;
  productId = id;
  refresh();
}

function syncMoreSwitch() {
  if (!moreBtn) return;
  moreBtn.classList.toggle("is-on", showExtra);
  moreBtn.setAttribute("aria-checked", showExtra ? "true" : "false");
}

function setShowExtra(on) {
  showExtra = !!on;
  if (!showExtra && product()?.extra) productId = "bank";
  refresh();
}

function fillInfo(id) {
  const item = PRODUCTS.find((p) => p.id === id);
  if (!item) return false;
  const t = dict();
  const lead = document.getElementById("rateInfoLead");
  const note = document.getElementById("rateInfoNote");
  const body = document.getElementById("rateInfoBody");
  if (lead) lead.textContent = t.infoLead || "";
  if (note) note.textContent = t.infoNote || "";
  if (body) body.textContent = "";
  if (infoOk) infoOk.textContent = t.ok || "OK";
  return true;
}

function openInfo(id, opener) {
  if (!infoPanel || !fillInfo(id)) return;
  infoOpener = opener || document.activeElement;
  window.clearTimeout(infoHideTimer);
  infoPanel.hidden = false;
  infoPanel.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => infoPanel.classList.add("is-open"));
  });
}

function closeInfo() {
  if (!infoPanel || infoPanel.hidden) return;
  const panelEl = infoPanel.querySelector(".rate-info__panel");
  infoPanel.classList.remove("is-open");
  infoPanel.setAttribute("aria-hidden", "true");
  let done = false;
  const hide = () => {
    if (done) return;
    done = true;
    infoPanel.hidden = true;
    panelEl?.removeEventListener("transitionend", onEnd);
    infoOpener?.focus?.();
    infoOpener = null;
  };
  const onEnd = (e) => {
    if (e.target !== panelEl) return;
    hide();
  };
  panelEl?.addEventListener("transitionend", onEnd);
  window.clearTimeout(infoHideTimer);
  infoHideTimer = window.setTimeout(hide, 420);
}

function openExtra() {
  if (!extraSheet) return;
  extraSheet.hidden = false;
  extraSheet.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => extraSheet.classList.add("is-open"));
  });
}

function closeExtra() {
  if (!extraSheet || extraSheet.hidden) return;
  extraSheet.classList.remove("is-open");
  extraSheet.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    extraSheet.hidden = true;
  }, 280);
}

function finishToCart() {
  if (!beneficiary) return;
  const q = selectedQuote();
  beneficiary.amount = formatKwd(q.send);
  const cart = typeof loadSendCart === "function" ? loadSendCart() : { items: [] };
  const items = Array.isArray(cart.items) ? cart.items.filter((x) => x.id !== beneficiary.id) : [];
  items.push({
    id: beneficiary.id,
    amount: beneficiary.amount,
    quoteCcy: "KWD",
    appId: typeof sendAppId === "function" ? sendAppId(beneficiary.id) : beneficiary.id,
    source: SOURCES.find((s) => s.id === sourceId)?.en,
    purpose: PURPOSES.find((p) => p.id === purposeId)?.en,
    instruction: document.getElementById("remitInstruction")?.value || "",
    phone: document.getElementById("remitPhone")?.value || "",
    product: productId,
  });
  sessionStorage.setItem(window.AME_SEND_CART_KEY || "ameSendCart", JSON.stringify({ items }));
  const href = "cart.html";
  if (typeof ameNavigate === "function") ameNavigate(href);
  else location.href = href;
}

function optionLabel(item) {
  return isAr() ? item.ar : item.en;
}

function renderSelectMenu(menu, items, selectedId, onPick) {
  if (!menu) return;
  menu.innerHTML = items
    .map((item) => {
      const on = item.id === selectedId ? " is-on" : "";
      return `<li>
      <button type="button" role="option" class="country-option${on}" data-id="${item.id}" aria-selected="${item.id === selectedId}">
        <span>${optionLabel(item)}</span>
      </button>
    </li>`;
    })
    .join("");
  menu.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => onPick(btn.getAttribute("data-id")));
  });
}

function setupSelect(fieldId, btnId, menuId, valueId, items, getId, setId, opts) {
  const field = document.getElementById(fieldId);
  const btn = document.getElementById(btnId);
  const menu = document.getElementById(menuId);
  const valueEl = document.getElementById(valueId);
  const search = opts?.searchId ? document.getElementById(opts.searchId) : null;
  const panel = opts?.panelId ? document.getElementById(opts.panelId) : menu;
  if (!field || !btn || !menu || !panel) return;

  const hideMenu = (el) => {
    const panelEl = el.querySelector(".remit-source-panel");
    const m = el.querySelector(".country-menu");
    if (panelEl) panelEl.hidden = true;
    else if (m) m.hidden = true;
  };

  const visibleItems = () => {
    const q = (search?.value || "").trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => optionLabel(item).toLowerCase().includes(q));
  };

  const paint = () => {
    const list = visibleItems();
    if (!list.length) {
      menu.innerHTML = `<li class="remit-source-empty" role="presentation">${isAr() ? "لا توجد نتائج" : "No matches"}</li>`;
      return;
    }
    renderSelectMenu(menu, list, getId(), (id) => {
      setId(id);
      if (valueEl) valueEl.textContent = optionLabel(items.find((x) => x.id === id) || items[0]);
      close();
    });
  };

  const placePanel = () => {
    if (!opts?.panelId || panel.hidden) return;
    const rect = btn.getBoundingClientRect();
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    panel.style.position = "fixed";
    panel.style.top = `${Math.round(rect.bottom + gap)}px`;
    panel.style.left = `${Math.round(rect.left)}px`;
    panel.style.width = `${Math.round(rect.width)}px`;
    panel.style.right = "auto";
    panel.style.zIndex = "40";
    panel.style.maxHeight = `${Math.max(180, Math.min(360, Math.round(spaceBelow)))}px`;
  };

  const close = () => {
    field.classList.remove("is-open");
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if (search) search.value = "";
    if (opts?.panelId && panel.parentElement !== field) field.appendChild(panel);
  };

  const open = () => {
    document.querySelectorAll(".field--select.is-open").forEach((el) => {
      if (el === field) return;
      el.classList.remove("is-open");
      hideMenu(el);
      el.querySelector(".field__control")?.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".remit-source-panel").forEach((panelEl) => {
      if (panelEl === panel) return;
      panelEl.hidden = true;
    });
    if (search) {
      search.value = "";
      search.placeholder = isAr() ? "بحث" : "Search";
      search.setAttribute("aria-label", search.placeholder);
    }
    paint();
    field.classList.add("is-open");
    if (opts?.panelId) document.body.appendChild(panel);
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    placePanel();
    if (search) requestAnimationFrame(() => search.focus());
  };

  btn.addEventListener("click", () => {
    if (field.classList.contains("is-open")) close();
    else open();
  });

  search?.addEventListener("input", paint);
  search?.addEventListener("click", (e) => e.stopPropagation());
  search?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      btn.focus();
    }
  });

  if (opts?.panelId) {
    window.addEventListener("resize", placePanel);
    document.addEventListener("scroll", placePanel, true);
  }

  document.addEventListener("click", (e) => {
    if (!field.contains(e.target) && !panel.contains(e.target)) close();
  });

  if (valueEl) valueEl.textContent = optionLabel(items.find((x) => x.id === getId()) || items[0]);
}

if (!beneficiary) {
  location.replace("beneficiaries.html");
} else {
  if (beneficiary.amount) {
    const n = parseAmount(beneficiary.amount);
    localInput.value = Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : formatKwd(n);
  }
  renderBene();
  refresh();
}

cardsEl?.addEventListener("click", (e) => {
  const info = e.target.closest("[data-info]");
  if (info) {
    e.preventDefault();
    e.stopPropagation();
    openInfo(info.getAttribute("data-info"), info);
    return;
  }
  const card = e.target.closest("[data-product]");
  if (card) selectProduct(card.getAttribute("data-product"));
});

cardsEl?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest("[data-product]");
  if (!card) return;
  e.preventDefault();
  selectProduct(card.getAttribute("data-product"));
});

moreBtn?.addEventListener("click", () => setShowExtra(!showExtra));

localInput?.addEventListener("input", () => {
  lastEdited = "send";
  refresh();
});

foreignInput?.addEventListener("input", () => {
  lastEdited = "receive";
  refresh();
});

nextBtn?.addEventListener("click", () => openExtra());

extraNext?.addEventListener("click", finishToCart);

document.querySelectorAll("[data-remit-extra-close]").forEach((el) => {
  el.addEventListener("click", closeExtra);
});

document.querySelectorAll("[data-close-info], [data-rate-info-close]").forEach((el) => {
  el.addEventListener("click", closeInfo);
});

setupSelect("remitSourceField", "remitSourceBtn", "remitSourceList", "remitSourceValue", SOURCES, () => sourceId, (id) => {
  sourceId = id;
}, { searchId: "remitSourceSearch", panelId: "remitSourceMenu" });

setupSelect("remitPurposeField", "remitPurposeBtn", "remitPurposeList", "remitPurposeValue", PURPOSES, () => purposeId, (id) => {
  purposeId = id;
}, { searchId: "remitPurposeSearch", panelId: "remitPurposeMenu" });
