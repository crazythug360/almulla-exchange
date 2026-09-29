/* Indicative 1 KWD rates — keep in lockstep with the index.html ticker. */
const COUNTRIES = [
  { id: "us", name: "United States", nameAr: "الولايات المتحدة", ccy: "USD", ccyName: "US Dollar", ccyNameAr: "الدولار الأمريكي", flag: "us", rate: 3.257 },
  { id: "eu", name: "European Union", nameAr: "الاتحاد الأوروبي", ccy: "EUR", ccyName: "Euro", ccyNameAr: "اليورو", flag: "eu", rate: 3.0124 },
  { id: "gb", name: "United Kingdom", nameAr: "المملكة المتحدة", ccy: "GBP", ccyName: "British Pound", ccyNameAr: "الجنيه الإسترليني", flag: "gb", rate: 2.5481 },
  { id: "in", name: "India", nameAr: "الهند", ccy: "INR", ccyName: "Indian Rupee", ccyNameAr: "الروبية الهندية", flag: "in", rate: 271.85 },
  { id: "pk", name: "Pakistan", nameAr: "باكستان", ccy: "PKR", ccyName: "Pakistani Rupee", ccyNameAr: "الروبية الباكستانية", flag: "pk", rate: 907.4 },
  { id: "bd", name: "Bangladesh", nameAr: "بنغلاديش", ccy: "BDT", ccyName: "Bangladeshi Taka", ccyNameAr: "التاكا البنغلاديشية", flag: "bd", rate: 396.12 },
  { id: "ph", name: "Philippines", nameAr: "الفلبين", ccy: "PHP", ccyName: "Philippine Peso", ccyNameAr: "البيزو الفلبيني", flag: "ph", rate: 186.55 },
  { id: "eg", name: "Egypt", nameAr: "مصر", ccy: "EGP", ccyName: "Egyptian Pound", ccyNameAr: "الجنيه المصري", flag: "eg", rate: 157.8 },
  { id: "np", name: "Nepal", nameAr: "نيبال", ccy: "NPR", ccyName: "Nepalese Rupee", ccyNameAr: "الروبية النيبالية", flag: "np", rate: 435.8 },
  { id: "lk", name: "Sri Lanka", nameAr: "سريلانكا", ccy: "LKR", ccyName: "Sri Lankan Rupee", ccyNameAr: "الروبية السريلانكية", flag: "lk", rate: 977.1 },
  { id: "sa", name: "Saudi Arabia", nameAr: "السعودية", ccy: "SAR", ccyName: "Saudi Riyal", ccyNameAr: "الريال السعودي", flag: "sa", rate: 12.215 },
  { id: "ae", name: "United Arab Emirates", nameAr: "الإمارات", ccy: "AED", ccyName: "UAE Dirham", ccyNameAr: "الدرهم الإماراتي", flag: "ae", rate: 11.968 },
];

const ICON_BEST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 11v9H5.8A1.8 1.8 0 0 1 4 18.2V12.8A1.8 1.8 0 0 1 5.8 11H8Zm0 0 2.2-5.2A1.9 1.9 0 0 1 12 4.8h.3c.9 0 1.6.8 1.5 1.7l-.3 2.5h4a2 2 0 0 1 2 2.3l-.7 5.2a2.5 2.5 0 0 1-2.5 2.2H8" stroke-linejoin="round"/></svg>`;
const ICON_FAST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5.2 16.2a7.5 7.5 0 1 1 13.6 0"/><path d="M12 14.2 15.6 9" stroke-linecap="round"/><circle cx="12" cy="14.2" r="1.2" fill="currentColor" stroke="none"/></svg>`;

const PRODUCTS = [
  { id: "bank", key: "productBank", extra: false, fee: 9, timeKey: "time2hrs", rateMult: 1, infoKey: "infoBank" },
  { id: "cash", key: "productCash", extra: false, fee: 10, timeKey: "time4hrs", rateMult: 0.995, infoKey: "infoCash" },
  { id: "wallet", key: "productWallet", extra: true, fee: 8, timeKey: "timeInstant", rateMult: 1.002, infoKey: "infoWallet" },
];

