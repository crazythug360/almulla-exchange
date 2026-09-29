const dict = () => (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};
const SEND_BENEFICIARIES = window.SEND_BENEFICIARIES || [];

const CCY_COUNTRY = {
  BDT: "Bangladesh",
  INR: "India",
  PKR: "Pakistan",
  PHP: "Philippines",
  USD: "United States",
  AED: "UAE",
  SAR: "Saudi Arabia",
  EGP: "Egypt",
  KWD: "Kuwait",
};

const AVATAR_TONE = {
  bg: "var(--color-secondary)",
  fg: "var(--fc-inverse, #fff)",
  dark: true,
};

function avatarTone() {
  return AVATAR_TONE;
}

const EYE_ICON = `<img class="bene-eye__icon" src="assets/images/view2.svg" alt="" width="32" height="32" aria-hidden="true" />`;
const FAV_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.4c.35 0 .67.2.82.52l1.96 4.28 4.66.5c.78.08 1.1 1.04.51 1.56l-3.5 3.2.98 4.56c.16.76-.65 1.35-1.32.96L12 16.9l-4.11 2.08c-.67.39-1.48-.2-1.32-.96l.98-4.56-3.5-3.2c-.59-.52-.27-1.48.51-1.56l4.66-.5 1.96-4.28c.15-.32.47-.52.82-.52Z"/></svg>`;

const listEl = document.getElementById("beneList");
const searchEl = document.getElementById("beneListSearch");
const detailSheet = document.getElementById("beneDetailSheet");
let filterCcy = "all";
let filterStatus = "all";
let viewMode = "list";
let selectedId = null;
let detailId = null;
let detailOpener = null;
let detailHideTimer = 0;
let filterHideTimer = 0;
const favourites = new Set();
const inactive = new Set();
const disabled = new Set();

const filterSheet = document.getElementById("beneFilterSheet");
const filterBtn = document.getElementById("beneFilterBtn");

function initial(name) {
  const ch = String(name || "").trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

function countryLabel(b) {
  const country = b.country || CCY_COUNTRY[b.currency] || "";
  return country ? `${country} - ${b.currency}` : b.currency;
}

function bankLine(b) {
  const parts = [b.bank, b.account].filter(Boolean);
  return parts.join(" ");
}

function serviceLabel(b) {
  if (b.service) return b.service;
  if (!b.account) return dict().abChannelCash || "Cash Payout";
  return dict().abChannelBank || "Bank Account Transfer";
}

function relationLabel(b) {
  return b.relationship || dict().friend || "Friend";
}

function findBene(id) {
  return SEND_BENEFICIARIES.find((b) => b.id === id) || null;
}

function visibleList() {
  const q = (searchEl?.value || "").trim().toLowerCase();
  return SEND_BENEFICIARIES.filter((b) => {
    if (filterCcy !== "all" && b.currency !== filterCcy) return false;
    if (filterStatus === "active" && (inactive.has(b.id) || disabled.has(b.id))) return false;
    if (filterStatus === "favourite" && !favourites.has(b.id)) return false;
    if (filterStatus === "disabled" && !disabled.has(b.id)) return false;
    if (filterStatus === "inactive" && !inactive.has(b.id)) return false;
    if (!q) return true;
    const hay = `${b.name} ${b.account} ${b.bank} ${b.branch || ""} ${b.currency}`.toLowerCase();
    return hay.includes(q);
  });
}

function openBeneficiary(id) {
  selectedId = id;
  render();
  const href = `remittance.html?bene=${encodeURIComponent(id)}`;
  window.setTimeout(() => {
    if (typeof ameNavigate === "function") ameNavigate(href);
    else location.href = href;
  }, 120);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "—";
}

function paintDetail(b) {
  if (!b) return;
  const d = dict();
  setText("beneDetailName", b.name);
  setText("beneDetailBranch", b.branch || "—");
  setText("beneDetailRelation", relationLabel(b));
  setText("beneDetailBank", b.bank || "—");
  setText("beneDetailService", serviceLabel(b));

  const favBtn = document.getElementById("beneDetailFav");
  favBtn?.classList.toggle("is-on", favourites.has(b.id));

  const activeBtn = document.getElementById("beneDetailActive");
  const on = !inactive.has(b.id);
  activeBtn?.classList.toggle("is-on", on);
  activeBtn?.setAttribute("aria-checked", on ? "true" : "false");
  activeBtn?.setAttribute("aria-label", on ? (d.active || "Active") : (d.beneficiaryInactive || "Inactive"));
}

function openDetailSheet(id, opener) {
  const b = findBene(id);
  if (!b || !detailSheet) return;
  detailId = id;
  detailOpener = opener || document.activeElement;
  paintDetail(b);
  window.clearTimeout(detailHideTimer);
  detailSheet.hidden = false;
  detailSheet.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      detailSheet.classList.add("is-open");
      document.body.classList.add("bene-detail-open");
      document.getElementById("beneDetailSend")?.focus();
    });
  });
}

