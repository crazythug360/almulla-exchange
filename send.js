const params = new URLSearchParams(location.search);
const pre = params.get("bene");

const dict = () => (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};

const fmt = window.sendFmt;
const parseAmt = window.sendParseAmt;
const SEND_BENEFICIARIES = window.SEND_BENEFICIARIES;

const FLAG = { KWD: "kw", BDT: "bd", INR: "in", PKR: "pk", PHP: "ph", USD: "us", AED: "ae", SAR: "sa", EGP: "eg" };
const AVATAR_TONES = [
  "rgba(0, 174, 66, 0.18)",
  "rgba(59, 130, 246, 0.18)",
  "rgba(249, 115, 22, 0.18)",
  "rgba(168, 85, 247, 0.16)",
  "rgba(20, 184, 166, 0.18)",
  "rgba(236, 72, 153, 0.16)",
];

const SEND_PROCEED_ICON = `<svg class="send-card__act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4.2 12.2 19.5 4.8l-3.4 14.4-4.2-4.1-3.2 2.3v-4.6Z" stroke-linejoin="round"/><path d="m11.9 15.1 7.6-10.3" stroke-linecap="round"/></svg>`;

const SEND_REMOVE_ICON = `<svg class="send-card__act-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 7h15l-1.4 8.2H8.2L6 7Z"/><path d="M6 7 5 4H2.8"/><circle cx="9.2" cy="19.2" r="1.3"/><circle cx="17.6" cy="19.2" r="1.3"/><path d="M10 11v4M14.5 11v4"/></svg>`;

const VERIFIED_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m6.5 12.2 3.4 3.4 7.6-7.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MORE_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18.5" r="1.6"/></svg>`;

const CHEVRON_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const cart = new Set();
const quoteCcy = {};
let filter = "all";
const listEl = document.getElementById("sendList");
const searchEl = document.getElementById("sendSearch");
const badgeEl = document.getElementById("sendCartBadge");
const payBtnEl = document.getElementById("sendPayBtn");

function persistCart() {
  if (typeof saveSendCart === "function") saveSendCart(cart, quoteCcy);
}

function restoreCart() {
  if (typeof loadSendCart !== "function") return;
  const data = loadSendCart();
  cart.clear();
  data.items.forEach((item) => {
    cart.add(item.id);
    if (item.quoteCcy) quoteCcy[item.id] = item.quoteCcy;
    const b = SEND_BENEFICIARIES.find((x) => x.id === item.id);
    if (b && item.amount) b.amount = item.amount;
  });
}

function goCart() {
  persistCart();
  if (typeof ameNavigate === "function") ameNavigate("cart.html");
  else location.href = "cart.html";
}

