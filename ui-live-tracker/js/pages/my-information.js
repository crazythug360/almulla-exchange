const dict = () => (window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"]) || {};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "—";
}

function initial(name) {
  const ch = String(name || "").trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

function paintMyInfo() {
  const d = dict();
  const session = typeof ameReadSession === "function" ? ameReadSession() : null;
  const name = (session && session.name) || "Faruque Habibur Rahman";
  const civil = (session && session.civilId) || "—";
  const mobile = (session && session.mobile) || "+965 5000 0000";
  const email = (session && session.email) || "faruque@example.com";
  const nationality = (session && session.nationality) || (d.kuwait || "Kuwait");

  const avatar = document.getElementById("myInfoAvatar");
  if (avatar) avatar.textContent = initial(name);

  setText("myInfoName", name);
  setText("myInfoCivil", civil === "—" ? (d.civilId || "Civil ID") : civil);
  setText("myInfoFullName", name);
  setText("myInfoCivilId", civil);
  setText("myInfoMobile", mobile);
  setText("myInfoEmail", email);
  setText("myInfoNationality", nationality);
}

document.getElementById("dashLogoutBtn")?.addEventListener("click", () => {
  if (typeof closeMenu === "function") closeMenu();
  if (typeof ameClearSession === "function") ameClearSession();
  if (typeof ameNavigate === "function") ameNavigate("index.html");
});

paintMyInfo();
window.addEventListener("ame:lang", paintMyInfo);
