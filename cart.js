const dict = () => (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};

let cartItems = [];
let termsAccepted = false;
const openIds = new Set();

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
let payOkSound = null;
let payOkLottieAnim = null;

function playPayOkSound() {
  try {
    if (!payOkSound) {
      payOkSound = new Audio("sounds/payment-success.wav");
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
  apple: "payApple",
  knet: "payKnet",
  branch: "payBranch",
  kiosk: "payKiosk",
  bank: "payBank",
};

const CCY_FLAG = {
  KWD: "kw", BDT: "bd", INR: "in", PKR: "pk", PHP: "ph",
  USD: "us", EUR: "eu", GBP: "gb", EGP: "eg", SAR: "sa", AED: "ae",
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

function flagUrl(ccy) {
  return `https://flagcdn.com/w40/${CCY_FLAG[ccy] || "un"}.png`;
}

function cartLine(label, value, icon, strong) {
  const mark = icon ? `<span class="cart-line__icon">${icon}</span>` : "";
  return `<div class="cart-line${strong ? " is-strong" : ""}">${mark}<span class="cart-line__label">${label}</span><span class="cart-line__value">${value}</span></div>`;
}

function itemTotals(item, b) {
  const sendKwd = sendParseAmt(item.amount);
  const fee = b.fee || 1;
  const youPay = sendKwd + fee;
  const recv = sendKwd * b.rate;
  return { sendKwd, fee, youPay, recv };
}

function renderItem(item) {
  const b = getSendBeneficiary(item.id);
  if (!b) return "";
  const d = dict();
  const { sendKwd, fee, youPay, recv } = itemTotals(item, b);
  const invRate = b.rate ? (1 / b.rate).toFixed(3) : "0.000";
  const appId = item.appId || sendAppId(item.id);
  const open = openIds.has(item.id);
  const moreLabel = open ? (d.lessDetails || "Less details") : (d.moreDetails || "More details");

  return `<li>
    <article class="cart-card${open ? " is-open" : ""}" data-id="${item.id}">
      <div class="cart-card__head">
        <span class="cart-card__app">${d.cartApplication || "Application #"} ${appId}</span>
        <p class="cart-card__selected">
          <span class="cart-card__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 12.2 4 4 8-8.4"/></svg>
          </span>
          <span>${d.cartSelected || "Selected in cart"}</span>
        </p>
        <button class="cart-card__delete" type="button" data-remove="${item.id}" aria-label="${d.cartRemove || "Remove"}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M5 7h14"/>
            <path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7"/>
            <path d="M7.5 7v12.2A1.8 1.8 0 0 0 9.3 21h5.4a1.8 1.8 0 0 0 1.8-1.8V7"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>
      <div class="cart-card__rates">
        <div class="cart-rate">
          <img class="cart-rate__flag" src="${flagUrl("KWD")}" width="22" height="16" alt="" />
          <div class="cart-rate__text">
            <span class="cart-rate__pair">KWD → ${b.currency}</span>
            <span class="cart-rate__val">${sendFmt(b.rate, 6)}</span>
          </div>
        </div>
        <span class="cart-card__swap" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 8h11l-2.4-2.4M17 16H6l2.4 2.4"/></svg>
        </span>
        <div class="cart-rate">
          <img class="cart-rate__flag" src="${flagUrl(b.currency)}" width="22" height="16" alt="" />
          <div class="cart-rate__text">
            <span class="cart-rate__pair">${b.currency} → KWD</span>
            <span class="cart-rate__val">${invRate}</span>
          </div>
        </div>
      </div>
      <div class="cart-card__details">
        ${cartLine(d.beneficiary || "Beneficiary", b.name, ICON_USER)}
        ${cartLine(d.bank || "Bank", b.bank, ICON_BANK)}
        ${cartLine(d.branches || "Branches", b.branch || b.bank, ICON_PIN)}
        ${cartLine(d.accountNumber || "Account Number", b.account, ICON_CARD)}
      </div>
      <div class="cart-card__extra" id="cartExtra-${item.id}">
        <div class="cart-card__extra-inner">
          ${cartLine(d.sourceOfFunds || "Source Of Funds", b.source || "Salary", ICON_FUNDS)}
          ${cartLine(d.purposeOfTransaction || "Purpose Of Transaction", b.purpose || "Family Maintenance / Savings", ICON_PURPOSE)}
          ${cartLine(d.send || "Send", `${sendFmt(sendKwd, 3)} KWD`, ICON_SEND, true)}
          ${cartLine(d.transactionFees || "Transaction Fees", `+${sendFmt(fee, 3)} KWD`, ICON_FEE)}
          ${cartLine(d.netTransactionFees || "Net Transaction Fees", `${sendFmt(fee, 3)} KWD`, ICON_NET)}
        </div>
      </div>
      <div class="cart-card__summary">
        <div class="cart-sum">
          <span class="cart-sum__label">${d.youPay || "You Pay"}</span>
          <span class="cart-sum__val">KWD ${sendFmt(youPay, 3)}</span>
        </div>
        <div class="cart-sum">
          <span class="cart-sum__label">${d.receive || "Receive"}</span>
          <span class="cart-sum__val">${b.currency} ${sendFmt(recv, 3)}</span>
        </div>
      </div>
      <button class="cart-card__toggle" type="button" data-toggle="${item.id}" aria-expanded="${open ? "true" : "false"}" aria-controls="cartExtra-${item.id}">
        <span>${moreLabel}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
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

function updateTabs() {
  if (remitCountEl) remitCountEl.textContent = `(${cartItems.length})`;
}

function updatePayBtn() {
  const total = totalPay();
  if (totalEl) totalEl.textContent = `${sendFmt(total, 3)} KWD`;
  if (payBtn) payBtn.disabled = !termsAccepted || cartItems.length === 0;
}

function persistCart() {
  const quoteCcy = Object.fromEntries(cartItems.map((i) => [i.id, i.quoteCcy || "KWD"]));
  saveSendCart(cartItems.map((i) => i.id), quoteCcy);
}

function toggleExtra(id) {
  if (openIds.has(id)) openIds.delete(id);
  else openIds.add(id);
  render();
}

function render() {
  const d = dict();
  updateTabs();
  if (!cartItems.length) {
    listEl.innerHTML = `<li><p class="cart-empty">${d.cartEmptyPage || "Your cart is empty. Add beneficiaries from Send Money."}</p></li>`;
    updatePayBtn();
    return;
  }
  listEl.innerHTML = cartItems.map(renderItem).join("");
  listEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cartItems = cartItems.filter((i) => i.id !== btn.dataset.remove);
      openIds.delete(btn.dataset.remove);
      persistCart();
      render();
    });
  });
  listEl.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => toggleExtra(btn.dataset.toggle));
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
  if (!cartItems.length) {
    const params = new URLSearchParams(location.search);
    if (params.get("empty") !== "1") {
      location.replace("send.html");
    }
  }
}

termsEl?.addEventListener("change", () => {
  termsAccepted = termsEl.checked;
  updatePayBtn();
});

document.getElementById("cartAddBtn")?.addEventListener("click", () => {
  if (typeof ameNavigate === "function") ameNavigate("send.html");
  else location.href = "send.html";
});

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
  paySheet.hidden = false;
  paySheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("pay-sheet-open");
  requestAnimationFrame(() => paySheet.classList.add("is-open"));
  paySheetClose?.focus();
}

function closePaySheet() {
  if (!paySheet || paySheet.hidden || !paySheet.classList.contains("is-open")) return;
  paySheet.classList.remove("is-open");
  paySheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("pay-sheet-open");
  if (payCloseTimer) clearTimeout(payCloseTimer);
  payCloseTimer = window.setTimeout(() => {
    paySheet.hidden = true;
    payCloseTimer = null;
  }, PAY_ANIM_MS);
}

function receiptText(meta) {
  const d = dict();
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
    txn: String(624510000000000 + (n % 99999999)),
    ref: `20370${year}${app}${String(Date.now()).slice(-6)}`,
    recv: recvParts.join(" · ") || "—",
    name: `${(names[0] || "—").toUpperCase()}${extra}`,
    method: d[methodKey] || method,
  };
}

function fillPayOk(meta) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set("payOkAmount", meta.amount);
  set("payOkReceipt", meta.receipt);
  set("payOkTxn", meta.txn);
  set("payOkRef", meta.ref);
  set("payOkRecv", meta.recv);
  set("payOkName", meta.name);
}

function openPayOk() {
  if (!payOk) return;
  payOk.hidden = false;
  payOk.setAttribute("aria-hidden", "false");
  document.body.classList.add("pay-ok-open");
  requestAnimationFrame(() => {
    payOk.classList.add("is-open");
    playPayOkLottie();
  });
  playPayOkSound();
  payOkExit?.focus();
}

function closePayOk(dest) {
  if (!payOk || payOk.hidden) return;
  payOk.classList.remove("is-open");
  payOk.setAttribute("aria-hidden", "true");
  document.body.classList.remove("pay-ok-open");
  destroyPayOkLottie();
  window.setTimeout(() => {
    payOk.hidden = true;
    if (!dest) return;
    cartItems = [];
    persistCart();
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

function pickPayMethod(method) {
  paySheet?.querySelectorAll(".pay-opt").forEach((btn) => {
    const on = btn.dataset.pay === method;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-checked", on ? "true" : "false");
  });
  lastReceipt = buildReceipt(method);
  fillPayOk(lastReceipt);
  window.setTimeout(() => {
    closePaySheet();
    openPayOk();
  }, 180);
}

payBtn?.addEventListener("click", () => {
  if (!termsAccepted || !cartItems.length) return;
  openPaySheet();
});

paySheetClose?.addEventListener("click", closePaySheet);
paySheetBackdrop?.addEventListener("click", closePaySheet);

paySheet?.querySelectorAll("[data-pay]").forEach((btn) => {
  btn.addEventListener("click", () => pickPayMethod(btn.dataset.pay));
});

payOkExit?.addEventListener("click", () => closePayOk("home"));
payOkNew?.addEventListener("click", () => closePayOk("send"));
payOkDownload?.addEventListener("click", downloadReceipt);
payOkShare?.addEventListener("click", () => {
  shareReceipt();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (payOk && !payOk.hidden) {
    closePayOk("home");
    return;
  }
  closePaySheet();
});

fxTab?.addEventListener("click", () => {
  if (typeof toast === "function") toast(dict().comingSoon || "This service will be available soon.", "info");
});

document.getElementById("dashLogoutBtn")?.addEventListener("click", () => {
  if (typeof closeMenu === "function") closeMenu();
  if (typeof ameClearSession === "function") ameClearSession();
  if (typeof ameNavigate === "function") ameNavigate("index.html");
});

loadCart();
render();
