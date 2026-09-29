const dict = () => (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};

const fmt = (n, digits = 3) =>
  typeof window.sendFmt === "function" ? window.sendFmt(n, digits) : Number(n).toFixed(digits);

/* Per-card avatar colors (this page only) — white letter on rich fill */
const AVATAR_PALETTE = [
  { bg: "#4A5D3A", fg: "#fff" },
  { bg: "#5B4B8A", fg: "#fff" },
  { bg: "#2C3E6B", fg: "#fff" },
  { bg: "#6B4E3D", fg: "#fff" },
  { bg: "#3D5A5B", fg: "#fff" },
  { bg: "#6B3A5A", fg: "#fff" },
  { bg: "#3A4A6B", fg: "#fff" },
  { bg: "#5A6B3A", fg: "#fff" },
];

function avatarTone(index, tx) {
  if (tx?.avatar) {
    return { bg: tx.avatar, fg: "#fff", dark: true };
  }
  return { ...AVATAR_PALETTE[index % AVATAR_PALETTE.length], dark: true };
}

const TX_DATA = [
  {
    id: "tx1",
    name: "Jatin Gupta",
    account: "12345678904688",
    bank: "Money Gram",
    branch: "Motijheel Road, Dhaka, Bangladesh",
    currency: "BDT",
    status: "in_progress",
    date: "2026-08-08",
    sendKwd: 100,
    recv: 39990.19,
    authNeeded: false,
    avatar: "#4A5D3A",
  },
  {
    id: "tx2",
    name: "Mir Rabil Uddin",
    account: "50100123450697",
    bank: "Hdfc Bank Ltd",
    branch: "Andheri West, Mumbai, India",
    currency: "INR",
    status: "in_progress",
    date: "2026-07-14",
    sendKwd: 50,
    recv: 16192,
    authNeeded: true,
    avatar: "#5B4B8A",
  },
  {
    id: "tx3",
    name: "Priya Sharma",
    account: "00220100112210",
    bank: "ICICI Bank",
    branch: "Bandra Kurla Complex, Mumbai, India",
    currency: "INR",
    status: "completed",
    date: "2026-08-20",
    sendKwd: 30,
    recv: 8157,
    authNeeded: false,
    avatar: "#4A5D3A",
  },
  {
    id: "tx4",
    name: "Ahmed Hassan",
    account: "PK00HABB0001239012",
    bank: "Habib Bank Limited",
    branch: "I.I. Chundrigar Road, Karachi, Pakistan",
    currency: "PKR",
    status: "failed",
    date: "2026-08-12",
    sendKwd: 20,
    recv: 18144,
    authNeeded: false,
    avatar: "#2C3E6B",
  },
  {
    id: "tx5",
    name: "Nimal Perera",
    account: "789012344412",
    bank: "Bank of Ceylon",
    branch: "Fort Branch, Colombo, Sri Lanka",
    currency: "LKR",
    status: "completed",
    date: "2026-07-30",
    sendKwd: 40,
    recv: 42280,
    authNeeded: false,
    avatar: "#3D5A5B",
  },
  {
    id: "tx6",
    name: "Maria Santos",
    account: "004580123456",
    bank: "BDO Unibank",
    branch: "Ayala Avenue, Makati, Philippines",
    currency: "PHP",
    status: "in_progress",
    date: "2026-07-22",
    sendKwd: 15,
    recv: 2841,
    authNeeded: false,
    avatar: "#6B3A5A",
  },
  {
    id: "tx7",
    name: "Alex Morgan",
    account: "98765432104471",
    bank: "Chase Bank",
    branch: "Madison Avenue, New York, USA",
    currency: "USD",
    status: "completed",
    date: "2026-07-15",
    sendKwd: 100,
    recv: 325.7,
    authNeeded: false,
    avatar: "#3A4A6B",
  },
  {
    id: "tx8",
    name: "Salma Akter",
    account: "2050123454512",
    bank: "Islami Bank Bangladesh Limited",
    branch: "Mirpur 10, Dhaka, Bangladesh",
    currency: "BDT",
    status: "completed",
    date: "2026-06-28",
    sendKwd: 55,
    recv: 20912.5,
    authNeeded: false,
    avatar: "#5A6B3A",
  },
  {
    id: "tx9",
    name: "Rajesh Kumar",
    account: "5010009988377",
    bank: "HDFC Bank",
    branch: "Andheri West, Mumbai, India",
    currency: "INR",
    status: "pending",
    date: "2026-06-18",
    sendKwd: 75,
    recv: 20448.75,
    authNeeded: true,
    avatar: "#6B4E3D",
  },
  {
    id: "tx10",
    name: "John Doe",
    account: "12345678907890",
    bank: "Bank of the Philippine Islands",
    branch: "IT Park, Cebu, Philippines",
    currency: "PHP",
    status: "failed",
    date: "2026-06-10",
    sendKwd: 18,
    recv: 3409.2,
    authNeeded: false,
    avatar: "#2C3E6B",
  },
  {
    id: "tx11",
    name: "Kashf Said",
    account: "1051200123451",
    bank: "Eastern Bank Ltd",
    branch: "Gulshan Avenue, Dhaka, Bangladesh",
    currency: "BDT",
    status: "completed",
    date: "2026-05-25",
    sendKwd: 20,
    recv: 7942,
    authNeeded: false,
    avatar: "#4A5D3A",
  },
  {
    id: "tx12",
    name: "test usd bene",
    account: "453211221122",
    bank: "Wells Fargo",
    branch: "Market Street, San Francisco, USA",
    currency: "USD",
    status: "completed",
    date: "2026-08-02",
    sendKwd: 200,
    recv: 651.4,
    authNeeded: false,
    avatar: "#5B4B8A",
  },
];

