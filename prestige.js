document.querySelectorAll("[data-soon]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof toast === "function") {
      const dict = window.copy && window.copy[document.documentElement.lang === "ar" ? "ar" : "en"];
      toast((dict && dict.comingSoon) || "This service will be available soon.", "info");
    }
  });
});
