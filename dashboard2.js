(function () {
  function dict() {
    return (window.copy && window.copy[lang]) || {};
  }

  function formatAmt(value) {
    return Number(value || 0).toFixed(3);
  }

  function updateCard(card) {
    const rate = Number(card.dataset.rate);
    const recv = card.dataset.recv || "BDT";
    const input = card.querySelector(".amount-input");
    const sendCcy = card.querySelector(".ccy-toggle .is-active")?.dataset.ccy || "KWD";
    const amount = Number(input?.value) || 0;
    const sendAmt = card.querySelector(".send-amt");
    const recvAmt = card.querySelector(".recv-amt");
    if (!sendAmt || !recvAmt) return;
    if (sendCcy === "KWD") {
      sendAmt.textContent = formatAmt(amount);
      recvAmt.textContent = formatAmt(amount * rate);
      if (sendAmt.nextElementSibling) sendAmt.nextElementSibling.textContent = "KWD";
      if (recvAmt.nextElementSibling) recvAmt.nextElementSibling.textContent = recv;
    } else {
      sendAmt.textContent = formatAmt(amount);
      recvAmt.textContent = formatAmt(rate ? amount / rate : 0);
      if (sendAmt.nextElementSibling) sendAmt.nextElementSibling.textContent = recv;
      if (recvAmt.nextElementSibling) recvAmt.nextElementSibling.textContent = "KWD";
    }
  }

  document.querySelectorAll(".bene-card").forEach((card) => {
    const input = card.querySelector(".amount-input");
    input?.addEventListener("input", () => updateCard(card));
    card.querySelectorAll(".ccy-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".ccy-toggle button").forEach((el) => el.classList.remove("is-active"));
        btn.classList.add("is-active");
        updateCard(card);
      });
    });
  });

  const liveRates = document.querySelectorAll(".rate-marquee-group:first-child .rate-value[data-base]");
  function tickLiveRate() {
    if (!liveRates.length) return;
    const el = liveRates[Math.floor(Math.random() * liveRates.length)];
    const code = el.closest(".rate-card")?.dataset.code;
    const next = Math.max(0.01, Number(el.dataset.base) + (Math.random() - 0.48) * 0.14);
    const formatted = next.toFixed(2);
    document.querySelectorAll(".rate-value[data-base]").forEach((node) => {
      const nodeCode = node.closest(".rate-card")?.dataset.code;
      if (nodeCode !== code) return;
      node.dataset.base = formatted;
      node.textContent = formatted;
      node.classList.remove("is-tick");
      void node.offsetWidth;
      node.classList.add("is-tick");
    });
  }

  if (liveRates.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(tickLiveRate, 2200);
  }

  const beneficiaries = [
    { id: "faruque", name: "Md Faruque Habibur Rahman Msa", short: "Faruque", country: "Bangladesh", account: "20504090200155113", mobile: "+8801712345678", bank: "Islami Bank Bangladesh Limited, Comilla Cantonment", currency: "BDT", recv: "BDT", rate: 397.5, fee: 1, initials: "MF" },
    { id: "salma", name: "Salma Akter", short: "Salma", country: "Bangladesh", account: "20507770236314512", mobile: "+8801811223344", bank: "Islami Bank Bangladesh Limited, Agent Banking Dhaka", currency: "BDT", recv: "BDT", rate: 380.23, fee: 1, initials: "SA" },
    { id: "rajesh", name: "Rajesh Kumar", short: "Rajesh", country: "India", account: "3019288377462210", mobile: "+919876543210", bank: "HDFC Bank, Andheri West, Mumbai", currency: "INR", recv: "INR", rate: 272.65, fee: 1, initials: "RK" },
    { id: "ahmed", name: "Ahmed Hassan", short: "Ahmed", country: "Pakistan", account: "PK92HABB0000123456789012", mobile: "+923001234567", bank: "Habib Bank Limited, Karachi", currency: "PKR", recv: "PKR", rate: 907.2, fee: 1, initials: "AH" },
    { id: "maria", name: "Maria Santos", short: "Maria", country: "Philippines", account: "PH1234567890123456", mobile: "+639171234567", bank: "BDO Unibank, Manila", currency: "PHP", recv: "PHP", rate: 189.4, fee: 1, initials: "MS" },
    { id: "priya", name: "Priya Sharma", short: "Priya", country: "India", account: "5012345678901234", mobile: "+919812345678", bank: "ICICI Bank, Connaught Place, New Delhi", currency: "INR", recv: "INR", rate: 271.9, fee: 1, initials: "PS" },
  ];

  const beneSearch = document.getElementById("beneSearch");
  const beneSuggest = document.getElementById("beneSuggest");
  const beneRemitCard = document.getElementById("beneRemitCard");
  const remitClose = document.getElementById("remitClose");
  const remitProceed = document.getElementById("remitProceed");
  const remitAmount = document.getElementById("remitAmount");
  const remitSuccess = document.getElementById("remitSuccess");
  let selectedBene = null;

  function initials(name) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  }

  function renderSuggest(items, showAll = false) {
    if (!beneSuggest) return;
    if (!items.length) {
      beneSuggest.innerHTML = `<li><div class="bene-suggest-empty">${dict().noBeneMatch || "No beneficiaries found"}</div></li>`;
      beneSuggest.hidden = false;
      return;
    }
    const header = showAll
      ? `<li class="bene-suggest-head"><span>${dict().sendAgain || "People you send to"}</span><span>${items.length}</span></li>`
      : `<li class="bene-suggest-head"><span>${dict().searchResults || "Search results"}</span><span>${items.length}</span></li>`;
    beneSuggest.innerHTML = header + items.map((b) => `
      <li>
        <button type="button" data-id="${b.id}">
          <span class="bene-suggest-avatar">${b.initials || initials(b.name)}</span>
          <span class="bene-suggest-copy">
            <strong>${b.short || b.name}</strong>
            <span class="bene-suggest-bank">${b.country || b.bank}</span>
          </span>
          <em>${dict().sendBtn || "Send"}</em>
        </button>
      </li>
    `).join("");
    beneSuggest.hidden = false;
    beneSuggest.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => selectBeneficiary(beneficiaries.find((x) => x.id === btn.dataset.id)));
    });
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function filterBeneficiaries(q) {
    const query = q.trim().toLowerCase();
    if (!query) return beneficiaries;
    const qDigits = digitsOnly(query);
    return beneficiaries.filter((b) =>
      b.name.toLowerCase().includes(query) ||
      (b.short || "").toLowerCase().includes(query) ||
      (b.country || "").toLowerCase().includes(query) ||
      b.account.toLowerCase().includes(query) ||
      (b.mobile || "").toLowerCase().includes(query) ||
      (qDigits && digitsOnly(b.account).includes(qDigits)) ||
      (qDigits && digitsOnly(b.mobile).includes(qDigits)) ||
      b.bank.toLowerCase().includes(query)
    );
  }

  function showBeneficiaryList() {
    const q = beneSearch?.value || "";
    const query = q.trim().toLowerCase();
    if (!query) {
      renderSuggest(beneficiaries, true);
      return;
    }
    renderSuggest(filterBeneficiaries(q), false);
  }

  function updateRemitPreview() {
    if (!selectedBene || !remitAmount) return;
    const sendCcy = document.querySelector("#remitCcyToggle .is-active")?.dataset.ccy || "KWD";
    const amount = Number(remitAmount.value) || 0;
    const rate = selectedBene.rate;
    const recv = selectedBene.recv;
    const rateLine = document.getElementById("remitRateLine");
    const totalLine = document.getElementById("remitTotalLine");
    let recvAmt = amount * rate;
    if (sendCcy !== "KWD") {
      recvAmt = rate ? amount / rate : 0;
    }
    if (rateLine) {
      rateLine.textContent = sendCcy === "KWD"
        ? `They get ${recvAmt.toFixed(2)} ${recv}`
        : `${amount.toFixed(2)} ${recv} ≈ ${recvAmt.toFixed(3)} KWD`;
    }
    if (totalLine) {
      totalLine.textContent = `Fee ${selectedBene.fee.toFixed(3)} KWD · 1 KWD = ${rate.toFixed(2)} ${recv}`;
    }
  }

  function selectBeneficiary(bene) {
    if (!bene || !beneRemitCard) return;
    selectedBene = bene;
    if (beneSearch) beneSearch.value = bene.short || bene.name;
    if (beneSuggest) beneSuggest.hidden = true;
    remitSuccess?.classList.add("is-hidden");
    const nameEl = document.getElementById("remitName");
    const accEl = document.getElementById("remitAcc");
    const bankEl = document.getElementById("remitBank");
    if (nameEl) nameEl.textContent = bene.short || bene.name;
    if (accEl) accEl.textContent = bene.country || "";
    if (bankEl) bankEl.textContent = bene.bank;
    const recvBtn = document.querySelector('#remitCcyToggle button[data-ccy="RECV"]');
    if (recvBtn) recvBtn.textContent = bene.recv;
    if (remitAmount) remitAmount.value = 25;
    beneRemitCard.classList.remove("is-hidden");
    beneRemitCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    updateRemitPreview();
  }

  if (beneSearch) {
    beneSearch.addEventListener("input", showBeneficiaryList);
    beneSearch.addEventListener("click", showBeneficiaryList);
    beneSearch.addEventListener("focus", showBeneficiaryList);
  }

  (function initSearchHint() {
    const field = beneSearch?.closest(".bene-search-field");
    const hintText = document.querySelector("#beneSearchHint .bene-search-hint__text");
    if (!beneSearch || !field || !hintText) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let gen = 0;
    let timer = 0;
    let settle = null;

    function phrases() {
      const d = dict();
      return [
        d.searchHintName || "Search by beneficiary name",
        d.searchHintAccount || "Search by account number",
        d.searchHintMobile || "Search by mobile number",
      ];
    }

    function syncFilled() {
      field.classList.toggle("is-filled", Boolean(beneSearch.value));
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
      hintText.textContent = "";
      play(gen);
    }

    syncFilled();
    beneSearch.addEventListener("input", syncFilled);
    document.addEventListener("ame:lang", start);
    start();
  })();

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".bene-search-wrap")) {
      if (beneSuggest) beneSuggest.hidden = true;
    }
  });

  remitClose?.addEventListener("click", () => {
    beneRemitCard?.classList.add("is-hidden");
    selectedBene = null;
    if (beneSearch) beneSearch.value = "";
    remitSuccess?.classList.add("is-hidden");
  });

  remitAmount?.addEventListener("input", updateRemitPreview);

  document.querySelectorAll("#remitCcyToggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#remitCcyToggle button").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
      updateRemitPreview();
    });
  });

  remitProceed?.addEventListener("click", () => {
    if (!selectedBene) return;
    const amount = Number(remitAmount.value) || 0;
    if (amount <= 0) {
      remitAmount.focus();
      return;
    }
    if (remitSuccess) {
      remitSuccess.textContent = (dict().remitOk || "Remittance of {amount} KWD to {name} submitted successfully.")
        .replace("{amount}", amount.toFixed(3))
        .replace("{name}", selectedBene.short || selectedBene.name);
      remitSuccess.classList.remove("is-hidden");
    }
  });

  document.getElementById("dashNotifyBtn")?.addEventListener("click", () => {
    setNotifyOpen(!notifyDrawer?.classList.contains("is-open"));
  });

  const notifyDrawer = document.getElementById("notifyDrawer");
  const notifyBackdrop = document.getElementById("notifyBackdrop");
  const notifyBtn = document.getElementById("dashNotifyBtn");

  function setNotifyOpen(open) {
    notifyDrawer?.classList.toggle("is-open", open);
    notifyBackdrop?.classList.toggle("is-open", open);
    notifyDrawer?.setAttribute("aria-hidden", open ? "false" : "true");
    notifyBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) document.getElementById("notifyClose")?.focus();
    else notifyBtn?.focus();
  }

  notifyBackdrop?.addEventListener("click", () => setNotifyOpen(false));
  document.getElementById("notifyClose")?.addEventListener("click", () => setNotifyOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && notifyDrawer?.classList.contains("is-open")) {
      setNotifyOpen(false);
    }
  });

  document.getElementById("dashLogoutBtn")?.addEventListener("click", () => {
    if (typeof closeMenu === "function") closeMenu();
    if (typeof ameClearSession === "function") ameClearSession();
    if (typeof ameNavigate === "function") ameNavigate("index.html");
  });

  document.querySelectorAll("[data-send-again]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.sendAgain;
      if (!id) return;
      if (typeof ameNavigate === "function") ameNavigate("send.html?bene=" + encodeURIComponent(id));
    });
  });

  document.querySelectorAll("[data-soon]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof toast === "function") toast(dict().comingSoon || "This service will be available soon.", "info");
    });
  });

  document.querySelectorAll(".proceed-btn").forEach((btn) => {
    if (btn.id === "remitProceed") return;
    btn.addEventListener("click", () => {
      if (typeof toast === "function") toast(dict().comingSoon || "This service will be available soon.", "info");
    });
  });

  (function initHeroCarousel() {
    const root = document.querySelector(".home-hero");
    const slides = [...document.querySelectorAll(".home-hero__slide")];
    const dots = [...document.querySelectorAll(".home-hero__dot")];
    if (!root || slides.length < 2) return;

    let index = Math.max(0, slides.findIndex((el) => el.classList.contains("is-active")));
    let timer = 0;

    function paint(n) {
      slides.forEach((el, i) => {
        el.style.removeProperty("opacity");
        el.style.removeProperty("transform");
        el.style.removeProperty("z-index");
        el.classList.toggle("is-active", i === n);
      });
      dots.forEach((dot, i) => {
        const on = i === n;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    function show(next) {
      const n = (next + slides.length) % slides.length;
      if (n === index) return;
      paint(n);
      index = n;
    }

    function play() {
      clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        show(Number(dot.dataset.heroSlide));
        play();
      });
    });

    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", play);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(timer);
      else play();
    });
    paint(index);
    play();
  })();
})();