const state = {
  tab: "transactions",
  search: "",
  currency: "all",
  sort: "desc",
  filterOpen: false,
  from: "",
  to: "",
  beneficiary: "all",
  status: "all",
  stmtPeriod: "",
  stmtFormat: "",
  stmtAll: true,
  stmtBenes: [],
};

const listEl = document.getElementById("txList");
const ordersEl = document.getElementById("txOrders");
const totalAmtEl = document.getElementById("txTotalAmt");
const countBadgeEl = document.getElementById("txCountBadge");
const searchEl = document.getElementById("txSearch");
const sortBtn = document.getElementById("txSortBtn");
const filterBtn = document.getElementById("txFilterBtn");
const filterPanel = document.getElementById("txFilterPanel");
const filterBadge = document.getElementById("txFilterBadge");
const filterClear = document.getElementById("txFilterClear");
const fromEl = document.getElementById("txFrom");
const toEl = document.getElementById("txTo");
const stmtEl = document.getElementById("txStmt");
const stmtProceed = document.getElementById("txStmtProceed");
const stmtCustom = document.getElementById("txStmtCustom");
const stmtBeneList = document.getElementById("txStmtBeneList");
const stmtBeneBtn = document.getElementById("txStmtBeneBtn");
const stmtBeneMenu = document.getElementById("txStmtBeneMenu");
const stmtBeneLabel = document.getElementById("txStmtBeneLabel");
const stmtBeneSelect = document.getElementById("txStmtBeneSelect");

function t(key, fallback) {
  const d = dict();
  return d[key] || fallback;
}

function showToast(msg, type = "info") {
  if (typeof toast === "function") {
    toast(typeof msg === "string" ? { title: type === "success" ? t("getStatement", "Get Statement") : t("myTransactions", "My Transactions"), desc: msg } : msg, type);
  } else {
    alert(typeof msg === "string" ? msg : msg?.desc || "");
  }
}

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function statusLabel(status) {
  const map = {
    in_progress: t("inProgress", "In Progress"),
    completed: t("completed", "Completed"),
    failed: t("failed", "Failed"),
    pending: t("pending", "Pending"),
  };
  return map[status] || status;
}

