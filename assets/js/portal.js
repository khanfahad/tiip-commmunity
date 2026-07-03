/* TIIP Community — Member Portal prototype
   All data is demo data persisted to localStorage. Production requires
   a secure backend (auth, RBAC enforcement, encrypted storage). */
(function () {
  "use strict";

  var LS_KEY = "tiip-portal-demo-v1";
  var DAY = 86400000;
  function today(offset) { return new Date(Date.now() + (offset || 0) * DAY); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
  }

  /* ---------------------------------------------------------
     Roles (RBAC demo)
  --------------------------------------------------------- */
  var ROLES = {
    trainee:      { label: "Trainee · Level III", name: "Amina Yusuf" },
    practitioner: { label: "Certified Practitioner", name: "Dr. Bilal Rahman" },
    supervisor:   { label: "Supervisor / Scholar", name: "Dr. Hana Qadri" },
    admin:        { label: "Admin", name: "Musa Adem" }
  };

  /* ---------------------------------------------------------
     Seed data
  --------------------------------------------------------- */
  function seedState() {
    return {
      role: "trainee",
      hours: [
        { date: iso(today(-24)), hours: 3, type: "Direct client work", notes: "Sessions 1–2, iḥsāsi focus", status: "approved" },
        { date: iso(today(-17)), hours: 4, type: "Live supervision", notes: "Two-chair work review", status: "approved" },
        { date: iso(today(-9)),  hours: 2.5, type: "Case consultation", notes: "Waswasah differential", status: "approved" },
        { date: iso(today(-2)),  hours: 3, type: "Direct client work", notes: "Nafs inventory session", status: "pending" }
      ],
      approvedSeed: 118.5, /* previously credited hours */
      casesDone: 6,
      certs: [
        { name: "Ethics in Teletherapy (3 CE)", cat: "ceu", credits: 3, issued: iso(today(-320)), expires: iso(today(45)) },
        { name: "Suicide Risk Assessment (6 CE)", cat: "ceu", credits: 6, issued: iso(today(-150)), expires: iso(today(215)) },
        { name: "Fiqh of Worship — Farḍ al-ʿAyn I", cat: "fard", credits: 12, issued: iso(today(-400)), expires: iso(today(-12)) },
        { name: "ʿAqīdah Essentials — Farḍ al-ʿAyn II", cat: "fard", credits: 10, issued: iso(today(-60)), expires: iso(today(305)) }
      ],
      cases: [
        { id: 1, alias: "Case H-30", primary: "Iḥsās", presenting: "Marital conflict; anger outbursts masking sadness from unmet connection needs.", aql: "Catastrophizing under activation; strong capacity for religious reframing.", nafs: "Avoidance (leaving home), approval-seeking, low frustration tolerance.", ruh: "Prayer soothes; weak riḍā bi-al-qaḍāʾ during conflict.", ihsas: "Secondary anger over primary sadness and helplessness.", shared: true, updated: iso(today(-5)) }
      ],
      tickets: [
        {
          id: 1, subject: "Scrupulosity vs. clinical OCD — repeated wudū", cat: "Waswasah / OCD", status: "answered",
          thread: [
            { author: "Amina Yusuf", role: "Trainee", text: "De-identified: adult client repeats wudū 5–7x citing doubt. ERP indicated clinically — is limiting repetition to the sunnah maximum defensible as an exposure target?", at: iso(today(-6)) },
            { author: "Shaykh Idris Kamal", role: "Scholar", text: "Yes. The sharīʿah itself caps repetition at three and instructs ignoring doubt after completion (yaqīn is not lifted by shakk). Framing ERP limits as adherence to the sunnah is sound and often therapeutic in itself.", at: iso(today(-4)) }
          ]
        },
        {
          id: 2, subject: "Custody guidance during separation counseling", cat: "Divorce & family fiqh", status: "open",
          thread: [
            { author: "Dr. Bilal Rahman", role: "Practitioner", text: "De-identified: couple in discernment counseling ask about Islamic custody presumptions across madhāhib to reduce catastrophizing. Seeking a summary suitable for psychoeducation.", at: iso(today(-1)) }
          ]
        }
      ],
      rsvps: {},
      pubs: [
        { title: "TIIP for adjustment disorder with anger features: a case series", type: "Case study", stage: "Internal review", authors: "Yusuf, Qadri", updated: iso(today(-8)) },
        { title: "Validation of a murāqabah-based emotion regulation protocol", type: "Empirical study", stage: "Draft", authors: "Rahman et al.", updated: iso(today(-19)) }
      ],
      forum: [
        {
          id: 1, name: "Tazkiyah & wellbeing", desc: "The practitioner's own heart",
          threads: [
            { id: 11, title: "Sustaining dhikr routines during heavy caseloads", author: "Dr. Hana Qadri", posts: [
              { author: "Dr. Hana Qadri", role: "Supervisor", text: "What anchors your remembrance when the calendar is full? I keep post-session adhkār to reset between clients.", at: iso(today(-3)) },
              { author: "Amina Yusuf", role: "Trainee", text: "Commute muraqaba has helped me more than anything — 10 minutes, phone away.", at: iso(today(-2)) }
            ] },
            { id: 12, title: "Countertransference after trauma sessions", author: "Dr. Bilal Rahman", posts: [
              { author: "Dr. Bilal Rahman", role: "Practitioner", text: "Looking for peer support norms after heavy testimony weeks. How do you debrief without breaching confidentiality?", at: iso(today(-7)) }
            ] }
          ]
        },
        {
          id: 2, name: "Clinical peer support", desc: "Methods, measures, referrals",
          threads: [
            { id: 21, title: "Urdu-language intake battery recommendations", author: "Amina Yusuf", posts: [
              { author: "Amina Yusuf", role: "Trainee", text: "Which validated Urdu measures pair well with the TIIP psychospiritual assessment?", at: iso(today(-4)) }
            ] }
          ]
        },
        { id: 3, name: "Trainee lounge", desc: "Cohort space for Levels I–III", threads: [] }
      ]
    };
  }

  var state;
  try { state = JSON.parse(localStorage.getItem(LS_KEY)) || seedState(); }
  catch (e) { state = seedState(); }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

  /* ---------------------------------------------------------
     Static datasets (read-only)
  --------------------------------------------------------- */
  var DIRECTORY = [
    { name: "Dr. Hana Qadri", cred: "PsyD · TIIP Supervisor", city: "Chicago, US", region: "Americas", tz: "America/Chicago", langs: ["English", "Urdu"], focus: ["Marital & family", "Trauma"], lic: "PSYPACT", accepting: true },
    { name: "Dr. Bilal Rahman", cred: "PhD, LCP · Certified", city: "Houston, US", region: "Americas", tz: "America/Chicago", langs: ["English", "Arabic"], focus: ["Anxiety & mood", "OCD / Waswasah"], lic: "PSYPACT", accepting: true },
    { name: "Amira Hassan", cred: "LMFT · Certified", city: "Toronto, CA", region: "Americas", tz: "America/Toronto", langs: ["English", "Arabic"], focus: ["Marital & family"], lic: "Canada", accepting: false },
    { name: "Dr. Selim Aydın", cred: "Clin. Psych · Certified", city: "Istanbul, TR", region: "Europe / Africa", tz: "Europe/Istanbul", langs: ["Turkish", "English"], focus: ["Anxiety & mood", "Youth & identity"], lic: "International", accepting: true },
    { name: "Maryam Siddiqui", cred: "MSc, HCPC · Certified", city: "London, UK", region: "Europe / Africa", tz: "Europe/London", langs: ["English", "Urdu"], focus: ["Trauma", "Youth & identity"], lic: "UK / EU", accepting: true },
    { name: "Dr. Omar Farouk", cred: "MD Psychiatry · Supervisor", city: "Cairo, EG", region: "Middle East", tz: "Africa/Cairo", langs: ["Arabic", "English"], focus: ["OCD / Waswasah", "Anxiety & mood"], lic: "International", accepting: true },
    { name: "Dr. Layla Nasser", cred: "PhD · Certified", city: "Dubai, AE", region: "Middle East", tz: "Asia/Dubai", langs: ["Arabic", "English"], focus: ["Addictions", "Trauma"], lic: "International", accepting: true },
    { name: "Yusuf Chaudhry", cred: "MS, LPC · Trainee III", city: "Lahore, PK", region: "South Asia", tz: "Asia/Karachi", langs: ["Urdu", "English"], focus: ["Anxiety & mood"], lic: "International", accepting: false },
    { name: "Dr. Fatima Malik", cred: "PhD · Certified", city: "Karachi, PK", region: "South Asia", tz: "Asia/Karachi", langs: ["Urdu", "English"], focus: ["Marital & family", "Addictions"], lic: "International", accepting: true },
    { name: "Nur Aisyah Binti Ahmad", cred: "MClinPsy · Certified", city: "Kuala Lumpur, MY", region: "SE Asia / Pacific", tz: "Asia/Kuala_Lumpur", langs: ["English"], focus: ["Youth & identity", "Anxiety & mood"], lic: "International", accepting: true },
    { name: "Dr. Kemal Demir", cred: "Clin. Psych · Supervisor", city: "Ankara, TR", region: "Europe / Africa", tz: "Europe/Istanbul", langs: ["Turkish"], focus: ["Trauma", "Marital & family"], lic: "International", accepting: true },
    { name: "Sarah Abdullah", cred: "LCSW · Certified", city: "New Jersey, US", region: "Americas", tz: "America/New_York", langs: ["English", "Arabic"], focus: ["OCD / Waswasah", "Youth & identity"], lic: "US state-specific", accepting: true }
  ];

  var RESOURCES = [
    { title: "TIIP Psychospiritual Intake Form", type: "Intake form", lang: "English", tags: ["assessment", "intake"], v: "3.2", updated: iso(today(-30)), history: "v3.2 — added rūḥānī functioning scale · v3.1 — consent language · v3.0 — full TIIP domain restructure" },
    { title: "نموذج التقييم النفسي الروحي", type: "Intake form", lang: "Arabic", tags: ["assessment", "intake"], v: "2.0", updated: iso(today(-64)), history: "v2.0 — reviewed by Cairo team · v1.0 — initial translation" },
    { title: "Nafs Inventory — Daily Behaviors Worksheet", type: "Worksheet", lang: "English", tags: ["nafs", "homework"], v: "1.4", updated: iso(today(-12)), history: "v1.4 — added frustration-tolerance column" },
    { title: "نفسانی رجحانات کی روزانہ فہرست", type: "Worksheet", lang: "Urdu", tags: ["nafs", "homework"], v: "1.1", updated: iso(today(-40)), history: "v1.1 — terminology alignment with Urdu glossary" },
    { title: "Murāqabah: Guided Divine-Proximity Exercise", type: "Murāqabah audio script", lang: "English", tags: ["ruh", "dhikr", "regulation"], v: "2.3", updated: iso(today(-8)), history: "v2.3 — 12-min variant · v2.0 — breath pacing cues" },
    { title: "Murakabe Rehberli Egzersiz Metni", type: "Murāqabah audio script", lang: "Turkish", tags: ["ruh", "dhikr"], v: "1.0", updated: iso(today(-90)), history: "v1.0 — initial translation (Istanbul cohort)" },
    { title: "Waswasah vs. OCD — Psychoeducation Handout", type: "Psychoeducation", lang: "English", tags: ["waswasah", "ocd", "psychoeducation"], v: "4.0", updated: iso(today(-5)), history: "v4.0 — scholar-reviewed rulings appendix · v3.x — clinical criteria table" },
    { title: "وسوسہ اور OCD میں فرق — نفسیاتی تعلیم", type: "Psychoeducation", lang: "Urdu", tags: ["waswasah", "ocd"], v: "2.1", updated: iso(today(-22)), history: "v2.1 — reviewed by Karachi team" },
    { title: "Two-Chair Dialogue (Spiritual Compassion Lens) Protocol", type: "Worksheet", lang: "English", tags: ["ihsas", "intervention"], v: "1.2", updated: iso(today(-15)), history: "v1.2 — safety framing for trauma histories" },
    { title: "استمارة الملاحظة الذاتية للقلب", type: "Worksheet", lang: "Arabic", tags: ["qalb", "self-monitoring"], v: "1.0", updated: iso(today(-70)), history: "v1.0 — initial release" }
  ];

  var EVENTS = [
    { id: "ev1", title: "TIIP Foundations Webinar", when: today(3), mins: 90, mode: "Webinar", link: "https://meet.example.org/tiip-foundations" },
    { id: "ev2", title: "Case Consultation Clinic (Live)", when: today(7), mins: 60, mode: "Clinic", link: "https://meet.example.org/case-clinic" },
    { id: "ev3", title: "Waswasah Differential — Scholar Roundtable", when: today(12), mins: 120, mode: "Roundtable", link: "https://meet.example.org/waswasah-roundtable" },
    { id: "ev4", title: "Level II Intensive — Weekend 1", when: today(19), mins: 480, mode: "Intensive", link: "https://meet.example.org/level2-intensive" },
    { id: "ev5", title: "Murāqabah Practicum for Clinicians", when: today(26), mins: 75, mode: "Practicum", link: "https://meet.example.org/muraqabah" }
  ];

  var ADMIN_USERS = [
    { name: "Amina Yusuf", role: "Trainee (Level III)" },
    { name: "Yusuf Chaudhry", role: "Trainee (Level II)" },
    { name: "Dr. Bilal Rahman", role: "Certified Practitioner" },
    { name: "Sarah Abdullah", role: "Certified Practitioner" },
    { name: "Dr. Hana Qadri", role: "Supervisor / Scholar" },
    { name: "Shaykh Idris Kamal", role: "Supervisor / Scholar" }
  ];

  /* ---------------------------------------------------------
     Shell: role switching, nav, router
  --------------------------------------------------------- */
  var navBtns = document.querySelectorAll(".p-nav button");
  var views = document.querySelectorAll(".view");
  var viewTitle = document.getElementById("view-title");
  var roleSelect = document.getElementById("role-select");

  var VIEW_TITLES = {
    dashboard: "Dashboard", directory: "Global Referral Directory", certification: "Level III Certification Tracker",
    vault: "Dual-Compliance Vault", sandbox: "TIIP Conceptualization Sandbox", fatwa: "Scholarly Consultation Desk",
    resources: "Multilingual Intervention Vault", incubator: "Publication Incubator", events: "Events & Training Calendar",
    forums: "Tazkiyah & Peer Forums"
  };

  function roleAllows(btn) {
    var roles = btn.getAttribute("data-roles");
    return roles === "all" || roles.split(",").indexOf(state.role) !== -1;
  }

  function applyRole() {
    var r = ROLES[state.role];
    document.getElementById("user-name").textContent = r.name;
    document.getElementById("user-role").textContent = r.label;
    document.getElementById("user-avatar").textContent = initials(r.name);
    roleSelect.value = state.role;
    navBtns.forEach(function (btn) {
      var ok = roleAllows(btn);
      btn.classList.toggle("locked", !ok);
      var lock = btn.querySelector(".lock");
      if (!ok && !lock) { lock = document.createElement("span"); lock.className = "lock"; lock.textContent = "🔒"; btn.appendChild(lock); }
      if (ok && lock) lock.remove();
    });
  }

  function show(view) {
    var btn = document.querySelector('.p-nav button[data-view="' + view + '"]');
    if (btn && !roleAllows(btn)) view = "dashboard";
    navBtns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-view") === view); });
    views.forEach(function (v) { v.classList.toggle("active", v.getAttribute("data-view") === view); });
    viewTitle.textContent = VIEW_TITLES[view] || "Portal";
    if (location.hash !== "#" + view) history.replaceState(null, "", "#" + view);
    renderView(view);
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("side-scrim").classList.remove("show");
  }

  navBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!roleAllows(btn)) return;
      show(btn.getAttribute("data-view"));
    });
  });

  roleSelect.addEventListener("change", function () {
    state.role = roleSelect.value; save();
    applyRole();
    show(location.hash.replace("#", "") || "dashboard");
  });

  document.getElementById("reset-demo").addEventListener("click", function () {
    if (confirm("Reset all demo data in this browser?")) {
      localStorage.removeItem(LS_KEY);
      state = seedState(); save(); applyRole(); show("dashboard");
    }
  });

  document.getElementById("menu-btn").addEventListener("click", function () {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("side-scrim").classList.add("show");
  });
  document.getElementById("side-scrim").addEventListener("click", function () {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("side-scrim").classList.remove("show");
  });

  /* ---------------------------------------------------------
     Renderers
  --------------------------------------------------------- */
  function renderView(view) {
    if (view === "dashboard") renderDashboard();
    if (view === "directory") renderDirectory();
    if (view === "certification") renderCert();
    if (view === "vault") renderVault();
    if (view === "sandbox") renderSandbox();
    if (view === "fatwa") renderFatwa();
    if (view === "resources") renderResources();
    if (view === "incubator") renderPubs();
    if (view === "events") renderEvents();
    if (view === "forums") renderForums();
  }

  /* ---- helpers for hours math ---- */
  function approvedHours() {
    return state.approvedSeed + state.hours.filter(function (h) { return h.status === "approved"; })
      .reduce(function (s, h) { return s + Number(h.hours); }, 0);
  }
  function pendingEntries() { return state.hours.filter(function (h) { return h.status === "pending"; }); }

  /* ---- Dashboard ---- */
  function renderDashboard() {
    var hrs = approvedHours();
    var openTickets = state.tickets.filter(function (t) { return t.status === "open"; }).length;
    var expiring = state.certs.filter(function (c) { return certStatus(c) !== "ok"; }).length;
    var leads = {
      trainee: "As-salāmu ʿalaykum, Amina. Your Level III pathway, compliance items, and cohort activity at a glance.",
      practitioner: "As-salāmu ʿalaykum, Dr. Rahman. Referrals, compliance, and consultation activity at a glance.",
      supervisor: "As-salāmu ʿalaykum, Dr. Qadri. Trainee approvals and scholar-desk queries awaiting you.",
      admin: "As-salāmu ʿalaykum, Musa. Platform health and member administration."
    };
    document.getElementById("dash-lead").textContent = leads[state.role];

    var tiles;
    if (state.role === "supervisor") {
      tiles = [
        { n: pendingEntries().length, l: "Hours awaiting approval" },
        { n: state.cases.filter(function (c) { return c.shared; }).length, l: "Shared case files" },
        { n: openTickets, l: "Open scholar queries" },
        { n: EVENTS.length, l: "Upcoming events" }
      ];
    } else if (state.role === "admin") {
      tiles = [
        { n: ADMIN_USERS.length, l: "Active members" },
        { n: DIRECTORY.length, l: "Directory listings" },
        { n: RESOURCES.length, l: "Vault resources" },
        { n: openTickets, l: "Open scholar queries" }
      ];
    } else {
      tiles = [
        { n: Math.round(hrs) + "<i>/200</i>", l: "Supervised hours" },
        { n: state.casesDone + "<i>/10</i>", l: "Completed cases" },
        { n: expiring, l: "Compliance alerts" },
        { n: EVENTS.length, l: "Upcoming events" }
      ];
    }
    document.getElementById("dash-stats").innerHTML = tiles.map(function (t) {
      return '<div class="stat"><div class="num">' + t.n + '</div><div class="lbl">' + t.l + "</div></div>";
    }).join("");

    var actions = {
      trainee: [["certification", "Log supervised hours"], ["sandbox", "Draft a conceptualization"], ["fatwa", "Ask a scholar"], ["resources", "Browse worksheets"]],
      practitioner: [["directory", "Find a referral"], ["vault", "Update CE records"], ["incubator", "Open research workspace"], ["fatwa", "Ask a scholar"]],
      supervisor: [["certification", "Review pending hours"], ["sandbox", "Review shared cases"], ["fatwa", "Answer scholar queries"], ["events", "Schedule a clinic"]],
      admin: [["directory", "Audit directory"], ["resources", "Publish a resource"], ["events", "Manage events"], ["forums", "Moderate forums"]]
    };
    document.getElementById("dash-actions").innerHTML = actions[state.role].map(function (a) {
      return '<button class="btn btn-ghost btn-xs" style="margin:4px 6px 4px 0;" data-go="' + a[0] + '">' + a[1] + "</button>";
    }).join("");
    document.querySelectorAll("#dash-actions [data-go]").forEach(function (b) {
      b.addEventListener("click", function () { show(b.getAttribute("data-go")); });
    });

    document.getElementById("dash-events").innerHTML = EVENTS.slice(0, 3).map(function (ev) {
      return '<div class="row"><span class="grow"><b>' + esc(ev.title) + "</b><small>" + fmtLocal(ev.when) + '</small></span><span class="tag">' + ev.mode + "</span></div>";
    }).join("");

    var adminCard = document.getElementById("dash-admin-card");
    adminCard.style.display = state.role === "admin" ? "block" : "none";
    if (state.role === "admin") {
      document.getElementById("admin-users").innerHTML = ADMIN_USERS.map(function (u, i) {
        return '<div class="row"><span class="grow"><b>' + esc(u.name) + '</b></span>' +
          '<select class="admin-role" data-i="' + i + '" style="background:var(--bg-2);color:var(--cream);border:1px solid var(--line);border-radius:8px;padding:5px 8px;font-size:.78rem;">' +
          ["Trainee (Level I)", "Trainee (Level II)", "Trainee (Level III)", "Certified Practitioner", "Supervisor / Scholar", "Admin"].map(function (r) {
            return "<option" + (r === u.role ? " selected" : "") + ">" + r + "</option>";
          }).join("") + "</select></div>";
      }).join("");
      document.querySelectorAll(".admin-role").forEach(function (sel) {
        sel.addEventListener("change", function () { ADMIN_USERS[Number(sel.getAttribute("data-i"))].role = sel.value; });
      });
    }
  }

  /* ---- Directory ---- */
  function renderDirectory() {
    var q = (document.getElementById("dir-q").value || "").toLowerCase();
    var lang = document.getElementById("dir-lang").value;
    var tz = document.getElementById("dir-tz").value;
    var focus = document.getElementById("dir-focus").value;
    var lic = document.getElementById("dir-lic").value;
    var list = DIRECTORY.filter(function (d) {
      if (q && (d.name + " " + d.city + " " + d.focus.join(" ") + " " + d.cred).toLowerCase().indexOf(q) === -1) return false;
      if (lang && d.langs.indexOf(lang) === -1) return false;
      if (tz && d.region !== tz) return false;
      if (focus && d.focus.indexOf(focus) === -1) return false;
      if (lic && d.lic !== lic) return false;
      return true;
    });
    document.getElementById("dir-empty").style.display = list.length ? "none" : "block";
    document.getElementById("dir-grid").innerHTML = list.map(function (d) {
      var localTime = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", timeZone: d.tz }).format(new Date());
      return '<div class="dir-card"><div class="head"><span class="avatar">' + initials(d.name) + '</span><span><b>' + esc(d.name) + "</b><small>" + esc(d.cred) + " · " + esc(d.city) + '</small></span></div>' +
        '<div class="tags">' + d.langs.map(function (l) { return '<span class="tag">' + l + "</span>"; }).join("") +
        d.focus.map(function (f) { return '<span class="tag gold">' + f + "</span>"; }).join("") +
        '<span class="tag dim">' + d.lic + "</span></div>" +
        '<div class="foot"><span>🕐 ' + localTime + " local</span>" +
        (d.accepting ? '<span class="tag ok">Accepting referrals</span>' : '<span class="tag dim">Waitlist</span>') + "</div></div>";
    }).join("");
  }
  ["dir-q", "dir-lang", "dir-tz", "dir-focus", "dir-lic"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderDirectory);
  });

  /* ---- Certification ---- */
  function renderCert() {
    var t = document.getElementById("cert-trainee");
    var s = document.getElementById("cert-supervisor");
    var l = document.getElementById("cert-locked");
    t.style.display = s.style.display = l.style.display = "none";
    if (state.role === "trainee" || state.role === "admin") {
      t.style.display = "block";
      var hrs = approvedHours();
      var hp = Math.min(100, Math.round(hrs / 200 * 100));
      var cp = Math.min(100, Math.round(state.casesDone / 10 * 100));
      document.getElementById("hours-label").textContent = hrs + " / 200 hours approved";
      document.getElementById("hours-pct").textContent = hp + "%";
      document.getElementById("cases-label").textContent = state.casesDone + " / 10 cases completed";
      document.getElementById("cases-pct").textContent = cp + "%";
      requestAnimationFrame(function () {
        document.getElementById("hours-bar").style.width = hp + "%";
        document.getElementById("cases-bar").style.width = cp + "%";
      });
      var pend = pendingEntries().reduce(function (x, h) { return x + Number(h.hours); }, 0);
      document.getElementById("cert-eta").textContent =
        (200 - hrs) + " hours remaining" + (pend ? " · " + pend + "h pending supervisor approval" : "") + " · " + (10 - state.casesDone) + " cases to go.";
      document.getElementById("hours-rows").innerHTML = state.hours.slice().reverse().map(function (h) {
        var tag = h.status === "approved" ? '<span class="tag ok">Approved</span>' : h.status === "declined" ? '<span class="tag bad">Declined</span>' : '<span class="tag warn">Pending</span>';
        return '<div class="row"><span class="grow"><b>' + h.hours + "h · " + esc(h.type) + "</b><small>" + h.date + (h.notes ? " — " + esc(h.notes) : "") + "</small></span>" + tag + "</div>";
      }).join("") || '<div class="empty">No entries yet — log your first supervised hours.</div>';
    } else if (state.role === "supervisor") {
      s.style.display = "block";
      var rows = pendingEntries();
      document.getElementById("approve-rows").innerHTML = rows.length ? rows.map(function (h) {
        var idx = state.hours.indexOf(h);
        return '<div class="row"><span class="grow"><b>Amina Yusuf — ' + h.hours + "h · " + esc(h.type) + "</b><small>" + h.date + (h.notes ? " — " + esc(h.notes) : "") + "</small></span>" +
          '<button class="btn btn-gold btn-xs" data-approve="' + idx + '">Approve</button>' +
          '<button class="btn btn-ghost btn-xs" data-decline="' + idx + '">Decline</button></div>';
      }).join("") : '<div class="empty">Queue clear — no hours awaiting approval. 🌙</div>';
      document.querySelectorAll("[data-approve]").forEach(function (b) {
        b.addEventListener("click", function () { state.hours[Number(b.getAttribute("data-approve"))].status = "approved"; save(); renderCert(); });
      });
      document.querySelectorAll("[data-decline]").forEach(function (b) {
        b.addEventListener("click", function () { state.hours[Number(b.getAttribute("data-decline"))].status = "declined"; save(); renderCert(); });
      });
    } else {
      l.style.display = "block";
    }
  }
  document.getElementById("hours-form").addEventListener("submit", function (e) {
    e.preventDefault();
    state.hours.push({
      date: document.getElementById("hf-date").value,
      hours: Number(document.getElementById("hf-hours").value),
      type: document.getElementById("hf-type").value,
      notes: document.getElementById("hf-notes").value,
      status: "pending"
    });
    save(); e.target.reset(); renderCert();
  });

  /* ---- Compliance vault ---- */
  function certStatus(c) {
    var days = Math.floor((new Date(c.expires) - Date.now()) / DAY);
    if (days < 0) return "expired";
    if (days <= 60) return "expiring";
    return "ok";
  }
  function renderVault() {
    ["ceu", "fard"].forEach(function (cat) {
      var items = state.certs.filter(function (c) { return c.cat === cat; });
      var credits = items.reduce(function (s, c) { return s + Number(c.credits); }, 0);
      document.getElementById(cat === "ceu" ? "ceu-sum" : "fard-sum").textContent = credits + " credits on file";
      document.getElementById(cat === "ceu" ? "ceu-rows" : "fard-rows").innerHTML = items.map(function (c) {
        var st = certStatus(c);
        var days = Math.floor((new Date(c.expires) - Date.now()) / DAY);
        var tag = st === "ok" ? '<span class="tag ok">Valid</span>'
          : st === "expiring" ? '<span class="tag warn">Expires in ' + days + "d — reminder sent</span>"
          : '<span class="tag bad">Expired ' + Math.abs(days) + "d ago</span>";
        return '<div class="row"><span class="grow"><b>' + esc(c.name) + "</b><small>" + c.credits + " credits · issued " + c.issued + " · expires " + c.expires + "</small></span>" + tag + "</div>";
      }).join("") || '<div class="empty">Nothing on file yet.</div>';
    });
  }
  document.getElementById("vault-form").addEventListener("submit", function (e) {
    e.preventDefault();
    state.certs.push({
      name: document.getElementById("vf-name").value,
      cat: document.getElementById("vf-cat").value,
      credits: Number(document.getElementById("vf-credits").value || 0),
      issued: document.getElementById("vf-issued").value,
      expires: document.getElementById("vf-expires").value
    });
    save(); e.target.reset(); renderVault();
  });

  /* ---- Case sandbox ---- */
  function renderSandbox() {
    var isSup = state.role === "supervisor";
    document.getElementById("case-list-title").textContent = isSup ? "📁 Cases shared with me" : "📁 My cases";
    document.getElementById("case-form").closest(".card").style.display = isSup ? "none" : "block";
    var list = isSup ? state.cases.filter(function (c) { return c.shared; }) : state.cases;
    document.getElementById("case-list").innerHTML = list.length ? list.slice().reverse().map(function (c) {
      return '<div class="thread"><div class="t-head"><b>' + esc(c.alias) + '</b><span>' +
        '<span class="tag gold">' + esc(c.primary) + " primary</span> " +
        (c.shared ? '<span class="tag ok">🔐 Shared · E2E</span>' : '<span class="tag dim">Private</span>') + "</span></div>" +
        '<div class="t-sub">Updated ' + c.updated + "</div>" +
        '<div style="margin-top:8px;font-size:.84rem;color:var(--muted);">' +
        "<p style='margin:0 0 6px;'><strong>Presenting:</strong> " + esc(c.presenting) + "</p>" +
        "<p style='margin:0 0 4px;'><strong>ʿAql:</strong> " + esc(c.aql || "—") + "</p>" +
        "<p style='margin:0 0 4px;'><strong>Nafs:</strong> " + esc(c.nafs || "—") + "</p>" +
        "<p style='margin:0 0 4px;'><strong>Rūḥ:</strong> " + esc(c.ruh || "—") + "</p>" +
        "<p style='margin:0;'><strong>Iḥsās:</strong> " + esc(c.ihsas || "—") + "</p></div></div>";
    }).join("") : '<div class="empty">' + (isSup ? "No trainee cases shared with you yet." : "No conceptualizations yet.") + "</div>";
  }
  document.getElementById("case-form").addEventListener("submit", function (e) {
    e.preventDefault();
    state.cases.push({
      id: Date.now(),
      alias: document.getElementById("cf-alias").value,
      primary: document.getElementById("cf-primary").value,
      presenting: document.getElementById("cf-presenting").value,
      aql: document.getElementById("cf-aql").value,
      nafs: document.getElementById("cf-nafs").value,
      ruh: document.getElementById("cf-ruh").value,
      ihsas: document.getElementById("cf-ihsas").value,
      shared: document.getElementById("cf-share").checked,
      updated: iso(new Date())
    });
    save(); e.target.reset(); renderSandbox();
  });

  /* ---- Fatwa desk ---- */
  var openTicketId = null;
  function renderFatwa() {
    var isScholar = state.role === "supervisor";
    document.getElementById("fatwa-list-title").textContent = isScholar ? "🎫 Scholar queue" : "🎫 My consultations";
    document.getElementById("fatwa-new-card").style.display = isScholar ? "none" : "block";
    document.getElementById("ticket-list").innerHTML = state.tickets.slice().reverse().map(function (t) {
      var tag = t.status === "answered" ? '<span class="tag ok">Answered</span>' : t.status === "closed" ? '<span class="tag dim">Closed</span>' : '<span class="tag warn">Open</span>';
      return '<div class="thread' + (openTicketId === t.id ? " open-item" : "") + '" data-ticket="' + t.id + '"><div class="t-head"><b>' + esc(t.subject) + "</b>" + tag + "</div>" +
        '<div class="t-sub">' + esc(t.cat) + " · " + t.thread.length + " message" + (t.thread.length === 1 ? "" : "s") + ' · <span class="tag dim" style="font-size:.6rem;">Anonymized</span></div></div>';
    }).join("");
    document.querySelectorAll("[data-ticket]").forEach(function (el) {
      el.addEventListener("click", function () { openTicketId = Number(el.getAttribute("data-ticket")); renderFatwa(); });
    });
    var box = document.getElementById("ticket-detail");
    var t = state.tickets.find(function (x) { return x.id === openTicketId; });
    if (!t) { box.style.display = "none"; return; }
    box.style.display = "block";
    box.innerHTML = "<h3>" + esc(t.subject) + ' <span class="tag">' + esc(t.cat) + "</span></h3>" +
      t.thread.map(function (m) {
        return '<div class="msg' + (m.role === "Scholar" ? " scholar" : "") + '"><span class="avatar">' + initials(m.author) + '</span><div class="m-body"><div class="m-who"><b>' + esc(m.author) + "</b> · " + m.role + " · " + m.at + "</div><p>" + esc(m.text) + "</p></div></div>";
      }).join("") +
      '<form id="ticket-reply" style="margin-top:12px;"><div class="field"><label>' + (isScholar ? "Scholarly response" : "Follow-up") + '</label><textarea id="tr-body" required></textarea></div>' +
      '<button class="btn btn-gold btn-xs" type="submit">Post reply</button> ' +
      (t.status !== "closed" ? '<button class="btn btn-ghost btn-xs" type="button" id="ticket-close">Mark resolved</button>' : "") + "</form>";
    document.getElementById("ticket-reply").addEventListener("submit", function (e) {
      e.preventDefault();
      t.thread.push({ author: ROLES[state.role].name, role: isScholar ? "Scholar" : ROLES[state.role].label.split(" ")[0], text: document.getElementById("tr-body").value, at: iso(new Date()) });
      if (isScholar) t.status = "answered";
      save(); renderFatwa();
    });
    var closeBtn = document.getElementById("ticket-close");
    if (closeBtn) closeBtn.addEventListener("click", function () { t.status = "closed"; save(); renderFatwa(); });
  }
  document.getElementById("ticket-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var id = Date.now();
    state.tickets.push({
      id: id, subject: document.getElementById("tf-subject").value, cat: document.getElementById("tf-cat").value, status: "open",
      thread: [{ author: ROLES[state.role].name, role: ROLES[state.role].label.split(" ")[0], text: document.getElementById("tf-body").value, at: iso(new Date()) }]
    });
    openTicketId = id;
    save(); e.target.reset(); renderFatwa();
  });

  /* ---- Intervention vault ---- */
  function renderResources() {
    var q = (document.getElementById("res-q").value || "").toLowerCase();
    var lang = document.getElementById("res-lang").value;
    var type = document.getElementById("res-type").value;
    var list = RESOURCES.filter(function (r) {
      if (q && (r.title + " " + r.tags.join(" ")).toLowerCase().indexOf(q) === -1) return false;
      if (lang && r.lang !== lang) return false;
      if (type && r.type !== type) return false;
      return true;
    });
    document.getElementById("res-empty").style.display = list.length ? "none" : "block";
    document.getElementById("res-rows").innerHTML = list.map(function (r, i) {
      return '<div class="row"><span class="grow"><b>' + esc(r.title) + "</b><small>" + r.type + " · updated " + r.updated + " · " + r.tags.map(function (t) { return "#" + t; }).join(" ") + "</small></span>" +
        '<span class="tag">' + r.lang + '</span><span class="tag gold" title="' + esc(r.history) + '">v' + r.v + "</span>" +
        '<button class="btn btn-ghost btn-xs" data-dl="' + RESOURCES.indexOf(r) + '">Download</button></div>';
    }).join("");
    document.querySelectorAll("[data-dl]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = RESOURCES[Number(b.getAttribute("data-dl"))];
        var body = r.title + "\n" + "=".repeat(r.title.length) + "\n\nTIIP Community — Intervention Vault (demo placeholder)\nType: " + r.type + "\nLanguage: " + r.lang + "\nVersion: " + r.v + " (updated " + r.updated + ")\nTags: " + r.tags.join(", ") + "\n\nVersion history:\n" + r.history + "\n\nIn production this downloads the actual clinical asset (PDF/DOCX) from encrypted storage.";
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
        a.download = r.title.replace(/[^\w؀-ۿ-]+/g, "_") + "_v" + r.v + ".txt";
        a.click(); URL.revokeObjectURL(a.href);
      });
    });
    document.getElementById("res-upload-note").style.display =
      (state.role === "supervisor" || state.role === "admin") ? "block" : "none";
  }
  ["res-q", "res-lang", "res-type"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderResources);
  });

  /* ---- Publication incubator ---- */
  function renderPubs() {
    var STAGES = ["Draft", "Internal review", "Formatting", "Submission-ready"];
    document.getElementById("pub-rows").innerHTML = state.pubs.map(function (p, i) {
      var si = STAGES.indexOf(p.stage);
      return '<div class="thread" style="cursor:default;"><div class="t-head"><b>' + esc(p.title) + '</b><span class="tag ' + (si >= 3 ? "ok" : si >= 1 ? "warn" : "dim") + '">' + p.stage + "</span></div>" +
        '<div class="t-sub">' + p.type + " · " + esc(p.authors) + " · updated " + p.updated + "</div>" +
        '<div class="prog" style="margin-top:8px;"><div class="bar"><i style="width:' + ((si + 1) / STAGES.length * 100) + '%"></i></div></div>' +
        (si < 3 ? '<button class="btn btn-ghost btn-xs" style="margin-top:8px;" data-advance="' + i + '">Advance to ' + STAGES[si + 1] + "</button>" : '<span class="tag ok" style="margin-top:8px;">Ready for Janeway submission</span>') +
        "</div>";
    }).join("");
    document.querySelectorAll("[data-advance]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = state.pubs[Number(b.getAttribute("data-advance"))];
        p.stage = STAGES[STAGES.indexOf(p.stage) + 1]; p.updated = iso(new Date());
        save(); renderPubs();
      });
    });
  }
  document.getElementById("pub-form").addEventListener("submit", function (e) {
    e.preventDefault();
    state.pubs.unshift({ title: document.getElementById("pf-title").value, type: document.getElementById("pf-type").value, stage: "Draft", authors: ROLES[state.role].name, updated: iso(new Date()) });
    save(); e.target.reset(); renderPubs();
  });

  /* ---- Events ---- */
  function fmtLocal(d) {
    return new Intl.DateTimeFormat([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
  }
  function renderEvents() {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "your local timezone";
    document.getElementById("tz-label").textContent = tz.replace(/_/g, " ");
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth();
    document.getElementById("cal-title").textContent = new Intl.DateTimeFormat([], { month: "long", year: "numeric" }).format(now);
    document.getElementById("cal-count").textContent = EVENTS.length + " events";
    var first = new Date(y, m, 1);
    var startDow = first.getDay();
    var daysIn = new Date(y, m + 1, 0).getDate();
    var html = ["S", "M", "T", "W", "T", "F", "S"].map(function (d) { return '<div class="dow">' + d + "</div>"; }).join("");
    for (var i = 0; i < startDow; i++) html += '<div class="cal-cell"></div>';
    for (var d = 1; d <= daysIn; d++) {
      var dayEvents = EVENTS.filter(function (ev) { return ev.when.getFullYear() === y && ev.when.getMonth() === m && ev.when.getDate() === d; });
      html += '<div class="cal-cell' + (d === now.getDate() ? " today" : "") + (dayEvents.length ? " has-ev" : "") + '"><span class="d">' + d + "</span>" +
        dayEvents.map(function (ev) { return '<span class="ev">' + esc(ev.title) + "</span>"; }).join("") + "</div>";
    }
    document.getElementById("cal-grid").innerHTML = html;

    document.getElementById("event-rows").innerHTML = EVENTS.map(function (ev) {
      var going = !!state.rsvps[ev.id];
      return '<div class="row"><span class="grow"><b>' + esc(ev.title) + "</b><small>" + fmtLocal(ev.when) + " · " + ev.mins + ' min · <span class="tag dim" style="font-size:.58rem;">' + ev.mode + "</span></small></span>" +
        (going ? '<a class="btn btn-gold btn-xs" href="' + ev.link + '" target="_blank" rel="noopener">Join link</a>' : "") +
        '<button class="btn ' + (going ? "btn-ghost" : "btn-gold") + ' btn-xs" data-rsvp="' + ev.id + '">' + (going ? "Cancel RSVP" : "RSVP") + "</button>" +
        (going ? '<button class="btn btn-ghost btn-xs" data-ics="' + ev.id + '">.ics</button>' : "") + "</div>";
    }).join("");
    document.querySelectorAll("[data-rsvp]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-rsvp");
        state.rsvps[id] = !state.rsvps[id]; save(); renderEvents();
      });
    });
    document.querySelectorAll("[data-ics]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ev = EVENTS.find(function (x) { return x.id === b.getAttribute("data-ics"); });
        var dt = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
        var end = new Date(ev.when.getTime() + ev.mins * 60000);
        var ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TIIP Community//Portal//EN\r\nBEGIN:VEVENT\r\nUID:" + ev.id + "@tiip.community\r\nDTSTAMP:" + dt(new Date()) + "\r\nDTSTART:" + dt(ev.when) + "\r\nDTEND:" + dt(end) + "\r\nSUMMARY:" + ev.title + "\r\nURL:" + ev.link + "\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
        a.download = ev.id + ".ics"; a.click(); URL.revokeObjectURL(a.href);
      });
    });
  }

  /* ---- Forums ---- */
  var activeTopic = 1, activeThread = null;
  function renderForums() {
    document.getElementById("forum-topics").innerHTML = state.forum.map(function (t) {
      return '<div class="thread' + (t.id === activeTopic ? " open-item" : "") + '" data-topic="' + t.id + '"><div class="t-head"><b>' + esc(t.name) + '</b><span class="tag dim">' + t.threads.length + "</span></div><div class='t-sub'>" + esc(t.desc) + "</div>" +
        (t.id === activeTopic ? t.threads.map(function (th) {
          return '<div class="row" data-thread="' + th.id + '" style="cursor:pointer;"><span class="grow"><b style="font-size:.82rem;' + (activeThread === th.id ? "color:var(--gold-300);" : "") + '">' + esc(th.title) + "</b><small>" + esc(th.author) + " · " + th.posts.length + " post" + (th.posts.length === 1 ? "" : "s") + "</small></span></div>";
        }).join("") || '<div class="empty" style="padding:12px;">No threads yet — start one below.</div>' : "") +
        "</div>";
    }).join("");
    document.querySelectorAll("[data-topic]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (e.target.closest("[data-thread]")) return;
        activeTopic = Number(el.getAttribute("data-topic")); activeThread = null; renderForums();
      });
    });
    document.querySelectorAll("[data-thread]").forEach(function (el) {
      el.addEventListener("click", function () { activeThread = Number(el.getAttribute("data-thread")); renderForums(); });
    });

    var topic = state.forum.find(function (t) { return t.id === activeTopic; });
    var th = topic && topic.threads.find(function (x) { return x.id === activeThread; });
    var replyForm = document.getElementById("reply-form");
    if (th) {
      document.getElementById("forum-thread-title").textContent = th.title;
      document.getElementById("forum-posts").innerHTML = th.posts.map(function (p) {
        return '<div class="msg' + (p.role === "Supervisor" ? " scholar" : "") + '"><span class="avatar">' + initials(p.author) + '</span><div class="m-body"><div class="m-who"><b>' + esc(p.author) + "</b> · " + p.role + " · " + p.at + "</div><p>" + esc(p.text) + "</p></div></div>";
      }).join("");
      replyForm.style.display = "block";
    } else {
      document.getElementById("forum-thread-title").textContent = "Select a thread";
      document.getElementById("forum-posts").innerHTML = '<div class="empty">Choose a board, then a thread, to read and reply.</div>';
      replyForm.style.display = "none";
    }
  }
  document.getElementById("thread-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var topic = state.forum.find(function (t) { return t.id === activeTopic; });
    var id = Date.now();
    topic.threads.unshift({ id: id, title: document.getElementById("ff-title").value, author: ROLES[state.role].name, posts: [] });
    activeThread = id;
    save(); e.target.reset(); renderForums();
  });
  document.getElementById("reply-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var topic = state.forum.find(function (t) { return t.id === activeTopic; });
    var th = topic.threads.find(function (x) { return x.id === activeThread; });
    th.posts.push({ author: ROLES[state.role].name, role: ROLES[state.role].label.split(" ")[0], text: document.getElementById("rf-body").value, at: iso(new Date()) });
    save(); e.target.reset(); renderForums();
  });

  /* ---------------------------------------------------------
     Boot
  --------------------------------------------------------- */
  /* EVENTS store Dates — revive after JSON parse is not needed since
     EVENTS is a static constant, but state Dates are stored as ISO strings. */
  applyRole();
  show((location.hash || "#dashboard").replace("#", ""));
  window.addEventListener("hashchange", function () {
    show((location.hash || "#dashboard").replace("#", ""));
  });
})();
