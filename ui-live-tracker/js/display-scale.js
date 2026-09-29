/* Type scale follows the display, not the layout viewport.
   Docked DevTools changes innerWidth and innerHeight. screen size does not. */
(function () {
  var root = document.documentElement;

  function apply() {
    var screen = window.screen;
    var w = screen && screen.width ? screen.width : window.innerWidth;
    var h = screen && screen.height ? screen.height : window.innerHeight;
    var display = "desktop";
    if (w <= 767) display = "mobile";
    else if (w <= 1024) display = "tablet";
    else if (w <= 1512 || h <= 960) display = "laptop";
    if (root.getAttribute("data-display") !== display) {
      root.setAttribute("data-display", display);
    }
  }

  apply();
  window.addEventListener("orientationchange", apply);
  window.addEventListener("resize", apply);
})();