function monthKey(dateStr) {
  return String(dateStr).slice(0, 7);
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString(document.documentElement.lang === "ar" ? "ar" : "en", {
    month: "long",
    year: "numeric",
  });
}

function formatDisplayDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString(document.documentElement.lang === "ar" ? "ar" : "en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function uniqueBeneficiaries() {
  const names = [...new Set(TX_DATA.map((x) => x.name))].sort((a, b) => a.localeCompare(b));
  return names;
}

function setupSelect(menuId, btnId, labelId, items, onPick, current) {
  const menu = document.getElementById(menuId);
  const btn = document.getElementById(btnId);
  const label = document.getElementById(labelId);
  if (!menu || !btn || !label) return;

  function close() {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }

  function open() {
    document.querySelectorAll(".tx-select__menu").forEach((m) => {
      if (m !== menu) m.hidden = true;
    });
    document.querySelectorAll(".tx-select__btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }

  menu.innerHTML = items
    .map(
      (item) => `
    <li>
      <button type="button" class="tx-select__option${item.value === current ? " is-on" : ""}" role="option" data-value="${item.value}">
        ${item.label}
      </button>
    </li>`
    )
    .join("");

  const selected = items.find((i) => i.value === current);
  if (selected) label.textContent = selected.label;

  btn.onclick = (e) => {
    e.stopPropagation();
    if (menu.hidden) open();
    else close();
  };

  menu.onclick = (e) => {
    const opt = e.target.closest(".tx-select__option");
    if (!opt) return;
    const value = opt.getAttribute("data-value");
    menu.querySelectorAll(".tx-select__option").forEach((o) => o.classList.toggle("is-on", o === opt));
    label.textContent = opt.textContent.trim();
    close();
    onPick(value);
  };

  return { close, setValue(value) {
    const item = items.find((i) => i.value === value);
    if (item) label.textContent = item.label;
    menu.querySelectorAll(".tx-select__option").forEach((o) => {
      o.classList.toggle("is-on", o.getAttribute("data-value") === value);
    });
  }};
}

let beneSelectApi;
let statusSelectApi;

function buildFilterSelects() {
  const beneItems = [
    { value: "all", label: t("selectBeneficiary", "Select beneficiary") },
    ...uniqueBeneficiaries().map((n) => ({ value: n, label: n })),
  ];
  beneSelectApi = setupSelect("txBeneMenu", "txBeneBtn", "txBeneLabel", beneItems, (v) => {
    state.beneficiary = v;
    updateFilterBadge();
    render();
  }, state.beneficiary);

  const statusItems = [
    { value: "all", label: "All" },
    { value: "in_progress", label: statusLabel("in_progress") },
    { value: "completed", label: statusLabel("completed") },
    { value: "failed", label: statusLabel("failed") },
    { value: "pending", label: statusLabel("pending") },
  ];
  statusSelectApi = setupSelect("txStatusMenu", "txStatusBtn", "txStatusLabel", statusItems, (v) => {
    state.status = v;
    updateFilterBadge();
    render();
  }, state.status);
}

function stmtBeneSummary() {
  if (state.stmtAll) return t("allBeneficiaries", "All beneficiaries");
  if (state.stmtBenes.length === 0) return t("selectBeneficiaries", "Select beneficiaries");
  if (state.stmtBenes.length === 1) return state.stmtBenes[0];
  return `${state.stmtBenes.length} ${t("beneficiaries", "beneficiaries")}`;
}

function updateStmtBeneLabel() {
  if (stmtBeneLabel) stmtBeneLabel.textContent = stmtBeneSummary();
}

function closeStmtBeneMenu() {
  if (!stmtBeneMenu || !stmtBeneBtn) return;
  stmtBeneMenu.hidden = true;
  stmtBeneBtn.setAttribute("aria-expanded", "false");
}

function openStmtBeneMenu() {
  if (!stmtBeneMenu || !stmtBeneBtn) return;
  stmtBeneMenu.hidden = false;
  stmtBeneBtn.setAttribute("aria-expanded", "true");
}

function toggleStmtBeneMenu() {
  if (!stmtBeneMenu) return;
  if (stmtBeneMenu.hidden) openStmtBeneMenu();
  else closeStmtBeneMenu();
}

function renderStmtBenes() {
  if (!stmtBeneList) return;
  const names = uniqueBeneficiaries();
  if (state.stmtAll) state.stmtBenes = names.slice();
  const selected = new Set(state.stmtBenes);
  const allOn = state.stmtAll || (names.length > 0 && names.every((n) => selected.has(n)));

  const allLabel = t("allBeneficiaries", "All beneficiaries");
  const rows = [
    `<label class="tx-stmt__bene-opt${allOn ? " is-on" : ""}">
      <input type="checkbox" data-stmt-bene="__all__" ${allOn ? "checked" : ""} />
      <span class="tx-stmt__bene-box" aria-hidden="true"></span>
      <span class="tx-stmt__bene-name">${allLabel}</span>
    </label>`,
    ...names.map(
      (n) => `<label class="tx-stmt__bene-opt${selected.has(n) ? " is-on" : ""}">
      <input type="checkbox" data-stmt-bene="${n.replace(/"/g, "&quot;")}" ${selected.has(n) ? "checked" : ""} />
      <span class="tx-stmt__bene-box" aria-hidden="true"></span>
      <span class="tx-stmt__bene-name">${n}</span>
    </label>`
    ),
  ];
  stmtBeneList.innerHTML = rows.join("");
  updateStmtBeneLabel();
}

function onStmtBeneChange(value, checked) {
  const names = uniqueBeneficiaries();
  if (value === "__all__") {
    state.stmtAll = checked;
    state.stmtBenes = checked ? names.slice() : [];
  } else {
    const set = new Set(state.stmtBenes);
    if (checked) set.add(value);
    else set.delete(value);
    state.stmtBenes = [...set];
    state.stmtAll = names.length > 0 && names.every((n) => set.has(n));
  }
  renderStmtBenes();
  updateStmtProceed();
}

function filteredList() {
  let rows = TX_DATA.slice();

  if (state.currency !== "all") {
    rows = rows.filter((r) => r.currency === state.currency);
  }

  const q = state.search.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) => r.name.toLowerCase().includes(q));
  }

  if (state.from) {
    rows = rows.filter((r) => r.date >= state.from);
  }
  if (state.to) {
    rows = rows.filter((r) => r.date <= state.to);
  }
  if (state.beneficiary !== "all") {
    rows = rows.filter((r) => r.name === state.beneficiary);
  }
  if (state.status !== "all") {
    rows = rows.filter((r) => r.status === state.status);
  }

  rows.sort((a, b) => {
    if (a.date === b.date) return a.name.localeCompare(b.name);
    return state.sort === "desc" ? (a.date < b.date ? 1 : -1) : a.date < b.date ? -1 : 1;
  });

  return rows;
}