const countryField = document.getElementById("countryField");
const countryBtn = document.getElementById("countryBtn");
const countryPanel = document.getElementById("countryPanel");
const countrySearch = document.getElementById("countrySearch");
const countryMenu = document.getElementById("countryMenu");
const countryFlag = document.getElementById("countryFlag");
const countryName = document.getElementById("countryName");
const sendInput = document.getElementById("sendAmount");
const receiveInput = document.getElementById("receiveAmount");
const ccyField = document.getElementById("ccyField");
const ccyBtn = document.getElementById("ccyBtn");
const ccyMenu = document.getElementById("ccyMenu");
const receiveCcy = document.getElementById("receiveCcy");
const cardsEl = document.getElementById("rateCards");
const moreBtn = document.getElementById("moreRates");
const shareBtn = document.getElementById("shareBtn");
const ratesSendBtn = document.getElementById("ratesSendBtn");
const infoPanel = document.getElementById("rateInfo");
const infoOk = document.getElementById("rateInfoOk");
let infoOpener = null;
let infoProductId = null;
let infoHideTimer = 0;

let countryId = "in";
let productId = "bank";
let showExtra = false;
let lastEdited = "send";

function dict() {
  const lang = document.documentElement.lang === "ar" ? "ar" : "en";
  return window.copy?.[lang] || {};
}

function isAr() {
  return document.documentElement.lang === "ar";
}

function country() {
  return COUNTRIES.find((item) => item.id === countryId) || COUNTRIES[0];
}

function product() {
  return PRODUCTS.find((item) => item.id === productId) || PRODUCTS[0];
}

function countryLabel(item) {
  return isAr() ? item.nameAr : item.name;
}

function currencyName(item) {
  return isAr() ? item.ccyNameAr : item.ccyName;
}

