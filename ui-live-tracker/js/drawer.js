/**
 * Master hamburger menu
 * HTML: partials/drawer.html
 * CSS:  css/drawer.css (imported from css/style.css)
 * Keep FALLBACK_HTML in sync with the partial when possible.
 * Mounts into #ameDrawer before app.js so menu bindings work.
 *
 * Two modes:
 *   data-drawer-mode="guest" — before login
 *   data-drawer-mode="auth"  — after login (screenshot menu)
 */
(function () {
  const FALLBACK_HTML = `<nav class="drawer" id="drawer" data-ame-drawer-root data-drawer-mode="guest" aria-hidden="true">
  <div class="drawer__head">
    <p class="drawer__hello" lang="en" dir="ltr">
      <span class="welcome__hello">
        <span class="welcome__label" data-drawer-greeting data-i18n-lock="en">Welcome</span>
        <span class="welcome__name" data-user-first hidden></span>
      </span>
      <small class="drawer__last-login" data-drawer-last-login hidden></small>
    </p>
    <button class="drawer__back" id="drawerBack" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span data-i18n="backToHelpSupport">Back to Help &amp; Support</span>
    </button>
    <button class="drawer__close" id="closeMenu" type="button" aria-label="Close menu">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

  <div class="drawer__stage">
    <!-- —— Pre-login menu (guest) —— -->
    <div class="drawer__page drawer__page--guest is-on" id="drawerGuest">
      <div class="drawer__group">
        <button class="drawer__item" type="button" data-menu="branches">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_branch.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="branches">Branches</span>
        </button>
        <button class="drawer__item" type="button" data-menu="rates">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/exchangerate.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="rates">Exchange Rate Enquiry</span>
        </button>
        <button class="drawer__item" type="button" data-menu="notifications">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_notify.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="notifications">Notifications</span>
        </button>
        <div class="drawer__item drawer__item--lang">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_lang.svg" alt="" width="35" height="35" /></span>
          <div class="drawer__lang-block">
            <span data-i18n="changeLanguage">Change Language</span>
            <div class="drawer__toggle drawer__toggle--lang" role="group" aria-label="Language">
              <button class="drawer__toggle-btn is-on" type="button" data-set-lang="en" aria-pressed="true">English</button>
              <button class="drawer__toggle-btn" type="button" data-set-lang="ar" aria-pressed="false">العربية</button>
            </div>
          </div>
        </div>
        <button class="drawer__item" type="button" data-menu="demo">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_demo.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="demo">Demo</span>
        </button>
      </div>

      <p class="drawer__label" data-i18n="getInTouch">Get in Touch</p>
      <div class="drawer__group">
        <a class="drawer__item drawer__item--stack" href="tel:+9651840123">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_call.svg" alt="" width="35" height="35" /></span>
          <span class="drawer__meta">
            <strong data-i18n="callUs">Call Us</strong>
            <small>+965 1840123</small>
          </span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
        <a class="drawer__item drawer__item--stack" href="https://wa.me/9651840123" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_chat.svg" alt="" width="35" height="35" /></span>
          <span class="drawer__meta">
            <strong data-i18n="whatsapp">WhatsApp</strong>
            <small data-i18n="whatsappChat">Chat with Us on WhatsApp</small>
          </span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
      </div>

      <p class="drawer__label" data-i18n="followUs">Follow Us</p>
      <div class="drawer__group">
        <a class="drawer__item" href="https://www.instagram.com/almullaexchange/" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/hs_insta.svg" alt="" width="35" height="35" /></span>
          <span>Instagram</span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
        <a class="drawer__item" href="https://www.linkedin.com/company/al-mulla-exchange" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/hs_linkedin.svg" alt="" width="35" height="35" /></span>
          <span>LinkedIn</span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
        <a class="drawer__item" href="https://www.facebook.com/AlMullaExchange" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/hs_fb.svg" alt="" width="35" height="35" /></span>
          <span>Facebook</span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
        <a class="drawer__item" href="https://x.com/almullaexchange" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/hs_x.svg" alt="" width="35" height="35" /></span>
          <span>X (Twitter)</span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
      </div>
    </div>

    <!-- —— Post-login menu (from app screenshots) —— -->
    <div class="drawer__page drawer__page--auth" id="drawerAuth">
      <p class="drawer__label" data-i18n="customerProfile">Customer profile</p>
      <div class="drawer__group">
        <button class="drawer__item" type="button" data-menu="my-information">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_myinfo.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="myInformation">My Information</span>
        </button>
      </div>

      <p class="drawer__label" data-i18n="accountSettings">Account settings</p>
      <div class="drawer__group">
        <button class="drawer__item" type="button" data-menu="biometrics">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_biometric.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="fingerprintFaceId">Fingerprint / Face ID</span>
        </button>
        <button class="drawer__item" type="button" data-menu="reset-password">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_resetpass.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="resetPassword">Reset Password</span>
        </button>
        <button class="drawer__item" type="button" data-menu="employment">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/annualIncome.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="employmentDetails">Employment Details</span>
        </button>
        <button class="drawer__item drawer__item--stack" type="button" data-menu="civil-id">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_civilupdate.svg" alt="" width="35" height="35" /></span>
          <span class="drawer__meta">
            <strong data-i18n="civilIdUpdate">Civil ID Update</strong>
            <small data-i18n="civilIdExpiry">Expiry Date 05-10-2026</small>
          </span>
        </button>
      </div>

      <p class="drawer__label" data-i18n="helpSupport">Help &amp; Support</p>
      <div class="drawer__group">
        <button class="drawer__item" type="button" data-menu="branches">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_branch.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="branches">Branches</span>
        </button>
        <a class="drawer__item" href="tel:+9651840123">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_call.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="callUs">Call Us</span>
        </a>
        <a class="drawer__item" href="https://wa.me/9651840123" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_chat.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="chat">Chat</span>
        </a>
        <button class="drawer__item" type="button" data-menu="feedback">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_fdbck.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="feedbackComplaint">FeedBack &amp; Complaint</span>
        </button>
      </div>

      <p class="drawer__label" data-i18n="others">Others</p>
      <div class="drawer__group">
        <button class="drawer__item" type="button" data-menu="wu-rewards">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_wu.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="wuRewards">WU Rewards</span>
        </button>
        <div class="drawer__item drawer__item--lang">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_lang.svg" alt="" width="35" height="35" /></span>
          <div class="drawer__lang-block">
            <span data-i18n="changeLanguage">Change Language</span>
            <div class="drawer__toggle drawer__toggle--lang" role="group" aria-label="Language">
              <button class="drawer__toggle-btn is-on" type="button" data-set-lang="en" aria-pressed="true">English</button>
              <button class="drawer__toggle-btn" type="button" data-set-lang="ar" aria-pressed="false">العربية</button>
            </div>
          </div>
        </div>
      </div>

      <div class="drawer__cta-wrap">
        <a class="drawer__cta" href="https://wa.me/9651840123" target="_blank" rel="noopener">
          <span class="drawer__cta-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 3.5a8.2 8.2 0 0 0-7 12.5L4 20.5l4.7-1.2A8.2 8.2 0 1 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.2 9.4c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .5-.2.6l-.5.4a6 6 0 0 0 2.6 2.6l.4-.5c.2-.2.4-.3.6-.2l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .5-.5.7A7 7 0 0 1 9.2 9.4Z" fill="currentColor"/></svg>
          </span>
          <span data-i18n="deactivateAccess">Call Us -- Deactivate Mobile App Access</span>
        </a>
      </div>

      <div class="drawer__group">
        <button class="drawer__item" type="button" id="dashLogoutBtn">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_logout.svg" alt="" width="35" height="35" /></span>
          <span data-i18n="logout">Logout</span>
        </button>
      </div>
    </div>

    <!-- —— Help sub-page (shared) —— -->
    <div class="drawer__page" id="drawerHelp">
      <p class="drawer__label" data-i18n="getInTouch">Get in Touch</p>
      <div class="drawer__group">
        <a class="drawer__item drawer__item--stack" href="tel:+9651840123">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_call.svg" alt="" width="35" height="35" /></span>
          <span class="drawer__meta">
            <strong data-i18n="callUs">Call Us</strong>
            <small>+965 1840123</small>
          </span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
        <a class="drawer__item drawer__item--stack" href="https://wa.me/9651840123" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/sd_chat.svg" alt="" width="35" height="35" /></span>
          <span class="drawer__meta">
            <strong data-i18n="whatsapp">WhatsApp</strong>
            <small data-i18n="whatsappChat">Chat with Us on WhatsApp</small>
          </span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
      </div>
      <p class="drawer__label" data-i18n="followUs">Follow Us</p>
      <div class="drawer__group">
        <a class="drawer__item" href="https://www.instagram.com/almullaexchange/" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/hs_insta.svg" alt="" width="35" height="35" /></span>
          <span>Instagram</span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
        <a class="drawer__item" href="https://www.linkedin.com/company/al-mulla-exchange" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/hs_linkedin.svg" alt="" width="35" height="35" /></span>
          <span>LinkedIn</span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
        <a class="drawer__item" href="https://www.facebook.com/AlMullaExchange" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/hs_fb.svg" alt="" width="35" height="35" /></span>
          <span>Facebook</span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
        <a class="drawer__item" href="https://x.com/almullaexchange" target="_blank" rel="noopener">
          <span class="drawer__glyph drawer__glyph--sd" aria-hidden="true"><img src="assets/images/hs_x.svg" alt="" width="35" height="35" /></span>
          <span>X (Twitter)</span>
          <span class="drawer__chevron drawer__chevron--end" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m10 8 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
      </div>
    </div>
  </div>
</nav>
`;

  function drawerSrc() {
    return "partials/drawer.html?v=ex3";
  }

  function loadMasterHtml() {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", drawerSrc(), false);
      xhr.send(null);
      const ok = (xhr.status >= 200 && xhr.status < 300) || xhr.status === 0;
      if (ok && xhr.responseText && xhr.responseText.trim()) {
        return xhr.responseText.trim();
      }
    } catch {
      /* file:// or offline — use fallback */
    }
    return FALLBACK_HTML.trim();
  }

  function hasSession() {
    try {
      return Boolean(JSON.parse(sessionStorage.getItem("ameSession") || "null"));
    } catch {
      return false;
    }
  }

  function isAuthMode() {
    if (document.getElementById("loginForm")) return false;
    if (hasSession()) return true;
    return document.body.classList.contains("page-dashboard");
  }

  function adaptDrawerMode(root) {
    if (!root) return;
    const auth = isAuthMode();
    root.setAttribute("data-drawer-mode", auth ? "auth" : "guest");
    root.classList.toggle("drawer--auth", auth);
    root.classList.toggle("drawer--guest", !auth);

    const guest = root.querySelector("#drawerGuest");
    const authPage = root.querySelector("#drawerAuth");
    const help = root.querySelector("#drawerHelp");
    const onHelp = root.classList.contains("is-help");

    if (!onHelp) {
      help?.classList.remove("is-on");
      if (auth) {
        guest?.classList.remove("is-on");
        authPage?.classList.add("is-on");
      } else {
        authPage?.classList.remove("is-on");
        guest?.classList.add("is-on");
      }
    }

    if (!auth) {
      root.querySelectorAll("[data-drawer-greeting], .drawer__hello .welcome__label").forEach((el) => {
        el.textContent = "Welcome";
        el.removeAttribute("data-i18n");
      });
      root.querySelectorAll(".welcome__name").forEach((el) => {
        el.hidden = true;
        el.textContent = "";
      });
      root.querySelectorAll("[data-drawer-last-login]").forEach((el) => {
        el.hidden = true;
        el.textContent = "";
      });
    }
  }

  function markCurrent(root) {
    const page = (location.pathname.split("/").pop() || "").toLowerCase() || "index.html";
    const map = {
      "dashboard.html": "dashboard",
      "dashboard2.html": "dashboard",
      "my-information.html": "my-information",
      "prestige.html": "prestige",
      "branches.html": "branches",
      "rates.html": "rates",
    };
    const key = map[page];
    if (!key) return;
    root.querySelectorAll("[data-menu]").forEach((btn) => {
      const on = btn.getAttribute("data-menu") === key;
      btn.classList.toggle("is-current", on);
      if (on) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
  }

  function mountAmeDrawer() {
    const host = document.getElementById("ameDrawer");
    if (!host) return null;
    if (document.querySelector("[data-ame-drawer-root]")) {
      const existing = document.querySelector("[data-ame-drawer-root]");
      adaptDrawerMode(existing);
      return existing;
    }

    const wrap = document.createElement("div");
    wrap.innerHTML = loadMasterHtml();
    const drawer = wrap.querySelector("nav.drawer") || wrap.firstElementChild;
    if (!drawer) return null;
    if (!drawer.id) drawer.id = "drawer";
    drawer.setAttribute("data-ame-drawer-root", "");
    markCurrent(drawer);
    adaptDrawerMode(drawer);
    host.replaceWith(drawer);
    return drawer;
  }

  window.mountAmeDrawer = mountAmeDrawer;
  window.adaptAmeDrawerMode = adaptDrawerMode;
  mountAmeDrawer();
})();
