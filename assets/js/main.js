/* TIIP Community — interactive behaviors */
(function () {
  "use strict";

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
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

  /* ---- Psyche diagram (model page) ---- */
  var psycheData = {
    qalb: {
      title: "Qalb — The Spiritual Heart",
      body: "The qalb is the seat of perception, faith, and moral cognition — the spiritual center where guidance and disease both take root. In TIIP, much of the therapeutic work aims to restore the heart’s clarity (ṣafāʾ al-qalb) and remove spiritual veils that distort thought and behavior."
    },
    aql: {
      title: "ʿAql — The Intellect",
      body: "The ʿaql is the faculty of reason and discernment that distinguishes benefit from harm. Strengthening the intellect’s authority over impulse is central to cognitive and behavioral change within the model."
    },
    ruh: {
      title: "Rūḥ — The Spirit",
      body: "The rūḥ is the divine breath animating the human being and its connection to the transcendent. Nurturing the rūḥ through worship, remembrance, and meaning is a core pathway to psychological well-being."
    },
    nafs: {
      title: "Nafs — The Self / Ego",
      body: "The nafs encompasses the appetitive drives and lower impulses that, unregulated, pull a person toward harm. TIIP frames healing partly as the disciplining and refinement of the nafs — from the commanding self toward the tranquil self (al-nafs al-muṭmaʾinnah)."
    }
  };
  var detail = document.getElementById("psyche-detail");
  if (detail) {
    document.querySelectorAll(".psyche-node").forEach(function (node) {
      node.addEventListener("click", function () {
        document.querySelectorAll(".psyche-node").forEach(function (n) { n.classList.remove("active"); });
        node.classList.add("active");
        var key = node.getAttribute("data-key");
        var d = psycheData[key];
        if (d) {
          detail.innerHTML = "<span class='tag teal'>Faculty of the soul</span><h3>" + d.title + "</h3><p>" + d.body + "</p>";
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

  /* ---- Mock login modal ---- */
  var overlay = document.getElementById("login-modal");
  function openModal() { if (overlay) overlay.classList.add("open"); }
  function closeModal() { if (overlay) overlay.classList.remove("open"); }
  document.querySelectorAll("[data-open-login]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
  });
  document.querySelectorAll("[data-close-login]").forEach(function (b) {
    b.addEventListener("click", closeModal);
  });
  if (overlay) {
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    var form = overlay.querySelector("form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = overlay.querySelector(".demo-pill");
        if (msg) { msg.textContent = "✓ Demo only — member accounts are not active in this mock-up."; }
      });
    }
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

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