function closeDetailSheet() {
  if (!detailSheet || detailSheet.hidden) return;
  const panelEl = detailSheet.querySelector(".bene-detail-sheet__panel");
  detailSheet.classList.remove("is-open");
  document.body.classList.remove("bene-detail-open");
  detailSheet.setAttribute("aria-hidden", "true");
  let done = false;
  const hide = () => {
    if (done) return;
    done = true;
    detailSheet.hidden = true;
    panelEl?.removeEventListener("transitionend", onEnd);
    const opener = detailOpener;
    detailOpener = null;
    detailId = null;
    opener?.focus?.();
  };
  const onEnd = (e) => {
    if (e.target !== panelEl) return;
    hide();
  };
  panelEl?.addEventListener("transitionend", onEnd);
  window.clearTimeout(detailHideTimer);
  detailHideTimer = window.setTimeout(hide, 420);
}

function render() {
  if (!listEl) return;
  const d = dict();
  const items = visibleList();
  listEl.classList.toggle("is-list", viewMode === "list");
  listEl.classList.toggle("is-grid", viewMode === "grid");

  if (!items.length) {
    listEl.innerHTML = `<li><p class="bene-empty">${d.noBeneMatch || "No beneficiaries found"}</p></li>`;
    return;
  }

  listEl.innerHTML = items
    .map((b, index) => {
      const selected = selectedId === b.id ? " is-selected" : "";
      const isFav = favourites.has(b.id);
      const tone = avatarTone(index);
      const favMark = isFav
        ? `<span class="bene-fav" title="${d.favourite || "Favourite"}" aria-label="${d.favourite || "Favourite"}">${FAV_ICON}</span>`
        : "";
      return `
    <li>
      <div class="bene-row${selected}${isFav ? " is-favourite" : ""}" data-bene-id="${b.id}">
        <button class="bene-row__main" type="button" data-bene-open="${b.id}">
          <span class="bene-avatar-wrap">
            <span class="bene-avatar${tone.dark ? " is-dark" : " is-light"}" style="--avatar-bg:${tone.bg};--avatar-fg:${tone.fg}" aria-hidden="true">${initial(b.name)}</span>
            ${favMark}
          </span>
          <span class="bene-copy">
            <span class="bene-name">${b.name}</span>
            <span class="bene-bank">${bankLine(b)}</span>
            <span class="bene-meta">
              <span>${countryLabel(b)}</span>
            </span>
          </span>
        </button>
        <span class="bene-actions">
          <button class="bene-eye" type="button" data-bene-eye="${b.id}" data-i18n-aria="viewDetails" aria-label="${d.viewDetails || "View details"}">${EYE_ICON}</button>
        </span>
      </div>
    </li>`;
    })
    .join("");

  listEl.querySelectorAll("[data-bene-open]").forEach((btn) => {
    btn.addEventListener("click", () => openBeneficiary(btn.getAttribute("data-bene-open")));
  });

  listEl.querySelectorAll("[data-bene-eye]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDetailSheet(btn.getAttribute("data-bene-eye"), btn);
    });
  });
}

function setFilter(ccy) {
  filterCcy = ccy || "all";
  document.querySelectorAll("[data-bene-ccy]").forEach((chip) => {
    const on = chip.getAttribute("data-bene-ccy") === filterCcy;
    chip.classList.toggle("is-on", on);
    chip.setAttribute("aria-selected", on ? "true" : "false");
  });
  render();
}

function paintStatusOptions() {
  document.querySelectorAll("[data-bene-status]").forEach((btn) => {
    const on = btn.getAttribute("data-bene-status") === filterStatus;
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
}

function setStatusFilter(status) {
  filterStatus = status || "all";
  paintStatusOptions();
  render();
  closeFilterSheet();
}

function openFilterSheet() {
  if (!filterSheet) return;
  window.clearTimeout(filterHideTimer);
  paintStatusOptions();
  filterSheet.hidden = false;
  filterSheet.setAttribute("aria-hidden", "false");
  filterBtn?.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      filterSheet.classList.add("is-open");
      filterSheet.querySelector(".bene-filter-opt[aria-selected='true']")?.focus();
    });
  });
}

