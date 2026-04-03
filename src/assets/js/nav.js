(function () {
  function openMenu() {
    var panel = document.getElementById("hamburger-panel");
    var overlay = document.getElementById("hamburger-overlay");
    if (panel) panel.setAttribute("data-open", "true");
    if (overlay) overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    // Move focus into panel
    if (panel) {
      var closeBtn = panel.querySelector(".hamburger-panel__close");
      if (closeBtn) closeBtn.focus();
    }
  }

  function closeMenu() {
    var panel = document.getElementById("hamburger-panel");
    var overlay = document.getElementById("hamburger-overlay");
    if (panel) panel.setAttribute("data-open", "false");
    if (overlay) overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  // Focus trap inside hamburger panel
  function trapFocus(e) {
    var panel = document.getElementById("hamburger-panel");
    if (!panel || panel.getAttribute("data-open") !== "true") return;
    if (e.key !== "Tab") return;

    var focusable = panel.querySelectorAll("a[href], button, input, textarea, select, [tabindex]:not([tabindex='-1'])");
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // Expose for inline onclick
  window.openMenu = openMenu;
  window.closeMenu = closeMenu;

  document.addEventListener("keydown", function (e) {
    // Focus trap
    trapFocus(e);

    if (e.key === "Escape") {
      var panel = document.getElementById("hamburger-panel");
      if (panel && panel.getAttribute("data-open") === "true") {
        closeMenu();
        var btn = document.getElementById("hamburger-btn");
        if (btn) btn.focus();
      }
    }
  });
})();
