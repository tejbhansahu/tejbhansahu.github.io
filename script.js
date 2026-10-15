/* =========================================================
   Tejbhan Sahu — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Theme toggle (remembers choice, respects system) ---- */
  var toggle = document.getElementById("themeToggle");
  function getStored() { try { return localStorage.getItem("theme"); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem("theme", v); } catch (e) {} }

  var stored = getStored();
  if (stored === "light") {
    root.setAttribute("data-theme", "light");
  } else if (!stored && window.matchMedia &&
             window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var isLight = root.getAttribute("data-theme") === "light";
      if (isLight) { root.removeAttribute("data-theme"); store("dark"); }
      else { root.setAttribute("data-theme", "light"); store("light"); }
    });
  }

  /* ---- Nav: mobile menu ---- */
  var nav = document.querySelector(".nav");
  var burger = document.getElementById("navBurger");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Active link highlighting ---- */
  var sections = [].slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = [].slice.call(document.querySelectorAll(".nav__links a"));
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Reveal on scroll ---- */
  var revealTargets = [].slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !prefersReduced) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el) { revealer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Animated stat counters ---- */
  var statNums = [].slice.call(document.querySelectorAll(".stat__num[data-count]"));
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (String(target).split(".")[1] || "").length;
    var start = null, dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = (decimals ? target.toFixed(decimals) : target) + suffix;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !prefersReduced && statNums.length) {
    var counterObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    statNums.forEach(function (el) { counterObs.observe(el); });
  }

  /* ---- Copy email ---- */
  var copyBtn = document.getElementById("copyEmail");
  var emailLink = document.getElementById("emailLink");
  if (copyBtn && emailLink) {
    copyBtn.addEventListener("click", function () {
      var email = emailLink.textContent.trim();
      var done = function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = "Copied ✓";
        setTimeout(function () { copyBtn.textContent = original; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else { done(); }
    });
  }

  /* ---- Subtle parallax tilt on hero card (pointer only) ---- */
  var heroCard = document.querySelector(".hero__card");
  if (heroCard && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    var frame;
    heroCard.addEventListener("mousemove", function (e) {
      var r = heroCard.getBoundingClientRect();
      var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        heroCard.style.transform = "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
    });
    heroCard.addEventListener("mouseleave", function () {
      cancelAnimationFrame(frame);
      heroCard.style.transform = "";
    });
  }

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