function currencyLabel(item) {
  return `${currencyName(item)} (${item.ccy})`;
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

function flagUrl(code) {
  return `https://flagcdn.com/w40/${code}.png`;
}

function quoteFor(prod) {
  const dest = country();
  const send = lastEdited === "receive"
    ? (parseAmount(receiveInput.value) / (dest.rate * prod.rateMult) || 0)
    : parseAmount(sendInput.value);
  const rate = dest.rate * prod.rateMult;
  return {
    send,
    fee: prod.fee,
    netPay: send + prod.fee,
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
  if (lastEdited === "send") {
    receiveInput.value = q.send > 0 ? formatReceiveInput(q.receive) : "";
  } else {
    sendInput.value = q.receive > 0 ? formatKwd(q.send) : "";
  }
  sendInput.closest(".field")?.classList.toggle("has-value", sendInput.value.trim() !== "");
  receiveInput.closest(".field")?.classList.toggle("has-value", receiveInput.value.trim() !== "");
}

function renderCountry() {
  const dest = country();
  countryFlag.src = flagUrl(dest.flag);
  countryName.textContent = countryLabel(dest);
  receiveCcy.textContent = dest.ccy;
}

function optionRow(item, label) {
  const on = item.id === countryId ? " is-on" : "";
  return `<li>
      <button type="button" role="option" class="country-option${on}" data-id="${item.id}" aria-selected="${item.id === countryId}">
        <img class="field__flag" src="${flagUrl(item.flag)}" width="28" height="20" alt="" />
        <span>${label}</span>
        <small>${item.ccy}</small>
      </button>
    </li>`;
}

function filteredCountries() {
  const q = (countrySearch?.value || "").trim().toLowerCase();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter((item) => {
    const hay = `${item.name} ${item.nameAr} ${item.ccy}`.toLowerCase();
    return hay.includes(q);
  });
}

function renderMenu() {
  const list = filteredCountries();
  if (!list.length) {
    countryMenu.innerHTML = `<li class="country-panel__empty" role="presentation">${isAr() ? "لا توجد نتائج" : "No matches"}</li>`;
    return;
  }
  countryMenu.innerHTML = list.map((item) => optionRow(item, countryLabel(item))).join("");
}

function renderCcyMenu() {
  ccyMenu.innerHTML = COUNTRIES.map((item) => optionRow(item, currencyLabel(item))).join("");
}

function placeCountryPanel() {
  if (!countryPanel || countryPanel.hidden) return;
  const rect = countryBtn.getBoundingClientRect();
  const gap = 8;
  const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
  countryPanel.style.position = "fixed";
  countryPanel.style.top = `${Math.round(rect.bottom + gap)}px`;
  countryPanel.style.left = `${Math.round(rect.left)}px`;
  countryPanel.style.width = `${Math.round(rect.width)}px`;
  countryPanel.style.right = "auto";
  countryPanel.style.zIndex = "40";
  countryPanel.style.maxHeight = `${Math.max(180, Math.min(360, Math.round(spaceBelow)))}px`;
}

function closeCountryMenu() {
  countryField.classList.remove("is-open");
  if (countryPanel) countryPanel.hidden = true;
  countryBtn.setAttribute("aria-expanded", "false");
  if (countrySearch) countrySearch.value = "";
  if (countryPanel && countryPanel.parentElement !== countryField) countryField.appendChild(countryPanel);
}

function closeCcyMenu() {
  ccyField.classList.remove("is-open");
  ccyMenu.hidden = true;
  ccyBtn.setAttribute("aria-expanded", "false");
}

function closeMenus() {
  closeCountryMenu();
  closeCcyMenu();
}

function openCountryMenu() {
  closeCcyMenu();
  if (countrySearch) {
    countrySearch.value = "";
    countrySearch.placeholder = isAr() ? "بحث" : "Search";
    countrySearch.setAttribute("aria-label", countrySearch.placeholder);
  }
  renderMenu();
  countryField.classList.add("is-open");
  if (countryPanel) {
    document.body.appendChild(countryPanel);
    countryPanel.hidden = false;
    placeCountryPanel();
  }
  countryBtn.setAttribute("aria-expanded", "true");
  if (countrySearch) requestAnimationFrame(() => countrySearch.focus());
}

function openCcyMenu() {
  closeCountryMenu();
  renderCcyMenu();
  ccyField.classList.add("is-open");
  ccyMenu.hidden = false;
  ccyBtn.setAttribute("aria-expanded", "true");
}

function cell(label, value, accent) {
  return `<div class="rate-card__cell">
    <span class="rate-card__label">${label}</span>
    <span class="rate-card__value${accent ? " rate-card__value--accent" : ""}">${value}</span>
  </div>`;
}

function tagsHtml(selected) {
  if (selected) return "";
  const t = dict();
  const parts = [
    `<span class="rate-card__tag">${ICON_BEST}${t.best || "Best"}</span>`,
    `<span class="rate-card__tag">${ICON_FAST}${t.fast || "Fast"}</span>`,
  ];
  return `<div class="rate-card__tags">${parts.join('<span class="rate-card__sep" aria-hidden="true"></span>')}</div>`;
}

function renderCards() {
  const t = dict();
  const dest = country();
  const visible = PRODUCTS.filter((item) => showExtra || !item.extra);
  cardsEl.innerHTML = visible.map((item) => {
    const q = quoteFor(item);
    const on = item.id === productId;
    return `<article class="rate-card${on ? " is-on" : ""}" data-product="${item.id}" role="radio" aria-checked="${on}" tabindex="0">
      <div class="rate-card__grid">
        ${cell(t.payAmount, `KWD ${formatKwd(q.send)}`)}
        ${cell(t.fees, `KWD ${formatFee(q.fee)}`)}
        ${cell(t.netPay, `KWD ${formatKwd(q.netPay)}`)}
        ${cell(t.deliveryTime, q.time)}
        ${cell(t.rateLabel, `${dest.ccy} ${formatRate(q.rate)}`, !on)}
        ${cell(t.netReceive, `${dest.ccy} ${formatReceive(q.receive)}`)}
      </div>
      <div class="rate-card__foot">
        <button class="rate-card__info" type="button" data-info="${item.id}">
          <img class="rate-card__info-i" src="assets/images/info2.svg" width="16" height="16" alt="" aria-hidden="true" />
          ${t.info || "Info"}
        </button>
        ${tagsHtml(on)}
      </div>
    </article>`;
  }).join("");
}

function refresh() {
  applyQuoteToFields();
  renderCountry();
  renderCards();
}

function selectCountry(id) {
  if (!COUNTRIES.some((item) => item.id === id)) return;
  countryId = id;
  closeMenus();
  refresh();
}

function selectProduct(id) {
  if (!PRODUCTS.some((item) => item.id === id)) return;
  productId = id;
  refresh();
}

function fillInfo(id) {
  const item = PRODUCTS.find((prod) => prod.id === id);
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
  infoProductId = id;
  infoOpener = opener || document.activeElement;
  window.clearTimeout(infoHideTimer);
  infoPanel.hidden = false;
  infoPanel.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      infoPanel.classList.add("is-open");
      infoOk?.focus();
    });
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
    const opener = infoOpener;
    infoOpener = null;
    opener?.focus?.();
  };
  const onEnd = (e) => {
    if (e.target !== panelEl) return;
    hide();
  };
  panelEl?.addEventListener("transitionend", onEnd);
  window.clearTimeout(infoHideTimer);
  infoHideTimer = window.setTimeout(hide, 420);
}