function activeFilterCount() {
  let n = 0;
  if (state.from) n += 1;
  if (state.to) n += 1;
  if (state.beneficiary !== "all") n += 1;
  if (state.status !== "all") n += 1;
  return n;
}

function updateFilterBadge() {
  const n = activeFilterCount();
  if (!filterBadge) return;
  if (n > 0) {
    filterBadge.hidden = false;
    filterBadge.textContent = String(n);
  } else {
    filterBadge.hidden = true;
  }
}

function updateSummary(rows) {
  const total = rows.reduce((sum, r) => sum + Number(r.sendKwd || 0), 0);
  if (totalAmtEl) totalAmtEl.textContent = `KWD ${fmt(total, 3)}`;
  if (countBadgeEl) {
    const strong = countBadgeEl.querySelector("strong");
    if (strong) strong.textContent = String(rows.length);
  }
}

function formatListDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function cardHtml(tx, index) {
  const d = dict();
  const statusClass = ` tx-status--${tx.status || "pending"}`;
  const auth = tx.authNeeded
    ? `<div class="tx-auth">
        <div class="tx-auth__copy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><path d="M12 8v4l2.2 2.2" stroke-linecap="round"/></svg>
          <span>${d.kuwaitMobileIdAuth || "Kuwait Mobile ID authorization"}</span>
        </div>
        <button class="tx-verify" type="button" data-tx-verify="${tx.id}">${d.verify || "Verify"}</button>
      </div>`
    : "";
  const tone = avatarTone(index, tx);
  const place = [tx.bank, tx.branch].filter(Boolean).join(" ");
  const accountLine = tx.account
    ? (place ? `${tx.account} | ${place}` : tx.account)
    : place || "—";

  return `
  <article class="tx-card" data-tx-id="${tx.id}">
    <div class="tx-card__main">
      <div class="tx-card__avatar${tone.dark ? " is-dark" : " is-light"}" style="--avatar-bg:${tone.bg};--avatar-fg:${tone.fg}" aria-hidden="true">${initials(tx.name).slice(0, 1)}</div>
      <div class="tx-card__meta">
        <div class="tx-card__top">
          <p class="tx-card__name">${tx.name}</p>
          <span class="tx-status${statusClass}">${statusLabel(tx.status)}</span>
        </div>
        <div class="tx-card__body">
          <div class="tx-card__info">
            <p class="tx-card__place">${accountLine}</p>
            <p class="tx-card__date">${formatListDate(tx.date)}</p>
          </div>
          <div class="tx-card__amts">
            <p class="tx-card__send">KWD ${fmt(tx.sendKwd, 3)}</p>
            <p class="tx-card__recv">${tx.currency} ${Number(tx.recv).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        ${auth}
        <div class="tx-card__actions">
          <button class="tx-track" type="button" data-tx-track="${tx.id}">${d.track || "Track"} »</button>
        </div>
      </div>
    </div>
  </article>`;
}

