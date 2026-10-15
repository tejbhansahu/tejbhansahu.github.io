/* =========================================================
   Tejbhan Sahu — Portfolio interactions & Live Fluid Canvas
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Theme toggle with smooth transition class ---- */
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
      root.classList.add("theme-transitioning");
      var isLight = root.getAttribute("data-theme") === "light";
      if (isLight) { root.removeAttribute("data-theme"); store("dark"); }
      else { root.setAttribute("data-theme", "light"); store("light"); }
      setTimeout(function () { root.classList.remove("theme-transitioning"); }, 400);
    });
  }

  /* ---- Scroll Progress Indicator ---- */
  var scrollBar = document.getElementById("scrollProgress");
  function updateScroll() {
    if (!scrollBar) return;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    scrollBar.style.width = Math.min(Math.max(progress, 0), 100) + "%";
  }
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  /* ---- Nav: mobile menu & scroll elevation ---- */
  var nav = document.querySelector(".nav");
  var navInner = document.querySelector(".nav__inner");
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
  window.addEventListener("scroll", function () {
    if (navInner) {
      if (window.scrollY > 24) navInner.classList.add("is-scrolled");
      else navInner.classList.remove("is-scrolled");
    }
  }, { passive: true });

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

  /* ---- Unified 3D Tilt & Cursor Spotlight System ---- */
  var tiltCards = [].slice.call(document.querySelectorAll("[data-tilt], .principle, .card, .hero__card"));
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    tiltCards.forEach(function (card) {
      var frame;
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        // Set spotlight coordinates
        card.style.setProperty("--mouse-x", x.toFixed(1) + "px");
        card.style.setProperty("--mouse-y", y.toFixed(1) + "px");

        // Compute 3D rotation angles
        var rx = ((y / rect.height) - 0.5) * -7;
        var ry = ((x / rect.width) - 0.5) * 7;

        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          card.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateZ(3px)";
        });
      });

      card.addEventListener("mouseleave", function () {
        cancelAnimationFrame(frame);
        card.style.transform = "";
        card.style.setProperty("--mouse-x", "50%");
        card.style.setProperty("--mouse-y", "50%");
      });
    });

    /* ---- Ambient pointer inertia drift ---- */
    var orb1 = document.querySelector(".orb--1");
    var orb2 = document.querySelector(".orb--2");
    if (orb1 && orb2) {
      var mouseFrame;
      window.addEventListener("mousemove", function (e) {
        cancelAnimationFrame(mouseFrame);
        mouseFrame = requestAnimationFrame(function () {
          var nx = (e.clientX / window.innerWidth - 0.5) * 40;
          var ny = (e.clientY / window.innerHeight - 0.5) * 40;
          orb1.style.transform = "translate3d(" + nx.toFixed(1) + "px, " + ny.toFixed(1) + "px, 0)";
          orb2.style.transform = "translate3d(" + (-nx * 0.75).toFixed(1) + "px, " + (-ny * 0.75).toFixed(1) + "px, 0)";
        });
      }, { passive: true });
    }
  }

  /* ---- Smooth Ambient Pointer Aura ---- */
  var aura = document.getElementById("cursorAura");
  if (aura && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    var auraX = window.innerWidth / 2, auraY = window.innerHeight / 2;
    var targetAuraX = auraX, targetAuraY = auraY;
    var auraVisible = false;
    var auraFrame;

    window.addEventListener("mousemove", function (e) {
      targetAuraX = e.clientX;
      targetAuraY = e.clientY;
      if (!auraVisible) {
        auraVisible = true;
        aura.style.opacity = "1";
      }
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      auraVisible = false;
      aura.style.opacity = "0";
    });

    function loopAura() {
      auraX += (targetAuraX - auraX) * 0.08;
      auraY += (targetAuraY - auraY) * 0.08;
      aura.style.transform = "translate3d(" + (auraX - 260).toFixed(1) + "px, " + (auraY - 260).toFixed(1) + "px, 0)";
      auraFrame = requestAnimationFrame(loopAura);
    }
    auraFrame = requestAnimationFrame(loopAura);
  }

  /* ---- Dynamic Telemetry Badge Text Rotator ---- */
  var badgeTextEl = document.getElementById("badgeText");
  if (badgeTextEl && !prefersReduced) {
    var titles = [
      "Open to senior Android roles",
      "6+ Yrs · 1M+ Scale · 99% Crash-Free",
      "Architecture & Compose Specialist",
      "Airtel · Saregama · Maps & 3D Depth"
    ];
    var titleIdx = 0;
    setInterval(function () {
      badgeTextEl.classList.add("is-switching");
      setTimeout(function () {
        titleIdx = (titleIdx + 1) % titles.length;
        badgeTextEl.textContent = titles[titleIdx];
        badgeTextEl.classList.remove("is-switching");
      }, 250);
    }, 4200);
  }

  /* ---- Magnetic Button Micro-Interactions ---- */
  var magneticBtns = [].slice.call(document.querySelectorAll(".hero__cta .btn, .nav__actions .btn"));
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    magneticBtns.forEach(function (btn) {
      btn.classList.add("btn--magnetic");
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var bx = e.clientX - rect.left - rect.width / 2;
        var by = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate3d(" + (bx * 0.22).toFixed(1) + "px, " + (by * 0.22).toFixed(1) + "px, 0)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---- Interactive Audio Equalizer Wave on Saregama Card ---- */
  var audioWave = document.querySelector(".card__audio-wave");
  if (audioWave) {
    var waveParentCard = audioWave.closest(".card");
    if (waveParentCard) {
      var bars = [].slice.call(audioWave.querySelectorAll("span"));
      waveParentCard.addEventListener("mousemove", function (e) {
        var rect = waveParentCard.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width;
        bars.forEach(function (bar, i) {
          var energy = Math.sin((relX * 6.0) + (i * 1.2)) * 0.4 + 0.6;
          bar.style.transform = "scaleY(" + Math.max(0.2, energy).toFixed(2) + ")";
        });
      });
      waveParentCard.addEventListener("mouseleave", function () {
        bars.forEach(function (bar) { bar.style.transform = ""; });
      });
    }
  }

  /* =========================================================
     Live Code-Driven Hero Fluid Wave Canvas (WebGL + Fallback)
     ========================================================= */
  function initFluidHeroCanvas() {
    var canvas = document.getElementById("heroFluidCanvas");
    var hero = document.getElementById("hero") || document.querySelector(".hero");
    if (!canvas || !hero) return;

    var gl = null;
    try {
      gl = canvas.getContext("webgl", { alpha: false, depth: false, antialias: true, powerPreference: "high-performance" }) ||
           canvas.getContext("experimental-webgl");
    } catch (e) {
      gl = null;
    }

    if (!gl) {
      initCanvas2DFallback(canvas, hero);
      return;
    }

    var vertexSrc = [
      "attribute vec2 a_pos;",
      "void main() {",
      "  gl_Position = vec4(a_pos, 0.0, 1.0);",
      "}"
    ].join("\n");

    var fragmentSrc = [
      "#ifdef GL_FRAGMENT_PRECISION_HIGH",
      "precision highp float;",
      "#else",
      "precision mediump float;",
      "#endif",
      "",
      "uniform vec2 u_resolution;",
      "uniform vec2 u_mouse;",
      "uniform float u_time;",
      "uniform float u_scroll;",
      "uniform float u_theme;",
      "uniform vec3 u_click;",
      "",
      "float wave(vec2 p, float t) {",
      "  p *= 1.35;",
      "  vec2 q = vec2(",
      "    sin(p.x * 1.8 + t * 0.38 + p.y * 0.8),",
      "    cos(p.y * 1.9 - t * 0.32 + p.x * 0.7)",
      "  );",
      "  vec2 r = vec2(",
      "    sin(q.x * 2.5 + p.x * 1.2 + t * 0.45 + q.y * 0.9),",
      "    cos(q.y * 2.4 + p.y * 1.3 - t * 0.40 - q.x * 0.8)",
      "  );",
      "  float w1 = sin((p.x + r.x * 0.6) * 1.8 + t * 0.52);",
      "  float w2 = cos((p.y + r.y * 0.6) * 2.1 - t * 0.44);",
      "  float w3 = sin(dot(p + r * 0.4, vec2(1.4, 1.8)) - t * 0.6);",
      "",
      "  vec2 mDiff = p - u_mouse * 1.35;",
      "  float mDist = length(mDiff);",
      "  float mWave = sin(mDist * 14.0 - t * 5.0) * exp(-mDist * 2.8) * 0.35;",
      "",
      "  float dt = t - u_click.z;",
      "  float clickWave = 0.0;",
      "  if (dt > 0.0 && dt < 2.5) {",
      "    vec2 cDiff = p - u_click.xy * 1.35;",
      "    float cDist = length(cDiff);",
      "    float ring = abs(cDist - dt * 2.4);",
      "    clickWave = sin(ring * 22.0) * exp(-ring * 6.0) * exp(-dt * 1.4) * 0.5;",
      "  }",
      "",
      "  return (w1 * 0.45 + w2 * 0.35 + w3 * 0.20) + mWave + clickWave;",
      "}",
      "",
      "void main() {",
      "  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);",
      "  p.y += u_scroll * 0.35;",
      "",
      "  float t = u_time * 0.75;",
      "",
      "  float eps = 0.012;",
      "  float h = wave(p, t);",
      "  float hx = wave(p + vec2(eps, 0.0), t) - h;",
      "  float hy = wave(p + vec2(0.0, eps), t) - h;",
      "",
      "  vec3 norm = normalize(vec3(-hx * 4.5, -hy * 4.5, eps * 2.8));",
      "",
      "  vec2 lightPos = u_mouse * 0.8 + vec2(0.35, 0.45);",
      "  vec3 lightDir = normalize(vec3(lightPos - p * 0.5, 0.85));",
      "  vec3 viewDir = vec3(0.0, 0.0, 1.0);",
      "  vec3 halfDir = normalize(lightDir + viewDir);",
      "",
      "  float spec = pow(max(dot(norm, halfDir), 0.0), 22.0) * 0.9;",
      "  float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 3.0);",
      "",
      "  vec3 colGreen = vec3(0.24, 0.86, 0.52);",
      "  vec3 colCyan = vec3(0.22, 0.74, 0.97);",
      "  vec3 colPurple = vec3(0.65, 0.54, 0.98);",
      "",
      "  float ribbon = sin(p.x * 1.5 + h * 3.2 + t * 0.35);",
      "  vec3 fluidCol = mix(colCyan, colGreen, smoothstep(-0.35, 0.45, h));",
      "  fluidCol = mix(fluidCol, colPurple, smoothstep(0.1, 0.85, ribbon));",
      "",
      "  vec3 darkBase = vec3(0.065, 0.075, 0.095);",
      "  float darkAlpha = clamp((h * 0.48 + 0.36) + fresnel * 0.45, 0.0, 1.0);",
      "  vec3 darkResult = mix(darkBase, fluidCol, darkAlpha * 0.85) + spec * mix(colCyan, vec3(1.0), 0.55);",
      "",
      "  vec3 lightBase = vec3(0.91, 0.93, 0.95);",
      "  float lightAlpha = clamp((h * 0.30 + 0.22) + fresnel * 0.35, 0.0, 1.0);",
      "  vec3 lightResult = mix(lightBase, fluidCol * 0.65 + 0.35, lightAlpha * 0.55) + spec * vec3(1.0) * 0.75;",
      "",
      "  vec3 finalColor = mix(darkResult, lightResult, u_theme);",
      "",
      "  gl_FragColor = vec4(finalColor, 1.0);",
      "}"
    ].join("\n");

    function compileShader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("Shader error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    var vs = compileShader(gl.VERTEX_SHADER, vertexSrc);
    var fs = compileShader(gl.FRAGMENT_SHADER, fragmentSrc);
    if (!vs || !fs) {
      initCanvas2DFallback(canvas, hero);
      return;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(prog));
      initCanvas2DFallback(canvas, hero);
      return;
    }

    gl.useProgram(prog);

    // Full-screen quad
    var quadVerts = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    var aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_resolution");
    var uMouse = gl.getUniformLocation(prog, "u_mouse");
    var uTime = gl.getUniformLocation(prog, "u_time");
    var uScroll = gl.getUniformLocation(prog, "u_scroll");
    var uTheme = gl.getUniformLocation(prog, "u_theme");
    var uClick = gl.getUniformLocation(prog, "u_click");

    var width = 0, height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 300);
      height = Math.max(rect.height, 300);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    var mouseX = 0, mouseY = 0;
    var targetMouseX = 0, targetMouseY = 0;
    var lastMouseMove = Date.now();
    var clickData = [0, 0, -100];
    var currentTheme = (root.getAttribute("data-theme") === "light") ? 1.0 : 0.0;
    var scrollOffset = 0, currentScroll = 0;
    var isHeroVisible = true;
    var animFrame = null;
    var startTime = performance.now();

    function onPointerMove(e) {
      var rect = hero.getBoundingClientRect();
      var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.width / 2);
      var clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.height / 2);

      // Normalize into aspect-adjusted coordinate
      var nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = nx;
      targetMouseY = ny;
      lastMouseMove = Date.now();
    }
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });

    hero.addEventListener("click", function (e) {
      var rect = hero.getBoundingClientRect();
      var nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      var tSec = (performance.now() - startTime) * 0.001;
      clickData = [nx, ny, tSec];
    });

    if ("IntersectionObserver" in window) {
      var heroObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isHeroVisible = entry.isIntersecting;
          if (isHeroVisible && !animFrame) {
            animFrame = requestAnimationFrame(render);
          }
        });
      }, { threshold: 0.05 });
      heroObs.observe(hero);
    }

    function render(now) {
      if (!isHeroVisible) {
        animFrame = null;
        return;
      }

      var elapsed = (now - startTime) * 0.001;
      if (prefersReduced) elapsed *= 0.1;

      // Gentle auto-drift if no mouse interaction recently
      if (Date.now() - lastMouseMove > 2500) {
        targetMouseX = Math.sin(elapsed * 0.5) * 0.45;
        targetMouseY = Math.cos(elapsed * 0.4) * 0.35;
      }

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Smooth scroll lerp
      scrollOffset = window.scrollY / (window.innerHeight || 800);
      currentScroll += (scrollOffset - currentScroll) * 0.07;

      // Smooth theme lerp
      var targetTheme = (root.getAttribute("data-theme") === "light") ? 1.0 : 0.0;
      currentTheme += (targetTheme - currentTheme) * 0.08;

      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uScroll, currentScroll);
      gl.uniform1f(uTheme, currentTheme);
      gl.uniform3f(uClick, clickData[0], clickData[1], clickData[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrame = requestAnimationFrame(render);
    }

    animFrame = requestAnimationFrame(render);
  }

  /* ---- Canvas 2D Fallback for older or restricted environments ---- */
  function initCanvas2DFallback(canvas, hero) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var width = 0, height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    var mouseX = width / 2, mouseY = height / 2;
    window.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }, { passive: true });

    function render2D(now) {
      var t = now * 0.0012;
      var isLight = root.getAttribute("data-theme") === "light";
      ctx.clearRect(0, 0, width, height);

      // Draw multi-layer harmonic gradients
      var layers = [
        { color: isLight ? "rgba(15, 158, 88, 0.22)" : "rgba(61, 220, 132, 0.28)", speed: 0.7, freq: 0.003, amp: 40 },
        { color: isLight ? "rgba(2, 132, 199, 0.25)" : "rgba(56, 189, 248, 0.26)", speed: 0.5, freq: 0.002, amp: 55 },
        { color: isLight ? "rgba(124, 92, 255, 0.20)" : "rgba(167, 139, 250, 0.22)", speed: 0.9, freq: 0.004, amp: 35 }
      ];

      layers.forEach(function (layer, idx) {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (var x = 0; x <= width; x += 15) {
          var mouseInfluence = Math.exp(-Math.pow((x - mouseX) / 250, 2)) * 30;
          var y = (height * 0.4) + Math.sin(x * layer.freq + t * layer.speed + idx) * layer.amp + mouseInfluence;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      });

      requestAnimationFrame(render2D);
    }
    requestAnimationFrame(render2D);
  }

  // Initialize live fluid canvas
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFluidHeroCanvas);
  } else {
    initFluidHeroCanvas();
  }

  /* ---- Smooth Back to top handlers ---- */
  function scrollToTop(e) {
    if (e && e.preventDefault) e.preventDefault();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReduced ? "auto" : "smooth"
    });
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  var backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", scrollToTop);
  }

  var floatingTop = document.getElementById("floatingTop");
  if (floatingTop) {
    floatingTop.addEventListener("click", scrollToTop);
    function checkFloatingTop() {
      if (window.scrollY > 450) {
        floatingTop.classList.add("is-visible");
      } else {
        floatingTop.classList.remove("is-visible");
      }
    }
    window.addEventListener("scroll", checkFloatingTop, { passive: true });
    checkFloatingTop();
  }

  /* =========================================================
     Project Category Filters
     ========================================================= */
  var filterChips = [].slice.call(document.querySelectorAll(".filter-chip"));
  var projectCards = [].slice.call(document.querySelectorAll(".projects .card[data-category]"));
  if (filterChips.length && projectCards.length) {
    filterChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var category = chip.getAttribute("data-filter");
        filterChips.forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-selected", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-selected", "true");

        projectCards.forEach(function (card) {
          var cardCat = card.getAttribute("data-category");
          if (category === "all" || cardCat === category) {
            card.classList.remove("is-hidden");
          } else {
            card.classList.add("is-hidden");
          }
        });
      });
    });
  }

  /* =========================================================
     Architecture Deep Dive Modal Data & Controller
     ========================================================= */
  var deepDiveData = {
    saregama: {
      title: "Saregama Padhanisa",
      subtitle: "AI Vocal Training · 1M+ Downloads · 69% → 99% Crash-Free",
      challenge: "The consumer app suffered from a 69% crash-free rate and 500+ recurring ANRs caused by heavy real-time pitch-detection DSP algorithms executing on the main UI thread during microphone audio recording.",
      architecture: [
        "<strong>Threading Isolation:</strong> Offloaded acoustic pitch detection to a dedicated coroutine pipeline bound to <code>Dispatchers.Default</code> with structured concurrency and cooperative cancellation.",
        "<strong>ExoPlayer Audio Pipeline:</strong> Built a custom <code>AudioProcessor</code> extracting raw PCM float buffers into a zero-allocation circular buffer directly feeding a Jetpack Compose waveform Canvas renderer.",
        "<strong>WebRTC & Live Video:</strong> Encapsulated 100ms video call synchronization in a foreground service managing microphone audio focus and device orientation changes."
      ],
      metrics: [
        { num: "69% → 99%", desc: "Crash-free rate jump" },
        { num: "500+", desc: "Main-thread ANRs eliminated" },
        { num: "1M+", desc: "Active Play Store downloads" },
        { num: "4.5 ★", desc: "Average store rating" }
      ],
      stack: ["Kotlin", "Jetpack Compose", "Coroutines & Flow", "ExoPlayer", "100ms WebRTC", "FCM"]
    },
    airtel: {
      title: "Airtel Fiverse",
      subtitle: "Enterprise Fiber Planning · 500+ Cities · Offline First",
      challenge: "Field engineers had to navigate and edit massive 500MB+ GIS datasets, fiber routes, and 3D utility assets across remote Indian regions with intermittent 2G/3G connectivity without experiencing OOM crashes or sync collisions.",
      architecture: [
        "<strong>Offline-First Sync Engine:</strong> Designed a multi-table Room database sync queue with SQLite <code>@Transaction</code> batching, WorkManager exponential backoff, and selective delta reconciliation.",
        "<strong>Filament 3D & ARCore:</strong> Rendered 3D fiber distribution hubs and utility poles using Google Filament inside an isolated SurfaceView with GLB caching and aggressive Level-of-Detail (LOD) mesh reduction.",
        "<strong>Spatial Quadtree Maps:</strong> Custom cluster manager for Google Maps SDK with quadtree spatial indexing supporting 100,000+ vector markers at 60 FPS."
      ],
      metrics: [
        { num: "99.2%", desc: "Crash-free production rate" },
        { num: "500+", desc: "Cities deployed across India" },
        { num: "40%", desc: "Reduction in field battery drain" },
        { num: "500MB+", desc: "Offline dataset synced safely" }
      ],
      stack: ["Kotlin", "Compose", "Room", "WorkManager", "Hilt", "Maps SDK", "ARCore", "Filament 3D"]
    },
    bharatcattle: {
      title: "BharatCattle",
      subtitle: "Livestock Marketplace · Real-Time Search & Geolocation",
      challenge: "Agricultural buyers and sellers operating low-cost devices needed instantaneous listing discovery, multi-attribute filtering, location-based proximity sorting, and secure payments.",
      architecture: [
        "<strong>Clean Architecture & MVVM:</strong> Decoupled UI state from domain use cases with Firebase Firestore offline persistence and real-time snapshot listeners.",
        "<strong>Proximity Geohashing:</strong> Integrated Google Play Services Location SDK with geohash bounds querying for low-latency nearby livestock filtering.",
        "<strong>Memory & Image Pipeline:</strong> Lazy pagination and compressed cache layer cutting app startup time by 25% on entry-level Android devices."
      ],
      metrics: [
        { num: "100K+", desc: "Users served" },
        { num: "25%", desc: "Faster startup and screen loads" },
        { num: "18%", desc: "Increase in buyer engagement" },
        { num: "4 devs", desc: "Engineering team led" }
      ],
      stack: ["Kotlin", "MVVM", "Firebase Firestore", "Android Location Services", "Razorpay"]
    },
    drl: {
      title: "DRL MyFlexa",
      subtitle: "Telehealth Platform · Dr. Reddy's Laboratories",
      challenge: "Delivering real-time teleconsultations, appointment reminders, and an interactive anatomical pain heat-map for 2,000+ patients with strict privacy and reliability.",
      architecture: [
        "<strong>Custom Anatomical Canvas:</strong> Interactive touch-responsive pain heat-map drawn on custom Android Canvas across 10+ body anatomical zones with vector hit-testing and RGB gradient interpolation.",
        "<strong>Dual-Channel Communication:</strong> Persistent WebSocket layer for real-time consultation notifications and clinical chat, paired with low-latency WebRTC video streaming.",
        "<strong>Resilient Room Caching:</strong> Offline consultation history, prescription vault, and encrypted patient profile storage."
      ],
      metrics: [
        { num: "2K+", desc: "Patients onboarded" },
        { num: "35%", desc: "Reduction in network API calls" },
        { num: "0", desc: "Dropped consultation handshakes" },
        { num: "10+", desc: "Body anatomical heat-map zones" }
      ],
      stack: ["Kotlin", "WebRTC", "ExoPlayer", "Custom Canvas", "WebSocket", "Room SQLite"]
    },
    cengage: {
      title: "Cengage Digital",
      subtitle: "Offline EdTech Platform · 15K+ Active Students",
      challenge: "Delivering offline DRM-protected textbooks, video chapters, and adaptive quizzes to 15,000+ students in low-connectivity areas while preventing unauthorized content duplication.",
      architecture: [
        "<strong>AES-256 Crypto Pipeline:</strong> Hardware-backed cryptographic decryption with Android Keystore for secure local chapter caching and watermarking.",
        "<strong>Adaptive Quiz State Machine:</strong> Client-side Finite State Machine (FSM) assessing student answers offline and reconciling performance metrics with the cloud upon reconnection.",
        "<strong>Payment Integrity:</strong> Razorpay SDK integration with offline intent verification and cryptographically signed local receipt tokens."
      ],
      metrics: [
        { num: "100K+", desc: "Play Store downloads" },
        { num: "15K+", desc: "Active offline students" },
        { num: "99.4%", desc: "Payment success rate" },
        { num: "AES-256", desc: "Hardware-backed DRM encryption" }
      ],
      stack: ["Kotlin", "Room", "AES-256", "State Machine", "Razorpay SDK"]
    },
    cicr: {
      title: "CICR Cotton",
      subtitle: "AgriTech Field Mapping & Multilingual Advisory",
      challenge: "Providing localized crop disease diagnostics, weather telemetry, and field GPS boundary mapping to rural farmers in Hindi, Marathi, and English without requiring constant mobile data.",
      architecture: [
        "<strong>Offline GIS & Polygons:</strong> Google Maps SDK polygon boundary mapping backed by Room SQLite offline coordinate storage.",
        "<strong>Dynamic Locale Switching:</strong> Runtime localization switching (Hindi, Marathi, English) without memory leaks or configuration recreation loops."
      ],
      metrics: [
        { num: "100%", desc: "Functional offline without cellular data" },
        { num: "3", desc: "Supported languages (Hindi, Marathi, English)" },
        { num: "GIS", desc: "Field polygon boundary mapping" }
      ],
      stack: ["Kotlin", "Google Maps SDK", "Room", "Android i18n"]
    }
  };

  var deepDiveModal = document.getElementById("deepDiveModal");
  var deepDiveTitle = document.getElementById("deepDiveTitle");
  var deepDiveSubtitle = document.getElementById("deepDiveSubtitle");
  var deepDiveBody = document.getElementById("deepDiveBody");
  var closeDeepDive = document.getElementById("closeDeepDive");

  function openDeepDive(key) {
    var data = deepDiveData[key];
    if (!data || !deepDiveModal) return;
    deepDiveTitle.textContent = data.title;
    deepDiveSubtitle.textContent = data.subtitle;

    var metricsHtml = data.metrics.map(function (m) {
      return '<div class="deepdive__metric-box">' +
               '<div class="deepdive__metric-num">' + m.num + '</div>' +
               '<div class="deepdive__metric-desc">' + m.desc + '</div>' +
             '</div>';
    }).join("");

    var archHtml = data.architecture.map(function (item) {
      return '<p>' + item + '</p>';
    }).join("");

    var stackHtml = data.stack.map(function (s) {
      return '<span>' + s + '</span>';
    }).join("");

    deepDiveBody.innerHTML =
      '<div class="deepdive__section">' +
        '<h4>Engineering Challenge</h4>' +
        '<p>' + data.challenge + '</p>' +
      '</div>' +
      '<div class="deepdive__section">' +
        '<h4>Architecture & Implementation</h4>' +
        archHtml +
      '</div>' +
      '<div class="deepdive__section">' +
        '<h4>Key Outcomes & Metrics</h4>' +
        '<div class="deepdive__grid">' + metricsHtml + '</div>' +
      '</div>' +
      '<div class="deepdive__section">' +
        '<h4>Tech Stack</h4>' +
        '<div class="deepdive__tech-chips">' + stackHtml + '</div>' +
      '</div>';

    deepDiveModal.classList.add("is-open");
    deepDiveModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeAllModals() {
    [deepDiveModal, resumeModal, cmdPaletteModal].forEach(function (m) {
      if (m) {
        m.classList.remove("is-open");
        m.setAttribute("aria-hidden", "true");
      }
    });
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-deepdive]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-deepdive");
      openDeepDive(key);
    });
  });

  if (closeDeepDive) closeDeepDive.addEventListener("click", closeAllModals);
  if (deepDiveModal) {
    deepDiveModal.addEventListener("click", function (e) {
      if (e.target === deepDiveModal) closeAllModals();
    });
  }

  /* =========================================================
     Résumé Quick Preview Modal Controller
     ========================================================= */
  var resumeModal = document.getElementById("resumeModal");
  var resumeBtn = document.getElementById("resumePreviewBtn");
  var mobileResumeBtn = document.getElementById("mobileResumeBtn");
  var closeResume = document.getElementById("closeResumeModal");

  function openResumeModal() {
    if (!resumeModal) return;
    resumeModal.classList.add("is-open");
    resumeModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  if (resumeBtn) resumeBtn.addEventListener("click", openResumeModal);
  if (mobileResumeBtn) {
    mobileResumeBtn.addEventListener("click", function () {
      if (nav) nav.classList.remove("is-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
      openResumeModal();
    });
  }
  if (closeResume) closeResume.addEventListener("click", closeAllModals);
  if (resumeModal) {
    resumeModal.addEventListener("click", function (e) {
      if (e.target === resumeModal) closeAllModals();
    });
  }

  /* =========================================================
     Command Palette (Cmd + K) Controller
     ========================================================= */
  var cmdPaletteModal = document.getElementById("cmdPaletteModal");
  var cmdToggle = document.getElementById("cmdToggle");
  var cmdInput = document.getElementById("cmdInput");
  var cmdList = document.getElementById("cmdList");

  var cmdCommands = [
    { title: "Download Résumé (PDF)", category: "Actions", icon: "M12 15.5 7 10.5l1.4-1.4 2.6 2.6V3h2v8.7l2.6-2.6L17 10.5l-5 5ZM5 19h14v2H5v-2Z", action: function () {
      var a = document.createElement("a"); a.href = "assets/resume.pdf"; a.download = "Tejbhan_Sahu_Resume.pdf"; a.click();
    }},
    { title: "Preview Résumé in Browser", category: "Actions", icon: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z", action: openResumeModal },
    { title: "Copy Email Address", category: "Actions", badge: "tejbhansahu0.ts@gmail.com", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", action: function () {
      navigator.clipboard.writeText("tejbhansahu0.ts@gmail.com"); alert("Email copied to clipboard!");
    }},
    { title: "Call Phone Number", category: "Actions", badge: "+91 73506 90287", icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", action: function () {
      window.location.href = "tel:+917350690287";
    }},
    { title: "Toggle Color Theme (Dark / Light)", category: "Actions", icon: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z", action: function () {
      var t = document.getElementById("themeToggle"); if (t) t.click();
    }},
    { title: "Open Android ADB Logcat Console", category: "Actions", badge: "Drawer", icon: "M4 17l6-6-6-6m8 14h8", action: function () {
      var d = document.getElementById("logcatDrawer"); if (d) d.classList.add("is-open");
    }},
    { title: "Jump to Companies & Clients", category: "Navigation", icon: "m9 18 6-6-6-6", action: function () { document.getElementById("clients").scrollIntoView({ behavior: "smooth" }); }},
    { title: "Jump to About Section", category: "Navigation", icon: "m9 18 6-6-6-6", action: function () { document.getElementById("about").scrollIntoView({ behavior: "smooth" }); }},
    { title: "Jump to Impact Metrics", category: "Navigation", icon: "m9 18 6-6-6-6", action: function () { document.getElementById("impact").scrollIntoView({ behavior: "smooth" }); }},
    { title: "Jump to Experience Timeline", category: "Navigation", icon: "m9 18 6-6-6-6", action: function () { document.getElementById("experience").scrollIntoView({ behavior: "smooth" }); }},
    { title: "Jump to Featured Projects", category: "Navigation", icon: "m9 18 6-6-6-6", action: function () { document.getElementById("projects").scrollIntoView({ behavior: "smooth" }); }},
    { title: "Jump to Skills & Tech Stack", category: "Navigation", icon: "m9 18 6-6-6-6", action: function () { document.getElementById("skills").scrollIntoView({ behavior: "smooth" }); }},
    { title: "Jump to Contact", category: "Navigation", icon: "m9 18 6-6-6-6", action: function () { document.getElementById("contact").scrollIntoView({ behavior: "smooth" }); }},
    { title: "Project: Saregama Padhanisa (Architecture)", category: "Projects", badge: "1M+ Downloads", icon: "m12 2 10 5-10 5-10-5 10-5Z", action: function () { openDeepDive("saregama"); }},
    { title: "Project: Airtel Fiverse (Architecture)", category: "Projects", badge: "500+ Cities", icon: "m12 2 10 5-10 5-10-5 10-5Z", action: function () { openDeepDive("airtel"); }},
    { title: "Project: DRL MyFlexa (Architecture)", category: "Projects", badge: "Telehealth", icon: "m12 2 10 5-10 5-10-5 10-5Z", action: function () { openDeepDive("drl"); }},
    { title: "Project: BharatCattle (Architecture)", category: "Projects", badge: "Marketplace", icon: "m12 2 10 5-10 5-10-5 10-5Z", action: function () { openDeepDive("bharatcattle"); }},
    { title: "Project: Cengage Digital (Architecture)", category: "Projects", badge: "100K+ Users", icon: "m12 2 10 5-10 5-10-5 10-5Z", action: function () { openDeepDive("cengage"); }},
    { title: "Open GitHub Profile", category: "Socials", badge: "@tejbhansahu", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", action: function () { window.open("https://github.com/tejbhansahu", "_blank"); }},
    { title: "Open LinkedIn Profile", category: "Socials", badge: "in/tejbhan-sahu", icon: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z", action: function () { window.open("https://www.linkedin.com/in/tejbhan-sahu-23704689", "_blank"); }}
  ];

  var activeCmdIndex = 0;
  function renderCommands(query) {
    if (!cmdList) return;
    var q = (query || "").toLowerCase().trim();
    var filtered = cmdCommands.filter(function (cmd) {
      return !q || cmd.title.toLowerCase().indexOf(q) !== -1 || (cmd.badge && cmd.badge.toLowerCase().indexOf(q) !== -1) || cmd.category.toLowerCase().indexOf(q) !== -1;
    });

    if (!filtered.length) {
      cmdList.innerHTML = '<li class="cmd-palette__group-title">No matching commands</li>';
      return;
    }

    var currentCat = "";
    var html = "";
    filtered.forEach(function (cmd, idx) {
      if (cmd.category !== currentCat) {
        currentCat = cmd.category;
        html += '<li class="cmd-palette__group-title">' + currentCat + '</li>';
      }
      var isSel = idx === activeCmdIndex ? " is-selected" : "";
      html += '<li class="cmd-palette__item' + isSel + '" data-cmd-idx="' + idx + '" role="option">' +
                '<div class="cmd-palette__item-left">' +
                  '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="' + cmd.icon + '"/></svg>' +
                  '<span>' + cmd.title + '</span>' +
                '</div>' +
                (cmd.badge ? '<span class="cmd-palette__badge">' + cmd.badge + '</span>' : '') +
              '</li>';
    });
    cmdList.innerHTML = html;

    // Attach click handlers
    cmdList.querySelectorAll(".cmd-palette__item").forEach(function (el) {
      el.addEventListener("click", function () {
        var idx = parseInt(el.getAttribute("data-cmd-idx"), 10);
        closeAllModals();
        if (filtered[idx] && filtered[idx].action) filtered[idx].action();
      });
    });
  }

  function openCommandPalette() {
    if (!cmdPaletteModal) return;
    cmdPaletteModal.classList.add("is-open");
    cmdPaletteModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    activeCmdIndex = 0;
    if (cmdInput) {
      cmdInput.value = "";
      renderCommands("");
      setTimeout(function () { cmdInput.focus(); }, 50);
    }
  }

  if (cmdToggle) cmdToggle.addEventListener("click", openCommandPalette);
  if (cmdPaletteModal) {
    cmdPaletteModal.addEventListener("click", function (e) {
      if (e.target === cmdPaletteModal) closeAllModals();
    });
  }
  if (cmdInput) {
    cmdInput.addEventListener("input", function () {
      activeCmdIndex = 0;
      renderCommands(cmdInput.value);
    });
    cmdInput.addEventListener("keydown", function (e) {
      var items = cmdList.querySelectorAll(".cmd-palette__item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeCmdIndex = (activeCmdIndex + 1) % Math.max(1, items.length);
        renderCommands(cmdInput.value);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeCmdIndex = (activeCmdIndex - 1 + items.length) % Math.max(1, items.length);
        renderCommands(cmdInput.value);
      } else if (e.key === "Enter") {
        e.preventDefault();
        var selected = cmdList.querySelector(".cmd-palette__item.is-selected");
        if (selected) selected.click();
      }
    });
  }

  // Global Keyboard Shortcuts (Cmd+K and ESC)
  window.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdPaletteModal && cmdPaletteModal.classList.contains("is-open")) {
        closeAllModals();
      } else {
        openCommandPalette();
      }
    } else if (e.key === "Escape") {
      closeAllModals();
      var drawer = document.getElementById("logcatDrawer");
      if (drawer) drawer.classList.remove("is-open");
    }
  });

  /* =========================================================
     ADB Logcat Drawer & Terminal Simulator (Easter Egg)
     ========================================================= */
  var logcatDrawer = document.getElementById("logcatDrawer");
  var logcatToggle = document.getElementById("logcatToggle");
  var logcatClose = document.getElementById("logcatClose");
  var logcatClear = document.getElementById("logcatClear");
  var logcatTerminal = document.getElementById("logcatTerminal");
  var logcatInput = document.getElementById("logcatInput");

  var sampleLogs = [
    { tag: "I", comp: "AndroidRuntime", msg: "Calling main entry point com.tejbhansahu.portfolio.MainActivity" },
    { tag: "D", comp: "HiltEngine", msg: "Injected ProfileComponent: 6+ yrs experience, 1M+ downloads, 99.2% crash-free" },
    { tag: "I", comp: "JetpackCompose", msg: "Recomposition skip count: 99.4% (zero jank observed on 120Hz display)" },
    { tag: "D", comp: "ExoPlayer", msg: "AudioProcessor PCM buffer connected to Compose Canvas waveform renderer" },
    { tag: "I", comp: "RoomWorkManager", msg: "Offline sync queue verified for 500+ cities with exponential backoff" },
    { tag: "D", comp: "Filament3D", msg: "GLB asset shader cache warm; LOD level 0 active" },
    { tag: "I", comp: "Crashlytics", msg: "ANR rate: 0.00% · Fatal crash rate: 0.08% (Production scale: 1M+ users)" }
  ];

  function addLogLine(tag, comp, msg) {
    if (!logcatTerminal) return;
    var now = new Date();
    var timeStr = ("0" + (now.getMonth() + 1)).slice(-2) + "-" +
                  ("0" + now.getDate()).slice(-2) + " " +
                  ("0" + now.getHours()).slice(-2) + ":" +
                  ("0" + now.getMinutes()).slice(-2) + ":" +
                  ("0" + now.getSeconds()).slice(-2) + "." +
                  ("00" + now.getMilliseconds()).slice(-3);
    var div = document.createElement("div");
    div.className = "logcat-entry";
    div.innerHTML = '<span class="logcat-time">' + timeStr + '</span> ' +
                    '<span class="logcat-tag--' + tag.toLowerCase() + '">' + tag + '/' + comp + ':</span> ' +
                    '<span class="logcat-msg">' + msg + '</span>';
    logcatTerminal.appendChild(div);
    logcatTerminal.scrollTop = logcatTerminal.scrollHeight;
  }

  var logcatLoaded = false;
  function toggleLogcatDrawer() {
    if (!logcatDrawer) return;
    var isOpen = logcatDrawer.classList.toggle("is-open");
    if (isOpen && !logcatLoaded) {
      logcatLoaded = true;
      sampleLogs.forEach(function (l, i) {
        setTimeout(function () { addLogLine(l.tag, l.comp, l.msg); }, i * 140);
      });
      setTimeout(function () {
        addLogLine("I", "LogcatCLI", "Ready. Type 'help' to inspect Android system commands.");
        if (logcatInput) logcatInput.focus();
      }, sampleLogs.length * 140 + 100);
    } else if (isOpen && logcatInput) {
      logcatInput.focus();
    }
  }

  if (logcatToggle) logcatToggle.addEventListener("click", toggleLogcatDrawer);

  if (logcatClose && logcatDrawer) {
    logcatClose.addEventListener("click", function () {
      logcatDrawer.classList.remove("is-open");
    });
  }

  if (logcatClear && logcatTerminal) {
    logcatClear.addEventListener("click", function () {
      logcatTerminal.innerHTML = "";
      addLogLine("I", "LogcatCLI", "Terminal buffer cleared. Type 'help' for commands.");
    });
  }

  if (logcatInput) {
    logcatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var cmd = logcatInput.value.trim().toLowerCase();
        logcatInput.value = "";
        if (!cmd) return;
        addLogLine("I", "UserPrompt", "$ " + cmd);

        switch (cmd) {
          case "help":
            addLogLine("I", "Help", "Available commands: 'skills', 'experience', 'projects', 'stats', 'contact', 'theme', 'clear', 'exit'");
            break;
          case "skills":
            addLogLine("D", "Skills", "Kotlin, Jetpack Compose, Coroutines/Flow, MVVM/MVI, Room, Hilt, ExoPlayer, Maps SDK, Filament 3D");
            break;
          case "experience":
            addLogLine("D", "Experience", "InnovationM (Lead Android) · Squareboat (Mobile Engineer L1) · Techtonic (Android Developer)");
            break;
          case "projects":
            addLogLine("D", "Projects", "1. Saregama Padhanisa · 2. Airtel Fiverse · 3. BharatCattle · 4. DRL MyFlexa · 5. Cengage Digital · 6. CICR Cotton");
            break;
          case "stats":
            addLogLine("D", "Stats", "6+ Years Experience · 1M+ Installs · 99.2% Crash-Free · 500+ ANRs Removed · 5 Devs Led");
            break;
          case "contact":
            addLogLine("I", "Contact", "Email: tejbhansahu0.ts@gmail.com | Phone: +91 73506 90287 | Location: Maharashtra, India");
            break;
          case "theme":
            var t = document.getElementById("themeToggle"); if (t) t.click();
            addLogLine("I", "Theme", "Theme switched successfully.");
            break;
          case "clear":
            if (logcatTerminal) logcatTerminal.innerHTML = "";
            break;
          case "exit":
            if (logcatDrawer) logcatDrawer.classList.remove("is-open");
            break;
          default:
            addLogLine("W", "UnknownCommand", "Command not recognized: '" + cmd + "'. Type 'help' for command list.");
        }
      }
    });
  }
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
