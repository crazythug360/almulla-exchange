window.AME_SEND_CART_KEY = "ameSendCart";

window.SEND_BENEFICIARIES = [
  { id: "yeshke", name: "Yeshke Keshke", account: "96385274108", bank: "State Bank Of India", branch: "Nariyapuram", currency: "INR", country: "India", rate: 296.007, fee: 1, amount: "10.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "kashf", name: "Kashf Said", account: "1051200123451", bank: "Eastern Bank Ltd", branch: "Gulshan Avenue, Dhaka", currency: "BDT", country: "Bangladesh", rate: 397.1, fee: 1, amount: "20.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "faruque", name: "Md Faruque Habibur Rahman Msa", account: "20504090200155113", bank: "Islami Bank Bangladesh Limited", branch: "Comilla Cantonment -comilla-125191210-", currency: "BDT", country: "Bangladesh", rate: 397.503677, fee: 1, amount: "25.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "salma", name: "Salma Akter", account: "20507770236314512", bank: "Islami Bank Bangladesh Limited", branch: "Agent Banking Branch Dhaka-dhaka-125270607-", currency: "BDT", country: "Bangladesh", rate: 380.228137, fee: 1, amount: "55.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "john", name: "John Doe", account: "1234567890", bank: "Bank of the Philippine Islands", branch: "Manila", currency: "PHP", country: "Philippines", rate: 189.4, fee: 1, amount: "18.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "rajesh", name: "Rajesh Kumar", account: "3019288377462210", bank: "HDFC Bank", branch: "Andheri West, Mumbai", currency: "INR", country: "India", rate: 272.65, fee: 1, amount: "50.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "ahmed", name: "Ahmed Hassan", account: "PK92HABB0000123456789012", bank: "Habib Bank Limited", branch: "Karachi Main", currency: "PKR", country: "Pakistan", rate: 907.2, fee: 1, amount: "20.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "maria", name: "Maria Santos", account: "PH1234567890123456", bank: "BDO Unibank", branch: "Manila", currency: "PHP", country: "Philippines", rate: 189.4, fee: 1, amount: "15.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "priya", name: "Priya Sharma", account: "5012345678901234", bank: "ICICI Bank", branch: "Connaught Place, New Delhi", currency: "INR", country: "India", rate: 271.9, fee: 1, amount: "30.000", source: "Salary", purpose: "Family Maintenance / Savings" },
  { id: "alex", name: "Alex Morgan", account: "4482736190284471", bank: "Chase Bank", branch: "New York", currency: "USD", country: "United States", rate: 3.257, fee: 1, amount: "100.000", source: "Salary", purpose: "Family Maintenance / Savings" },
];

window.sendFmt = function sendFmt(n, digits) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0." + "0".repeat(digits);
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

window.sendParseAmt = function sendParseAmt(raw) {
  const v = parseFloat(String(raw).replace(/,/g, ""));
  return Number.isFinite(v) ? v : 0;
};

window.sendAppId = function sendAppId(id) {
  const seed = { yeshke: 98925160, kashf: 98925140, faruque: 98925118, salma: 98925096, john: 98925144, rajesh: 98925102, ahmed: 98925111, maria: 98925125, priya: 98925133, alex: 98925150 };
  return seed[id] || 98925000 + Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 9000);
};

window.saveSendCart = function saveSendCart(cartIds, quoteCcy) {
  const items = [...cartIds].map((id) => {
    const b = window.SEND_BENEFICIARIES.find((x) => x.id === id);
    if (!b) return null;
    return {
      id,
      amount: b.amount,
      quoteCcy: quoteCcy[id] || "KWD",
      appId: sendAppId(id),
    };
  }).filter(Boolean);
  sessionStorage.setItem(window.AME_SEND_CART_KEY, JSON.stringify({ items }));
  if (typeof window.paintHeaderCartBadge === "function") window.paintHeaderCartBadge();
};

window.loadSendCart = function loadSendCart() {
  try {
    const raw = sessionStorage.getItem(window.AME_SEND_CART_KEY);
    if (!raw) return { items: [] };
    const data = JSON.parse(raw);
    return { items: Array.isArray(data.items) ? data.items : [] };
  } catch {
    return { items: [] };
  }
};

window.getSendBeneficiary = function getSendBeneficiary(id) {
  return window.SEND_BENEFICIARIES.find((b) => b.id === id);
};