function render() {
  if (state.tab === "orders") {
    if (listEl) listEl.hidden = true;
    if (ordersEl) ordersEl.hidden = false;
    updateSummary([]);
    return;
  }

  if (listEl) listEl.hidden = false;
  if (ordersEl) ordersEl.hidden = true;

  const rows = filteredList();
  updateSummary(rows);

  if (!listEl) return;

  if (!rows.length) {
    listEl.innerHTML = `<div class="tx-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M8.5 11h5" stroke-linecap="round"/></svg>
      <p>${t("txEmpty", "No transactions found.")}</p>
    </div>`;
    return;
  }

  const groups = new Map();
  rows.forEach((r) => {
    const key = monthKey(r.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });

  const keys = [...groups.keys()];
  let cardIndex = 0;
  listEl.innerHTML = keys
    .map((key) => {
      const items = groups.get(key);
      const monthTotal = items.reduce((s, r) => s + Number(r.sendKwd || 0), 0);
      return `
      <section class="tx-month" data-month="${key}">
        <div class="tx-month__head">
          <span class="tx-month__label">
            <img class="tx-month__icon" src="assets/images/calender2.svg" alt="" width="22" height="22" aria-hidden="true" />
            ${monthLabel(key)}
          </span>
          <span class="tx-month__total">↓ KWD ${fmt(monthTotal, 3)}</span>
        </div>
        ${items.map((tx) => cardHtml(tx, cardIndex++)).join("")}
      </section>`;
    })
    .join("");
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll(".tx-tab").forEach((btn) => {
    const on = btn.getAttribute("data-tx-tab") === tab;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  render();
}

function openStmt() {
  if (!stmtEl) return;
  state.stmtAll = true;
  state.stmtBenes = uniqueBeneficiaries().slice();
  renderStmtBenes();
  stmtEl.hidden = false;
  stmtEl.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => stmtEl.classList.add("is-open"));
  document.body.classList.add("tx-stmt-open");
  updateStmtProceed();
}

function closeStmt() {
  if (!stmtEl) return;
  closeStmtBeneMenu();
  stmtEl.classList.remove("is-open");
  document.body.classList.remove("tx-stmt-open");
  stmtEl.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    if (!stmtEl.classList.contains("is-open")) stmtEl.hidden = true;
  }, 420);
}

