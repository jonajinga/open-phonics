(function () {
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReduced = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener("change", function (e) { prefersReduced = e.matches; });
  var lessonDataEl = document.getElementById("lesson-data");
  if (!lessonDataEl) return;

  var lesson = JSON.parse(lessonDataEl.textContent);
  var steps = lesson.steps;
  var currentStep = 0;
  var currentAnimation = null;
  var isPaused = false;
  var pointerHidden = false;
  var shortcutOverlayVisible = false;

  // DOM
  var childText = document.getElementById("child-text");
  var finger = document.getElementById("teacher-finger");
  var cueArrow = document.getElementById("cue-arrow");
  var cueStop = document.getElementById("cue-stop");
  var arrowLine = document.getElementById("arrow-line-el");
  var stepDots = document.querySelectorAll(".step-dot");
  var stepNumber = document.getElementById("step-number");
  var stepSay = document.getElementById("step-say");
  var stepDo = document.getElementById("step-do");
  var praiseBox = document.getElementById("praise-box");
  var praiseText = document.getElementById("praise-text");
  var correctBox = document.getElementById("correct-box");
  var correctText = document.getElementById("correct-text");
  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");
  var playPauseBtn = document.getElementById("btn-play-pause");
  var speedSlider = document.getElementById("speed-slider");
  var iconPlay = document.getElementById("icon-play");
  var iconPause = document.getElementById("icon-pause");
  var pointerRemote = document.getElementById("pointer-remote");

  function getSpeedMultiplier() {
    var val = parseInt(speedSlider.value, 10);
    if (val <= 50) return 0.25 + (val / 50) * 0.75;
    return 1 + ((val - 50) / 50) * 2;
  }

  function showStep(index) {
    if (index < 0 || index >= steps.length) return;
    cancelAnimation();
    currentStep = index;
    var step = steps[currentStep];

    childText.innerHTML = step.display;
    if (step.track === "none") childText.classList.add("child-text--story");
    else childText.classList.remove("child-text--story");

    cueArrow.classList.remove("is-active");
    cueStop.classList.remove("is-active");
    finger.classList.remove("is-visible");

    if (step.track === "arrow") {
      cueArrow.classList.add("is-active");
      // Size arrow to match text width (ball left of first letter, arrow right of last)
      var textWidth = childText.scrollWidth || childText.offsetWidth;
      var arrowW = Math.max(textWidth + 20, 80); // pad 10px each side
      arrowLine.style.width = arrowW + "px";
    } else if (step.track === "stop") {
      cueStop.classList.add("is-active");
    }

    pointerRemote.style.display = step.track === "none" ? "none" : "";

    stepNumber.textContent = "Step " + (currentStep + 1);
    stepSay.innerHTML = step.say || "";
    stepDo.innerHTML = step.do || "";

    if (step.praise) { praiseBox.classList.add("is-visible"); praiseText.innerHTML = step.praise; }
    else praiseBox.classList.remove("is-visible");
    if (step.correct) { correctBox.classList.add("is-visible"); correctText.innerHTML = step.correct; }
    else correctBox.classList.remove("is-visible");

    stepDots.forEach(function (dot, i) {
      dot.classList.remove("is-active", "is-done");
      if (i === currentStep) dot.classList.add("is-active");
      else if (i < currentStep) dot.classList.add("is-done");
    });

    prevBtn.disabled = currentStep === 0;

    if (currentStep === steps.length - 1) {
      nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
      nextBtn.title = "Complete lesson";
      nextBtn.setAttribute("aria-label", "Complete lesson");
    } else {
      nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      nextBtn.title = "Next step";
      nextBtn.setAttribute("aria-label", "Next step");
    }

    isPaused = false;
    updatePlayPauseUI();
  }

  function cancelAnimation() {
    if (currentAnimation) { currentAnimation.cancel(); currentAnimation = null; }
    finger.classList.remove("is-visible");
    isPaused = false;
    updatePlayPauseUI();
  }

  function animateDot() {
    var step = steps[currentStep];
    if (!step || step.track === "none" || pointerHidden) return;
    cancelAnimation();
    var speed = getSpeedMultiplier();

    if (prefersReduced) { finger.classList.add("is-visible"); return; }

    finger.classList.add("is-visible");

    if (step.track === "arrow") {
      var width = arrowLine.offsetWidth || 160;
      var baseDuration = step.action === "fast" ? 500 : 1500;
      var duration = (baseDuration * (width / 200)) / speed;
      var easing = step.action === "fast" ? "ease-out" : "linear";
      finger.style.left = "-10px";
      finger.style.top = "50%";
      currentAnimation = finger.animate(
        [{ transform: "translateX(0px)" }, { transform: "translateX(" + width + "px)" }],
        { duration: duration, easing: easing, fill: "forwards" }
      );
      currentAnimation.onfinish = function () { currentAnimation = null; updatePlayPauseUI(); };
    } else if (step.track === "stop") {
      var tapDuration = 150 / speed;
      finger.style.left = "calc(50% - 10px)";
      finger.style.top = "50%";
      currentAnimation = finger.animate(
        [{ transform: "translateY(0px)" }, { transform: "translateY(-12px)" }, { transform: "translateY(0px)" }],
        { duration: tapDuration, easing: "ease-in-out", fill: "forwards" }
      );
      currentAnimation.onfinish = function () { currentAnimation = null; updatePlayPauseUI(); };
    }
    updatePlayPauseUI();
  }

  // Combined play/pause: no animation → play, animating → pause, paused → resume
  function playPause() {
    if (!currentAnimation) {
      animateDot();
    } else if (isPaused) {
      currentAnimation.play();
      isPaused = false;
      updatePlayPauseUI();
    } else {
      currentAnimation.pause();
      isPaused = true;
      updatePlayPauseUI();
    }
  }

  function updatePlayPauseUI() {
    var isAnimating = currentAnimation && !isPaused;
    if (isAnimating) {
      iconPlay.classList.add("hidden"); iconPause.classList.remove("hidden");
      playPauseBtn.title = "Pause"; playPauseBtn.setAttribute("aria-label", "Pause");
    } else {
      iconPlay.classList.remove("hidden"); iconPause.classList.add("hidden");
      playPauseBtn.title = "Play"; playPauseBtn.setAttribute("aria-label", "Play");
    }
  }

  function resetDotPosition() { cancelAnimation(); }

  function togglePointerVisibility() {
    pointerHidden = !pointerHidden;
    var eyeOpen = document.getElementById("icon-eye-open");
    var eyeClosed = document.getElementById("icon-eye-closed");
    if (pointerHidden) {
      finger.classList.add("is-hidden");
      eyeOpen.classList.add("hidden"); eyeClosed.classList.remove("hidden");
    } else {
      finger.classList.remove("is-hidden");
      eyeOpen.classList.remove("hidden"); eyeClosed.classList.add("hidden");
    }
  }

  function isStoryLesson() {
    return steps.filter(function (s) { return s.track === "none"; }).length >= 3;
  }

  function getStoryText() {
    // Collect unique FULL sentences from the last story step that has the complete text
    // The last track:none step typically has the full sentence/story
    var fullTexts = [];
    var seen = {};
    // Walk backwards to find the longest version of each sentence
    for (var i = steps.length - 1; i >= 0; i--) {
      if (steps[i].track !== "none") continue;
      var plain = (steps[i].display || "").replace(/<[^>]*>/g, "").trim();
      // Skip word-highlight versions (contain the same text as the full version)
      if (plain.length > 5 && !seen[plain]) {
        seen[plain] = true;
        fullTexts.unshift(plain);
      }
    }
    // Deduplicate by checking if any sentence is a substring of another
    var unique = [];
    fullTexts.forEach(function (s) {
      var isDuplicate = fullTexts.some(function (other) {
        return other !== s && other.length > s.length && other.includes(s);
      });
      // Also skip if we already have a very similar sentence
      var isNearDupe = unique.some(function (u) {
        return u.replace(/[^a-zA-Z]/g, "") === s.replace(/[^a-zA-Z]/g, "");
      });
      if (!isDuplicate && !isNearDupe) unique.push(s);
    });
    return unique;
  }

  function generateComprehension(sentences) {
    if (sentences.length < 2) return [];
    var questions = [];
    var text = sentences.join(" ");

    // Use lesson comprehension data if provided
    if (lesson.comprehension && lesson.comprehension.length > 0) {
      return lesson.comprehension;
    }

    // Auto-generate only if no hand-crafted questions exist
    // Find character names (capitalized words not at sentence start)
    var allWords = [];
    sentences.forEach(function (s) {
      var words = s.split(/\s+/);
      words.forEach(function (w, i) {
        if (i > 0) allWords.push(w);
      });
    });
    var names = [];
    allWords.forEach(function (w) {
      var clean = w.replace(/[^a-zA-Z]/g, "");
      if (clean.length > 1 && clean[0] === clean[0].toUpperCase() && clean[0] !== clean[0].toLowerCase()) {
        if (names.indexOf(clean) === -1 && ["The", "He", "She", "It", "We", "They", "My", "His", "Her", "I", "A", "An"].indexOf(clean) === -1) {
          names.push(clean);
        }
      }
    });

    if (names.length > 0) {
      questions.push({ q: "Who is in this story?", a: names.join(" and ") });
    }

    if (sentences.length >= 3) {
      questions.push({ q: "What happened at the end of the story?", a: sentences[sentences.length - 1] });
    }

    if (sentences.length >= 2) {
      questions.push({ q: "What happened first?", a: sentences[0] });
    }

    return questions;
  }

  function showSecondReading() {
    var shell = document.querySelector(".lesson-shell");
    var sr = document.getElementById("second-reading");
    if (shell) shell.classList.add("hidden");
    if (sr) sr.classList.remove("hidden");

    var sentences = getStoryText();
    var textEl = document.getElementById("second-reading-text");
    if (textEl) {
      textEl.innerHTML = sentences.map(function (s) { return "<p>" + s + "</p>"; }).join("");
    }

    var questions = generateComprehension(sentences);
    var compSection = document.getElementById("comprehension-section");
    var qEl = document.getElementById("comprehension-questions");

    if (questions.length === 0) {
      if (compSection) compSection.classList.add("hidden");
    } else if (qEl) {
      qEl.innerHTML = questions.map(function (q, i) {
        return '<div class="comprehension-q">' +
          '<div class="comprehension-q__question">' + (i + 1) + ". " + q.q + '</div>' +
          '<button class="comprehension-q__reveal" onclick="this.nextElementSibling.style.display=\'block\';this.style.display=\'none\'">Show Answer</button>' +
          '<div class="comprehension-q__answer">' + q.a + '</div>' +
          '</div>';
      }).join("");
    }
  }

  function completeLesson() {
    if (window.phonicsProgress) window.phonicsProgress.markComplete(lesson.id);
    window.location.href = "/lessons/";
  }

  function goNext() {
    if (currentStep < steps.length - 1) showStep(currentStep + 1);
    else if (isStoryLesson()) {
      showSecondReading();
    } else {
      completeLesson();
    }
  }

  function goPrev() { if (currentStep > 0) showStep(currentStep - 1); }

  // Keyboard shortcut overlay
  function toggleShortcutOverlay() {
    var existing = document.querySelector(".shortcut-overlay");
    if (existing) { existing.remove(); shortcutOverlayVisible = false; return; }
    shortcutOverlayVisible = true;
    var overlay = document.createElement("div");
    overlay.className = "shortcut-overlay";
    overlay.onclick = function () { overlay.remove(); shortcutOverlayVisible = false; };
    overlay.innerHTML =
      '<div class="shortcut-overlay__panel" onclick="event.stopPropagation()">' +
      '<div class="shortcut-overlay__title">Keyboard Shortcuts</div>' +
      '<div class="shortcut-overlay__grid">' +
      '<span class="shortcut-overlay__key">Space</span><span class="shortcut-overlay__desc">Move pointer</span>' +
      '<span class="shortcut-overlay__key">M</span><span class="shortcut-overlay__desc">Move pointer</span>' +
      '<span class="shortcut-overlay__key">P</span><span class="shortcut-overlay__desc">Pause / Resume</span>' +
      '<span class="shortcut-overlay__key">R</span><span class="shortcut-overlay__desc">Reset pointer</span>' +
      '<span class="shortcut-overlay__key">&larr; &rarr;</span><span class="shortcut-overlay__desc">Previous / Next step</span>' +
      '<span class="shortcut-overlay__key">1-9</span><span class="shortcut-overlay__desc">Jump to step</span>' +
      '<span class="shortcut-overlay__key">Esc</span><span class="shortcut-overlay__desc">Exit lesson</span>' +
      '<span class="shortcut-overlay__key">Shift + ?</span><span class="shortcut-overlay__desc">Toggle this overlay</span>' +
      '</div>' +
      '<div class="shortcut-overlay__close">Press Shift + ? or click outside to close</div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  // Expose to inline onclick
  window.moveDot = animateDot;
  window.pauseDot = playPause;
  window.playPause = playPause;
  window.resetDot = resetDotPosition;
  window.nextStep = goNext;
  window.prevStep = goPrev;
  window.togglePointerVisibility = togglePointerVisibility;
  window.completeLesson = completeLesson;

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (!lessonDataEl) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    // ? toggle shortcut overlay
    if (e.key === "?" || (e.shiftKey && e.key === "/")) {
      e.preventDefault();
      toggleShortcutOverlay();
      return;
    }

    // Close overlay with Escape
    if (shortcutOverlayVisible && e.key === "Escape") {
      e.preventDefault();
      toggleShortcutOverlay();
      return;
    }

    // Number keys 1-9 to jump to step
    if (e.key >= "1" && e.key <= "9" && !e.ctrlKey && !e.metaKey) {
      var stepIndex = parseInt(e.key, 10) - 1;
      if (stepIndex < steps.length) { e.preventDefault(); showStep(stepIndex); }
      return;
    }

    switch (e.key) {
      case "ArrowRight": e.preventDefault(); goNext(); break;
      case "ArrowLeft": e.preventDefault(); goPrev(); break;
      case " ": e.preventDefault(); playPause(); break;
      case "Escape": e.preventDefault(); window.location.href = "/lessons/"; break;
      case "m": if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); playPause(); } break;
      case "p": if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); playPause(); } break;
      case "r": if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); resetDotPosition(); } break;
    }
  });

  document.addEventListener("DOMContentLoaded", function () { showStep(0); });
})();