function flagUrl(ccy) {
  const code = FLAG[ccy] || "un";
  return `https://flagcdn.com/w40/${code}.png`;
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarTone(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  return AVATAR_TONES[h];
}

function visibleList() {
  const q = (searchEl?.value || "").trim().toLowerCase();
  return SEND_BENEFICIARIES.filter((b) => {
    if (filter !== "all" && b.currency !== filter) return false;
    if (!q) return true;
    return b.name.toLowerCase().includes(q) || b.account.toLowerCase().includes(q) || b.bank.toLowerCase().includes(q) || b.currency.toLowerCase().includes(q);
  });
}

function paintBadge() {
  if (!badgeEl) return;
  const n = cart.size;
  badgeEl.textContent = String(n);
  badgeEl.hidden = n === 0;
  if (payBtnEl) payBtnEl.disabled = n === 0;
}

function toastCartAdded(name) {
  if (typeof toast !== "function") return;
  const d = dict();
  toast({
    title: d.cartAddedTitle || "Added to cart",
    desc: name
      ? `${name} ${d.cartAddedDesc || "was added to your cart. Tap Pay Now when you are ready."}`
      : d.cartAddedDesc || "Beneficiary added to your cart. Tap Pay Now when you are ready.",
  }, "success");
}

function ccyControl(b, ccy) {
  const options = ["KWD", b.currency].filter((v, i, arr) => arr.indexOf(v) === i);
  return `<div class="send-ccy">
    <button type="button" class="send-ccy__btn" data-ccy-toggle="${b.id}" aria-haspopup="listbox" aria-expanded="false">
      <img src="${flagUrl(ccy)}" width="22" height="16" alt="" />
      <span>${ccy}</span>
      ${CHEVRON_ICON}
    </button>
    <div class="send-ccy__menu" role="listbox" hidden>
      ${options.map((code) => `
        <button type="button" role="option" data-ccy="${b.id}" data-set="${code}" class="${ccy === code ? "is-on" : ""}" aria-selected="${ccy === code}">
          <img src="${flagUrl(code)}" width="22" height="16" alt="" />
          <span>${code}</span>
        </button>
      `).join("")}
    </div>
  </div>`;
}

function render() {
  if (!listEl) return;
  const d = dict();
  const items = visibleList();
  if (!items.length) {
    listEl.innerHTML = `<li><p class="send-empty">${d.noBeneMatch || "No beneficiaries found"}</p></li>`;
    paintBadge();
    persistCart();
    return;
  }
  listEl.innerHTML = items.map((b) => {
    const inCart = cart.has(b.id);
    const ccy = quoteCcy[b.id] || "KWD";
    const kwd = parseAmt(b.amount);
    const recv = kwd * b.rate;
    const display = ccy === "KWD" ? b.amount : fmt(recv, 3);
    const actLabel = inCart ? (d.remove || "Remove") : (d.proceed || "Proceed");
    const actClass = inCart ? "send-card__act is-remove" : "send-card__act";
    const actIcon = inCart ? SEND_REMOVE_ICON : SEND_PROCEED_ICON;
    return `<li>
      <article class="send-card" data-id="${b.id}">
        <div class="send-card__top">
          <span class="send-card__avatar" style="--avatar-bg:${avatarTone(b.id)}" aria-hidden="true">${initials(b.name)}</span>
          <div class="send-card__who">
            <h2 class="send-card__name">
              <span class="send-card__name-text">${b.name}</span>
              <span class="send-card__verified" title="Verified">${VERIFIED_ICON}</span>
            </h2>
            <p class="send-card__acc">${b.account} | ${b.bank}</p>
          </div>
          <button class="send-card__more" type="button" data-soon aria-label="More options">${MORE_ICON}</button>
        </div>
        <div class="send-card__calc">
          <div class="send-card__amount">
            <span class="send-field-label">${d.enterAmount || "Enter Amount"}</span>
            <div class="send-amount-row">
              <input type="text" inputmode="decimal" value="${display}" data-amt="${b.id}" aria-label="${d.enterAmount || "Enter Amount"}" />
              ${ccyControl(b, ccy)}
            </div>
          </div>
          <div class="send-card__info">
            <div class="send-card__info-item">
              <span class="send-field-label">${d.exchangeRate || "Exchange Rate"}</span>
              <strong>1.000 KWD = ${fmt(b.rate, 3)} ${b.currency}</strong>
            </div>
            <div class="send-card__info-item">
              <span class="send-field-label">${d.fees || "Fees"}</span>
              <strong>${fmt(b.fee, 3)} KWD</strong>
            </div>
          </div>
          <div class="send-card__gets">
            <span class="send-field-label">${d.recipientGets || "Recipient Gets"}</span>
            <strong data-recv>${fmt(recv, 3)} ${b.currency}</strong>
            <small data-send>${fmt(kwd, 3)} KWD</small>
          </div>
          <button class="${actClass}" type="button" data-act="${b.id}">${actIcon}<span>${actLabel}</span></button>
        </div>
      </article>
    </li>`;
  }).join("");
  bindCards();
  paintBadge();
  persistCart();
}

function updateCardQuote(card, b) {
  const kwd = parseAmt(b.amount);
  const recv = kwd * b.rate;
  const recvEl = card.querySelector("[data-recv]");
  const sendEl = card.querySelector("[data-send]");
  if (recvEl) recvEl.textContent = `${fmt(recv, 3)} ${b.currency}`;
  if (sendEl) sendEl.textContent = `${fmt(kwd, 3)} KWD`;
}

function closeCcyMenus(except) {
  listEl?.querySelectorAll(".send-ccy.is-open").forEach((el) => {
    if (el === except) return;
    el.classList.remove("is-open");
    const btn = el.querySelector("[data-ccy-toggle]");
    const menu = el.querySelector(".send-ccy__menu");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (menu) menu.hidden = true;
  });
}

function bindCards() {
  listEl.querySelectorAll("[data-amt]").forEach((input) => {
    input.addEventListener("input", () => {
      const b = SEND_BENEFICIARIES.find((x) => x.id === input.dataset.amt);
      if (!b) return;
      const ccy = quoteCcy[b.id] || "KWD";
      const n = parseAmt(input.value);
      b.amount = ccy === "KWD" ? fmt(n, 3) : fmt(n / b.rate, 3);
      const card = input.closest(".send-card");
      if (card) updateCardQuote(card, b);
      persistCart();
    });
    input.addEventListener("blur", () => {
      const b = SEND_BENEFICIARIES.find((x) => x.id === input.dataset.amt);
      if (!b) return;
      render();
    });
  });

  listEl.querySelectorAll("[data-ccy-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wrap = btn.closest(".send-ccy");
      const menu = wrap?.querySelector(".send-ccy__menu");
      const open = !wrap.classList.contains("is-open");
      closeCcyMenus(open ? wrap : null);
      wrap.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (menu) menu.hidden = !open;
    });
  });

  listEl.querySelectorAll("[data-ccy]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      quoteCcy[btn.dataset.ccy] = btn.dataset.set;
      render();
    });
  });

  listEl.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.act;
      if (cart.has(id)) {
        cart.delete(id);
      } else {
        cart.add(id);
        const b = SEND_BENEFICIARIES.find((x) => x.id === id);
        toastCartAdded(b?.name);
      }
      render();
    });
  });

  listEl.querySelectorAll("[data-soon]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof toast === "function") toast(dict().comingSoon || "This service will be available soon.", "info");
    });
  });
}

