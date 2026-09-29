/**
 * Master top header
 * HTML: partials/topnav.html
 * CSS:  css/topnav.css (imported from css/style.css)
 * Keep FALLBACK_HTML in sync with the partial.
 * Mounts into #ameTopnav before app.js so menu/settings bindings work.
 */
(function () {
  const FALLBACK_HTML = `<header class="topnav" data-ame-topnav-root>
  <div class="topnav__bar">
    <div class="page-lead">
      <a class="menu-btn" id="menuBtn" href="dashboard.html" data-i18n-aria="home" aria-label="Home">
        <img class="menu-btn__mark" src="assets/images/brand/ame-mark.svg" width="40" height="40" alt="" aria-hidden="true" />
      </a>
      <p class="welcome">
        <span class="welcome__copy">
          <span class="welcome__hello">
            <span class="welcome__label" data-i18n="welcome">Hello</span>
            <span class="welcome__name" data-user-first hidden></span>
          </span>
          <small class="welcome__last" data-last-visit hidden></small>
        </span>
      </p>
    </div>
    <div class="page-actions">
      <a class="pill header-home" id="headerHomeAction" href="dashboard.html" data-i18n-aria="home" aria-label="Home">
        <img class="pill__icon pill__icon--home" src="assets/images/home.svg?v=2" width="20" height="20" alt="" aria-hidden="true" />
      </a>
      <a class="pill send-cart" id="sendCartBtn" href="cart.html" data-i18n-aria="cart" aria-label="Cart">
        <img class="pill__icon pill__icon--cart" src="assets/images/shoppingCart2.svg" width="19" height="20" alt="" aria-hidden="true" />
        <span class="send-cart__badge" id="sendCartBadge" hidden>0</span>
      </a>
      <button class="pill header-notify" id="headerNotifyBtn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="notifyDrawer" data-i18n-aria="notifications" aria-label="Notifications">
        <video class="pill__icon pill__icon--notify" src="assets/images/notification.webm" width="30" height="30" muted loop autoplay playsinline preload="auto" aria-hidden="true"></video>
        <span class="header-notify__badge" id="headerNotifyBadge">3</span>
      </button>
      <button class="pill header-settings" id="settingsBtn" type="button" data-i18n-aria="settings" aria-label="Settings" aria-haspopup="dialog" aria-controls="drawer" aria-expanded="false">
        <img class="pill__icon pill__icon--settings" src="assets/images/setting.svg" width="20" height="20" alt="" aria-hidden="true" />
      </button>
      <button class="pill header-logout" id="headerLogoutBtn" type="button" data-i18n-aria="logout" aria-label="Logout">
        <img class="pill__icon pill__icon--logout" src="assets/images/top-logout.svg?v=2" width="20" height="20" alt="" aria-hidden="true" />
      </button>
    </div>
  </div>
</header>`;

  function currentPageName() {
    return (location.pathname.split("/").pop() || "").toLowerCase() || "index.html";
  }

  function isPreLoginPage() {
    return Boolean(document.getElementById("loginForm"));
  }

  function adaptPreLogin(root) {
    if (!isPreLoginPage() || !root) return;

    root.classList.add("topnav--prelogin");

    const mark = root.querySelector(".menu-btn__mark");
    if (mark) {
      mark.src = "assets/images/brand/logo-almulla-exchange.svg";
      mark.alt = "Al Mulla Exchange";
      mark.removeAttribute("aria-hidden");
      mark.classList.add("menu-btn__logo");
      mark.removeAttribute("width");
      mark.removeAttribute("height");
    }

    const menuBtn = root.querySelector("#menuBtn");
    if (menuBtn) {
      menuBtn.classList.add("menu-btn--logo");
      menuBtn.setAttribute("aria-label", "Al Mulla Exchange");
      menuBtn.removeAttribute("aria-expanded");
      menuBtn.removeAttribute("aria-controls");
      menuBtn.removeAttribute("href");
      menuBtn.removeAttribute("data-i18n-aria");
      menuBtn.setAttribute("role", "img");
      menuBtn.tabIndex = -1;
      menuBtn.addEventListener("click", (e) => e.preventDefault());
    }

    const welcome = root.querySelector(".welcome");
    if (welcome) welcome.hidden = true;

    root.querySelectorAll(".welcome__label, [data-last-visit], [data-user-first]").forEach((el) => {
      el.hidden = true;
    });

    ["#headerHomeAction", "#sendCartBtn", "#headerNotifyBtn", "#headerLogoutBtn"].forEach((sel) => {
      const el = root.querySelector(sel);
      if (el) el.hidden = true;
    });
  }

  function topnavSrc() {
    return "partials/topnav.html?v=43";
  }

  function loadMasterHtml() {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", topnavSrc(), false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText.trim()) {
        return xhr.responseText.trim();
      }
    } catch {
      /* file:// or offline — use fallback */
    }
    return FALLBACK_HTML.trim();
  }

  function markCurrent(root) {
    const page = currentPageName();
    const cart = root.querySelector("#sendCartBtn");
    if (cart && page === "cart.html") {
      cart.classList.add("is-current");
      cart.setAttribute("aria-current", "page");
    }
    const home = root.querySelector("#headerHomeAction");
    if (home && (page === "dashboard.html" || page === "dashboard2.html")) {
      home.classList.add("is-current");
      home.setAttribute("aria-current", "page");
    }
  }

  function bindCartNav(root) {
    const cart = root?.querySelector("#sendCartBtn");
    if (!cart || cart.dataset.topnavCartBound) return;
    cart.dataset.topnavCartBound = "1";
    if (cart.tagName === "A") cart.setAttribute("href", "cart.html");
    cart.addEventListener("click", (e) => {
      if (currentPageName() === "cart.html") {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      if (typeof window.ameNavigate === "function") window.ameNavigate("cart.html");
      else window.location.href = "cart.html";
    });
  }

  function bindLogout(root) {
    const btn = root?.querySelector("#headerLogoutBtn");
    if (!btn || btn.dataset.topnavLogoutBound) return;
    btn.dataset.topnavLogoutBound = "1";
    btn.addEventListener("click", () => {
      if (typeof window.closeMenu === "function") window.closeMenu();
      if (typeof window.ameClearSession === "function") window.ameClearSession();
      else {
        try {
          sessionStorage.removeItem("ameSession");
        } catch (_) {}
      }
      if (typeof window.ameNavigate === "function") window.ameNavigate("index.html");
      else window.location.href = "index.html";
    });
  }

  function playNotifyVideo(root) {
    root?.querySelectorAll("video.pill__icon--notify").forEach((video) => {
      video.muted = true;
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    });
  }

  function mountAmeTopnav() {
    const host = document.getElementById("ameTopnav");
    if (!host) return null;
    if (document.querySelector("[data-ame-topnav-root]")) return document.querySelector("[data-ame-topnav-root]");

    const wrap = document.createElement("div");
    wrap.innerHTML = loadMasterHtml();
    const header = wrap.querySelector("header.topnav") || wrap.firstElementChild;
    if (!header) return null;
    markCurrent(header);
    adaptPreLogin(header);
    bindCartNav(header);
    bindLogout(header);
    host.replaceWith(header);
    playNotifyVideo(header);
    return header;
  }

  window.mountAmeTopnav = mountAmeTopnav;
  mountAmeTopnav();
})();
