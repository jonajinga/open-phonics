(function () {
  var STORAGE_KEY = "theme-preference";

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) toggle.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
    // Toggle icon visibility
    var lightIcon = document.querySelector(".theme-toggle__light");
    var darkIcon = document.querySelector(".theme-toggle__dark");
    if (lightIcon && darkIcon) {
      lightIcon.style.display = theme === "dark" ? "none" : "inline-flex";
      darkIcon.style.display = theme === "dark" ? "inline-flex" : "none";
    }
  }

  var stored = getStoredTheme();
  if (stored) setTheme(stored);
  else {
    var sys = getSystemTheme();
    var lightIcon = document.querySelector(".theme-toggle__light");
    var darkIcon = document.querySelector(".theme-toggle__dark");
    if (lightIcon && darkIcon) {
      lightIcon.style.display = sys === "dark" ? "none" : "inline-flex";
      darkIcon.style.display = sys === "dark" ? "inline-flex" : "none";
    }
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!getStoredTheme()) {
      var lightIcon = document.querySelector(".theme-toggle__light");
      var darkIcon = document.querySelector(".theme-toggle__dark");
      if (lightIcon && darkIcon) {
        lightIcon.style.display = e.matches ? "none" : "inline-flex";
        darkIcon.style.display = e.matches ? "inline-flex" : "none";
      }
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || getSystemTheme();
      setTheme(current === "dark" ? "light" : "dark");
    });
  });
})();
