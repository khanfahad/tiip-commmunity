/* TIIP Community — interactive behaviors */
(function () {
  "use strict";

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Active nav link by path ---- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "index.html" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ---- Psyche diagram (model page) — the six elements of the TIIP ontological model ---- */
  var psycheData = {
    qalb: {
      label: "The metaphysical heart",
      title: "Qalb (قلب) — The Heart",
      body: "The homeostatic center of the entire model — a container of both health and pathology. Its condition rises and falls with the ʾaql, nafs, iḥsās, and rūḥ that feed into it. The ultimate aim of treatment is <em>qalb salīm</em>: a sound, balanced heart, reached through <em>ittiḥād</em> (integrative unity)."
    },
    fitrah: {
      label: "Primordial essence",
      title: "Fiṭrah (فطرة) — Primordial Essence",
      body: "Every human is “born upon the fiṭrah” — a primordially endowed faculty to recognize good and evil and distinguish truth from falsehood. Contemporary research on infant moral cognition echoes this idea of an innate moral compass."
    },
    aql: {
      label: "Cognition",
      title: "ʾAql (عقل) — Cognition",
      body: "The rational faculty behind sound reasoning, knowledge, appreciation of consequences, and the regulation of emotion. It is “the mind behind the brain”: the brain is the necessary instrument, but the ʾaql is the executive that wills, intends, and reasons."
    },
    ruh: {
      label: "Spirit",
      title: "Rūḥ (روح) — Spirit",
      body: "Operates through <em>rūḥ ʿulwī samāwī</em> (a longing for the sacred) and <em>rūḥ ḥayawānī</em> (the animating life force). It is nourished chiefly through <em>dhikr</em> — remembrance of God — which research links to measurable shifts in glucose metabolism, prefrontal activation, and parasympathetic calm."
    },
    nafs: {
      label: "Behavioral inclination",
      title: "Nafs (نفس) — Inclination",
      body: "Houses the appetitive (<em>shahwah</em>) and aggressive/survival (<em>ghaḍab</em>) drives, moving through three states: <em>ammārah</em> (commanding toward overindulgence), <em>lawwāmah</em> (self-regulating), and <em>muṭmaʾinnah</em> (the tranquil self, no longer shackled by carnal desire)."
    },
    ihsas: {
      label: "Basic emotions",
      title: "Iḥsās (إحساس) — Emotion",
      body: "The visible byproduct of the interplay between ʾaql and nafs. TIIP treats emotion as a spectrum to be regulated rather than suppressed — the goal is balance across the full range of emotional intensity."
    }
  };
  var detail = document.getElementById("psyche-detail");
  if (detail) {
    var nodes = document.querySelectorAll(".psyche-node, .psyche-core[data-key]");
    nodes.forEach(function (node) {
      node.addEventListener("click", function () {
        nodes.forEach(function (n) { n.classList.remove("active"); });
        node.classList.add("active");
        var d = psycheData[node.getAttribute("data-key")];
        if (d) {
          detail.innerHTML = "<span class='tag teal'>" + d.label + "</span><h3>" + d.title + "</h3><p>" + d.body + "</p>";
        }
      });
    });
  }

  /* ---- Tabs ---- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var btns = group.querySelectorAll(".tab-btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        group.querySelectorAll(".tab-panel").forEach(function (p) {
          p.classList.toggle("active", p.getAttribute("data-panel") === target);
        });
      });
    });
  });

  /* ---- Accordion ---- */
  document.querySelectorAll(".acc-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var item = head.closest(".acc-item");
      var body = item.querySelector(".acc-body");
      var open = item.classList.contains("open");
      // optional: close siblings
      var accordion = item.closest(".accordion");
      if (accordion && accordion.hasAttribute("data-single")) {
        accordion.querySelectorAll(".acc-item.open").forEach(function (it) {
          if (it !== item) { it.classList.remove("open"); it.querySelector(".acc-body").style.maxHeight = null; }
        });
      }
      item.classList.toggle("open", !open);
      body.style.maxHeight = open ? null : body.scrollHeight + "px";
    });
  });

  /* ---- Portal nav (community page) ---- */
  document.querySelectorAll(".portal-nav button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var view = btn.getAttribute("data-view");
      document.querySelectorAll(".portal-nav button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      document.querySelectorAll(".portal-view").forEach(function (v) {
        v.classList.toggle("active", v.getAttribute("data-view") === view);
      });
    });
  });

  /* ---- Filter chips (resources / events) ---- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var chips = group.querySelectorAll(".chip");
    var targets = document.querySelectorAll("[data-cat]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        targets.forEach(function (t) {
          var show = f === "all" || t.getAttribute("data-cat") === f;
          t.classList.toggle("hidden", !show);
        });
      });
    });
  });

  /* ---- Mock modals (login + register) ---- */
  var modals = [];
  function setupModal(id, openAttr, closeAttr, submitMsg) {
    var overlay = document.getElementById(id);
    document.querySelectorAll("[" + openAttr + "]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        modals.forEach(function (m) { m.classList.remove("open"); });
        if (overlay) overlay.classList.add("open");
      });
    });
    if (!overlay) return;
    modals.push(overlay);
    document.querySelectorAll("[" + closeAttr + "]").forEach(function (b) {
      b.addEventListener("click", function () { overlay.classList.remove("open"); });
    });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.classList.remove("open"); });
    var form = overlay.querySelector("form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = overlay.querySelector(".demo-pill");
        if (msg) { msg.textContent = submitMsg; }
      });
    }
  }
  setupModal("login-modal", "data-open-login", "data-close-login",
    "✓ Demo only — member accounts are not active in this mock-up.");
  setupModal("register-modal", "data-open-register", "data-close-register",
    "✓ Demo only — in production you would now be a TIIP Trainee (Level 0).");
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      modals.forEach(function (m) { m.classList.remove("open"); });
      if (links && links.classList.contains("open")) {
        links.classList.remove("open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  /* ---- Header shadow + back-to-top on scroll ---- */
  var header = document.querySelector(".site-header");
  var topBtn = document.createElement("button");
  topBtn.className = "back-to-top";
  topBtn.type = "button";
  topBtn.setAttribute("aria-label", "Back to top");
  topBtn.innerHTML = "↑";
  topBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.body.appendChild(topBtn);
  var scrollTick = false;
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    topBtn.classList.toggle("show", window.scrollY > 600);
    scrollTick = false;
  }
  window.addEventListener("scroll", function () {
    if (!scrollTick) { scrollTick = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
