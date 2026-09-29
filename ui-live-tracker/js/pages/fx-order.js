/**
 * Order Foreign Currency — web FX order form → cart FX tab
 */
(function () {
  const KEY = "ameFxCart";
  const DELIVERY = 2;

  const currencies = [
    { code: "EGP", name: "Egyptian Pound", flag: "eg", toKwd: 0.0075, fromKwd: 133.33, country: "Egypt" },
    { code: "INR", name: "Indian Rupee", flag: "in", toKwd: 0.003375, fromKwd: 296.3, country: "India" },
    { code: "USD", name: "US Dollar", flag: "us", toKwd: 0.307, fromKwd: 3.257, country: "United States" },
    { code: "EUR", name: "Euro", flag: "eu", toKwd: 0.332, fromKwd: 3.012, country: "France" },
    { code: "GBP", name: "British Pound", flag: "gb", toKwd: 0.392, fromKwd: 2.548, country: "United Kingdom" },
  ];

  const sources = ["Bonus", "Salary", "Business", "Savings", "Other"];
  const purposes = ["Business Travel", "Holiday", "Medical", "Education", "Other"];
  const countries = [
    { name: "Egypt", flag: "eg" },
    { name: "India", flag: "in" },
    { name: "United States", flag: "us" },
    { name: "United Kingdom", flag: "gb" },
    { name: "France", flag: "eu" },
  ];

  let ccy = currencies[0];

  const $ = (s) => document.querySelector(s);
  const toast = (m, k) => {
    if (typeof window.toast === "function") window.toast(m, k || "info");
  };

  function parseAmount(raw) {
    const n = Number(String(raw || "").replace(/,/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function fmt(n, digits) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function syncTotals() {
    const amt = parseAmount($("#fxAmount")?.value);
    const pay = amt * ccy.toKwd;
    $("#fxPairA").textContent = `${ccy.code} - KWD`;
    $("#fxPairB").textContent = `KWD - ${ccy.code}`;
    $("#fxRateA").textContent = String(ccy.toKwd);
    $("#fxRateB").textContent = String(ccy.fromKwd);
    $("#fxYouPay").textContent = `${fmt(pay, 3)} KWD`;
    $("#fxReceive").textContent = `${fmt(amt, 2)} ${ccy.code}`;
    $("#fxAmountCcy").textContent = ccy.code;
  }

  function fillMenu(menu, items, onPick) {
    if (!menu) return;
    menu.innerHTML = items
      .map((item, i) => {
        if (typeof item === "string") {
          return `<li><button type="button" role="option" data-i="${i}">${item}</button></li>`;
        }
        const flag = item.flag
          ? `<img class="field__flag" src="https://flagcdn.com/w40/${item.flag}.png" width="22" height="16" alt="" />`
          : "";
        const label = item.label || item.name || item.code;
        return `<li><button type="button" role="option" data-i="${i}">${flag}<span>${label}</span></button></li>`;
      })
      .join("");
    menu.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        onPick(items[Number(btn.dataset.i)]);
        menu.hidden = true;
        btn.closest(".field")?.querySelector(".field__control")?.setAttribute("aria-expanded", "false");
      });
    });
  }

  function bindSelect(btnId, menuId, items, onPick) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return;
    fillMenu(menu, items, onPick);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      document.querySelectorAll(".country-menu").forEach((m) => {
        m.hidden = true;
      });
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("click", () => {
    document.querySelectorAll(".country-menu").forEach((m) => {
      m.hidden = true;
    });
  });

  bindSelect("fxCcyBtn", "fxCcyMenu", currencies.map((c) => ({
    ...c,
    label: `${c.code} - ${c.name}`,
  })), (item) => {
    ccy = currencies.find((c) => c.code === item.code) || ccy;
    $("#fxCcyFlag").src = `https://flagcdn.com/w40/${ccy.flag}.png`;
    $("#fxCcyLabel").textContent = `${ccy.code} - ${ccy.name}`;
    const match = countries.find((x) => x.name === ccy.country);
    if (match) {
      $("#fxCountryFlag").src = `https://flagcdn.com/w40/${match.flag}.png`;
      $("#fxCountryValue").textContent = match.name;
    }
    syncTotals();
  });

  bindSelect("fxSourceBtn", "fxSourceMenu", sources, (v) => {
    $("#fxSourceValue").textContent = v;
  });

  bindSelect("fxPurposeBtn", "fxPurposeMenu", purposes, (v) => {
    $("#fxPurposeValue").textContent = v;
  });

  bindSelect("fxCountryBtn", "fxCountryMenu", countries, (v) => {
    $("#fxCountryFlag").src = `https://flagcdn.com/w40/${v.flag}.png`;
    $("#fxCountryValue").textContent = v.name;
  });

  $("#fxAmount")?.addEventListener("input", syncTotals);

  $("#fxForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseAmount($("#fxAmount")?.value);
    if (!amount) {
      toast("Enter a valid amount.", "error");
      return;
    }
    const sell = amount * ccy.toKwd;
    const denom = document.querySelector('input[name="denom"]:checked')?.value || "high";
    const order = {
      id: String(5661411 + Math.floor(Math.random() * 90)),
      code: ccy.code,
      name: ccy.name,
      flag: ccy.flag,
      amount,
      sell,
      delivery: DELIVERY,
      total: sell + DELIVERY,
      toKwd: ccy.toKwd,
      fromKwd: ccy.fromKwd,
      denom: denom === "high" ? "High Value Notes" : "Mixed Notes",
      source: $("#fxSourceValue")?.textContent || "Bonus",
      purpose: $("#fxPurposeValue")?.textContent || "Business Travel",
      country: $("#fxCountryValue")?.textContent || ccy.country,
      from: $("#fxFromDate")?.value || "",
      to: $("#fxToDate")?.value || "",
      deliverySlot: "17/09/2026 | 12:00-14:00",
    };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(order));
    } catch {
      /* ignore */
    }
    if (typeof ameNavigate === "function") ameNavigate("cart.html?tab=fx");
    else location.href = "cart.html?tab=fx";
  });

  syncTotals();
})();
