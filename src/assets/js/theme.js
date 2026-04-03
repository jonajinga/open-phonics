(function () {
  var STORAGE_KEY = "theme-preference";

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function updateIcons(theme) {
    var lightIcons = document.querySelectorAll(".theme-toggle__light");
    var darkIcons = document.querySelectorAll(".theme-toggle__dark");
    lightIcons.forEach(function (el) { el.style.display = theme === "dark" ? "none" : "inline-flex"; });
    darkIcons.forEach(function (el) { el.style.display = theme === "dark" ? "inline-flex" : "none"; });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    var toggles = document.querySelectorAll(".theme-toggle");
    toggles.forEach(function (t) { t.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode"); });
    updateIcons(theme);
  }

  var stored = getStoredTheme();
  if (stored) setTheme(stored);
  else updateIcons(getSystemTheme());

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!getStoredTheme()) updateIcons(e.matches ? "dark" : "light");
  });

  document.addEventListener("DOMContentLoaded", function () {
    var toggles = document.querySelectorAll(".theme-toggle");
    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") || getSystemTheme();
        setTheme(current === "dark" ? "light" : "dark");
      });
    });
  });
})();