document.addEventListener("click", () => closeCcyMenus());

searchEl?.addEventListener("input", render);

document.querySelectorAll("[data-soon]").forEach((btn) => {
  if (btn.closest("#sendList")) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof toast === "function") toast(dict().comingSoon || "This service will be available soon.", "info");
  });
});

document.getElementById("sendAllBtn")?.addEventListener("click", () => {
  const before = cart.size;
  visibleList().forEach((b) => cart.add(b.id));
  render();
  if (cart.size > before && typeof toast === "function") {
    const d = dict();
    toast({
      title: d.cartAddedTitle || "Added to cart",
      desc: d.cartAddedAllDesc || "Beneficiaries added to your cart. Tap Pay Now when you are ready.",
    }, "success");
  }
});

document.getElementById("sendPayBtn")?.addEventListener("click", () => {
  if (!cart.size || payBtnEl?.disabled) return;
  goCart();
});

document.getElementById("sendCartBtn")?.addEventListener("click", () => {
  if (!cart.size) {
    if (typeof toast === "function") toast({ title: dict().cart || "Cart", desc: dict().cartEmpty || "Cart is empty." }, "info");
    return;
  }
  goCart();
});

document.getElementById("dashLogoutBtn")?.addEventListener("click", () => {
  if (typeof closeMenu === "function") closeMenu();
  if (typeof ameClearSession === "function") ameClearSession();
  if (typeof ameNavigate === "function") ameNavigate("index.html");
});

if (pre && SEND_BENEFICIARIES.some((b) => b.id === pre)) {
  filter = "all";
  cart.add(pre);
}

restoreCart();
render();

if (pre) {
  requestAnimationFrame(() => {
    document.querySelector(`.send-card[data-id="${pre}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}
