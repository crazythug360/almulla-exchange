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

const PRODUCTS = [
  { id: "bank", key: "productBank", extra: false, fee: 9, timeKey: "time2hrs", rateMult: 1, infoKey: "infoBank" },
  { id: "cash", key: "productCash", extra: false, fee: 10, timeKey: "time4hrs", rateMult: 0.995, infoKey: "infoCash" },
  { id: "wallet", key: "productWallet", extra: true, fee: 8, timeKey: "timeInstant", rateMult: 1.002, infoKey: "infoWallet" },
];

const countryField = document.getElementById("countryField");
const countryBtn = document.getElementById("countryBtn");
const countryMenu = document.getElementById("countryMenu");
const countryFlag = document.getElementById("countryFlag");
const countryName = document.getElementById("countryName");
const sendInput = document.getElementById("sendAmount");
const receiveInput = document.getElementById("receiveAmount");
const ccyField = document.getElementById("ccyField");
const ccyBtn = document.getElementById("ccyBtn");
const ccyMenu = document.getElementById("ccyMenu");
const receiveFlag = document.getElementById("receiveFlag");
const receiveCcy = document.getElementById("receiveCcy");
const cardsEl = document.getElementById("rateCards");
const moreBtn = document.getElementById("moreRates");
const shareBtn = document.getElementById("shareBtn");
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
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
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
  receiveFlag.src = flagUrl(dest.flag);
  receiveCcy.textContent = currencyLabel(dest);
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

function renderMenu() {
  countryMenu.innerHTML = COUNTRIES.map((item) => optionRow(item, countryLabel(item))).join("");
}

function renderCcyMenu() {
  ccyMenu.innerHTML = COUNTRIES.map((item) => optionRow(item, currencyLabel(item))).join("");
}

function closeCountryMenu() {
  countryField.classList.remove("is-open");
  countryMenu.hidden = true;
  countryBtn.setAttribute("aria-expanded", "false");
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
  renderMenu();
  countryField.classList.add("is-open");
  countryMenu.hidden = false;
  countryBtn.setAttribute("aria-expanded", "true");
}

function openCcyMenu() {
  closeCountryMenu();
  renderCcyMenu();
  ccyField.classList.add("is-open");
  ccyMenu.hidden = false;
  ccyBtn.setAttribute("aria-expanded", "true");
}

function cell(label, value) {
  return `<div class="rate-card__cell">
    <span class="rate-card__label">${label}</span>
    <span class="rate-card__value">${value}</span>
  </div>`;
}

function renderCards() {
  const t = dict();
  const dest = country();
  const visible = PRODUCTS.filter((item) => showExtra || !item.extra);
  cardsEl.innerHTML = visible.map((item) => {
    const q = quoteFor(item);
    const on = item.id === productId;
    return `<article class="rate-card${on ? " is-on" : ""}" data-product="${item.id}" role="radio" aria-checked="${on}" tabindex="0">
      <p class="rate-card__name">${t[item.key] || item.id}</p>
      <div class="rate-card__grid">
        ${cell(t.payAmount, `KWD ${formatKwd(q.send)}`)}
        ${cell(t.fees, `KWD ${formatFee(q.fee)}`)}
        ${cell(t.netPay, `KWD ${formatKwd(q.netPay)}`)}
        ${cell(t.deliveryTime, q.time)}
        ${cell(t.rateLabel, `${dest.ccy} ${formatRate(q.rate)}`)}
        ${cell(t.netReceive, `${dest.ccy} ${formatReceive(q.receive)}`)}
      </div>
      <button class="rate-card__info" type="button" data-info="${item.id}">
        <span class="rate-card__info-i" aria-hidden="true">i</span>
        ${t.info || "Info"}
      </button>
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
  if (body) body.textContent = t[item.infoKey] || "";
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
  if (countryMenu.hidden) openCountryMenu();
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

document.addEventListener("click", (e) => {
  if (!countryField.contains(e.target)) closeCountryMenu();
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

shareBtn.addEventListener("click", () => {
  shareQuote();
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