function periodLabel(period) {
  const map = {
    "30": t("last30Days", "Last 30 Days"),
    "60": t("last60Days", "Last 60 Days"),
    "90": t("last90Days", "Last 90 Days"),
    fy: t("financialYear", "Financial Year"),
    custom: t("custom", "Custom"),
  };
  return map[period] || "";
}

function updateStmtProceed() {
  const periodOk =
    !!state.stmtPeriod &&
    (state.stmtPeriod !== "custom" || (!!document.getElementById("txStmtFrom")?.value && !!document.getElementById("txStmtTo")?.value));
  const formatOk = !!state.stmtFormat;
  const beneOk = state.stmtAll || state.stmtBenes.length > 0;
  const ok = periodOk && formatOk && beneOk;

  if (stmtProceed) {
    stmtProceed.disabled = !ok;
    stmtProceed.textContent = t("proceed", "Proceed");
  }
}

document.querySelectorAll(".tx-tab").forEach((btn) => {
  btn.addEventListener("click", () => setTab(btn.getAttribute("data-tx-tab")));
});

if (searchEl) {
  searchEl.addEventListener("input", () => {
    state.search = searchEl.value;
    render();
  });
}

(function initTxSearchHint() {
  const field = searchEl?.closest(".tx-search");
  const hintRoot = document.getElementById("txSearchHint");
  const hintText = hintRoot?.querySelector(".tx-search-hint__text");
  const hintFixed = hintRoot?.querySelector(".tx-search-hint__fixed");
  if (!searchEl || !field || !hintText || !hintFixed) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gen = 0;
  let timer = 0;
  let settle = null;

  function phrases() {
    const d = dict();
    return [
      d.searchHintNameShort || "Beneficiary Name",
      d.searchHintCurrencyShort || "Currency",
      d.searchHintAccountShort || "Account Number",
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

if (sortBtn) {
  sortBtn.addEventListener("click", () => {
    state.sort = state.sort === "desc" ? "asc" : "desc";
    sortBtn.setAttribute("data-sort", state.sort);
    render();
  });
}

document.getElementById("txChips")?.addEventListener("click", (e) => {
  const chip = e.target.closest(".tx-chip");
  if (!chip) return;
  const ccy = chip.getAttribute("data-tx-ccy");
  state.currency = ccy;
  document.querySelectorAll(".tx-chip").forEach((c) => {
    const on = c === chip;
    c.classList.toggle("is-on", on);
    c.setAttribute("aria-selected", on ? "true" : "false");
  });
  render();
});

if (filterBtn && filterPanel) {
  filterBtn.addEventListener("click", () => {
    state.filterOpen = !state.filterOpen;
    filterPanel.hidden = !state.filterOpen;
    filterBtn.setAttribute("aria-expanded", state.filterOpen ? "true" : "false");
  });
}

if (fromEl) {
  fromEl.addEventListener("change", () => {
    state.from = fromEl.value;
    updateFilterBadge();
    render();
  });
}
if (toEl) {
  toEl.addEventListener("change", () => {
    state.to = toEl.value;
    updateFilterBadge();
    render();
  });
}

if (filterClear) {
  filterClear.addEventListener("click", () => {
    state.from = "";
    state.to = "";
    state.beneficiary = "all";
    state.status = "all";
    if (fromEl) fromEl.value = "";
    if (toEl) toEl.value = "";
    beneSelectApi?.setValue("all");
    statusSelectApi?.setValue("all");
    updateFilterBadge();
    render();
  });
}

document.getElementById("txStatementBtn")?.addEventListener("click", openStmt);
document.getElementById("txStmtClose")?.addEventListener("click", closeStmt);
document.getElementById("txStmtBackdrop")?.addEventListener("click", closeStmt);

stmtBeneBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleStmtBeneMenu();
});

stmtBeneList?.addEventListener("change", (e) => {
  const input = e.target.closest("input[data-stmt-bene]");
  if (!input) return;
  onStmtBeneChange(input.getAttribute("data-stmt-bene"), input.checked);
});

stmtBeneMenu?.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  if (!stmtBeneSelect?.contains(e.target)) closeStmtBeneMenu();
});

