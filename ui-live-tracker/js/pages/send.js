const params = new URLSearchParams(location.search);
const pre = params.get("bene");

const dict = () => (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};

const fmt = window.sendFmt;
const parseAmt = window.sendParseAmt;
const SEND_BENEFICIARIES = window.SEND_BENEFICIARIES;

const SEND_PROCEED_VIDEO_SRC = new URL(
  "assets/images/addtocart2.webm",
  document.baseURI
).href;
const SEND_PROCEED_ICON = `<video class="send-card__act-video" src="${SEND_PROCEED_VIDEO_SRC}" muted loop autoplay playsinline preload="auto" aria-hidden="true"></video>`;

const SEND_REMOVE_VIDEO_SRC = new URL(
  "assets/images/removefromcart.webm",
  document.baseURI
).href;
const SEND_REMOVE_ICON = `<video class="send-card__act-video" src="${SEND_REMOVE_VIDEO_SRC}" muted loop autoplay playsinline preload="auto" aria-hidden="true"></video>`;

const cart = new Set();
const quoteCcy = {};
let filter = "all";
const listEl = document.getElementById("sendList");
const searchEl = document.getElementById("sendSearch");
const payBtnEl = document.getElementById("sendPayBtn");
const badgeEl = document.getElementById("sendCartBadge");

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

window.persistSendCart = persistCart;

function moneyBits(amount, ccy) {
  return `${amount} <b>${ccy}</b>`;
}

function bankLine(b) {
  const parts = [b.bank, b.branch].filter(Boolean);
  const place = parts.join(" ");
  if (b.country) return `${place} , ${b.country}`;
  return place || "—";
}

function ccyToggle(b, ccy) {
  const options = ["KWD", b.currency].filter((v, i, arr) => arr.indexOf(v) === i);
  return `<span class="send-ccy" role="group" aria-label="Currency">
    ${options.map((code, i) => `
      ${i ? `<span class="send-ccy__sep" aria-hidden="true">|</span>` : ""}
      <button type="button" class="send-ccy__opt${ccy === code ? " is-on" : ""}" data-ccy="${b.id}" data-set="${code}" aria-pressed="${ccy === code}">${code}</button>
    `).join("")}
  </span>`;
}

function rateLineHtml(b) {
  return `${moneyBits("1.000", "KWD")} = ${moneyBits(fmt(b.rate, 3), b.currency)} <span class="send-card__pipe">|</span> Fees : ${moneyBits(fmt(b.fee, 3), "KWD")}`;
}

function totalLineHtml(b, kwd, recv) {
  return `${moneyBits(fmt(kwd, 3), "KWD")} = ${moneyBits(fmt(recv, 3), b.currency)}`;
}

function visibleList() {
  const q = (searchEl?.value || "").trim().toLowerCase();
  return SEND_BENEFICIARIES.filter((b) => {
    if (filter !== "all" && b.currency !== filter) return false;
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      String(b.account || "").toLowerCase().includes(q) ||
      b.bank.toLowerCase().includes(q) ||
      b.currency.toLowerCase().includes(q)
    );
  });
}

function paintBadge() {
  const n = cart.size;
  const badge = document.getElementById("sendCartBadge") || badgeEl;
  if (badge) {
    badge.textContent = String(n);
    badge.hidden = n === 0;
  }
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
    const account = b.account || "—";
    return `<li>
      <article class="send-card" data-id="${b.id}">
        <div class="send-card__who">
          <div class="send-card__meta">
            <h2 class="send-card__name">${b.name}</h2>
            <p class="send-card__acc">${account} | ${bankLine(b)}</p>
          </div>
        </div>
        <div class="send-card__row">
          <div class="send-amount-field">
            <span class="send-amount-field__label">${d.enterAmount || "Enter Amount"}</span>
            <input type="text" inputmode="decimal" value="${display}" data-amt="${b.id}" aria-label="${d.enterAmount || "Enter Amount"}" />
            ${ccyToggle(b, ccy)}
          </div>
          <div class="send-card__foot">
            <p class="send-card__rate" data-rate>${rateLineHtml(b)}</p>
            <p class="send-card__total" data-total>${totalLineHtml(b, kwd, recv)}</p>
          </div>
          <button class="${actClass}" type="button" data-act="${b.id}">${actIcon}<span>${actLabel}</span></button>
        </div>
      </article>
    </li>`;
  }).join("");
  bindCards();
  playProceedVideos();
  paintBadge();
  persistCart();
}

function updateCardQuote(card, b) {
  const kwd = parseAmt(b.amount);
  const recv = kwd * b.rate;
  const rateEl = card.querySelector("[data-rate]");
  const totalEl = card.querySelector("[data-total]");
  if (rateEl) rateEl.innerHTML = rateLineHtml(b);
  if (totalEl) totalEl.innerHTML = totalLineHtml(b, kwd, recv);
}

