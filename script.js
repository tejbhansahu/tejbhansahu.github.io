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

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