function closeFilterSheet() {
  if (!filterSheet || filterSheet.hidden) return;
  filterSheet.classList.remove("is-open");
  filterSheet.setAttribute("aria-hidden", "true");
  filterBtn?.setAttribute("aria-expanded", "false");
  window.clearTimeout(filterHideTimer);
  filterHideTimer = window.setTimeout(() => {
    filterSheet.hidden = true;
    filterBtn?.focus?.();
  }, 220);
}

function setView(mode) {
  viewMode = mode === "grid" ? "grid" : "list";
  document.querySelectorAll(".bene-view[data-bene-view]").forEach((btn) => {
    const on = btn.getAttribute("data-bene-view") === viewMode;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  render();
}

searchEl?.addEventListener("input", render);

document.querySelectorAll("[data-bene-ccy]").forEach((chip) => {
  chip.addEventListener("click", () => setFilter(chip.getAttribute("data-bene-ccy")));
});

document.querySelectorAll(".bene-view[data-bene-view]").forEach((btn) => {
  btn.addEventListener("click", () => setView(btn.getAttribute("data-bene-view")));
});

document.querySelectorAll("[data-soon]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof toast === "function") toast(dict().comingSoon || "This service will be available soon.", "info");
  });
});

filterBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (filterSheet?.classList.contains("is-open")) closeFilterSheet();
  else openFilterSheet();
});

document.querySelectorAll("[data-bene-status]").forEach((btn) => {
  btn.addEventListener("click", () => setStatusFilter(btn.getAttribute("data-bene-status")));
});

document.addEventListener("click", (e) => {
  if (!filterSheet?.classList.contains("is-open")) return;
  const wrap = filterBtn?.closest(".bene-filter-wrap");
  if (wrap && wrap.contains(e.target)) return;
  closeFilterSheet();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (filterSheet?.classList.contains("is-open")) {
    e.preventDefault();
    closeFilterSheet();
  }
});

document.getElementById("dashLogoutBtn")?.addEventListener("click", () => {
  if (typeof closeMenu === "function") closeMenu();
  if (typeof ameClearSession === "function") ameClearSession();
  if (typeof ameNavigate === "function") ameNavigate("index.html");
});

document.getElementById("beneAddBtn")?.addEventListener("click", () => {
  if (typeof ameNavigate === "function") ameNavigate("add-beneficiary.html");
  else location.href = "add-beneficiary.html";
});

document.querySelectorAll("[data-bene-detail-close]").forEach((el) => {
  el.addEventListener("click", () => closeDetailSheet());
});

document.getElementById("beneDetailFav")?.addEventListener("click", () => {
  if (!detailId) return;
  const d = dict();
  if (favourites.has(detailId)) {
    favourites.delete(detailId);
    if (typeof toast === "function") toast(d.unfavourited || "Removed from favourites", "info");
  } else {
    favourites.add(detailId);
    if (typeof toast === "function") toast(d.favourited || "Added to favourites", "success");
  }
  const b = findBene(detailId);
  if (b) paintDetail(b);
  render();
});

document.getElementById("beneDetailSend")?.addEventListener("click", () => {
  if (!detailId) return;
  const id = detailId;
  closeDetailSheet();
  openBeneficiary(id);
});

document.getElementById("beneDetailActive")?.addEventListener("click", () => {
  if (!detailId) return;
  const d = dict();
  if (inactive.has(detailId)) {
    inactive.delete(detailId);
    if (typeof toast === "function") toast(d.beneficiaryActive || "Beneficiary is active", "success");
  } else {
    inactive.add(detailId);
    if (typeof toast === "function") toast(d.beneficiaryInactive || "Beneficiary is inactive", "info");
  }
  const b = findBene(detailId);
  if (b) paintDetail(b);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDetailSheet();
});

(function initBeneSearchHint() {
  const field = searchEl?.closest(".bene-search");
  const hintRoot = document.getElementById("beneSearchHint");
  const hintText = hintRoot?.querySelector(".bene-search-hint__text");
  const hintFixed = hintRoot?.querySelector(".bene-search-hint__fixed");
  if (!searchEl || !field || !hintText || !hintFixed) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gen = 0;
  let timer = 0;
  let settle = null;

  function phrases() {
    const d = dict();
    return [
      d.searchHintNameShort || "Beneficiary Name",
      d.searchHintBankShort || "Bank Name",
      d.searchHintAccountShort || "Account Number",
      d.searchHintCurrencyShort || "Currency",
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

render();
