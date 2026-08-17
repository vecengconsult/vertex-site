(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var loaderFill = document.getElementById("loaderFill");
  var loaderPct = document.getElementById("loaderPct");
  var loader = document.querySelector(".loader");
  var headline = document.getElementById("headline");
  var subtext = document.getElementById("subtext");
  var cta = document.getElementById("cta");
  var footerLine = document.getElementById("footerLine");

  var SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&+=*";

  function revealFinalContent() {
    subtext.classList.add("is-visible");
    setTimeout(function () {
      cta.classList.add("is-visible");
    }, 160);
    setTimeout(function () {
      footerLine.classList.add("is-visible");
    }, 420);
  }

  /* ---------- Decode / scramble effect for a single line ---------- */

  function decodeLine(span, callback) {
    var finalText = span.getAttribute("data-final") || span.textContent;
    var chars = finalText.split("");
    var revealed = new Array(chars.length).fill(false);
    var frame = 0;
    var framesPerReveal = 2; // how many ticks before locking in the next character
    var tickMs = 28;

    span.classList.add("is-decoding");

    function render() {
      var out = "";
      for (var i = 0; i < chars.length; i++) {
        if (chars[i] === " ") {
          out += " ";
          continue;
        }
        if (revealed[i]) {
          out += chars[i];
        } else {
          out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      span.textContent = out;
    }

    function tick() {
      frame++;

      // reveal one more character every `framesPerReveal` ticks
      var revealCount = Math.min(chars.length, Math.floor(frame / framesPerReveal));
      for (var i = 0; i < revealCount; i++) {
        revealed[i] = true;
      }

      render();

      var allRevealed = revealCount >= chars.length;
      if (!allRevealed) {
        setTimeout(tick, tickMs);
      } else {
        span.textContent = finalText;
        if (callback) callback();
      }
    }

    tick();
  }

  function decodeHeadline() {
    var lines = headline.querySelectorAll(".line");
    var total = lines.length;
    var completed = 0;

    lines.forEach(function (line, idx) {
      setTimeout(function () {
        decodeLine(line, function () {
          completed++;
          if (completed === total) {
            setTimeout(revealFinalContent, 200);
          }
        });
      }, idx * 260);
    });
  }

  /* ---------- Loader progress ---------- */

  function runLoader() {
    var duration = 1100;
    var start = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (start === null) start = timestamp;
      var elapsed = timestamp - start;
      var t = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(t);
      var pct = Math.round(eased * 100);

      loaderFill.style.width = (eased * 100) + "%";
      loaderPct.textContent = (pct < 10 ? "0" : "") + pct + "%";

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        loaderPct.textContent = "100%";
        setTimeout(function () {
          loader.style.animation = "none";
          loader.style.transition = "opacity 0.5s ease";
          loader.style.opacity = "0";
          decodeHeadline();
        }, 220);
      }
    }

    requestAnimationFrame(step);
  }

  /* ---------- Reduced motion fallback ---------- */

  function showEverythingInstantly() {
    loader.style.display = "none";
    var lines = headline.querySelectorAll(".line");
    lines.forEach(function (line) {
      line.textContent = line.getAttribute("data-final");
      line.classList.add("is-decoding");
    });
    subtext.classList.add("is-visible");
    cta.classList.add("is-visible");
    footerLine.classList.add("is-visible");
  }

  /* ---------- Init ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    if (prefersReducedMotion) {
      showEverythingInstantly();
    } else {
      runLoader();
    }
  });
})();