function quoteText() {
  const t = dict();
  const dest = country();
  const q = selectedQuote();
  return [
    "Al Mulla Exchange",
    `${t.exchangeRateTitle || "Exchange Rate"} — ${countryLabel(dest)}`,
    `${q.name}`,
    `${t.send}: ${formatKwd(q.send)} KWD`,
    `${t.receive}: ${formatReceive(q.receive)} ${dest.ccy}`,
    `${t.rateLabel}: 1 KWD = ${formatRate(q.rate)} ${dest.ccy}`,
    `${t.fees}: ${formatFee(q.fee)} KWD`,
    `${t.netPay}: ${formatKwd(q.netPay)} KWD`,
    `${t.netReceive}: ${formatReceive(q.receive)} ${dest.ccy}`,
    `${t.deliveryTime}: ${q.time}`,
    t.ratesDisclaimer,
  ].filter(Boolean).join("\n");
}

async function shareQuote() {
  const t = dict();
  const text = quoteText();
  try {
    if (navigator.share) {
      await navigator.share({ title: "Al Mulla Exchange", text });
      return;
    }
  } catch (err) {
    if (err && err.name === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast(t.quoteCopied || "Quote copied.", "success");
  } catch {
    toast(t.shareFailed || "Unable to share right now.", "error");
  }
}

countryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (countryPanel.hidden) openCountryMenu();
  else closeCountryMenu();
});

ccyBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (ccyMenu.hidden) openCcyMenu();
  else closeCcyMenu();
});

function onMenuPick(e) {
  const option = e.target.closest("[data-id]");
  if (option) selectCountry(option.dataset.id);
}

countryMenu.addEventListener("click", onMenuPick);
ccyMenu.addEventListener("click", onMenuPick);

countrySearch?.addEventListener("input", () => {
  if (countryPanel && !countryPanel.hidden) renderMenu();
});
countrySearch?.addEventListener("click", (e) => e.stopPropagation());
countrySearch?.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    closeCountryMenu();
    countryBtn.focus();
  }
});

