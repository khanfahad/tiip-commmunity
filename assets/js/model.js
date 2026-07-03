/* TIIP model showcase — dedicated interactions for model.html */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Header + scroll progress
  --------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress-bar");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 30);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Mobile nav
  --------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  /* ---------------------------------------------------------
     Reveal on scroll (with stagger via --d set in markup)
  --------------------------------------------------------- */
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------------------------------------------------
     Section dots scrollspy
  --------------------------------------------------------- */
  var dotLinks = document.querySelectorAll(".dots-nav a");
  if (dotLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          dotLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    dotLinks.forEach(function (a) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target) spy.observe(target);
    });
  }

  /* ---------------------------------------------------------
     Hero constellation canvas
  --------------------------------------------------------- */
  var canvas = document.getElementById("constellation");
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var W, H, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(110, Math.floor((W * H) / 16000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.6 + 0.5,
          gold: Math.random() < 0.3
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      var linkDist = 130;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        // gentle drift away from the cursor
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var md = dx * dx + dy * dy;
        if (md < 22500) {
          var f = (22500 - md) / 22500;
          p.x += (dx / Math.sqrt(md + 0.01)) * f * 0.9;
          p.y += (dy / Math.sqrt(md + 0.01)) * f * 0.9;
        }
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? "rgba(216,165,65,0.75)" : "rgba(139,219,210,0.55)";
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var ddx = p.x - q.x, ddy = p.y - q.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(139,219,210," + (0.14 * (1 - d / linkDist)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    resize();
    tick();
  }

  /* ---------------------------------------------------------
     Hero count-up stats
  --------------------------------------------------------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null, dur = 1400;
    function frame(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.firstChild.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(frame);
    }
    el.innerHTML = "0<i>" + suffix + "</i>";
    if (prefersReduced) { el.firstChild.textContent = target; return; }
    requestAnimationFrame(frame);
  }
  var stats = document.querySelectorAll("[data-count]");
  if (stats.length && "IntersectionObserver" in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); statIO.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) { statIO.observe(el); });
  } else {
    stats.forEach(countUp);
  }

  /* ---------------------------------------------------------
     Cursor glow on panels
  --------------------------------------------------------- */
  document.querySelectorAll(".panel").forEach(function (panel) {
    panel.addEventListener("pointermove", function (e) {
      var r = panel.getBoundingClientRect();
      panel.style.setProperty("--mx", (e.clientX - r.left) + "px");
      panel.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------------------------------------------------------
     Orbital psyche diagram
  --------------------------------------------------------- */
  var psycheData = {
    qalb: {
      ar: "قلب",
      title: "Qalb — The Metaphysical Heart",
      role: "Homeostatic center · locus of health & pathology",
      body: "Distinct from the physical heart yet interacting with it, the qalb is the locus of the human being — the container of both health and dysfunction. Its condition rises and falls with the state of every other element that feeds into it: thought, drive, emotion, and spirit alike.",
      heal: "The end-goal of all treatment: <em>qalb salīm</em> — a sound heart — reached when every element of the psyche is balanced and unified (<em>ittiḥād</em>)."
    },
    fitrah: {
      ar: "فطرة",
      title: "Fiṭrah — Primordial Essence",
      role: "The innate moral compass · encompasses everything",
      body: "“Every child is born upon the fiṭrah” — a primordially endowed capacity to recognize good and evil and to distinguish truth from falsehood. Developmental research echoes it: infants as young as 6–10 months socially evaluate others and prefer those who help over those who hinder.",
      heal: "The fiṭrah is never treated — it is uncovered. Therapy clears away what obscures this innate inclination toward the good and toward the divine."
    },
    aql: {
      ar: "عقل",
      title: "ʾAql — Cognition",
      role: "The rational faculty · “the mind behind the brain”",
      body: "The governing source of reasoning, knowledge, judgment of consequences, and even regulation of emotion. The brain is its necessary instrument — but the ʾaql is the executive that wills, intends, and reasons through it. Damage the instrument and the faculty cannot express itself.",
      heal: "Treated through reflection and psychoeducation: engendering an actively contemplative mind and dismantling cognitive distortions."
    },
    nafs: {
      ar: "نفس",
      title: "Nafs — Behavioral Inclination",
      role: "Instinctual drives · shahwah & ghaḍab",
      body: "Not inherently evil. The nafs houses the appetitive (<em>shahwah</em>) and aggressive/survival (<em>ghaḍab</em>) drives — necessary forces that, when unregulated, command toward excess. Trained, they ascend through three Qur'anic stations toward tranquility.",
      heal: "Treated through <em>mukhālafat al-nafs</em> — positive opposition of the self: confronting discomfort and resisting the avoidance behaviors that feed the pathological cycle."
    },
    ihsas: {
      ar: "إحساس",
      title: "Iḥsās — Emotion",
      role: "The felt experience · byproduct of the interplay",
      body: "Emotions arise from hidden or overt thinking (ʾaql) or from the primitive drives of the nafs — 'guests from the divine,' in Rumi's words. Emotional expression sits on a spectrum: too little anger leaves you defenseless; too much destroys. Health is the calibrated middle.",
      heal: "Treated by evoking and expressing maladaptive emotion in session, then transforming it into balanced, adaptive expression."
    },
    ruh: {
      ar: "روح",
      title: "Rūḥ — Spirit",
      role: "Two forces · the heavenly & the animal spirit",
      body: "The <em>rūḥ ʿulwī samāwī</em> longs for reconnection with the divine; the <em>rūḥ ḥayawānī</em> is the life-force animating the body. Its chief nourishment is <em>dhikr</em> — remembrance of God — which research links to parasympathetic calm, improved emotion regulation, and reduced clinical anxiety.",
      heal: "Treated by clearing spiritual diseases first, then filling the void with remembrance, righteous action, and virtuous character."
    },
    ijtimai: {
      ar: "اجتماعي",
      title: "Ijtimāʿī — The Communal Layer",
      role: "The outer layer · family, community & surroundings",
      body: "The psyche never turns in a vacuum. Ibn Khaldūn called compassion for one's kin a divine gift placed in the hearts of men, and al-Ghazālī observed that society constantly shapes our inclinations, feelings, and thoughts. Communally influenced inclinations interact with every element within.",
      heal: "Treatment considers the person within their family, community, and environment — enlisting the surroundings as part of healing rather than ignoring them."
    }
  };

  var detail = document.getElementById("psy-detail");
  var psyNodes = document.querySelectorAll(".psy-hotspot");
  function renderPsyche(key) {
    var d = psycheData[key];
    if (!d || !detail) return;
    detail.classList.add("switching");
    setTimeout(function () {
      detail.querySelector(".big-ar").textContent = d.ar;
      detail.querySelector("h3").textContent = d.title;
      detail.querySelector(".role").textContent = d.role;
      detail.querySelector(".body").innerHTML = d.body;
      detail.querySelector(".heal-txt").innerHTML = d.heal;
      detail.classList.remove("switching");
    }, 240);
  }
  var psyOrder = ["fitrah", "aql", "ruh", "ihsas", "nafs", "qalb", "ijtimai"];
  psyNodes.forEach(function (node) {
    node.addEventListener("click", function () {
      psyNodes.forEach(function (n) { n.classList.remove("active"); });
      node.classList.add("active");
      renderPsyche(node.getAttribute("data-key"));
    });
    node.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var i = psyOrder.indexOf(node.getAttribute("data-key"));
        var next = psyOrder[(i + (e.key === "ArrowRight" ? 1 : psyOrder.length - 1)) % psyOrder.length];
        var el = document.querySelector('.psy-hotspot[data-key="' + next + '"]');
        if (el) { el.focus(); el.click(); }
      }
    });
  });

  /* ---------------------------------------------------------
     Process of change — sticky stage scrollspy
  --------------------------------------------------------- */
  var stageCards = document.querySelectorAll(".stage-card");
  var stageNum = document.querySelector(".stages-side .stage-num");
  var stageWord = document.querySelector(".stages-side .stage-word");
  var stageSide = document.querySelector(".stages-side");
  var meterBars = document.querySelectorAll(".stage-meter i");
  var stageWords = ["مُرابَطة", "مُكاشَفة", "مُعالَجة", "مُواصَلة"];
  if (stageCards.length && "IntersectionObserver" in window) {
    var stageIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var idx = Array.prototype.indexOf.call(stageCards, en.target);
        stageCards.forEach(function (c, i) { c.classList.toggle("active", i === idx); });
        meterBars.forEach(function (m, i) { m.classList.toggle("done", i <= idx); });
        if (stageSide && stageNum && stageWord) {
          stageSide.classList.add("switching");
          setTimeout(function () {
            stageNum.textContent = "0" + (idx + 1);
            stageWord.textContent = stageWords[idx];
            stageSide.classList.remove("switching");
          }, 180);
        }
      });
    }, { rootMargin: "-42% 0px -42% 0px" });
    stageCards.forEach(function (c) { stageIO.observe(c); });
  } else {
    stageCards.forEach(function (c) { c.classList.add("active"); });
  }

  /* ---------------------------------------------------------
     Case study stepper
  --------------------------------------------------------- */
  var caseBtns = document.querySelectorAll(".case-step-btn");
  var casePanels = document.querySelectorAll(".case-panel");
  var caseCount = document.querySelector(".case-nav .count");
  var casePrev = document.querySelector("[data-case-prev]");
  var caseNext = document.querySelector("[data-case-next]");
  var caseIdx = 0;
  function setCase(idx) {
    caseIdx = Math.max(0, Math.min(idx, casePanels.length - 1));
    caseBtns.forEach(function (b, i) {
      b.classList.toggle("active", i === caseIdx);
      b.setAttribute("aria-selected", i === caseIdx ? "true" : "false");
    });
    casePanels.forEach(function (p, i) { p.classList.toggle("active", i === caseIdx); });
    if (caseCount) caseCount.textContent = (caseIdx + 1) + " / " + casePanels.length;
    if (casePrev) casePrev.disabled = caseIdx === 0;
    if (caseNext) caseNext.disabled = caseIdx === casePanels.length - 1;
  }
  caseBtns.forEach(function (btn, i) {
    btn.addEventListener("click", function () { setCase(i); });
  });
  if (casePrev) casePrev.addEventListener("click", function () { setCase(caseIdx - 1); });
  if (caseNext) caseNext.addEventListener("click", function () { setCase(caseIdx + 1); });
  if (casePanels.length) setCase(0);

  /* ---------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------- */
  document.querySelectorAll(".acc-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var item = head.closest(".acc-item");
      var body = item.querySelector(".acc-body");
      var open = item.classList.contains("open");
      var acc = item.closest(".accordion");
      if (acc && acc.hasAttribute("data-single")) {
        acc.querySelectorAll(".acc-item.open").forEach(function (it) {
          if (it !== item) {
            it.classList.remove("open");
            it.querySelector(".acc-body").style.maxHeight = null;
            it.querySelector(".acc-head").setAttribute("aria-expanded", "false");
          }
        });
      }
      item.classList.toggle("open", !open);
      head.setAttribute("aria-expanded", String(!open));
      body.style.maxHeight = open ? null : body.scrollHeight + "px";
    });
  });
  document.querySelectorAll(".acc-item.open .acc-body").forEach(function (body) {
    body.style.maxHeight = body.scrollHeight + "px";
  });

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
