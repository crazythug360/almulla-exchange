/**
 * Signup web flow — PACI → Identity → Personal → eKYC (no video) → Credentials → Email OTP → Success
 */
(function () {
  const STEPS = ["paci", "identify", "personal", "ekyc", "credentials", "otp", "success"];
  const TITLES = {
    paci: "Kuwait Mobile ID",
    identify: "Identity",
    personal: "Personal Details",
    ekyc: "Upload EKYC",
    credentials: "Create Login Credentials",
    otp: "Verify",
    success: "Registration Successful",
  };

  const app = document.getElementById("signupApp");
  if (!app) return;

  const state = {
    step: "paci",
    front: false,
    back: false,
    otpSeconds: 300,
    otpTimer: null,
    paciTimer: null,
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function toast(msg, kind) {
    if (typeof window.toast === "function") window.toast(msg, kind || "info");
  }

  function markFields() {
    $$(".su__form .field--float, .su__phone .field--float").forEach((field) => {
      const input = field.querySelector("input, select");
      if (!input) return;
      const sync = () => field.classList.toggle("has-value", Boolean(String(input.value || "").trim()));
      input.addEventListener("input", sync);
      input.addEventListener("change", sync);
      sync();
    });
  }

  function setStep(next) {
    if (!STEPS.includes(next)) return;
    state.step = next;
    app.dataset.step = next;

    $$(".su__panel").forEach((panel) => {
      const on = panel.dataset.panel === next;
      panel.classList.toggle("is-on", on);
      panel.hidden = !on;
    });

    const idx = STEPS.indexOf(next);
    $$("#suSteps .su__step").forEach((el) => {
      const key = el.getAttribute("data-step-nav");
      const i = STEPS.indexOf(key);
      el.classList.toggle("is-on", key === next);
      el.classList.toggle("is-done", i >= 0 && i < idx);
    });

    const title = $("#suTitle");
    if (title) title.textContent = TITLES[next] || "Sign Up";

    const skip = $("#suSkipPaci");
    if (skip) skip.hidden = next !== "paci";

    const back = $("#suBack");
    if (back) back.hidden = next === "success";

    if (next === "credentials") {
      const civil = $("#suCivilId")?.value.trim() || $("#suCivilIdPersonal")?.value.trim() || "293090162717";
      const userId = $("#suUserId");
      if (userId && !userId.value) userId.value = civil;
      userId?.closest(".field")?.classList.add("has-value");
      syncPassHints();
    }

    if (next === "otp") {
      const email = $("#suEmail")?.value.trim();
      const mobile = `${$("#suDial")?.value || "+965"} ${$("#suMobile")?.value.trim() || ""}`.trim();
      const target = $("#suOtpTarget");
      if (target) target.textContent = email || mobile || "your email";
      startOtpTimer(300);
      const first = $(".su__otp-cell");
      first?.focus();
    }

    if (next === "success") stopOtpTimer();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    const i = STEPS.indexOf(state.step);
    if (i <= 0) {
      location.href = "index.html";
      return;
    }
    setStep(STEPS[i - 1]);
  }

  function openSkipDialog() {
    const dlg = $("#suSkipDialog");
    if (dlg?.showModal) dlg.showModal();
    else setStep("identify");
  }

  function closeSkipDialog() {
    $("#suSkipDialog")?.close?.();
  }

  function startPaciTimer(seconds) {
    stopPaciTimer();
    let left = seconds;
    const el = $("#suPaciTimer");
    const tick = () => {
      const m = String(Math.floor(left / 60)).padStart(2, "0");
      const s = String(left % 60).padStart(2, "0");
      if (el) el.textContent = `${m}:${s}`;
      if (left <= 0) {
        stopPaciTimer();
        return;
      }
      left -= 1;
    };
    tick();
    state.paciTimer = window.setInterval(tick, 1000);
  }

  function stopPaciTimer() {
    if (state.paciTimer) window.clearInterval(state.paciTimer);
    state.paciTimer = null;
  }

  function startOtpTimer(seconds) {
    stopOtpTimer();
    state.otpSeconds = seconds;
    const el = $("#suOtpTimer");
    const resend = $("#suResend");
    if (resend) resend.disabled = true;
    const tick = () => {
      const m = String(Math.floor(state.otpSeconds / 60)).padStart(2, "0");
      const s = String(state.otpSeconds % 60).padStart(2, "0");
      if (el) el.textContent = `${m}:${s}`;
      if (state.otpSeconds <= 0) {
        stopOtpTimer();
        if (resend) resend.disabled = false;
        return;
      }
      state.otpSeconds -= 1;
    };
    tick();
    state.otpTimer = window.setInterval(tick, 1000);
  }

  function stopOtpTimer() {
    if (state.otpTimer) window.clearInterval(state.otpTimer);
    state.otpTimer = null;
  }

  function bindUpload(inputId, wrapId) {
    const input = $(`#${inputId}`);
    const wrap = $(`#${wrapId}`);
    if (!input || !wrap) return;
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      const status = wrap.querySelector("[data-status]");
      if (!file) return;
      wrap.classList.add("is-done");
      if (status) status.textContent = "Upload Success";
      if (inputId === "suIdFront") state.front = true;
      if (inputId === "suIdBack") state.back = true;
      const next = $("#suEkycNext");
      if (next) next.disabled = !(state.front && state.back);
    });
  }

  function passRules(pass, confirm) {
    return {
      len: pass.length >= 8 && pass.length <= 15,
      lower: /[a-z]/.test(pass),
      upper: /[A-Z]/.test(pass),
      num: /\d/.test(pass),
      special: /[!@$%]/.test(pass),
      match: pass.length > 0 && pass === confirm,
    };
  }

  function syncPassHints() {
    const pass = $("#suPass")?.value || "";
    const confirm = $("#suPass2")?.value || "";
    const rules = passRules(pass, confirm);
    Object.keys(rules).forEach((key) => {
      const li = $(`#suPassHints [data-rule="${key}"]`);
      li?.classList.toggle("is-ok", rules[key]);
    });
    const next = $("#suCredNext");
    if (next) next.disabled = !Object.values(rules).every(Boolean);
  }

  function bindOtpBoxes() {
    const cells = $$(".su__otp-cell");
    cells.forEach((cell, i) => {
      cell.addEventListener("input", () => {
        cell.value = cell.value.replace(/\D/g, "").slice(0, 1);
        if (cell.value && cells[i + 1]) cells[i + 1].focus();
      });
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !cell.value && cells[i - 1]) {
          cells[i - 1].focus();
        }
      });
      cell.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
        text.split("").forEach((ch, n) => {
          if (cells[n]) cells[n].value = ch;
        });
        cells[Math.min(text.length, cells.length - 1)]?.focus();
      });
    });
  }

  function bindEyes() {
    $$(".field__eye[data-eye]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.getAttribute("data-eye"));
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.classList.toggle("is-visible", show);
      });
    });
  }

  /* Events */
  $("#suBack")?.addEventListener("click", goBack);
  $("#suSkipPaci")?.addEventListener("click", openSkipDialog);
  $("#suPaciSkipBtn")?.addEventListener("click", openSkipDialog);
  $("#suSkipCancel")?.addEventListener("click", closeSkipDialog);
  $("#suSkipClose")?.addEventListener("click", closeSkipDialog);
  $("#suSkipOk")?.addEventListener("click", () => {
    closeSkipDialog();
    stopPaciTimer();
    setStep("identify");
  });

  $("#suPaciContinue")?.addEventListener("click", () => {
    stopPaciTimer();
    toast("Mobile ID verified.", "success");
    setStep("identify");
  });

  $("#formIdentify")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const civil = $("#suCivilId")?.value.trim();
    const name = $("#suFullName")?.value.trim();
    const mobile = $("#suMobile")?.value.trim();
    if (!civil || civil.length < 8) {
      toast("Enter a valid Civil ID.", "error");
      return;
    }
    if (!name) {
      toast("Enter your full name.", "error");
      return;
    }
    if (!mobile || mobile.length < 7) {
      toast("Enter a valid mobile number.", "error");
      return;
    }
    $("#suCivilIdPersonal").value = civil;
    $("#suCivilIdPersonal")?.closest(".field")?.classList.add("has-value");
    const parts = name.split(/\s+/);
    $("#suFirstName").value = parts[0] || "";
    $("#suLastName").value = parts.slice(1).join(" ") || parts[0] || "";
    $("#suFirstName")?.closest(".field")?.classList.add("has-value");
    $("#suLastName")?.closest(".field")?.classList.add("has-value");
    toast("OTP sent for mobile verification.", "success");
    setStep("personal");
  });

  $("#formPersonal")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!$("#suFirstName")?.value.trim() || !$("#suLastName")?.value.trim()) {
      toast("Enter first and last name.", "error");
      return;
    }
    if (!$("#suCivilIdPersonal")?.value.trim()) {
      toast("Enter Civil ID.", "error");
      return;
    }
    setStep("ekyc");
  });

  $("#suEkycNext")?.addEventListener("click", () => {
    if (!(state.front && state.back)) {
      toast("Upload Civil ID front and back.", "error");
      return;
    }
    setStep("credentials");
  });

  $("#suPass")?.addEventListener("input", syncPassHints);
  $("#suPass2")?.addEventListener("input", syncPassHints);

  $("#formCredentials")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = $("#suPass")?.value || "";
    const confirm = $("#suPass2")?.value || "";
    const rules = passRules(pass, confirm);
    if (!Object.values(rules).every(Boolean)) {
      toast("Complete all password requirements.", "error");
      return;
    }
    toast("Credentials saved. Verify your email.", "success");
    setStep("otp");
  });

  $("#suResend")?.addEventListener("click", () => {
    startOtpTimer(300);
    toast("OTP resent.", "info");
  });

  $("#suOtpCancel")?.addEventListener("click", () => setStep("credentials"));

  $("#suOtpSubmit")?.addEventListener("click", () => {
    const code = $$(".su__otp-cell")
      .map((c) => c.value)
      .join("");
    if (code.length < 6) {
      toast("Enter the 6-digit OTP.", "error");
      return;
    }
    stopOtpTimer();
    setStep("success");
  });

  bindUpload("suIdFront", "uploadFront");
  bindUpload("suIdBack", "uploadBack");
  bindOtpBoxes();
  bindEyes();
  markFields();
  startPaciTimer(180);
  setStep("paci");
})();