window.addEventListener("resize", placeCountryPanel);
document.addEventListener("scroll", placeCountryPanel, true);

document.addEventListener("click", (e) => {
  if (!countryField.contains(e.target) && !countryPanel.contains(e.target)) closeCountryMenu();
  if (!ccyField.contains(e.target)) closeCcyMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (infoPanel && !infoPanel.hidden) {
    e.preventDefault();
    closeInfo();
    return;
  }
  closeMenus();
});

infoPanel?.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-info]")) closeInfo();
});

sendInput.addEventListener("input", () => {
  lastEdited = "send";
  sendInput.closest(".field")?.classList.toggle("has-value", sendInput.value.trim() !== "");
  const dest = country();
  const rate = dest.rate * product().rateMult;
  const send = parseAmount(sendInput.value);
  receiveInput.value = send > 0 ? String(Math.round(send * rate * 100) / 100) : "";
  receiveInput.closest(".field")?.classList.toggle("has-value", receiveInput.value.trim() !== "");
  renderCards();
});

receiveInput.addEventListener("focus", () => closeCcyMenu());

receiveInput.addEventListener("input", () => {
  lastEdited = "receive";
  receiveInput.closest(".field")?.classList.toggle("has-value", receiveInput.value.trim() !== "");
  const dest = country();
  const rate = dest.rate * product().rateMult;
  const receive = parseAmount(receiveInput.value);
  sendInput.value = receive > 0 && rate > 0 ? formatKwd(receive / rate) : "";
  sendInput.closest(".field")?.classList.toggle("has-value", sendInput.value.trim() !== "");
  renderCards();
});

sendInput.addEventListener("blur", () => {
  lastEdited = "send";
  const send = parseAmount(sendInput.value);
  if (send > 0) sendInput.value = formatKwd(send);
  applyQuoteToFields();
});
receiveInput.addEventListener("blur", () => {
  lastEdited = "receive";
  const receive = parseAmount(receiveInput.value);
  if (receive > 0) receiveInput.value = formatReceiveInput(receive);
  applyQuoteToFields();
});

moreBtn.addEventListener("click", () => {
  showExtra = !showExtra;
  moreBtn.setAttribute("aria-checked", showExtra ? "true" : "false");
  moreBtn.classList.toggle("is-on", showExtra);
  renderCards();
});

cardsEl.addEventListener("click", (e) => {
  const info = e.target.closest("[data-info]");
  if (info) {
    e.preventDefault();
    e.stopPropagation();
    openInfo(info.dataset.info, info);
    return;
  }
  const card = e.target.closest("[data-product]");
  if (card) selectProduct(card.dataset.product);
});

cardsEl.addEventListener("keydown", (e) => {
  const card = e.target.closest("[data-product]");
  if (!card) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    selectProduct(card.dataset.product);
  }
});

shareBtn?.addEventListener("click", () => {
  shareQuote();
});

ratesSendBtn?.addEventListener("click", () => {
  const q = selectedQuote();
  const amount = formatKwd(q.send);
  const href =
    `remittance.html?bene=yeshke` +
    `&amount=${encodeURIComponent(amount)}` +
    `&product=${encodeURIComponent(productId)}` +
    `&rate=${encodeURIComponent(String(q.rate))}`;
  try {
    sessionStorage.setItem(
      "ameRemitPrefill",
      JSON.stringify({
        bene: "yeshke",
        amount,
        product: productId,
        rate: q.rate,
        receive: q.receive,
        ccy: country().ccy,
      })
    );
  } catch (_) {}
  if (typeof ameNavigate === "function") ameNavigate(href);
  else location.href = href;
});

document.addEventListener("ame:lang", () => {
  renderCountry();
  renderMenu();
  renderCcyMenu();
  refresh();
  if (infoPanel && !infoPanel.hidden && infoProductId) fillInfo(infoProductId);
});

renderMenu();
renderCcyMenu();
refresh();
