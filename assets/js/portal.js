/* TIIP Community — Member Portal prototype
   All data is demo data persisted to localStorage. Production requires
   a secure backend (auth, RBAC enforcement, encrypted storage). */
(function () {
  "use strict";

  var LS_KEY = "tiip-portal-demo-v2";
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
    explorer:     { label: "TIIP Trainee · Level 0", name: "Zaid Mahmood" },
    trainee:      { label: "Trainee · Level III", name: "Amina Yusuf" },
    practitioner: { label: "Certified Practitioner", name: "Dr. Bilal Rahman" },
    supervisor:   { label: "Supervisor / Scholar", name: "Dr. Hana Qadri" },
    admin:        { label: "Admin", name: "Musa Adem" }
  };

  /* ---------------------------------------------------------
     Certification pathway — the full journey from open
     registration (Level 0) to full certification.
  --------------------------------------------------------- */
  var PATHWAY = [
    { num: "0", name: "Level 0", title: "TIIP Trainee", desc: "Open registration — starter modules, events & forums. No consultations; not listed in the directory." },
    { num: "1", name: "Level 1", title: "Foundations", desc: "Foundations coursework & assessment. Directory listing begins." },
    { num: "2", name: "Level 2", title: "Intermediate", desc: "Advanced seminars, applied skills & practicum entry." },
    { num: "3", name: "Level 3", title: "Supervised Practice", desc: "200 supervised hours · 10 completed cases." },
    { num: "✓", name: "Certified", title: "Full Certification", desc: "Full clinical & consultation privileges · supervisor track." }
  ];
  /* index into PATHWAY for each demo role (4 = fully certified) */
  var ROLE_STAGE = { explorer: 0, trainee: 3, practitioner: 4, supervisor: 4, admin: 3 };

  /* ---------------------------------------------------------
     Level 1 capstone — the Khalil Center "TIIP Case
     Formulation Sheet" (2024), section by section.
  --------------------------------------------------------- */
  var FORM_RATINGS = [
    ["motivation", "Motivation to change", ["Strong", "Moderate", "Weak", "Ambivalent", "Instrumental", "Due to others"]],
    ["support", "Social support available", ["Strong", "Moderate", "Weak"]],
    ["community", "Involvement in community settings (ijtimāʿī)", ["Strong", "Moderate", "Weak"]],
    ["religiosity", "How strongly does the patient identify with their religion?", ["Strong", "Moderate", "Weak"]],
    ["rapport", "Level of therapeutic rapport", ["Strong", "Moderate", "Weak"]]
  ];

  var TIIP_ELEMENTS = [
    { key: "aql", label: "ʿAql — cognition", items: [
      ["distortions", "Cognitive distortions"],
      ["fusion", "Cognitive fusion"],
      ["rumination", "Rumination"],
      ["other", "Other ʿaqlī patterns"]
    ] },
    { key: "nafs", label: "Nafs — behavioral inclinations", items: [
      ["addictions", "Behavioral addictions"],
      ["compulsive", "Compulsive behaviors"],
      ["safety", "Safety behaviors"],
      ["avoidance", "Avoidance behaviors"],
      ["overcomp", "Overcompensatory behaviors"],
      ["pain", "Pain/pleasure-seeking (eating/drinking, sexual pleasure, nail biting, self-harm…)"]
    ] },
    { key: "ihsas", label: "Iḥsās — emotion", items: [
      ["maladaptive", "Maladaptive emotional expression"],
      ["adaptive", "Adaptive emotional expression"],
      ["dysregulation", "Emotional dysregulation"],
      ["needs", "Unmet emotional needs"],
      ["primary", "Primary emotion"],
      ["secondary", "Secondary emotion"],
      ["instrumental", "Instrumental emotion"],
      ["blocking", "Dissociative emotional blocking"],
      ["trauma", "Emotional reaction to past traumatic events"],
      ["markers", "Emotional markers — self-self / self-other relations"]
    ] },
    { key: "ruh", label: "Rūḥ — spirit", items: [
      ["diseases", "Spiritual diseases of the heart (kibr, ḥasad, absent tawakkul, overemphasis on asbāb)"],
      ["existential", "Existential crisis of faith"],
      ["weakrel", "Weak or impaired relationship with Allah"],
      ["projection", "Projection of intrapsychic tensions onto Allah (e.g., anger at Allah)"],
      ["enmeshment", "Enmeshment of Allah with family (e.g., obedience equated with faith)"],
      ["other", "Other rūḥānī concerns"]
    ] }
  ];

  var PLAN_DOMAINS = ["ʿAql", "Nafs", "Iḥsās", "Rūḥ"];

  function seedFormulation() {
    function fig() { return { situation: "", ruh: "", aql: "", qalb: "", primary: "", secondary: "", instrumental: "", safety: "", avoidance: "", pain: "" }; }
    return {
      alias: "", profile: "", presenting: "", precipitating: "", history: "",
      assess: { motivation: "", support: "", community: "", religiosity: "", rapport: "" },
      additional: "", dsm: "",
      elements: { aql: {}, nafs: {}, ihsas: {}, ruh: {} }, /* key → { on, note } */
      dominant: "", narrative: "",
      plan: PLAN_DOMAINS.map(function (d) { return { domain: d, goal: "", intervention: "", details: "" }; }),
      prognosis: "",
      fig: fig(), fig2: fig()
    };
  }

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
      modules: [
        { title: "Welcome to TIIP — Orientation", mins: 18, done: true },
        { title: "The Ontological Model — a First Look", mins: 34, done: false },
        { title: "The Four Stages of Change — Overview", mins: 27, done: false }
      ],
      learning: {
        /* Level 0 — the six-part introductory series, open to every member */
        l0: [
          { title: "Part 1 · Introducing Islamically Integrated Psychotherapies", mins: 32, done: true },
          { title: "Part 2 · A Glimpse into the Living Islamic Tradition", mins: 30, done: false },
          { title: "Part 3 · Traditional Islamically Integrated Psychotherapy (TIIP)", mins: 38, done: false },
          { title: "Part 4 · TIIP Treatment of OCD Scrupulosity (Waswasa)", mins: 35, done: false },
          { title: "Part 5 · Dreams & Their Role in Islamically Integrated Mental Health Practice", mins: 33, done: false },
          { title: "Part 6 · The Intersection of Islamic Jurisprudence & Mental Health Care", mins: 34, done: false }
        ],
        /* Level 1 curriculum — invisible except to trainees an admin has
           approved and to members already at Level 2 and beyond. */
        l1EnabledUsers: {},
        l1: [
          { title: "Module 1 · Foundations of TIIP", mins: 60, done: false },
          { title: "Module 2 · The Role of the TIIP Clinician", mins: 55, done: false },
          { title: "Module 3 · Assessment & Conceptualization", mins: 70, done: false },
          { title: "Module 4 · ʿAql — Cognition", mins: 60, done: false },
          { title: "Module 5 · Nafs — Behavioral Inclinations", mins: 60, done: false },
          { title: "Module 6 · Iḥsās — Emotion", mins: 60, done: false },
          { title: "Module 7 · Rūḥ — Spirit", mins: 60, done: false },
          { title: "Module 8 · Islamic Virtues", mins: 55, done: false }
        ],
        l1Formulation: seedFormulation(), /* the in-portal TIIP Case Formulation Sheet draft */
        l1Submission: null /* { name, at } — required end-of-level submission */
      },
      certs: [
        { name: "Ethics in Teletherapy (3 CE)", cat: "ceu", credits: 3, issued: iso(today(-320)), expires: iso(today(45)) },
        { name: "Suicide Risk Assessment (6 CE)", cat: "ceu", credits: 6, issued: iso(today(-150)), expires: iso(today(215)) },
        { name: "Fiqh of Worship — Farḍ al-ʿAyn I", cat: "fard", credits: 12, issued: iso(today(-400)), expires: iso(today(-12)) },
        { name: "ʿAqīdah Essentials — Farḍ al-ʿAyn II", cat: "fard", credits: 10, issued: iso(today(-60)), expires: iso(today(305)) }
      ],
      cases: [
        { id: 1, alias: "Case H-30", primary: "Iḥsās", presenting: "Marital conflict; anger outbursts masking sadness from unmet connection needs.", precipitating: "Blow-up after spouse threatened to involve both families; client left home for two nights and returned only after a relative intervened.", motivation: "Ambivalent", support: "Moderate", religiosity: "Strong", aql: "Catastrophizing under activation; strong capacity for religious reframing.", nafs: "Avoidance (leaving home), approval-seeking, low frustration tolerance.", ruh: "Prayer soothes; weak riḍā bi-al-qaḍāʾ during conflict.", ihsas: "Secondary anger over primary sadness and helplessness.", narrative: "Perceived criticism (trigger) → catastrophizing (ʿaql) → primary sadness masked by secondary anger (iḥsās) → withdrawal and leaving home (nafs) → guilt and distance from Allah (rūḥ) → further conflict, restarting the cycle.", shared: true, updated: iso(today(-5)) }
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
      /* Member-submitted events awaiting or cleared by admin approval.
         Approved entries appear on the calendar alongside official EVENTS. */
      memberEvents: [
        { id: "me-seed1", title: "Community Halaqah: Grief & the Heart", date: iso(today(9)), time: "18:30", mins: 90, mode: "Community", link: "https://meet.example.org/halaqah-grief", by: "Amina Yusuf", status: "approved" },
        { id: "me-seed2", title: "Peer Practicum: Two-Chair Technique", date: iso(today(15)), time: "17:00", mins: 120, mode: "Practicum", link: "https://meet.example.org/two-chair", by: "Dr. Bilal Rahman", status: "pending" }
      ],
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
  if (!state.modules) state.modules = seedState().modules; /* migrate pre-pathway saves */
  if (!state.learning) state.learning = seedState().learning; /* migrate pre-learning saves */
  if (!state.learning.l1Formulation) state.learning.l1Formulation = seedFormulation(); /* migrate pre-formulation saves */
  if (!state.memberEvents) state.memberEvents = seedState().memberEvents; /* migrate pre-member-events saves */
  if (!ROLES[state.role]) state.role = "trainee";
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
    { name: "Sarah Abdullah", cred: "LCSW · Certified", city: "New Jersey, US", region: "Americas", tz: "America/New_York", langs: ["English", "Arabic"], focus: ["OCD / Waswasah", "Youth & identity"], lic: "US state-specific", accepting: true },
    { name: "Nadia Bouchard", cred: "RP (Qualifying) · Trainee I", city: "Montreal, CA", region: "Americas", tz: "America/Toronto", langs: ["English", "French"], focus: ["Youth & identity", "Anxiety & mood"], lic: "Canada", accepting: true, level: "level1" },
    { name: "Zayd Ibrahim", cred: "Provisional Psychologist · Trainee II", city: "Melbourne, AU", region: "SE Asia / Pacific", tz: "Australia/Melbourne", langs: ["English", "Arabic"], focus: ["Anxiety & mood", "Youth & identity"], lic: "International", accepting: false, level: "level2" }
  ];

  /* TIIP level per listing — inferred from the credential line unless set.
     Unlike the public directory, the members-only directory lists every
     level, including Levels 1 and 2. */
  var DIR_LEVELS = { supervisor: "Supervisor", certified: "Fully certified", level3: "Level 3", level2: "Level 2", level1: "Level 1" };
  DIRECTORY.forEach(function (d) {
    if (d.level) return;
    if (/Supervisor/.test(d.cred)) d.level = "supervisor";
    else if (/Trainee III/.test(d.cred)) d.level = "level3";
    else if (/Trainee II/.test(d.cred)) d.level = "level2";
    else if (/Trainee I/.test(d.cred)) d.level = "level1";
    else d.level = "certified";
  });

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
    { name: "Zaid Mahmood", role: "TIIP Trainee (Level 0)" },
    { name: "Hafsa Karim", role: "TIIP Trainee (Level 0)", city: "Lahore, PK" },
    { name: "Imran Baig", role: "TIIP Trainee (Level 0)", city: "Karachi, PK" },
    { name: "Amina Yusuf", role: "Trainee (Level III)" },
    { name: "Yusuf Chaudhry", role: "Trainee (Level II)" },
    { name: "Dr. Bilal Rahman", role: "Certified Practitioner" },
    { name: "Sarah Abdullah", role: "Certified Practitioner" },
    { name: "Dr. Hana Qadri", role: "Supervisor / Scholar" },
    { name: "Shaykh Idris Kamal", role: "Supervisor / Scholar" }
  ];

  /* Members' pending requests to change their TIIP level, awaiting admin
     approval. Demo-only (in-memory, resets on reload). */
  var LEVEL_REQUESTS = [
    { name: "Hafsa Karim", from: "TIIP Trainee (Level 0)", to: "Trainee (Level I)", note: "Completed Foundations of TIIP", cert: "Hafsa_Karim_Level1_certificate.pdf" },
    { name: "Yusuf Chaudhry", from: "Trainee (Level II)", to: "Trainee (Level III)", note: "Finished Level 2 applied-skills assessment", cert: "Yusuf_Chaudhry_Level2_certificate.pdf" },
    { name: "Amina Yusuf", from: "Trainee (Level III)", to: "Certified Practitioner", note: "200 supervised hours & 10 cases approved", cert: "Amina_Yusuf_Level3_completion.pdf" }
  ];
  /* Admin-issued invitations to unregistered people (demo-only). */
  var INVITES = [];

  /* ---------------------------------------------------------
     Shell: role switching, nav, router
  --------------------------------------------------------- */
  var navBtns = document.querySelectorAll(".p-nav button");
  var views = document.querySelectorAll(".view");
  var viewTitle = document.getElementById("view-title");
  var roleSelect = document.getElementById("role-select");

  var VIEW_TITLES = {
    dashboard: "Dashboard", learning: "Resources & Modules", directory: "Global Referral Directory", certification: "Certification Pathway",
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

  /* Admin member-search + invitation bindings (elements always present) */
  var adminSearchEl = document.getElementById("admin-user-search");
  if (adminSearchEl) adminSearchEl.addEventListener("input", function () { renderAdminUsers(adminSearchEl.value); });
  var inviteFormEl = document.getElementById("admin-invite-form");
  if (inviteFormEl) inviteFormEl.addEventListener("submit", function (e) {
    e.preventDefault();
    INVITES.push({ email: document.getElementById("ai-email").value, level: document.getElementById("ai-level").value });
    e.target.reset();
    renderAdmin();
  });

  /* ---------------------------------------------------------
     Renderers
  --------------------------------------------------------- */
  function renderView(view) {
    if (view === "dashboard") renderDashboard();
    if (view === "learning") renderLearning();
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
      explorer: "As-salāmu ʿalaykum, Zaid. Welcome — you're a TIIP Trainee at Level 0. Watch the starter modules and follow the community; the full pathway to certification starts whenever you're ready.",
      trainee: "As-salāmu ʿalaykum, Amina. Your Level III pathway, compliance items, and cohort activity at a glance.",
      practitioner: "As-salāmu ʿalaykum, Dr. Rahman. Referrals, compliance, and consultation activity at a glance.",
      supervisor: "As-salāmu ʿalaykum, Dr. Qadri. Trainee approvals and scholar-desk queries awaiting you.",
      admin: "As-salāmu ʿalaykum, Musa. Platform health and member administration."
    };
    document.getElementById("dash-lead").textContent = leads[state.role];
    /* Level 0 practice-scope notice */
    document.getElementById("l0-scope").style.display = state.role === "explorer" ? "flex" : "none";

    var tiles;
    if (state.role === "explorer") {
      var watched = state.learning.l0.filter(function (m) { return m.done; }).length;
      tiles = [
        { n: "L0", l: "Current level" },
        { n: watched + "<i>/" + state.learning.l0.length + "</i>", l: "Parts watched" },
        { n: EVENTS.length, l: "Upcoming events" },
        { n: 4, l: "Stages to certification" }
      ];
    } else if (state.role === "supervisor") {
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
      explorer: [["learning", "Watch the six-part series"], ["certification", "View my pathway"], ["events", "Browse events"], ["forums", "Join the forums"]],
      trainee: [["learning", "Open resources & modules"], ["certification", "Log supervised hours"], ["sandbox", "Draft a conceptualization"], ["fatwa", "Ask a scholar"]],
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

    document.getElementById("dash-events").innerHTML = allEvents().slice(0, 3).map(function (ev) {
      return '<div class="row"><span class="grow"><b>' + esc(ev.title) + "</b><small>" + fmtLocal(ev.when) + '</small></span><span class="tag">' + ev.mode + "</span></div>";
    }).join("");

    var adminCard = document.getElementById("dash-admin-card");
    adminCard.style.display = state.role === "admin" ? "block" : "none";
    if (state.role === "admin") renderAdmin();
  }

  /* ---- Admin: level-change requests, member search, invitations ---- */
  var ROLE_OPTIONS = ["TIIP Trainee (Level 0)", "Trainee (Level I)", "Trainee (Level II)", "Trainee (Level III)", "Certified Practitioner", "Supervisor / Scholar", "Admin"];

  function renderAdmin() {
    /* 1) Pending level-change requests */
    var reqEl = document.getElementById("admin-requests");
    reqEl.innerHTML = LEVEL_REQUESTS.length ? LEVEL_REQUESTS.map(function (r, i) {
      return '<div class="row"><span class="grow"><b>' + esc(r.name) + '</b><small>' + esc(r.from) + " → " + esc(r.to) +
        " · " + esc(r.note) + ' · 📎 <span class="tag dim" style="font-size:.6rem;">' + esc(r.cert) + "</span></small></span>" +
        '<button class="btn btn-gold btn-xs" data-req-ok="' + i + '">Approve</button>' +
        '<button class="btn btn-ghost btn-xs" data-req-no="' + i + '">Deny</button></div>';
    }).join("") : '<div class="empty">No level-change requests pending. 🌙</div>';
    reqEl.querySelectorAll("[data-req-ok]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = LEVEL_REQUESTS[Number(b.getAttribute("data-req-ok"))];
        var u = ADMIN_USERS.find(function (x) { return x.name === r.name; });
        if (u) u.role = r.to; else ADMIN_USERS.push({ name: r.name, role: r.to });
        LEVEL_REQUESTS.splice(Number(b.getAttribute("data-req-ok")), 1);
        renderAdmin();
      });
    });
    reqEl.querySelectorAll("[data-req-no]").forEach(function (b) {
      b.addEventListener("click", function () {
        LEVEL_REQUESTS.splice(Number(b.getAttribute("data-req-no")), 1);
        renderAdmin();
      });
    });

    /* 2) Member list with name search */
    renderAdminUsers(document.getElementById("admin-user-search").value || "");

    /* 3) Invitations already sent this session */
    var invEl = document.getElementById("admin-invites");
    invEl.innerHTML = INVITES.map(function (iv) {
      return '<div class="row"><span class="grow"><b>✉ ' + esc(iv.email) + "</b><small>Invited as " + esc(iv.level) + '</small></span><span class="tag warn">Invitation sent · pending</span></div>';
    }).join("");
  }

  function renderAdminUsers(filter) {
    var q = filter.trim().toLowerCase();
    var matched = ADMIN_USERS.filter(function (u) { return !q || u.name.toLowerCase().indexOf(q) !== -1; });
    var usersEl = document.getElementById("admin-users");
    usersEl.innerHTML = matched.map(function (u) {
      var idx = ADMIN_USERS.indexOf(u);
      return '<div class="row"><span class="grow"><b>' + esc(u.name) + "</b>" + (u.city ? "<small>" + esc(u.city) + "</small>" : "") + "</span>" +
        '<select class="admin-role" data-i="' + idx + '" style="background:var(--bg-2);color:var(--cream);border:1px solid var(--line);border-radius:8px;padding:5px 8px;font-size:.78rem;">' +
        ROLE_OPTIONS.map(function (r) { return "<option" + (r === u.role ? " selected" : "") + ">" + r + "</option>"; }).join("") +
        "</select></div>";
    }).join("");
    usersEl.querySelectorAll(".admin-role").forEach(function (sel) {
      sel.addEventListener("change", function () { ADMIN_USERS[Number(sel.getAttribute("data-i"))].role = sel.value; });
    });

    /* If a search finds nobody, prompt the admin to invite them instead. */
    var noMatch = document.getElementById("admin-no-match");
    if (q && !matched.length) {
      noMatch.style.display = "block";
      noMatch.innerHTML = '<div class="empty">No member matches “' + esc(filter.trim()) + '”. They may not be registered yet — invite them by email below.</div>';
    } else {
      noMatch.style.display = "none";
      noMatch.innerHTML = "";
    }
  }

  /* ---- Resources & Modules (learning) ---- */
  function l1EnabledFor(name) { return !!state.learning.l1EnabledUsers[name]; }

  function renderLearning() {
    /* Level 0 — six-part series (all members) */
    var l0 = state.learning.l0;
    var watched = l0.filter(function (m) { return m.done; }).length;
    document.getElementById("l0-sum").textContent = watched + " / " + l0.length + " watched";
    document.getElementById("l0-rows").innerHTML = l0.map(function (m, i) {
      return '<div class="row"><span class="grow"><b>' + esc(m.title) + "</b><small>" + m.mins + " min · video module</small></span>" +
        (m.done ? '<span class="tag ok">Watched</span>' : '<button class="btn btn-gold btn-xs" data-l0-watch="' + i + '">▶ Watch</button>') +
        "</div>";
    }).join("");
    document.querySelectorAll("[data-l0-watch]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.learning.l0[Number(b.getAttribute("data-l0-watch"))].done = true;
        save(); renderLearning();
      });
    });

    /* Level 1 — invisible to everyone except trainees an admin has
       approved and members already at Level 2 and beyond. Nobody else
       even sees that the card exists. */
    var stage = ROLE_STAGE[state.role] != null ? ROLE_STAGE[state.role] : 0;
    var approved = l1EnabledFor(ROLES[state.role].name);
    var isAdmin = state.role === "admin";
    var showTrack = !isAdmin && (approved || stage >= 2);
    var takingL1 = showTrack && stage < 2; /* actually working through it */
    document.getElementById("l1-online-card").style.display = showTrack ? "block" : "none";
    if (showTrack) {
      document.getElementById("l1-why").textContent = approved && stage < 2
        ? "Approved — enabled for you by an admin"
        : "Visible from Level 2 upward";
      var l1 = state.learning.l1;
      document.getElementById("l1-rows").innerHTML = l1.map(function (m, i) {
        return '<div class="row"><span class="grow"><b>' + esc(m.title) + "</b><small>" + m.mins + " min · online module</small></span>" +
          (m.done ? '<span class="tag ok">Completed</span>' : '<button class="btn btn-gold btn-xs" data-l1-watch="' + i + '">▶ Start</button>') +
          "</div>";
      }).join("");
      document.querySelectorAll("[data-l1-watch]").forEach(function (b) {
        b.addEventListener("click", function () {
          state.learning.l1[Number(b.getAttribute("data-l1-watch"))].done = true;
          save(); renderLearning();
        });
      });
      /* The capstone formulation only applies to members actually taking
         the level — not to Level 2+ members revisiting the material. */
      if (takingL1) {
        var modsDone = l1.every(function (m) { return m.done; });
        var f = state.learning.l1Formulation;
        var doneCount = FORM_SECTIONS.filter(function (s) { return s.done(f); }).length;
        var sub = state.learning.l1Submission;
        var capTag = sub
          ? '<span class="tag ok">Submitted · pending supervisor review</span><span class="tag dim">' + esc(sub.name) + " · " + sub.at + "</span>"
          : !modsDone
            ? '<span class="tag dim" id="l1-cap-tag">🔒 Unlocks when all modules are complete</span>'
            : '<span class="tag warn" id="l1-cap-tag">' + doneCount + " / " + FORM_SECTIONS.length + " sections complete</span>";
        document.getElementById("l1-capstone").innerHTML =
          '<div class="row" style="border-top:1px solid var(--line); padding-top:14px;"><span class="grow">' +
          "<b>📤 Capstone: TIIP Case Formulation Sheet</b>" +
          "<small>At the end of your modules, complete the Khalil Center case formulation below — every section filled, reviewed by a supervisor before Level 1 is credited.</small></span>" +
          capTag + "</div>";
        renderFormulation(modsDone);
      } else {
        document.getElementById("l1-capstone").innerHTML = "";
        hideFormulationCard();
      }
    } else {
      /* wipe the content too, so nothing lingers in the hidden card */
      document.getElementById("l1-rows").innerHTML = "";
      document.getElementById("l1-capstone").innerHTML = "";
      hideFormulationCard();
    }

    /* Admin — approve Level 1 access per registered Level 0 trainee */
    document.getElementById("l1-admin-card").style.display = isAdmin ? "block" : "none";
    if (isAdmin) {
      var level0 = ADMIN_USERS.filter(function (u) { return u.role.indexOf("Level 0") !== -1; });
      document.getElementById("l1-admin-rows").innerHTML = level0.map(function (u) {
        var on = l1EnabledFor(u.name);
        return '<div class="row"><span class="grow"><b>' + esc(u.name) + "</b><small>" + esc(u.role) + (u.city ? " · " + esc(u.city) : "") + "</small></span>" +
          (on ? '<span class="tag ok">Level 1 approved</span>' : '<span class="tag dim">Not approved</span>') +
          '<button class="btn ' + (on ? "btn-ghost" : "btn-gold") + ' btn-xs" data-l1-toggle="' + esc(u.name) + '">' + (on ? "Revoke" : "Approve") + "</button></div>";
      }).join("");
      document.querySelectorAll("[data-l1-toggle]").forEach(function (b) {
        b.addEventListener("click", function () {
          var name = b.getAttribute("data-l1-toggle");
          state.learning.l1EnabledUsers[name] = !state.learning.l1EnabledUsers[name];
          save(); renderLearning();
        });
      });
    }
  }

  /* ---- Level 1 capstone: TIIP Case Formulation Sheet ---- */
  function filled(s) { return !!(s && String(s).trim()); }
  function fSet(obj, path, v) {
    var ks = path.split("."), last = ks.pop(), t = obj;
    for (var i = 0; i < ks.length; i++) t = t[ks[i]];
    t[last] = v;
  }

  var FORM_SECTIONS = [
    { id: "profile", title: "Patient profile / demographics", done: function (f) { return filled(f.alias) && filled(f.profile); } },
    { id: "presenting", title: "Presenting problem / complaints", done: function (f) { return filled(f.presenting); } },
    { id: "precipitating", title: "Precipitating event", done: function (f) { return filled(f.precipitating); } },
    { id: "history", title: "Significant early or life experiences", done: function (f) { return filled(f.history); } },
    { id: "assess", title: "Assessment", done: function (f) { return FORM_RATINGS.every(function (r) { return filled(f.assess[r[0]]); }); } },
    { id: "additional", title: "Additional details", done: function (f) { return filled(f.additional); } },
    { id: "dsm", title: "Diagnosis (DSM-5)", done: function (f) { return filled(f.dsm); } },
    { id: "elements", title: "Diagnosis (TIIP elements)", done: function (f) {
        return TIIP_ELEMENTS.every(function (el) {
          return el.items.some(function (it) { var st = f.elements[el.key][it[0]]; return st && st.on; });
        });
      } },
    { id: "dominant", title: "Dominant area of dysfunction", done: function (f) { return filled(f.dominant); } },
    { id: "narrative", title: "Conceptualization (narrative form)", done: function (f) { return filled(f.narrative); } },
    { id: "plan", title: "Therapy plan", done: function (f) { return f.plan.every(function (r) { return filled(r.goal) && filled(r.intervention); }); } },
    { id: "prognosis", title: "Prognosis", done: function (f) { return filled(f.prognosis); } },
    { id: "figure", title: "Figure — the vicious cycle", done: function (f) {
        var g = f.fig;
        return filled(g.situation) && filled(g.ruh) && filled(g.aql) && filled(g.qalb) && filled(g.primary) &&
          (filled(g.safety) || filled(g.avoidance) || filled(g.pain));
      } }
  ];

  function fTxt(label, path, val, ph, big) {
    return '<div class="field"><label>' + label + "</label>" +
      (big
        ? '<textarea data-f="' + path + '" placeholder="' + esc(ph || "") + '">' + esc(val || "") + "</textarea>"
        : '<input type="text" data-f="' + path + '" placeholder="' + esc(ph || "") + '" value="' + esc(val || "") + '" />') +
      "</div>";
  }
  function pillGroup(name, path, opts, val) {
    return '<div class="pill-group">' + opts.map(function (o) {
      return '<label class="pill' + (val === o ? " sel" : "") + '"><input type="radio" name="' + name + '" data-f="' + path + '" value="' + esc(o) + '"' + (val === o ? " checked" : "") + " />" + esc(o) + "</label>";
    }).join("") + "</div>";
  }
  function figHTML(prefix, g) {
    return '<div class="fig-grid">' +
      '<div class="fig-full">' + fTxt("Situation / trigger", prefix + ".situation", g.situation, "A specific recent event that set the cycle in motion…", true) + "</div>" +
      fTxt("Rūḥ — spiritual symptoms", prefix + ".ruh", g.ruh, "e.g., prayer feels hollow; distance from Allah", true) +
      fTxt("ʿAql — thoughts", prefix + ".aql", g.aql, "Automatic thoughts / appraisals in the moment", true) +
      '<div class="fig-full fig-qalb">' + fTxt("Qalb — state of the heart", prefix + ".qalb", g.qalb, "The resultant state of the heart at the center of the cycle", true) + "</div>" +
      '<div><span class="flabel">Iḥsās — emotions</span>' +
        fTxt("Primary emotion", prefix + ".primary", g.primary, "") +
        fTxt("Secondary emotion", prefix + ".secondary", g.secondary, "") +
        fTxt("Instrumental emotion", prefix + ".instrumental", g.instrumental, "") + "</div>" +
      '<div><span class="flabel">Nafs — behavioral inclinations</span>' +
        fTxt("Safety behaviors", prefix + ".safety", g.safety, "") +
        fTxt("Avoidance behaviors", prefix + ".avoidance", g.avoidance, "") +
        fTxt("Pain / pleasure", prefix + ".pain", g.pain, "") + "</div>" +
      "</div>";
  }

  function formSectionBody(id, f) {
    if (id === "profile") return '<p class="hint">A concise narrative of who the patient is. Use a de-identified alias only.</p>' +
      fTxt("Case alias (never real names)", "alias", f.alias, "e.g., Case M-42") +
      fTxt("Profile / demographics", "profile", f.profile, "Age, gender, marital status, education, occupation, socioeconomic status…", true);
    if (id === "presenting") return '<p class="hint">The patient’s chief complaints, in their own terms where possible.</p>' +
      fTxt("Presenting problem / complaints", "presenting", f.presenting, "", true);
    if (id === "precipitating") return '<p class="hint">The recent, specific incident or catalyst that triggered the current symptoms — what led the patient to seek therapy at this particular time.</p>' +
      fTxt("Precipitating event", "precipitating", f.precipitating, "", true);
    if (id === "history") return '<p class="hint">Upbringing; grief, loss, trauma or neglect; family of origin and structure; socioeconomic, cultural and religious background; familial mental health — linked to the current issues.</p>' +
      fTxt("Significant early or life experiences", "history", f.history, "", true);
    if (id === "assess") return FORM_RATINGS.map(function (r) {
        return '<span class="flabel">' + r[1] + "</span>" + pillGroup("l1f-" + r[0], "assess." + r[0], r[2], f.assess[r[0]]);
      }).join("");
    if (id === "additional") return '<p class="hint">Anything else relevant to the case: current medication, alcohol/drug use, suicidal ideation, etc.</p>' +
      fTxt("Additional details", "additional", f.additional, "", true);
    if (id === "dsm") return fTxt("Diagnosis (DSM-5)", "dsm", f.dsm, "e.g., F41.1 Generalized Anxiety Disorder", true);
    if (id === "elements") return '<p class="hint">Fill in every TIIP element, with a concrete example for each item you mark.</p>' +
      TIIP_ELEMENTS.map(function (el) {
        return '<div class="el-block"><h4>' + el.label + '</h4><div class="chkgrid">' + el.items.map(function (it) {
          var st = f.elements[el.key][it[0]] || {};
          return '<div class="chk-item' + (st.on ? " on" : "") + '"><label><input type="checkbox" data-el="' + el.key + ":" + it[0] + '"' + (st.on ? " checked" : "") + ' /> <span>' + it[1] + "</span></label>" +
            '<input class="spec" type="text" placeholder="Specify with an example…" data-eln="' + el.key + ":" + it[0] + '" value="' + esc(st.note || "") + '" /></div>';
        }).join("") + "</div></div>";
      }).join("");
    if (id === "dominant") return '<p class="hint">Specify only one dominant area of dysfunction.</p>' +
      pillGroup("l1f-dominant", "dominant", PLAN_DOMAINS, f.dominant);
    if (id === "narrative") return '<p class="hint">Weave together the complaints, early experiences, precipitating factors and areas of dysfunction from a TIIP perspective — a summary encompassing all elements, their interconnections, and the specific formation that explains the vicious cycle.</p>' +
      fTxt("Narrative conceptualization", "narrative", f.narrative, "", true);
    if (id === "plan") return '<p class="hint">State a therapy goal, a TIIP signature intervention, and details for each of the four domains.</p>' +
      '<div class="ex-row"><span class="tag gold">Example</span> <b>Goal:</b> Externalize and cognitively defuse negative thinking from beliefs · <b>Intervention:</b> RIDA · <b>Details:</b> Teach the client they are not their thoughts; externalize negative thinking to Shayṭān’s running narrative.</div>' +
      f.plan.map(function (row, i) {
        return '<div class="plan-row"><span class="tag gold">' + row.domain + "</span>" +
          '<div class="field"><label>Goal</label><input type="text" data-plan="' + i + ':goal" value="' + esc(row.goal) + '" /></div>' +
          '<div class="field"><label>TIIP intervention</label><input type="text" data-plan="' + i + ':intervention" placeholder="e.g., RIDA, murāqabah, two-chair…" value="' + esc(row.intervention) + '" /></div>' +
          '<div class="field"><label>Details</label><input type="text" data-plan="' + i + ':details" value="' + esc(row.details) + '" /></div></div>';
      }).join("");
    if (id === "prognosis") return '<p class="hint">Your prediction of the expected outcome of treatment — how likely is full remission?</p>' +
      fTxt("Prognosis", "prognosis", f.prognosis, "", true);
    if (id === "figure") return '<p class="hint">Start from a specific triggering situation, then map the thoughts, emotions, behaviors and spiritual symptoms it induced — with the qalb at the center of the cycle.</p>' +
      figHTML("fig", f.fig) +
      '<details style="margin-top:12px;"><summary style="cursor:pointer;font-size:.82rem;color:var(--muted);">＋ Situation 2 (optional)</summary>' + figHTML("fig2", f.fig2) + "</details>";
    return "";
  }

  function hideFormulationCard() {
    var card = document.getElementById("l1-formulation-card");
    card.style.display = "none"; card.innerHTML = ""; card.removeAttribute("data-built");
  }

  function renderFormulation(modsDone) {
    var card = document.getElementById("l1-formulation-card");
    card.style.display = "block";
    var f = state.learning.l1Formulation;
    if (!modsDone) {
      var left = state.learning.l1.filter(function (m) { return !m.done; }).length;
      card.removeAttribute("data-built");
      card.innerHTML = '<h3>📝 TIIP Case Formulation Sheet <span class="tag dim">🔒 Locked</span></h3>' +
        '<p class="view-lead" style="margin-bottom:0;font-size:.85rem;">The end-of-level case conceptualization opens once every module is complete — ' + left + " module" + (left === 1 ? "" : "s") + ' to go. It follows the Khalil Center <strong>TIIP Case Formulation Sheet</strong>: no section may be left empty, and submissions are reviewed by a supervisor before Level 1 is credited.</p>';
      return;
    }

    /* preserve which sections were open across re-renders */
    var open = {};
    var prev = card.querySelectorAll("details.fsec[open]");
    for (var i = 0; i < prev.length; i++) open[prev[i].getAttribute("data-sec")] = true;
    if (!prev.length && !card.getAttribute("data-built")) open.profile = true;
    card.setAttribute("data-built", "1");

    var doneCount = FORM_SECTIONS.filter(function (s) { return s.done(f); }).length;
    var sub = state.learning.l1Submission;
    card.innerHTML = '<h3>📝 TIIP Case Formulation Sheet' + (sub ? ' <span class="tag ok">Submitted</span>' : "") + "</h3>" +
      '<p class="view-lead" style="margin-bottom:12px;font-size:.85rem;">Complete every section — <strong>no section may be left empty</strong>. Use a de-identified case alias only. Your formulation is reviewed by a supervisor before Level 1 is credited.</p>' +
      '<div class="prog"><div class="prog-head"><b>Sections complete</b><span id="l1f-count">' + doneCount + " / " + FORM_SECTIONS.length + '</span></div><div class="bar"><i id="l1f-bar" style="width:' + Math.round(doneCount / FORM_SECTIONS.length * 100) + '%"></i></div></div>' +
      FORM_SECTIONS.map(function (s, idx) {
        var ok = s.done(f);
        return '<details class="fsec" data-sec="' + s.id + '"' + (open[s.id] ? " open" : "") + ">" +
          '<summary><span class="sec-num">' + (idx + 1) + "</span><b>" + s.title + '</b><span class="tag ' + (ok ? "ok" : "dim") + '" data-sec-tag="' + s.id + '">' + (ok ? "✓ Complete" : "To do") + "</span></summary>" +
          '<div class="fsec-body">' + formSectionBody(s.id, f) + "</div></details>";
      }).join("") +
      '<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:14px;">' +
      '<button class="btn btn-gold" id="l1f-submit"' + (doneCount === FORM_SECTIONS.length ? "" : " disabled") + ">" + (sub ? "Resubmit for review" : "Submit for supervisor review") + "</button>" +
      '<button class="btn btn-ghost" id="l1f-download">⬇ Download draft (.txt)</button>' +
      '<span class="tag dim">Drafts save automatically (demo · localStorage)</span></div>' +
      '<p class="note"><b>Submission guidelines:</b> every section completed · electronic format only (no handwriting or images) · file named <em>Name_Surname_TIIP Level 1 Case Formulation</em>. Non-compliant submissions are not evaluated.</p>';

    bindFormulation(card, f);
  }

  function updateFormulationMeta(card, f) {
    var done = 0;
    FORM_SECTIONS.forEach(function (s) {
      var ok = s.done(f); if (ok) done++;
      var tag = card.querySelector('[data-sec-tag="' + s.id + '"]');
      if (tag) { tag.className = "tag " + (ok ? "ok" : "dim"); tag.textContent = ok ? "✓ Complete" : "To do"; }
    });
    card.querySelector("#l1f-count").textContent = done + " / " + FORM_SECTIONS.length;
    card.querySelector("#l1f-bar").style.width = Math.round(done / FORM_SECTIONS.length * 100) + "%";
    card.querySelector("#l1f-submit").disabled = done !== FORM_SECTIONS.length;
    var cap = document.getElementById("l1-cap-tag");
    if (cap && !state.learning.l1Submission) {
      cap.className = "tag warn";
      cap.textContent = done + " / " + FORM_SECTIONS.length + " sections complete";
    }
  }

  function bindFormulation(card, f) {
    /* assigned as properties (not addEventListener) so re-renders never stack handlers */
    card.oninput = function (e) {
      var t = e.target;
      var p = t.getAttribute("data-f");
      if (p) { fSet(f, p, t.value); save(); updateFormulationMeta(card, f); return; }
      var pl = t.getAttribute("data-plan");
      if (pl) { var a = pl.split(":"); f.plan[Number(a[0])][a[1]] = t.value; save(); updateFormulationMeta(card, f); return; }
      var en = t.getAttribute("data-eln");
      if (en) {
        var b = en.split(":");
        var st = f.elements[b[0]][b[1]] || { on: true, note: "" };
        st.note = t.value; f.elements[b[0]][b[1]] = st; save();
      }
    };
    card.onchange = function (e) {
      var t = e.target;
      if (t.type === "radio" && t.getAttribute("data-f")) {
        fSet(f, t.getAttribute("data-f"), t.value); save();
        var group = t.closest(".pill-group");
        if (group) group.querySelectorAll(".pill").forEach(function (p) { p.classList.remove("sel"); });
        t.closest(".pill").classList.add("sel");
        updateFormulationMeta(card, f);
      }
      if (t.type === "checkbox" && t.getAttribute("data-el")) {
        var a = t.getAttribute("data-el").split(":");
        var st = f.elements[a[0]][a[1]] || { on: false, note: "" };
        st.on = t.checked; f.elements[a[0]][a[1]] = st; save();
        t.closest(".chk-item").classList.toggle("on", t.checked);
        updateFormulationMeta(card, f);
      }
    };
    card.onclick = function (e) {
      var id = e.target.id;
      if (id === "l1f-submit") {
        if (!FORM_SECTIONS.every(function (s) { return s.done(f); })) return;
        state.learning.l1Submission = {
          name: ROLES[state.role].name.replace(/\s+/g, "_") + "_TIIP Level 1 Case Formulation",
          at: iso(new Date())
        };
        save(); renderLearning();
      }
      if (id === "l1f-download") downloadFormulation(f);
    };
  }

  function downloadFormulation(f) {
    var L = [];
    function head(t) { L.push("", t.toUpperCase(), "-".repeat(t.length)); }
    L.push("TIIP CASE FORMULATION SHEET", "Khalil Center | TIIP Level 1", "Candidate: " + ROLES[state.role].name);
    head("Patient (alias)"); L.push(f.alias || "—");
    head("Patient profile / demographics"); L.push(f.profile || "—");
    head("Presenting problem / complaints"); L.push(f.presenting || "—");
    head("Precipitating event"); L.push(f.precipitating || "—");
    head("Significant early or life experiences"); L.push(f.history || "—");
    head("Assessment");
    FORM_RATINGS.forEach(function (r) { L.push(r[1] + ": " + (f.assess[r[0]] || "—")); });
    head("Additional details"); L.push(f.additional || "—");
    head("Diagnosis (DSM-5)"); L.push(f.dsm || "—");
    head("Diagnosis (TIIP elements)");
    TIIP_ELEMENTS.forEach(function (el) {
      L.push(el.label + ":");
      el.items.forEach(function (it) {
        var st = f.elements[el.key][it[0]];
        if (st && st.on) L.push("  [x] " + it[1] + (st.note ? " — " + st.note : ""));
      });
    });
    head("Dominant area of dysfunction"); L.push(f.dominant || "—");
    head("Conceptualization (narrative form)"); L.push(f.narrative || "—");
    head("Therapy plan");
    f.plan.forEach(function (r) { L.push(r.domain + " — Goal: " + (r.goal || "—") + " | Intervention: " + (r.intervention || "—") + " | Details: " + (r.details || "—")); });
    head("Prognosis"); L.push(f.prognosis || "—");
    [["Situation 1", f.fig], ["Situation 2", f.fig2]].forEach(function (p) {
      var g = p[1];
      if (p[0] === "Situation 2" && !Object.keys(g).some(function (k) { return filled(g[k]); })) return;
      head("Figure — " + p[0]);
      L.push("Situation/trigger: " + (g.situation || "—"),
        "Ruh/spirit: " + (g.ruh || "—"),
        "'Aql/thoughts: " + (g.aql || "—"),
        "Qalb/heart: " + (g.qalb || "—"),
        "Ihsas — primary: " + (g.primary || "—") + " | secondary: " + (g.secondary || "—") + " | instrumental: " + (g.instrumental || "—"),
        "Nafs — safety: " + (g.safety || "—") + " | avoidance: " + (g.avoidance || "—") + " | pain/pleasure: " + (g.pain || "—"));
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([L.join("\n")], { type: "text/plain" }));
    a.download = ROLES[state.role].name.replace(/[^\w]+/g, "_") + "_TIIP_Level_1_Case_Formulation.txt";
    a.click(); URL.revokeObjectURL(a.href);
  }

  /* ---- Directory ---- */
  function renderDirectory() {
    var q = (document.getElementById("dir-q").value || "").toLowerCase();
    var lvl = document.getElementById("dir-level").value;
    var lang = document.getElementById("dir-lang").value;
    var tz = document.getElementById("dir-tz").value;
    var focus = document.getElementById("dir-focus").value;
    var lic = document.getElementById("dir-lic").value;
    var list = DIRECTORY.filter(function (d) {
      if (q && (d.name + " " + d.city + " " + d.focus.join(" ") + " " + d.cred).toLowerCase().indexOf(q) === -1) return false;
      if (lvl && d.level !== lvl) return false;
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
        '<div class="tags"><span class="tag warn">' + DIR_LEVELS[d.level] + "</span>" +
        d.langs.map(function (l) { return '<span class="tag">' + l + "</span>"; }).join("") +
        d.focus.map(function (f) { return '<span class="tag gold">' + f + "</span>"; }).join("") +
        '<span class="tag dim">' + d.lic + "</span></div>" +
        '<div class="foot"><span>🕐 ' + localTime + " local</span>" +
        (d.accepting ? '<span class="tag ok">Accepting referrals</span>' : '<span class="tag dim">Waitlist</span>') + "</div></div>";
    }).join("");
  }
  ["dir-q", "dir-level", "dir-lang", "dir-tz", "dir-focus", "dir-lic"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderDirectory);
  });

  /* ---- Certification pathway ---- */
  function renderPathway() {
    var stage = ROLE_STAGE[state.role] != null ? ROLE_STAGE[state.role] : 0;
    var certified = stage >= PATHWAY.length - 1;
    document.getElementById("pw-where").textContent = certified
      ? (state.role === "supervisor" ? "Fully certified · TIIP Supervisor" : "Fully certified")
      : "You are at " + PATHWAY[stage].name;
    document.getElementById("pathway-steps").innerHTML = PATHWAY.map(function (p, i) {
      var cls = i < stage ? "done" : i === stage ? (certified ? "done current" : "current") : "";
      return '<div class="pw-step ' + cls + '">' +
        '<span class="pw-dot">' + (i < stage ? "✓" : p.num) + "</span>" +
        "<div>" +
        '<span class="pw-name">' + p.name + "</span>" +
        '<span class="pw-title">' + p.title + "</span>" +
        '<span class="pw-desc">' + p.desc + "</span>" +
        (i === stage ? '<span class="pw-here">You are here</span>' : "") +
        "</div></div>";
    }).join("");
  }

  function renderModules() {
    var series = state.learning.l0;
    var doneCount = series.filter(function (m) { return m.done; }).length;
    document.getElementById("mod-sum").textContent = doneCount + " / " + series.length + " watched";
    document.getElementById("mod-rows").innerHTML = series.map(function (m, i) {
      return '<div class="row"><span class="grow"><b>' + esc(m.title) + "</b><small>" + m.mins + " min · video module</small></span>" +
        (m.done ? '<span class="tag ok">Watched</span>' : '<button class="btn btn-gold btn-xs" data-watch="' + i + '">▶ Watch</button>') +
        "</div>";
    }).join("");
    document.querySelectorAll("[data-watch]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.learning.l0[Number(b.getAttribute("data-watch"))].done = true;
        save(); renderModules();
      });
    });
  }

  function renderCert() {
    renderPathway();
    var x = document.getElementById("cert-explorer");
    var t = document.getElementById("cert-trainee");
    var s = document.getElementById("cert-supervisor");
    var c = document.getElementById("cert-certified");
    x.style.display = t.style.display = s.style.display = c.style.display = "none";
    if (state.role === "explorer") {
      x.style.display = "block";
      renderModules();
    } else if (state.role === "practitioner") {
      c.style.display = "block";
    } else if (state.role === "trainee" || state.role === "admin") {
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
      var snap = [c.motivation && ["Motivation", c.motivation], c.support && ["Support", c.support], c.religiosity && ["Religiosity", c.religiosity]]
        .filter(Boolean).map(function (s) { return '<span class="tag dim">' + s[0] + ": " + esc(s[1]) + "</span>"; }).join(" ");
      return '<div class="thread"><div class="t-head"><b>' + esc(c.alias) + '</b><span>' +
        '<span class="tag gold">' + esc(c.primary) + " primary</span> " +
        (c.shared ? '<span class="tag ok">🔐 Shared · E2E</span>' : '<span class="tag dim">Private</span>') + "</span></div>" +
        '<div class="t-sub">Updated ' + c.updated + "</div>" +
        (snap ? '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px;">' + snap + "</div>" : "") +
        '<div style="margin-top:8px;font-size:.84rem;color:var(--muted);">' +
        "<p style='margin:0 0 6px;'><strong>Presenting:</strong> " + esc(c.presenting) + "</p>" +
        (c.precipitating ? "<p style='margin:0 0 6px;'><strong>Precipitating:</strong> " + esc(c.precipitating) + "</p>" : "") +
        "<p style='margin:0 0 4px;'><strong>ʿAql:</strong> " + esc(c.aql || "—") + "</p>" +
        "<p style='margin:0 0 4px;'><strong>Nafs:</strong> " + esc(c.nafs || "—") + "</p>" +
        "<p style='margin:0 0 4px;'><strong>Rūḥ:</strong> " + esc(c.ruh || "—") + "</p>" +
        "<p style='margin:0;'><strong>Iḥsās:</strong> " + esc(c.ihsas || "—") + "</p>" +
        (c.narrative ? "<p style='margin:6px 0 0;'><strong>Cycle:</strong> " + esc(c.narrative) + "</p>" : "") +
        "</div></div>";
    }).join("") : '<div class="empty">' + (isSup ? "No trainee cases shared with you yet." : "No conceptualizations yet.") + "</div>";
  }
  document.getElementById("case-form").addEventListener("submit", function (e) {
    e.preventDefault();
    state.cases.push({
      id: Date.now(),
      alias: document.getElementById("cf-alias").value,
      primary: document.getElementById("cf-primary").value,
      presenting: document.getElementById("cf-presenting").value,
      precipitating: document.getElementById("cf-precip").value,
      motivation: document.getElementById("cf-motivation").value,
      support: document.getElementById("cf-support").value,
      religiosity: document.getElementById("cf-religiosity").value,
      aql: document.getElementById("cf-aql").value,
      nafs: document.getElementById("cf-nafs").value,
      ruh: document.getElementById("cf-ruh").value,
      ihsas: document.getElementById("cf-ihsas").value,
      narrative: document.getElementById("cf-narrative").value,
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
  /* Member submissions store a date (+optional time) string; build a local Date. */
  function parseLocalDT(dateStr, timeStr) {
    var d = (dateStr || "").split("-");
    var t = (timeStr || "18:00").split(":");
    return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), Number(t[0] || 18), Number(t[1] || 0));
  }
  function approvedMemberEvents() {
    return state.memberEvents.filter(function (e) { return e.status === "approved"; }).map(function (e) {
      return { id: e.id, title: e.title, when: parseLocalDT(e.date, e.time), mins: e.mins, mode: e.mode, link: e.link, member: true, by: e.by };
    });
  }
  /* Official events plus admin-approved member submissions, sorted by date. */
  function allEvents() {
    return EVENTS.concat(approvedMemberEvents()).sort(function (a, b) { return a.when - b.when; });
  }
  function renderEvents() {
    var ALL = allEvents();
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "your local timezone";
    document.getElementById("tz-label").textContent = tz.replace(/_/g, " ");
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth();
    document.getElementById("cal-title").textContent = new Intl.DateTimeFormat([], { month: "long", year: "numeric" }).format(now);
    document.getElementById("cal-count").textContent = ALL.length + " events";
    var first = new Date(y, m, 1);
    var startDow = first.getDay();
    var daysIn = new Date(y, m + 1, 0).getDate();
    var html = ["S", "M", "T", "W", "T", "F", "S"].map(function (d) { return '<div class="dow">' + d + "</div>"; }).join("");
    for (var i = 0; i < startDow; i++) html += '<div class="cal-cell"></div>';
    for (var d = 1; d <= daysIn; d++) {
      var dayEvents = ALL.filter(function (ev) { return ev.when.getFullYear() === y && ev.when.getMonth() === m && ev.when.getDate() === d; });
      html += '<div class="cal-cell' + (d === now.getDate() ? " today" : "") + (dayEvents.length ? " has-ev" : "") + '"><span class="d">' + d + "</span>" +
        dayEvents.map(function (ev) { return '<span class="ev' + (ev.member ? " member" : "") + '">' + esc(ev.title) + "</span>"; }).join("") + "</div>";
    }
    document.getElementById("cal-grid").innerHTML = html;

    document.getElementById("event-rows").innerHTML = ALL.map(function (ev) {
      var going = !!state.rsvps[ev.id];
      return '<div class="row"><span class="grow"><b>' + esc(ev.title) + "</b><small>" + fmtLocal(ev.when) + " · " + ev.mins + ' min · <span class="tag dim" style="font-size:.58rem;">' + ev.mode + "</span>" + (ev.member ? ' <span class="tag gold" style="font-size:.58rem;">Member event</span>' : "") + "</small></span>" +
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
        var ev = ALL.find(function (x) { return x.id === b.getAttribute("data-ics"); });
        var dt = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
        var end = new Date(ev.when.getTime() + ev.mins * 60000);
        var ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TIIP Community//Portal//EN\r\nBEGIN:VEVENT\r\nUID:" + ev.id + "@tiip.community\r\nDTSTAMP:" + dt(new Date()) + "\r\nDTSTART:" + dt(ev.when) + "\r\nDTEND:" + dt(end) + "\r\nSUMMARY:" + ev.title + "\r\nURL:" + ev.link + "\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
        a.download = ev.id + ".ics"; a.click(); URL.revokeObjectURL(a.href);
      });
    });

    /* Propose an event — Level 1 and above (everyone except Level 0). */
    var canPropose = state.role !== "explorer";
    document.getElementById("event-form").style.display = canPropose ? "block" : "none";
    document.getElementById("propose-locked").style.display = canPropose ? "none" : "block";
    document.getElementById("propose-note").textContent = canPropose
      ? "Add an event to the community calendar. Every submission is reviewed by an admin before it is listed."
      : "Level 1 members and above can add events to the community calendar.";

    /* This member's own submissions */
    var mine = state.memberEvents.filter(function (e) { return e.by === ROLES[state.role].name; });
    document.getElementById("my-event-rows").innerHTML = mine.length ? mine.slice().reverse().map(function (e) {
      var tag = e.status === "approved" ? '<span class="tag ok">Approved · listed</span>' : e.status === "declined" ? '<span class="tag bad">Declined</span>' : '<span class="tag warn">Pending review</span>';
      return '<div class="row"><span class="grow"><b>' + esc(e.title) + "</b><small>" + esc(e.date) + (e.time ? " " + esc(e.time) : "") + " · " + e.mins + " min · " + esc(e.mode) + "</small></span>" + tag + "</div>";
    }).join("") : '<div class="empty">You haven’t submitted any events yet.</div>';

    /* Admin approval queue for member submissions */
    var adminEvCard = document.getElementById("event-admin-card");
    adminEvCard.style.display = state.role === "admin" ? "block" : "none";
    if (state.role === "admin") {
      var pending = state.memberEvents.filter(function (e) { return e.status === "pending"; });
      document.getElementById("event-approval-rows").innerHTML = pending.length ? pending.map(function (e) {
        return '<div class="row"><span class="grow"><b>' + esc(e.title) + "</b><small>By " + esc(e.by) + " · " + esc(e.date) + (e.time ? " " + esc(e.time) : "") + " · " + e.mins + " min · " + esc(e.mode) + "</small></span>" +
          '<button class="btn btn-gold btn-xs" data-ev-ok="' + e.id + '">Approve</button>' +
          '<button class="btn btn-ghost btn-xs" data-ev-no="' + e.id + '">Decline</button></div>';
      }).join("") : '<div class="empty">No submissions awaiting approval.</div>';
      document.querySelectorAll("[data-ev-ok]").forEach(function (b) {
        b.addEventListener("click", function () {
          var e = state.memberEvents.find(function (x) { return x.id === b.getAttribute("data-ev-ok"); });
          if (e) { e.status = "approved"; save(); renderEvents(); }
        });
      });
      document.querySelectorAll("[data-ev-no]").forEach(function (b) {
        b.addEventListener("click", function () {
          var e = state.memberEvents.find(function (x) { return x.id === b.getAttribute("data-ev-no"); });
          if (e) { e.status = "declined"; save(); renderEvents(); }
        });
      });
    }
  }
  document.getElementById("event-form").addEventListener("submit", function (e) {
    e.preventDefault();
    state.memberEvents.push({
      id: "me" + Date.now(),
      title: document.getElementById("ef-title").value,
      date: document.getElementById("ef-date").value,
      time: document.getElementById("ef-time").value || "18:00",
      mins: Number(document.getElementById("ef-mins").value || 90),
      mode: document.getElementById("ef-mode").value,
      link: document.getElementById("ef-link").value,
      by: ROLES[state.role].name,
      status: "pending"
    });
    save(); e.target.reset(); renderEvents();
  });

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