function paintActButton(btn, id) {
  if (!btn) return;
  const d = dict();
  const inCart = cart.has(id);
  btn.className = inCart ? "send-card__act is-remove" : "send-card__act";
  const label = inCart ? (d.remove || "Remove") : (d.proceed || "Proceed");
  const icon = inCart ? SEND_REMOVE_ICON : SEND_PROCEED_ICON;
  btn.innerHTML = `${icon}<span>${label}</span>`;
  playProceedVideos(btn);
}

function playProceedVideos(root = listEl) {
  root?.querySelectorAll(".send-card__act-video").forEach((video) => {
    video.muted = true;
    const play = video.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
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
      const ccy = quoteCcy[b.id] || "KWD";
      const kwd = parseAmt(b.amount);
      const recv = kwd * b.rate;
      b.amount = fmt(kwd, 3);
      input.value = ccy === "KWD" ? b.amount : fmt(recv, 3);
      const card = input.closest(".send-card");
      if (card) updateCardQuote(card, b);
      persistCart();
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
      paintActButton(btn, id);
      paintBadge();
      persistCart();
    });
  });
}

searchEl?.addEventListener("input", render);

(function initSendSearchHint() {
  const field = searchEl?.closest(".send-search");
  const hintRoot = document.getElementById("sendSearchHint");
  const hintText = hintRoot?.querySelector(".send-search-hint__text");
  const hintFixed = hintRoot?.querySelector(".send-search-hint__fixed");
  if (!searchEl || !field || !hintText || !hintFixed) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gen = 0;
  let timer = 0;
  let settle = null;

  function phrases() {
    const d = dict();
    return [
      d.searchHintAccountShort || "Account Number",
      d.searchHintNameShort || "Beneficiary Name",
      d.searchHintCurrencyShort || "Currency",
      d.searchHintBankShort || "Bank Name",
    ];
  }

  function syncFilled() {
    field.classList.toggle("is-filled", Boolean(searchEl.value));
  }

  function wait(ms) {
    return new Promise((resolve) => {
      settle = resolve;
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        settle = null;
        resolve();
      }, ms);
    });
  }

  async function play(token) {
    let index = 0;
    while (token === gen && hintText.isConnected) {
      const list = phrases();
      const phrase = list[index % list.length];
      if (reduceMotion) {
        hintText.textContent = phrase;
        await wait(2800);
      } else {
        hintText.textContent = "";
        for (let i = 1; i <= phrase.length; i += 1) {
          if (token !== gen) return;
          hintText.textContent = phrase.slice(0, i);
          await wait(36);
        }
        await wait(1600);
        for (let i = phrase.length - 1; i >= 0; i -= 1) {
          if (token !== gen) return;
          hintText.textContent = phrase.slice(0, i);
          await wait(20);
        }
        await wait(260);
      }
      index += 1;
    }
  }

  function start() {
    gen += 1;
    clearTimeout(timer);
    if (settle) settle();
    settle = null;
    const d = dict();
    hintFixed.textContent = d.searchByPrefix || "Search by";
    hintText.textContent = "";
    play(gen);
  }

  syncFilled();
  searchEl.addEventListener("input", syncFilled);
  document.addEventListener("ame:lang", start);
  start();
})();

function setSendCcyFilter(ccy) {
  filter = ccy || "all";
  document.querySelectorAll("[data-send-ccy]").forEach((chip) => {
    const on = chip.getAttribute("data-send-ccy") === filter;
    chip.classList.toggle("is-on", on);
    chip.setAttribute("aria-selected", on ? "true" : "false");
  });
  render();
}

document.querySelectorAll("[data-send-ccy]").forEach((chip) => {
  chip.addEventListener("click", () => setSendCcyFilter(chip.getAttribute("data-send-ccy")));
});

document.querySelectorAll("[data-soon]").forEach((btn) => {
  if (btn.closest("#sendList")) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof toast === "function") toast(dict().comingSoon || "This service will be available soon.", "info");
  });
});

document.getElementById("sendAddBeneBtn")?.addEventListener("click", () => {
  if (typeof ameNavigate === "function") ameNavigate("add-beneficiary.html");
  else location.href = "add-beneficiary.html";
});

document.getElementById("sendSelectBeneBtn")?.addEventListener("click", () => {
  if (typeof ameNavigate === "function") ameNavigate("beneficiaries.html");
  else location.href = "beneficiaries.html";
});

document.getElementById("sendPayBtn")?.addEventListener("click", () => {
  if (!cart.size || payBtnEl?.disabled) return;
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

(function playSendBackVideo() {
  if (typeof window.playPageBackVideos === "function") window.playPageBackVideos();
  else {
    document.querySelectorAll(".page-back__video").forEach((video) => {
      video.muted = true;
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    });
  }
})();

if (pre) {
  requestAnimationFrame(() => {
    document.querySelector(`.send-card[data-id="${pre}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}