document.querySelectorAll("[data-stmt-period]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.stmtPeriod = btn.getAttribute("data-stmt-period");
    document.querySelectorAll("[data-stmt-period]").forEach((b) => b.classList.toggle("is-on", b === btn));
    if (stmtCustom) stmtCustom.hidden = state.stmtPeriod !== "custom";
    updateStmtProceed();
  });
});

document.querySelectorAll("[data-stmt-format]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.stmtFormat = btn.getAttribute("data-stmt-format");
    document.querySelectorAll("[data-stmt-format]").forEach((b) => b.classList.toggle("is-on", b === btn));
    updateStmtProceed();
  });
});

["txStmtFrom", "txStmtTo"].forEach((id) => {
  document.getElementById(id)?.addEventListener("change", updateStmtProceed);
});

const TX_PATH_KEY = "ame-pay-path";

function normalizeTxPath(path) {
  if (path === "sad" || path === "otp") return path;
  return "happy";
}

function readTxPath() {
  if (typeof getPayPath === "function") return normalizeTxPath(getPayPath());
  try {
    return normalizeTxPath(localStorage.getItem(TX_PATH_KEY));
  } catch {
    return "happy";
  }
}

if (stmtProceed) {
  stmtProceed.addEventListener("click", () => {
    if (stmtProceed.disabled) return;
    const beneDetail = state.stmtAll
      ? t("allBeneficiaries", "All beneficiaries")
      : state.stmtBenes.length === 1
        ? state.stmtBenes[0]
        : `${state.stmtBenes.length} ${t("beneficiaries", "beneficiaries")}`;
    const detail = `${beneDetail} · ${periodLabel(state.stmtPeriod)}`;

    const path = readTxPath();

    if (path === "sad") {
      showToast(
        {
          title: t("statementFailedTitle", "Statement unavailable"),
          desc: t("statementFailedDesc", "We could not generate your statement right now. Please try again."),
        },
        "error"
      );
      closeStmt();
      return;
    }

    if (path === "otp") {
      showToast(
        {
          title: t("payPathOtp", "OTP error"),
          desc: t("statementOtpDesc", "Verification failed. Please confirm your OTP and try again."),
        },
        "error"
      );
      closeStmt();
      return;
    }

    showToast(
      {
        title: t("downloadStatement", "Download Statement"),
        desc: `${t("statementReady", "Your statement is ready to download.")} (${detail} · ${String(state.stmtFormat || "").toUpperCase()})`,
      },
      "success"
    );
    closeStmt();
  });
}

listEl?.addEventListener("click", (e) => {
  const track = e.target.closest("[data-tx-track]");
  if (track) {
    showToast(t("track", "Track") + ": " + (dict().comingSoon || "This service will be available soon."), "info");
    return;
  }
  const verify = e.target.closest("[data-tx-verify]");
  if (verify) {
    showToast(t("verify", "Verify") + ": " + (dict().comingSoon || "Kuwait Mobile ID verification coming soon."), "info");
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest(".tx-select")) return;
  document.querySelectorAll(".tx-select__menu").forEach((m) => {
    m.hidden = true;
  });
  document.querySelectorAll(".tx-select__btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && stmtEl?.classList.contains("is-open")) closeStmt();
});

document.addEventListener("ame:lang", () => {
  buildFilterSelects();
  render();
  updateStmtProceed();
});

buildFilterSelects();
updateFilterBadge();
render();

