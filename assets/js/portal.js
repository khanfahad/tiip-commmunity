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
    explorer:     { label: "Level 0 · TIIP Trainee", short: "Trainee", name: "Zaid Mahmood" },
    level1:       { label: "Level 1 · Trainee", short: "Trainee", name: "Nadia Bouchard" },
    level2:       { label: "Level 2 · Trainee", short: "Trainee", name: "Zayd Ibrahim" },
    trainee:      { label: "Level 3 · Trainee", short: "Trainee", name: "Amina Yusuf" },
    practitioner: { label: "Fully Certified Practitioner", short: "Practitioner", name: "Dr. Bilal Rahman" },
    supervisor:   { label: "Supervisor / Scholar", short: "Supervisor", name: "Dr. Hana Qadri" },
    admin:        { label: "Admin", short: "Admin", name: "Musa Adem" }
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
      /* ---- Members, level-change requests, training registry ---- */
      users: [
        { name: "Zaid Mahmood", role: "TIIP Trainee (Level 0)" },
        { name: "Hafsa Karim", role: "TIIP Trainee (Level 0)", city: "Lahore, PK" },
        { name: "Imran Baig", role: "Trainee (Level I)", city: "Karachi, PK" },
        { name: "Nadia Bouchard", role: "Trainee (Level I)", city: "Montreal, CA" },
        { name: "Zayd Ibrahim", role: "Trainee (Level II)", city: "Melbourne, AU" },
        { name: "Yusuf Chaudhry", role: "Trainee (Level II)", city: "Lahore, PK" },
        { name: "Amina Yusuf", role: "Trainee (Level III)" },
        { name: "Dr. Bilal Rahman", role: "Certified Practitioner" },
        { name: "Sarah Abdullah", role: "Certified Practitioner" },
        { name: "Dr. Hana Qadri", role: "Supervisor / Scholar" },
        { name: "Shaykh Idris Kamal", role: "Supervisor / Scholar" },
        { name: "Dr. Omar Farouk", role: "Supervisor / Scholar", city: "Cairo, EG" },
        { name: "Dr. Kemal Demir", role: "Supervisor / Scholar", city: "Ankara, TR" }
      ],
      levelRequests: [
        { name: "Hafsa Karim", from: "TIIP Trainee (Level 0)", to: "Trainee (Level I)", note: "Completed Foundations of TIIP", cert: "Hafsa_Karim_Level1_certificate.pdf" },
        { name: "Amina Yusuf", from: "Trainee (Level III)", to: "Certified Practitioner", note: "200 supervised hours & 10 cases approved", cert: "Amina_Yusuf_Level3_completion.pdf" }
      ],
      /* Who has completed / is registered for each level, with year & location.
         inv: none | invited | joined */
      registry: [
        { id: "rg1", name: "Omar Siddiqui", email: "omar.siddiqui@example.org", level: 1, status: "Registered", year: 2026, loc: "Chicago, US", inv: "none" },
        { id: "rg2", name: "Layla Haddad", email: "layla.haddad@example.org", level: 1, status: "Registered", year: 2026, loc: "Chicago, US", inv: "none" },
        { id: "rg3", name: "Yasir Anwar", email: "yasir.anwar@example.org", level: 1, status: "Registered", year: 2026, loc: "Chicago, US", inv: "none" },
        { id: "rg4", name: "Maha Ali", email: "maha.ali@example.org", level: 1, status: "Completed", year: 2025, loc: "Chicago, US", inv: "invited" },
        { id: "rg5", name: "Sana Qureshi", email: "sana.qureshi@example.org", level: 1, status: "Completed", year: 2025, loc: "Houston, US", inv: "none" },
        { id: "rg6", name: "Farah Nadeem", email: "farah.nadeem@example.org", level: 1, status: "Registered", year: 2026, loc: "Houston, US", inv: "none" },
        { id: "rg7", name: "Idris Mahmoud", email: "idris.mahmoud@example.org", level: 2, status: "Registered", year: 2026, loc: "Toronto, CA", inv: "none" },
        { id: "rg8", name: "Hamza Sheikh", email: "hamza.sheikh@example.org", level: 2, status: "Registered", year: 2026, loc: "Chicago, US", inv: "none" },
        { id: "rg9", name: "Tariq Mansour", email: "tariq.mansour@example.org", level: 2, status: "Completed", year: 2025, loc: "Dubai, AE", inv: "none" },
        { id: "rg10", name: "Yasmin Karim", email: "yasmin.karim@example.org", level: 3, status: "Completed", year: 2024, loc: "London, UK", inv: "joined" }
      ],
      /* Level 1 & 2 case conceptualizations. status: pending | passed | retry */
      submissions: [
        { id: "sb1", member: "Imran Baig", level: 1, alias: "Case R-27", file: "", at: iso(today(-3)), status: "pending", attempts: 1, feedback: "", history: [],
          summary: { presenting: "Adult male, panic episodes and avoidance of crowded places after a workplace incident.", dominant: "Nafs", narrative: "Perceived threat (trigger) → catastrophic appraisal (ʿaql) → racing heart and fear (iḥsās) → avoidance and safety behaviours (nafs) → withdrawal from congregational prayer (rūḥ), which maintains the cycle.", plan: "Interoceptive exposure, graded return to the masjid, dhikr-paced breathing.", prognosis: "Good with consistent practice." } },
        { id: "sb2", member: "Yusuf Chaudhry", level: 2, alias: "Case K-14", file: "K14_conceptualization.pdf", at: iso(today(-2)), status: "pending", attempts: 2, feedback: "",
          history: [{ at: iso(today(-12)), status: "retry", feedback: "Please tie the dominant area of dysfunction directly to the vicious-cycle narrative." }],
          summary: { presenting: "Young adult with depressive symptoms and a sense of spiritual distance.", dominant: "Rūḥ", narrative: "Unmet attachment needs (iḥsās) fuel harsh self-appraisals (ʿaql); withdrawal and neglect of worship (nafs) deepen the sense of distance from Allah (rūḥ), which feeds low mood.", plan: "Behavioural activation anchored in small acts of worship; compassion-focused reframing.", prognosis: "Fair to good; depends on engagement." } }
      ],
      /* Research library — contributed by Level 1+ members. */
      library: [
        { id: "lb1", title: "Scrupulosity and waswasah: a clinician’s primer", kind: "Article", category: "Clinical interventions", author: "Dr. Hana Qadri", by: "Dr. Hana Qadri", at: iso(today(-6)),
          summary: "A practical walk-through of telling clinical OCD apart from waswasah, with ERP framing that stays faith-consistent.", link: "https://example.org/waswasah-primer", file: "",
          likes: ["Dr. Bilal Rahman", "Amina Yusuf"], comments: [{ author: "Amina Yusuf", role: "Trainee", text: "The part on limiting repetition as an exposure target was exactly what I needed.", at: iso(today(-4)) }] },
        { id: "lb2", title: "The three states of the nafs as a formulation lens", kind: "Post", category: "Foundations & ontology", author: "Dr. Bilal Rahman", by: "Dr. Bilal Rahman", at: iso(today(-9)),
          summary: "A short post on using ammārah, lawwāmah, and muṭmaʾinnah to think about readiness for change and relapse risk.", link: "", file: "",
          likes: ["Amina Yusuf"], comments: [] },
        { id: "lb3", title: "Annotated reading list: classical sources on the diseases of the heart", kind: "Book", category: "Spiritual care & tazkiyah", author: "Compiled by Shaykh Idris Kamal", by: "Shaykh Idris Kamal", at: iso(today(-14)),
          summary: "A starter list for clinicians new to the classical literature on the heart. Add your own suggestions in the comments.", link: "", file: "Heart-diseases-reading-list.pdf",
          likes: ["Dr. Hana Qadri", "Dr. Bilal Rahman", "Amina Yusuf"], comments: [{ author: "Dr. Hana Qadri", role: "Supervisor", text: "Wonderful — I’ll share this with my supervision group.", at: iso(today(-12)) }] },
        { id: "lb4", title: "Grief after perinatal loss: faith-informed care", kind: "Article", category: "Trauma & grief", author: "Amina Yusuf", by: "Amina Yusuf", at: iso(today(-20)),
          summary: "Notes from practice on sabr, permission to grieve, and avoiding premature spiritual bypassing.", link: "https://example.org/perinatal-grief", file: "",
          likes: [], comments: [] },
        { id: "lb5", title: "Designing a small-N study of dhikr-based regulation", kind: "Article", category: "Research & evidence", author: "Dr. Bilal Rahman", by: "Dr. Bilal Rahman", at: iso(today(-26)),
          summary: "Single-case designs as a feasible way for clinicians to build evidence for murāqabah and dhikr protocols.", link: "", file: "SCED-dhikr-design.pdf",
          likes: ["Dr. Hana Qadri"], comments: [] }
      ],
      /* ---- Certification journey: per-member checklist flags ----
         l1_reg/l2_reg hold a training (cohort) id; done1/done2/done3 mark a
         level whose requirements are all complete; certified = panel passed. */
      journey: {
        "Zaid Mahmood": { flags: {}, notified: {} },
        "Hafsa Karim": { flags: {}, notified: {} },
        "Imran Baig": { flags: { l1_reg: "co-l1-chi", l1_att: true, l1_mod: true }, notified: {} },
        "Nadia Bouchard": { flags: { l1_reg: "co-l1-chi", l1_att: true, l1_mod: true, done1: true }, notified: { done1: true } },
        "Zayd Ibrahim": { flags: { l1_reg: "co-l1-onl", done1: true, l2_reg: "co-l2-tor", l2_att: true }, notified: { done1: true } },
        "Yusuf Chaudhry": { flags: { l1_reg: "co-l1-hou", done1: true, l2_reg: "co-l2-tor", l2_att: true }, notified: { done1: true } },
        "Amina Yusuf": { flags: { l1_reg: "co-l1-hou", done1: true, l2_reg: "co-l2-onl", done2: true }, notified: { done1: true, done2: true } },
        "Dr. Bilal Rahman": { flags: { done1: true, done2: true, done3: true, certified: true }, notified: { done1: true, done2: true, done3: true } },
        "Sarah Abdullah": { flags: { done1: true, done2: true, done3: true, certified: true }, notified: { done1: true, done2: true, done3: true } },
        "Dr. Hana Qadri": { flags: { done1: true, done2: true, done3: true, certified: true }, notified: { done1: true, done2: true, done3: true } },
        "Shaykh Idris Kamal": { flags: { done1: true, done2: true, done3: true, certified: true }, notified: { done1: true, done2: true, done3: true } },
        "Dr. Omar Farouk": { flags: { done1: true, done2: true, done3: true, certified: true }, notified: { done1: true, done2: true, done3: true } },
        "Dr. Kemal Demir": { flags: { done1: true, done2: true, done3: true, certified: true }, notified: { done1: true, done2: true, done3: true } }
      },
      /* Upcoming trainings (cohorts) members can register for */
      cohorts: [
        { id: "co-l1-onl", level: 1, title: "Level 1 · Foundations", date: iso(today(28)), loc: "Online", mode: "Online" },
        { id: "co-l1-chi", level: 1, title: "Level 1 · Foundations", date: iso(today(42)), loc: "Chicago, US", mode: "In person" },
        { id: "co-l1-hou", level: 1, title: "Level 1 · Foundations", date: iso(today(63)), loc: "Houston, US", mode: "In person" },
        { id: "co-l2-onl", level: 2, title: "Level 2 · Intermediate", date: iso(today(49)), loc: "Online", mode: "Online" },
        { id: "co-l2-tor", level: 2, title: "Level 2 · Intermediate", date: iso(today(70)), loc: "Toronto, CA", mode: "In person" }
      ],
      /* Email notifications (demo outbox): { id, to, cat, subject, body, at, read } */
      outbox: [
        { id: "em-seed1", to: "Nadia Bouchard", cat: "training", subject: "Level 2 training posted — Toronto, CA", body: "A new Level 2 · Intermediate training is open for registration (Toronto, CA).\nYou completed Level 1, so you can register from your Certification Journey.\n\nOpen the portal: portal.html#certification", at: iso(today(-3)) + " 09:00", read: false },
        { id: "em-seed2", to: "Musa Adem", cat: "review", subject: "Case conceptualization awaiting review — Imran Baig (Level 1)", body: "Imran Baig submitted a Level 1 case conceptualization.\n\nReview it in Administration → Reviews & letters.", at: iso(today(-3)) + " 14:20", read: false }
      ],
      prefs: {},
      /* Member directory / public profile listings, keyed by member name.
         publicStatus: none | pending | approved | changes | declined */
      listings: {
        "Yusuf Chaudhry": {
          internal: true, referrals: true, publicStatus: "pending", publicNote: "", updated: iso(today(-2)),
          data: { bio: "Counselor working with young adults and families in Lahore on anxiety, identity, and the pressures of study and work.", credentials: "MS, LPC · Counselor", license: "", education: "MS Counseling Psychology — Lahore", years: "6", city: "Lahore", state: "Punjab", country: "Pakistan", languages: "Urdu, English", specialties: "Anxiety, Youth & Adolescents", approach: "CBT-informed counseling with TIIP formulation", populations: "Young adults, Families", formats: "In person, Telehealth", accepting: "Accepting new clients", gender: "Male", contactEmail: "", off1_title: "Exam stress and the anxious student", off1_type: "Workshop", off1_desc: "Practical tools for students and parents.", off2_title: "", off2_type: "Workshop", off2_desc: "", off3_title: "", off3_type: "Workshop", off3_desc: "" },
          show: { about: true, credentials: true, location: true, languages: true, focus: true, services: true, gender: true, contact: false, offerings: true }
        }
      },
      /* Referrals sent through the internal directory */
      referrals: [],
      /* Level 3 panel presentation requests (scheduled with >= 3 supervisors) */
      panels: [],
      /* Intervention vault — community section (uploaded by fully certified
         clinicians, approved by a TIIP supervisor). status: pending | approved | declined */
      vault: [
        { id: "vt1", title: "Behavioural activation with a worship-anchored activity schedule", type: "Worksheet", lang: "English", tags: ["depression", "activation"], desc: "A weekly planner pairing graded activities with fixed points of worship to rebuild routine in depressive episodes.", file: "BA-worship-schedule.pdf", by: "Dr. Bilal Rahman", at: iso(today(-18)), status: "approved", approvedBy: "Dr. Hana Qadri", note: "" },
        { id: "vt2", title: "Grounding with dhikr — acute anxiety protocol (Urdu)", type: "Protocol", lang: "Urdu", tags: ["anxiety", "dhikr", "grounding"], desc: "A five-minute protocol for panic and acute anxiety using paced dhikr and sensory grounding; includes a client handout in Urdu.", file: "dhikr-grounding-ur.pdf", by: "Sarah Abdullah", at: iso(today(-30)), status: "approved", approvedBy: "Shaykh Idris Kamal", note: "" },
        { id: "vt3", title: "Two-chair dialogue adaptation for guilt and shame", type: "Protocol", lang: "English", tags: ["ihsas", "shame", "two-chair"], desc: "An adaptation of two-chair work for spiritual guilt, with safety framing and a closing murāqabah.", file: "two-chair-guilt.docx", by: "Dr. Bilal Rahman", at: iso(today(-2)), status: "pending", approvedBy: "", note: "" }
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
  var _seed = null; /* lazily-built defaults for migrating older saved states */
  ["users", "levelRequests", "registry", "submissions", "library", "journey", "cohorts", "outbox", "prefs", "listings", "referrals", "panels", "vault"].forEach(function (k) {
    if (!state[k]) { _seed = _seed || seedState(); state[k] = _seed[k]; }
  });
  delete state.pubs; /* the Publication Incubator was replaced by the Research Library */
  Object.keys(state.listings).forEach(function (n) { var l = state.listings[n]; if (l.publicStatus === "approved" && l.published && l.publishedLive == null) l.publishedLive = true; });
  ["Dr. Omar Farouk", "Dr. Kemal Demir"].forEach(function (n) { /* panels need 3+ supervisors */
    if (!state.users.some(function (u) { return u.name === n; })) state.users.push({ name: n, role: "Supervisor / Scholar" });
  });
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
    { name: "Dr. Fatima Malik", cred: "PhD · Certified", city: "Karachi, PK", region: "South Asia", tz: "Asia/Karachi", langs: ["Urdu", "English"], focus: ["Marital & family", "Addictions"], lic: "International", accepting: true },
    { name: "Nur Aisyah Binti Ahmad", cred: "MClinPsy · Certified", city: "Kuala Lumpur, MY", region: "SE Asia / Pacific", tz: "Asia/Kuala_Lumpur", langs: ["English"], focus: ["Youth & identity", "Anxiety & mood"], lic: "International", accepting: true },
    { name: "Dr. Kemal Demir", cred: "Clin. Psych · Supervisor", city: "Ankara, TR", region: "Europe / Africa", tz: "Europe/Istanbul", langs: ["Turkish"], focus: ["Trauma", "Marital & family"], lic: "International", accepting: true },
    { name: "Sarah Abdullah", cred: "LCSW · Certified", city: "New Jersey, US", region: "Americas", tz: "America/New_York", langs: ["English", "Arabic"], focus: ["OCD / Waswasah", "Youth & identity"], lic: "US state-specific", accepting: true }
  
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

  /* Members and level requests live in `state` (persisted); these aliases
     are re-pointed whenever state is replaced (e.g., demo reset). */
  var ADMIN_USERS = state.users;
  var LEVEL_REQUESTS = state.levelRequests;

  /* ---------------------------------------------------------
     Shell: role switching, nav, router
  --------------------------------------------------------- */
  var navBtns = document.querySelectorAll(".p-nav button");
  var views = document.querySelectorAll(".view");
  var viewTitle = document.getElementById("view-title");
  var roleSelect = document.getElementById("role-select");

  var VIEW_TITLES = {
    dashboard: "Dashboard", admin: "Administration", notifications: "Notifications", learning: "Resources & Modules", directory: "Member Directory", profile: "My Profile & Listing", certification: "Certification Journey",
    sandbox: "TIIP Conceptualization Sandbox", fatwa: "Scholarly Consultation Desk",
    resources: "Multilingual Intervention Vault", library: "Islamic Psychology Research Library", events: "Events & Training Calendar",
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
    updateBadge();
    navBtns.forEach(function (btn) {
      var ok = roleAllows(btn);
      btn.classList.toggle("locked", !ok);
      var lock = btn.querySelector(".lock");
      if (!ok && !lock) { lock = document.createElement("span"); lock.className = "lock"; lock.textContent = "🔒"; btn.appendChild(lock); }
      if (ok && lock) lock.remove();
    });
  }

  var VIEW_ALIAS = { vault: "certification", incubator: "library" };
  function show(view) {
    if (VIEW_ALIAS[view]) view = VIEW_ALIAS[view];
    if (!VIEW_TITLES[view]) view = "dashboard";
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
      state = seedState(); ADMIN_USERS = state.users; LEVEL_REQUESTS = state.levelRequests; save(); applyRole(); show("dashboard");
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

  /* Administration bindings (elements always present in the DOM) */
  var adminSearchEl = document.getElementById("admin-user-search");
  adminSearchEl.addEventListener("input", function () { renderAdminUsers(adminSearchEl.value); });
  ["rf-q", "rf-level", "rf-status", "rf-year", "rf-loc", "rf-inv"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderRegistry);
  });
  document.getElementById("rg-level").addEventListener("change", syncRegForm);
  document.getElementById("reg-form").addEventListener("submit", function (e) { e.preventDefault(); addRegistryRecord(true); });
  document.getElementById("rg-add").addEventListener("click", function () { addRegistryRecord(false); });
  document.getElementById("reg-bulk").addEventListener("click", bulkInvite);

  /* ---------------------------------------------------------
     Renderers
  --------------------------------------------------------- */
  function renderView(view) {
    if (view === "dashboard") renderDashboard();
    if (view === "learning") renderLearning();
    if (view === "directory") renderDirectory();
    if (view === "certification") renderJourney();
    if (view === "profile") renderProfile();
    if (view === "notifications") renderNotifications();
    if (view === "sandbox") renderSandbox();
    if (view === "fatwa") renderFatwa();
    if (view === "resources") renderResources();
    if (view === "library") renderLibrary();
    if (view === "admin") renderAdmin();
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
      level1: "As-salāmu ʿalaykum, Nadia. You're at Level 1 — track your checklist in the Certification Journey, and register for the next training when you're ready.",
      level2: "As-salāmu ʿalaykum, Zayd. You're at Level 2 — submit your case conceptualization; an admin will pass it or ask you to retry, and you'll be emailed the result.",
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
        { n: "L" + standing(viewerName()), l: "Current level" },
        { n: watched + "<i>/" + state.learning.l0.length + "</i>", l: "Parts watched" },
        { n: state.outbox.filter(function (e) { return e.to === viewerName() && !e.read; }).length, l: "Unread emails" },
        { n: EVENTS.length, l: "Upcoming events" }
      ];
    } else if (state.role === "level1" || state.role === "level2") {
      var jn = viewerName(), jlv = standing(jn), jt = jlv >= 2 ? 2 : 1;
      var jr = reqs(jn, jt), jd = jr.filter(function (r) { return r.done; }).length;
      tiles = [
        { n: "L" + jlv, l: "Current level" },
        { n: jd + "<i>/" + jr.length + "</i>", l: "Level " + jt + " checklist" },
        { n: state.outbox.filter(function (e) { return e.to === jn && !e.read; }).length, l: "Unread emails" },
        { n: allEvents().length, l: "Upcoming events" }
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
        { n: state.submissions.filter(function (x) { return x.status === "pending"; }).length, l: "Reviews awaiting you" },
        { n: state.registry.filter(function (r) { return r.inv === "none"; }).length, l: "Registry — not invited" },
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
      explorer: [["certification", "Register for Level 1"], ["learning", "Watch the six-part series"], ["events", "Browse events"], ["notifications", "My emails"]],
      level1: [["certification", "My certification journey"], ["profile", "Create my directory listing"], ["directory", "Member directory"], ["library", "Research library"]],
      level2: [["learning", "Submit case conceptualization"], ["certification", "My certification journey"], ["profile", "My profile & public listing"], ["directory", "Member directory"]],
      trainee: [["certification", "Log hours & track Level 3"], ["learning", "Written case conceptualization"], ["profile", "My profile & listing"], ["fatwa", "Ask a scholar"]],
      practitioner: [["directory", "Find a referral"], ["profile", "My profile & listing"], ["resources", "Upload an intervention"], ["certification", "Update CE records"]],
      supervisor: [["certification", "Review hours & panels"], ["resources", "Approve interventions"], ["sandbox", "Review shared cases"], ["fatwa", "Answer scholar queries"]],
      admin: [["admin", "Administration & invitations"], ["events", "Approve events"], ["library", "Moderate the library"], ["resources", "Publish a resource"]]
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
  }

  /* ---- Case-conceptualization submissions (Levels 1–3) ---- */
  var SUB_LABEL = { pending: "Awaiting admin review", passed: "Passed", retry: "Retry requested" };
  function findSubmission(member, level) {
    return state.submissions.find(function (x) { return x.member === member && x.level === level; }) || null;
  }
  function mySub(level) { return findSubmission(viewerName(), level); }
  function subTags(sb) {
    var cls = sb.status === "passed" ? "ok" : sb.status === "retry" ? "retry" : "warn";
    var txt = sb.status === "passed" ? "Passed · Level " + sb.level + " credited" : SUB_LABEL[sb.status];
    return '<span class="tag ' + cls + '">' + txt + '</span><span class="tag dim">Attempt ' + (sb.attempts || 1) + " · " + esc(sb.at) + "</span>";
  }
  function feedbackNote(sb) {
    var graded = sb.gradedFile ? '<div style="margin-top:4px;">' + fileLink(sb.gradedFile) + " <small>(graded copy)</small></div>" : "";
    if (sb.status === "retry") return '<div class="fb-note retry"><b>Admin feedback — please revise and resubmit:</b> ' + esc(sb.feedback) + graded + "</div>";
    if (sb.status === "passed" && (sb.feedback || sb.gradedFile)) return '<div class="fb-note passed"><b>Admin feedback:</b> ' + esc(sb.feedback || "Passed.") + graded + "</div>";
    return "";
  }
  /* create or update (resubmit) the viewer's submission for a level */
  function submitConceptualization(level, alias, summary, info) {
    var member = viewerName();
    var sb = findSubmission(member, level);
    if (sb) {
      sb.alias = alias; sb.summary = summary; sb.file = info ? info.name : (sb.file || ""); sb.fileInfo = info || sb.fileInfo || null;
      sb.at = iso(new Date()); sb.status = "pending"; sb.attempts = (sb.attempts || 1) + 1; sb.feedback = ""; sb.gradedFile = null;
    } else {
      state.submissions.push({ id: "sb" + Date.now(), member: member, level: level, alias: alias, file: info ? info.name : "", fileInfo: info || null, at: iso(new Date()),
        status: "pending", attempts: 1, feedback: "", history: [], summary: summary });
    }
    save();
    notify(ADMIN_NAME, "review", "Case conceptualization awaiting review — " + member + " (Level " + level + ")", member + " submitted a Level " + level + " case conceptualization (" + (alias || "untitled case") + ").\n\nReview it in Administration → Reviews & letters.");
    notify(member, "review", "We received your Level " + level + " case conceptualization", "Your submission is with the admin team. You'll be emailed the result — passed, or a request to revise and retry with feedback.");
    checkProgress(member);
  }

  /* ---- Administration ---- */
  var ROLE_OPTIONS = ["TIIP Trainee (Level 0)", "Trainee (Level I)", "Trainee (Level II)", "Trainee (Level III)", "Certified Practitioner", "Supervisor / Scholar", "Admin"];
  var adminTab = "reviews";

  function pendingListings() { return Object.keys(state.listings).filter(function (n) { return state.listings[n].publicStatus === "pending"; }); }
  function pendingLetters() {
    return Object.keys(state.journey).filter(function (n) { var L = state.journey[n].letter; return L && L.status === "pending"; });
  }
  function unattended() {
    var out = [];
    ADMIN_USERS.forEach(function (u) {
      [1, 2].forEach(function (n) {
        if (fl(u.name, "l" + n + "_reg") && !fl(u.name, "l" + n + "_att") && !fl(u.name, "done" + n)) out.push({ name: u.name, level: n });
      });
    });
    return out;
  }

  function renderAdmin() {
    var counts = {
      reviews: state.submissions.filter(function (x) { return x.status === "pending"; }).length + pendingLetters().length,
      trainings: unattended().length,
      directory: pendingListings().length,
      panels: state.panels.filter(function (x) { return x.status === "requested"; }).length,
      members: LEVEL_REQUESTS.length,
      emails: 0
    };
    var TABS = [["reviews", "Reviews & letters"], ["trainings", "Trainings & registry"], ["directory", "Directory requests"], ["panels", "Level 3 panels"], ["members", "Members"], ["emails", "Email log"]];
    document.getElementById("admin-tabs").innerHTML = TABS.map(function (t) {
      return '<button type="button" class="cat-chip' + (adminTab === t[0] ? " sel" : "") + '" data-admin-tab="' + t[0] + '">' + t[1] + (counts[t[0]] ? '<span class="tab-count">' + counts[t[0]] + "</span>" : "") + "</button>";
    }).join("");
    document.querySelectorAll(".admin-pane").forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-pane") === adminTab); });
    renderReviews(); renderLetters();
    renderCohorts(); renderAttendance(); syncRegForm(); renderRegistry();
    renderListingRequests();
    renderPanels();
    renderRequests(); renderAdminUsers(document.getElementById("admin-user-search").value || "");
    renderEmailLog();
  }
  document.getElementById("admin-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-admin-tab]");
    if (!b) return;
    adminTab = b.getAttribute("data-admin-tab"); renderAdmin();
  });

  /* -- case conceptualization reviews (with graded-file upload) -- */
  var SUMMARY_LABELS = [["presenting", "Presenting problem"], ["dominant", "Dominant area of dysfunction"], ["narrative", "Conceptualization (narrative)"], ["plan", "Therapy plan"], ["prognosis", "Prognosis"]];
  function renderReviews() {
    var el = document.getElementById("admin-reviews");
    var pend = state.submissions.filter(function (x) { return x.status === "pending"; });
    document.getElementById("rev-count").textContent = pend.length + " awaiting";
    var ordered = state.submissions.slice().sort(function (a, b) {
      if ((a.status === "pending") !== (b.status === "pending")) return a.status === "pending" ? -1 : 1;
      return a.at < b.at ? 1 : -1;
    });
    el.innerHTML = ordered.length ? ordered.map(function (sb) {
      var body = SUMMARY_LABELS.filter(function (l) { return filled(sb.summary && sb.summary[l[0]]); }).map(function (l) {
        return "<p><strong>" + l[1] + ":</strong> " + esc(sb.summary[l[0]]) + "</p>";
      }).join("") || "<p>No written summary attached.</p>";
      var attach = sb.fileInfo ? "<p><strong>Attachment:</strong> " + fileLink(sb.fileInfo) + "</p>" : sb.file ? "<p><strong>Attachment:</strong> 📎 " + esc(sb.file) + "</p>" : "";
      var hist = (sb.history || []).map(function (h) {
        return '<div class="fb-note ' + (h.status === "retry" ? "retry" : "passed") + '"><b>' + esc(h.at) + " · " + (h.status === "retry" ? "Retry requested" : "Passed") + ":</b> " + esc(h.feedback || "—") + (h.gradedName ? " · 📎 " + esc(h.gradedName) : "") + "</div>";
      }).join("");
      var decide = sb.status === "pending"
        ? '<div class="rv-form"><div class="field"><label>Feedback to the member</label><textarea data-fb="' + sb.id + '" placeholder="Required if you ask for a retry — say what to revise"></textarea></div>' +
          '<div class="field"><label>Graded / commented copy <span style="text-transform:none;letter-spacing:0;font-weight:500;">(optional · PDF or Word)</span></label><input type="file" data-gf="' + sb.id + '" accept=".pdf,.doc,.docx" /></div>' +
          '<div class="rv-btns"><button class="btn btn-gold btn-xs" data-pass="' + sb.id + '">Pass — credit Level ' + sb.level + '</button>' +
          '<button class="btn btn-ghost btn-xs" data-retry="' + sb.id + '">Ask to retry</button></div></div>'
        : (sb.gradedFile ? '<p class="view-lead" style="margin:10px 0 0;font-size:.8rem;">Graded copy sent: ' + fileLink(sb.gradedFile) + "</p>" : "");
      return '<div class="review-item"><div class="rv-head"><span class="grow"><b>' + esc(sb.member) + " — Level " + sb.level + " case conceptualization</b><small>" +
        esc(sb.alias || "Untitled case") + " · submitted " + esc(sb.at) + "</small></span>" + subTags(sb) + "</div>" +
        "<details><summary>View submission &amp; history</summary><div class='rv-body'>" + body + attach + hist + "</div></details>" + decide + "</div>";
    }).join("") : '<div class="empty">No case conceptualizations have been submitted yet.</div>';

    function decideOn(id, status) {
      var sb = state.submissions.find(function (x) { return x.id === id; });
      var ta = el.querySelector('[data-fb="' + id + '"]');
      var gf = el.querySelector('[data-gf="' + id + '"]');
      var fb = ta ? ta.value.trim() : "";
      if (!sb) return;
      if (status === "retry" && !fb) {
        ta.focus(); ta.style.borderColor = "#b64d4d"; ta.placeholder = "Please add feedback so the member knows what to revise";
        return;
      }
      readFileInfo(gf && gf.files[0], function (info) {
        sb.history = sb.history || [];
        sb.history.push({ at: iso(new Date()), status: status, feedback: fb, gradedName: info ? info.name : "" });
        sb.status = status; sb.feedback = fb; sb.gradedFile = info;
        var lead = status === "passed" ? "Your Level " + sb.level + " case conceptualization (" + (sb.alias || "untitled") + ") was PASSED." : "Your Level " + sb.level + " case conceptualization (" + (sb.alias || "untitled") + ") needs revision — please retry.";
        notify(sb.member, "review", (status === "passed" ? "Passed — " : "Please revise and resubmit — ") + "Level " + sb.level + " case conceptualization",
          lead + (fb ? "\n\nFeedback: " + fb : "") + (info ? "\n\nA graded / commented copy is attached: " + info.name + " (open it in the portal)." : "") + "\n\nOpen your journey: portal.html#certification");
        checkProgress(sb.member);
        save(); renderAdmin();
      });
    }
    el.querySelectorAll("[data-pass]").forEach(function (b) { b.addEventListener("click", function () { decideOn(b.getAttribute("data-pass"), "passed"); }); });
    el.querySelectorAll("[data-retry]").forEach(function (b) { b.addEventListener("click", function () { decideOn(b.getAttribute("data-retry"), "retry"); }); });
  }

  /* -- scholar letters -- */
  function renderLetters() {
    var el = document.getElementById("admin-letters");
    var names = Object.keys(state.journey).filter(function (n) { return state.journey[n].letter; })
      .sort(function (a, b) { return (state.journey[a].letter.status === "pending" ? 0 : 1) - (state.journey[b].letter.status === "pending" ? 0 : 1); });
    el.innerHTML = names.length ? names.map(function (n) {
      var L = state.journey[n].letter;
      var tag = L.status === "verified" ? '<span class="tag ok">Verified</span>' : L.status === "replace" ? '<span class="tag retry">Replacement requested</span>' : '<span class="tag warn">Awaiting verification</span>';
      return '<div class="review-item"><div class="rv-head"><span class="grow"><b>' + esc(n) + " — letter from " + esc(L.scholar) + "</b><small>Uploaded " + esc(L.at) + " · " + fileLink(L.info) + "</small></span>" + tag + "</div>" +
        (L.status === "pending" ? '<div class="rv-form"><div class="field"><label>Note to the member <span style="text-transform:none;letter-spacing:0;font-weight:500;">(required if asking for a replacement)</span></label><input type="text" data-ln="' + esc(n) + '" /></div>' +
          '<div class="rv-btns"><button class="btn btn-gold btn-xs" data-letter-ok="' + esc(n) + '">Verify letter</button><button class="btn btn-ghost btn-xs" data-letter-no="' + esc(n) + '">Ask for a replacement</button></div></div>' : "") + "</div>";
    }).join("") : '<div class="empty">No scholar letters uploaded yet.</div>';
  }
  document.getElementById("admin-letters").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var n = b.getAttribute("data-letter-ok") || b.getAttribute("data-letter-no");
    if (!n) return;
    var L = state.journey[n] && state.journey[n].letter;
    var inp = this.querySelector('[data-ln="' + n + '"]');
    var note = inp ? inp.value.trim() : "";
    if (!L) return;
    if (b.hasAttribute("data-letter-ok")) {
      L.status = "verified"; L.note = note;
      notify(n, "review", "Your scholar letter was verified", "Your farḍ al-ʿayn letter from " + L.scholar + " has been verified.\n\nOpen your journey: portal.html#certification");
      checkProgress(n);
    } else {
      if (!note) { inp.focus(); inp.style.borderColor = "#b64d4d"; return; }
      L.status = "replace"; L.note = note;
      notify(n, "review", "Please upload a replacement scholar letter", "We could not verify your letter from " + L.scholar + ".\nReason: " + note + "\n\nUpload a replacement in your Certification Journey.");
    }
    save(); renderAdmin();
  });

  /* -- trainings: post, attendance -- */
  function renderCohorts() {
    var cs = state.cohorts.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    document.getElementById("cohort-rows").innerHTML = cs.map(function (c) {
      var regs = ADMIN_USERS.filter(function (u) { return fl(u.name, "l" + c.level + "_reg") === c.id; }).length;
      return '<div class="row"><span class="grow"><b>' + esc(c.title) + " · " + esc(c.loc) + "</b><small>" + fmtDate(c.date) + " · " + esc(c.mode) + " · " + regs + " registered</small></span></div>";
    }).join("") || '<div class="empty">No trainings posted.</div>';
  }
  document.getElementById("cohort-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var level = Number(document.getElementById("co-level").value);
    var c = { id: "co" + Date.now(), level: level, title: level === 1 ? "Level 1 · Foundations" : "Level 2 · Intermediate", date: document.getElementById("co-date").value, loc: document.getElementById("co-loc").value.trim(), mode: document.getElementById("co-mode").value };
    state.cohorts.push(c);
    /* notify eligible members: L1 → Level 0 members not yet registered; L2 → members who completed Level 1 */
    var eligible = ADMIN_USERS.filter(function (u) {
      if (!isClinicalMember(u.name)) return false;
      if (level === 1) return standing(u.name) === 0 && !fl(u.name, "l1_reg");
      return levelComplete(u.name, 1) && !fl(u.name, "l2_reg") && !levelComplete(u.name, 2);
    });
    eligible.forEach(function (u) {
      notify(u.name, "training", "New Level " + level + " training posted — " + c.loc, "A new " + cohortLabel(c) + " (" + c.mode + ") is open for registration.\n" + (level === 2 ? "You completed Level 1, so you can register now from your Certification Journey." : "Register from your Certification Journey to begin Level 1.") + "\n\nOpen the portal: portal.html#certification");
    });
    save(); e.target.reset(); renderAdmin();
    document.getElementById("cohort-note").innerHTML = '<p class="invite-sent">✓ Training posted. Emailed ' + eligible.length + " eligible member" + (eligible.length === 1 ? "" : "s") + (level === 2 ? " who completed Level 1" : " at Level 0") + " (demo).</p>";
  });
  function renderAttendance() {
    var list = unattended();
    document.getElementById("attend-rows").innerHTML = list.length ? list.map(function (x) {
      return '<div class="row"><span class="grow"><b>' + esc(x.name) + "</b><small>Level " + x.level + " · " + esc(cohortLabel(cohortById(fl(x.name, "l" + x.level + "_reg")))) + '</small></span><button class="btn btn-gold btn-xs" data-att-name="' + esc(x.name) + '" data-att-level="' + x.level + '">Mark attended</button></div>';
    }).join("") : '<div class="empty">Everyone registered has been confirmed. 🌙</div>';
  }
  document.getElementById("attend-rows").addEventListener("click", function (e) {
    var b = e.target.closest("[data-att-name]");
    if (!b) return;
    var name = b.getAttribute("data-att-name"), n = Number(b.getAttribute("data-att-level"));
    setFl(name, "l" + n + "_att", true);
    notify(name, "training", "Attendance confirmed — Level " + n + " training", "Your attendance at the Level " + n + " training was confirmed. One more checkbox is ticked on your journey.\n\nOpen your journey: portal.html#certification");
    checkProgress(name); renderAdmin();
  });

  /* -- training registry & invitations -- */
  function levelText(n) { return n ? "Level " + n : "No level yet"; }
  function setOptions(id, first, values) {
    var sel = document.getElementById(id), cur = sel.value;
    sel.innerHTML = '<option value="">' + first + "</option>" + values.map(function (v) { return "<option>" + esc(v) + "</option>"; }).join("");
    if (values.map(String).indexOf(cur) !== -1) sel.value = cur;
  }
  function filteredRegistry() {
    var q = (document.getElementById("rf-q").value || "").trim().toLowerCase();
    var lvl = document.getElementById("rf-level").value, st = document.getElementById("rf-status").value;
    var yr = document.getElementById("rf-year").value, loc = document.getElementById("rf-loc").value, inv = document.getElementById("rf-inv").value;
    return state.registry.filter(function (r) {
      if (q && (r.name + " " + r.email).toLowerCase().indexOf(q) === -1) return false;
      if (lvl !== "" && String(r.level) !== lvl) return false;
      if (st && r.status !== st) return false;
      if (yr && String(r.year) !== yr) return false;
      if (loc && r.loc !== loc) return false;
      if (inv && r.inv !== inv) return false;
      return true;
    });
  }
  function sendInvite(r) {
    r.inv = "invited"; r.invitedAt = iso(new Date());
    notify(r.email, "account", "You're invited to join the TIIP Community portal",
      "Salaam " + r.name + ",\n\nYou're invited to join the TIIP Community member portal" + (r.level ? " — our records show you " + (r.status === "Completed" ? "completed" : "are registered for") + " Level " + r.level + (r.loc ? " (" + r.loc + (r.year ? ", " + r.year : "") + ")" : "") + "." : ".") + "\nCreate your account here: join.html");
  }
  function renderRegistry() {
    var years = [], locs = [];
    state.registry.forEach(function (r) {
      if (r.year && years.indexOf(String(r.year)) === -1) years.push(String(r.year));
      if (r.loc && locs.indexOf(r.loc) === -1) locs.push(r.loc);
    });
    setOptions("rf-year", "Any", years.sort().reverse());
    setOptions("rf-loc", "Any", locs.sort());

    var list = filteredRegistry();
    var eligible = list.filter(function (r) { return r.inv === "none"; });
    document.getElementById("reg-count").textContent = list.length + (list.length === 1 ? " record" : " records") + " · " + eligible.length + " not yet invited";
    var bulk = document.getElementById("reg-bulk");
    bulk.textContent = "Invite all " + eligible.length + " matching";
    bulk.disabled = !eligible.length;

    var tagFor = { none: '<span class="tag dim">Not invited</span>', invited: '<span class="tag warn">Invited · pending</span>', joined: '<span class="tag ok">Joined</span>' };
    document.getElementById("reg-rows").innerHTML = list.length ? list.map(function (r) {
      return '<div class="row"><span class="grow"><b>' + esc(r.name) + "</b><small>" + esc(r.email) + " · " + levelText(r.level) +
        (r.level ? " · " + esc(r.status) : "") + (r.loc ? " · " + esc(r.loc) : "") + (r.year ? " · " + r.year : "") + "</small></span>" +
        tagFor[r.inv] +
        (r.inv === "none" ? '<button class="btn btn-gold btn-xs" data-inv="' + r.id + '">Invite</button>' : "") + "</div>";
    }).join("") : '<div class="empty">No one in the registry matches those filters.</div>';
    document.querySelectorAll("#reg-rows [data-inv]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = state.registry.find(function (x) { return x.id === b.getAttribute("data-inv"); });
        if (r) { sendInvite(r); save(); renderAdmin(); }
      });
    });
  }
  function bulkInvite() {
    var eligible = filteredRegistry().filter(function (r) { return r.inv === "none"; });
    if (!eligible.length) return;
    if (!confirm("Send portal invitations to " + eligible.length + " " + (eligible.length === 1 ? "person" : "people") + "?")) return;
    eligible.forEach(sendInvite);
    save(); renderAdmin();
    document.getElementById("reg-note").innerHTML = '<p class="invite-sent">✓ ' + eligible.length + " invitation" + (eligible.length === 1 ? "" : "s") + " emailed (demo — see the Email log).</p>";
  }
  /* level 0 has no status / year / location requirement */
  function syncRegForm() {
    var hasLevel = Number(document.getElementById("rg-level").value) > 0;
    document.getElementById("rg-status").disabled = !hasLevel;
    document.getElementById("rg-year").required = hasLevel;
    document.getElementById("rg-loc").required = hasLevel;
  }
  function addRegistryRecord(invite) {
    var form = document.getElementById("reg-form");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var email = document.getElementById("rg-email").value.trim();
    var note = document.getElementById("reg-note");
    if (state.registry.some(function (r) { return r.email.toLowerCase() === email.toLowerCase(); })) {
      note.innerHTML = '<p class="invite-sent" style="color:var(--red-400);">That email is already in the registry.</p>';
      return;
    }
    var lvl = Number(document.getElementById("rg-level").value);
    var rec = {
      id: "rg" + Date.now(), name: document.getElementById("rg-name").value.trim(), email: email, level: lvl,
      status: lvl ? document.getElementById("rg-status").value : "—",
      year: lvl ? Number(document.getElementById("rg-year").value) : (Number(document.getElementById("rg-year").value) || null),
      loc: document.getElementById("rg-loc").value.trim(), inv: "none", invitedAt: ""
    };
    state.registry.unshift(rec);
    if (invite) sendInvite(rec);
    save(); form.reset(); renderAdmin();
    document.getElementById("reg-note").innerHTML = '<p class="invite-sent">✓ Added to the registry' + (invite ? " and invitation emailed (demo — see the Email log)." : ".") + "</p>";
  }

  /* -- public directory listing requests -- */
  function renderListingRequests() {
    var el = document.getElementById("admin-listings");
    var names = Object.keys(state.listings);
    var pend = names.filter(function (n) { return state.listings[n].publicStatus === "pending"; });
    var live = names.filter(function (n) { return state.listings[n].publishedLive && state.listings[n].published; });
    var html = '<div class="admin-subhead" style="margin-top:0;">Awaiting review (' + pend.length + ")</div>" + (pend.length ? pend.map(function (n) {
      var L = state.listings[n];
      return '<div class="review-item"><div class="rv-head"><span class="grow"><b>' + esc(n) + '</b><small>' + esc(DIR_LEVELS[levelKeyFor(n)] || "") + " · requested " + esc(L.updated || "") + '</small></span><span class="tag warn">Pending</span></div>' +
        "<details open><summary>What the member chose to show</summary><div class='rv-body'>" + previewHtml(listingView(n)) + "</div></details>" +
        '<div class="rv-form"><div class="field"><label>Note to the member <span style="text-transform:none;letter-spacing:0;font-weight:500;">(required to request changes or decline)</span></label><input type="text" data-lnote="' + esc(n) + '" /></div>' +
        '<div class="rv-btns"><button class="btn btn-gold btn-xs" data-lst-ok="' + esc(n) + '">Approve &amp; publish</button><button class="btn btn-ghost btn-xs" data-lst-changes="' + esc(n) + '">Request changes</button><button class="btn btn-ghost btn-xs" data-lst-no="' + esc(n) + '">Decline</button></div></div></div>';
    }).join("") : '<div class="empty">No public-profile requests waiting.</div>') +
      '<div class="admin-subhead">Live on the public directory (' + live.length + ")</div>" + (live.length ? live.map(function (n) {
        var v = state.listings[n].published || {};
        return '<div class="row"><span class="grow"><b>' + esc(n) + '</b><small>Published ' + esc(state.listings[n].updated || "") + ' · <a href="provider.html?p=' + encodeURIComponent(v.slug || "") + '" target="_blank" rel="noopener">View public profile ↗</a></small></span><span class="tag ok">Live</span><button class="btn btn-ghost btn-xs" data-lst-unpub="' + esc(n) + '">Unpublish</button></div>';
      }).join("") : '<div class="empty">Nothing published from member requests yet.</div>');
    el.innerHTML = html;
  }
  document.getElementById("admin-listings").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var n = b.getAttribute("data-lst-ok") || b.getAttribute("data-lst-changes") || b.getAttribute("data-lst-no") || b.getAttribute("data-lst-unpub");
    var L = n && state.listings[n];
    if (!L) return;
    var inp = this.querySelector('[data-lnote="' + n + '"]'), note = inp ? inp.value.trim() : "";
    if (b.hasAttribute("data-lst-ok")) {
      var v = listingView(n); v.level = levelKeyFor(n);
      L.published = v; L.publishedLive = true; L.publicStatus = "approved"; L.publicNote = note; L.updated = iso(new Date());
      notify(n, "review", "Your public directory profile was approved", "Your profile is now live on the public TIIP directory." + (note ? "\n\nNote: " + note : "") + "\n\nView it: provider.html?p=" + v.slug);
    } else if (b.hasAttribute("data-lst-unpub")) {
      L.publicStatus = "none"; L.publishedLive = false; delete L.published;
      notify(n, "review", "Your public directory profile was unpublished", "An admin removed your profile from the public directory. You can update it and request publication again from My Profile & Listing.");
    } else {
      if (!note) { inp.focus(); inp.style.borderColor = "#b64d4d"; return; }
      L.publicStatus = b.hasAttribute("data-lst-changes") ? "changes" : "declined"; L.publicNote = note;
      notify(n, "review", b.hasAttribute("data-lst-changes") ? "Changes requested for your public profile" : "Your public profile request was declined", note + "\n\nOpen My Profile & Listing: portal.html#profile");
    }
    save(); renderAdmin();
  });

  /* -- Level 3 panels -- */
  function renderPanels() {
    var el = document.getElementById("admin-panels");
    var sups = supervisorNames();
    var open = state.panels.filter(function (x) { return x.status === "requested" || x.status === "scheduled"; });
    var closed = state.panels.filter(function (x) { return x.status === "passed" || x.status === "notyet"; });
    el.innerHTML = (open.length ? open.map(function (x) {
      if (x.status === "requested") {
        return '<div class="review-item"><div class="rv-head"><span class="grow"><b>' + esc(x.member) + '</b><small>Requested ' + esc(x.requestedAt) + " · availability: " + esc(x.availability) + '</small></span><span class="tag warn">Needs scheduling</span></div>' +
          '<div class="rv-form"><div class="field-row"><div class="field"><label>Date &amp; time</label><input type="datetime-local" data-pn-when="' + x.id + '" /></div><div class="field"><label>Meeting link</label><input type="url" data-pn-link="' + x.id + '" placeholder="https://…" /></div></div>' +
          '<label class="flabel" style="margin-top:0;">Panel — choose at least 3 supervisors</label><div class="sup-pick">' + sups.map(function (s) { return '<label><input type="checkbox" data-pn-sup="' + x.id + '" value="' + esc(s) + '" /> ' + esc(s) + "</label>"; }).join("") + "</div>" +
          '<div class="rv-btns"><button class="btn btn-gold btn-xs" data-pn-sched="' + x.id + '">Schedule panel &amp; notify</button></div><p class="invite-sent" style="color:var(--red-400);display:none;" data-pn-err="' + x.id + '"></p></div></div>';
      }
      return '<div class="review-item"><div class="rv-head"><span class="grow"><b>' + esc(x.member) + '</b><small>' + esc(x.when.replace("T", " ")) + " · panel: " + x.members.map(esc).join(", ") + (x.link ? ' · <a href="' + esc(x.link) + '" target="_blank" rel="noopener noreferrer">link</a>' : "") + '</small></span><span class="tag ok">Scheduled</span></div>' +
        '<div class="rv-form"><div class="field"><label>Outcome note <span style="text-transform:none;letter-spacing:0;font-weight:500;">(required if not yet)</span></label><input type="text" data-pn-note="' + x.id + '" /></div>' +
        '<div class="rv-btns"><button class="btn btn-gold btn-xs" data-pn-pass="' + x.id + '">Passed — certify</button><button class="btn btn-ghost btn-xs" data-pn-not="' + x.id + '">Not yet</button></div></div></div>';
    }).join("") : '<div class="empty">No panel requests waiting. 🌙</div>') +
      (closed.length ? '<div class="admin-subhead">Completed</div>' + closed.map(function (x) {
        return '<div class="row"><span class="grow"><b>' + esc(x.member) + "</b><small>" + esc(x.when.replace("T", " ")) + (x.note ? " · " + esc(x.note) : "") + '</small></span><span class="tag ' + (x.status === "passed" ? "ok" : "retry") + '">' + (x.status === "passed" ? "Passed" : "Not yet") + "</span></div>";
      }).join("") : "");
  }
  document.getElementById("admin-panels").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var id = b.getAttribute("data-pn-sched") || b.getAttribute("data-pn-pass") || b.getAttribute("data-pn-not");
    var x = state.panels.find(function (p) { return p.id === id; });
    if (!x) return;
    if (b.hasAttribute("data-pn-sched")) {
      var when = this.querySelector('[data-pn-when="' + id + '"]').value, link = this.querySelector('[data-pn-link="' + id + '"]').value.trim();
      var picks = Array.prototype.map.call(this.querySelectorAll('[data-pn-sup="' + id + '"]:checked'), function (c) { return c.value; });
      var err = this.querySelector('[data-pn-err="' + id + '"]');
      if (!when || picks.length < 3) { err.style.display = "block"; err.textContent = !when ? "Choose a date and time." : "A panel needs at least 3 supervisors (" + picks.length + " selected)."; return; }
      x.status = "scheduled"; x.when = when; x.link = link; x.members = picks;
      var whenTxt = when.replace("T", " ");
      notify(x.member, "review", "Your Level 3 panel presentation is scheduled — " + whenTxt, "Your panel presentation is on " + whenTxt + ".\nPanel: " + picks.join(", ") + (link ? "\nJoin: " + link : "") + "\n\nOpen your journey: portal.html#certification");
      picks.forEach(function (s) { notify(s, "review", "You're on a Level 3 panel — " + x.member, "You are assigned to the Level 3 panel for " + x.member + " on " + whenTxt + (link ? "\nJoin: " + link : "") + "."); });
    } else {
      var inp = this.querySelector('[data-pn-note="' + id + '"]'), note = inp ? inp.value.trim() : "";
      if (b.hasAttribute("data-pn-pass")) {
        x.status = "passed"; x.note = note;
        setFl(x.member, "certified", true);
        var u = ADMIN_USERS.find(function (q) { return q.name === x.member; });
        if (u && u.role !== "Supervisor / Scholar") u.role = "Certified Practitioner";
        notify(x.member, "review", "Congratulations — you are fully certified", "The panel passed your Level 3 presentation. You are now a fully certified TIIP practitioner." + (note ? "\n\nNote: " + note : "") + "\n\nYou can now post interventions in the vault and request a public profile.");
      } else {
        if (!note) { inp.focus(); inp.style.borderColor = "#b64d4d"; return; }
        x.status = "notyet"; x.note = note;
        notify(x.member, "review", "Level 3 panel outcome — not yet", "The panel was not able to pass your presentation this time.\nFeedback: " + note + "\n\nYou can request another presentation from your Certification Journey.");
      }
    }
    save(); renderAdmin();
  });

  /* -- email log -- */
  function renderEmailLog() {
    var all = state.outbox;
    document.getElementById("email-count").textContent = all.length + " sent";
    document.getElementById("admin-emails").innerHTML = all.slice(0, 80).map(function (e) {
      return '<div class="row"><span class="grow"><b>' + esc(e.subject) + "</b><small>To " + esc(e.to) + " · " + esc((NOTIF_CATS[e.cat] || {}).label || e.cat) + " · " + esc(e.at) + '</small><details><summary style="font-size:.74rem;cursor:pointer;color:var(--gold-400);">View email</summary><div class="m-body" style="white-space:pre-line;font-size:.82rem;color:var(--cream-dim);margin-top:6px;">' + esc(e.body) + "</div></details></span></div>";
    }).join("") || '<div class="empty">No emails sent yet.</div>';
  }

  /* -- level-change requests -- */
  function renderRequests() {
    var reqEl = document.getElementById("admin-requests");
    reqEl.innerHTML = LEVEL_REQUESTS.length ? LEVEL_REQUESTS.map(function (r, i) {
      return '<div class="row"><span class="grow"><b>' + esc(r.name) + '</b><small>' + esc(r.from) + " → " + esc(r.to) +
        " · " + esc(r.note) + ' · 📎 <span class="tag dim" style="font-size:.6rem;">' + esc(r.cert) + "</span></small></span>" +
        '<button class="btn btn-gold btn-xs" data-req-ok="' + i + '">Approve</button>' +
        '<button class="btn btn-ghost btn-xs" data-req-no="' + i + '">Deny</button></div>';
    }).join("") : '<div class="empty">No level-change requests pending. 🌙</div>';
    reqEl.querySelectorAll("[data-req-ok]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-req-ok")), r = LEVEL_REQUESTS[i];
        var u = ADMIN_USERS.find(function (x) { return x.name === r.name; });
        if (u) u.role = r.to; else ADMIN_USERS.push({ name: r.name, role: r.to });
        notify(r.name, "account", "Your level change was approved", "Your request to move from " + r.from + " to " + r.to + " was approved.");
        LEVEL_REQUESTS.splice(i, 1); save(); renderAdmin();
      });
    });
    reqEl.querySelectorAll("[data-req-no]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-req-no")), r = LEVEL_REQUESTS[i];
        notify(r.name, "account", "Your level-change request was not approved", "Your request to move to " + r.to + " was not approved at this time. Contact an admin for details.");
        LEVEL_REQUESTS.splice(i, 1); save(); renderAdmin();
      });
    });
  }

  /* -- member list with name search -- */
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
      sel.addEventListener("change", function () { ADMIN_USERS[Number(sel.getAttribute("data-i"))].role = sel.value; save(); });
    });

    /* If a search finds nobody, point the admin to the registry to invite them. */
    var noMatch = document.getElementById("admin-no-match");
    if (q && !matched.length) {
      noMatch.style.display = "block";
      noMatch.innerHTML = '<div class="empty">No member matches “' + esc(filter.trim()) + '”. They may not be registered yet — add them in Trainings &amp; registry and send an invitation.</div>';
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
    var vname = viewerName();
    var approved = l1EnabledFor(vname) || !!fl(vname, "l1_reg");
    var isAdmin = state.role === "admin";
    var showTrack = !isAdmin && (approved || standing(vname) >= 2);
    var takingL1 = showTrack && !levelComplete(vname, 1); /* actually working through it */
    document.getElementById("l1-online-card").style.display = showTrack ? "block" : "none";
    if (showTrack) {
      document.getElementById("l1-why").textContent = takingL1
        ? (fl(vname, "l1_reg") ? "Unlocked when you registered for Level 1" : "Approved — enabled for you by an admin")
        : "Level 1 — completed";
      var l1 = state.learning.l1;
      document.getElementById("l1-rows").innerHTML = l1.map(function (m, i) {
        return '<div class="row"><span class="grow"><b>' + esc(m.title) + "</b><small>" + m.mins + " min · online module</small></span>" +
          (m.done ? '<span class="tag ok">Completed</span>' : '<button class="btn btn-gold btn-xs" data-l1-watch="' + i + '">▶ Start</button>') +
          "</div>";
      }).join("");
      document.querySelectorAll("[data-l1-watch]").forEach(function (b) {
        b.addEventListener("click", function () {
          state.learning.l1[Number(b.getAttribute("data-l1-watch"))].done = true;
          save(); checkProgress(viewerName()); renderLearning();
        });
      });
      /* The capstone formulation only applies to members actually taking
         the level — not to Level 2+ members revisiting the material. */
      if (takingL1) {
        var modsDone = l1.every(function (m) { return m.done; });
        var f = state.learning.l1Formulation;
        var doneCount = FORM_SECTIONS.filter(function (s) { return s.done(f); }).length;
        var sub = mySub(1);
        var capTag = sub
          ? subTags(sub)
          : !modsDone
            ? '<span class="tag dim" id="l1-cap-tag">🔒 Unlocks when all modules are complete</span>'
            : '<span class="tag warn" id="l1-cap-tag">' + doneCount + " / " + FORM_SECTIONS.length + " sections complete</span>";
        document.getElementById("l1-capstone").innerHTML =
          '<div class="row" style="border-top:1px solid var(--line); padding-top:14px;"><span class="grow">' +
          "<b>📤 Capstone: TIIP Case Formulation Sheet</b>" +
          "<small>At the end of your modules, complete the Khalil Center case formulation below — every section filled, reviewed by an admin before Level 1 is credited.</small></span>" +
          capTag + "</div>" + (sub ? feedbackNote(sub) : "");
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

    renderSubCards();

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
        '<p class="view-lead" style="margin-bottom:0;font-size:.85rem;">The end-of-level case conceptualization opens once every module is complete — ' + left + " module" + (left === 1 ? "" : "s") + ' to go. It follows the Khalil Center <strong>TIIP Case Formulation Sheet</strong>: no section may be left empty, and submissions are reviewed by an admin, who passes them or asks you to retry, before Level 1 is credited.</p>';
      return;
    }

    /* preserve which sections were open across re-renders */
    var open = {};
    var prev = card.querySelectorAll("details.fsec[open]");
    for (var i = 0; i < prev.length; i++) open[prev[i].getAttribute("data-sec")] = true;
    if (!prev.length && !card.getAttribute("data-built")) open.profile = true;
    card.setAttribute("data-built", "1");

    var doneCount = FORM_SECTIONS.filter(function (s) { return s.done(f); }).length;
    var sub = mySub(1);
    card.innerHTML = '<h3>📝 TIIP Case Formulation Sheet' + (sub ? " " + subTags(sub) : "") + "</h3>" +
      '<p class="view-lead" style="margin-bottom:12px;font-size:.85rem;">Complete every section — <strong>no section may be left empty</strong>. Use a de-identified case alias only. Your formulation is reviewed by an admin — who will pass it or ask you to retry — before Level 1 is credited.</p>' +
      '<div class="prog"><div class="prog-head"><b>Sections complete</b><span id="l1f-count">' + doneCount + " / " + FORM_SECTIONS.length + '</span></div><div class="bar"><i id="l1f-bar" style="width:' + Math.round(doneCount / FORM_SECTIONS.length * 100) + '%"></i></div></div>' +
      FORM_SECTIONS.map(function (s, idx) {
        var ok = s.done(f);
        return '<details class="fsec" data-sec="' + s.id + '"' + (open[s.id] ? " open" : "") + ">" +
          '<summary><span class="sec-num">' + (idx + 1) + "</span><b>" + s.title + '</b><span class="tag ' + (ok ? "ok" : "dim") + '" data-sec-tag="' + s.id + '">' + (ok ? "✓ Complete" : "To do") + "</span></summary>" +
          '<div class="fsec-body">' + formSectionBody(s.id, f) + "</div></details>";
      }).join("") +
      '<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:14px;">' +
      '<button class="btn btn-gold" id="l1f-submit"' + (doneCount === FORM_SECTIONS.length && !(sub && sub.status === "passed") ? "" : " disabled") + ">" + (sub && sub.status !== "passed" ? "Resubmit for review" : sub ? "Passed — Level 1 credited" : "Submit for admin review") + "</button>" +
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
    var _sb = mySub(1);
    card.querySelector("#l1f-submit").disabled = done !== FORM_SECTIONS.length || !!(_sb && _sb.status === "passed");
    var cap = document.getElementById("l1-cap-tag");
    if (cap && !mySub(1)) {
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
        var fname = ROLES[state.role].name.replace(/\s+/g, "_") + "_TIIP Level 1 Case Formulation";
        state.learning.l1Submission = { name: fname, at: iso(new Date()) };
        submitConceptualization(1, f.alias, {
          presenting: f.presenting, dominant: f.dominant, narrative: f.narrative, prognosis: f.prognosis,
          plan: f.plan.map(function (r) { return r.domain + " — " + r.goal + " (" + r.intervention + ")"; }).join("; ")
        }, { name: fname + ".txt", size: 0, dataUrl: "" });
        renderLearning();
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

  /* =========================================================
     Member listings: profile sections → internal directory card /
     public profile snapshot
  ========================================================= */
  var OFFER_TYPES = ["Workshop", "Seminar", "Training", "Community talk", "Webinar"];
  var PROFILE_SECTIONS = [
    { id: "about", title: "About me", fields: [["bio", "Short bio", "textarea", "A few sentences about you and how you work."], ["about", "Longer description (optional)", "textarea", ""]] },
    { id: "credentials", title: "Credentials & licensure", fields: [["credentials", "Credentials (shown under your name)", "text", "e.g., LPC · Licensed Professional Counselor"], ["license", "Licensure / registration", "text", ""], ["education", "Education (one per line)", "textarea", ""], ["years", "Years in practice", "number", ""]] },
    { id: "location", title: "Location", fields: [["city", "City", "text", ""], ["state", "State / province", "text", ""], ["country", "Country", "text", ""]] },
    { id: "languages", title: "Languages", fields: [["languages", "Languages (comma-separated)", "text", "e.g., English, Urdu"]] },
    { id: "focus", title: "Specialties & approach", fields: [["specialties", "Specialties (comma-separated)", "text", "e.g., Anxiety, Trauma & PTSD"], ["approach", "Approach", "text", ""], ["populations", "Populations served (comma-separated)", "text", ""]] },
    { id: "services", title: "Session formats & availability", fields: [["formats", "Session formats (comma-separated)", "text", "e.g., In person, Telehealth"], ["accepting", "Availability", "select", ["", "Accepting new clients", "Waitlist", "Not accepting"]]] },
    { id: "gender", title: "Gender (for the public directory's Male / Female filter)", fields: [["gender", "Gender", "select", ["", "Male", "Female"]]] },
    { id: "contact", title: "Contact email", fields: [["contactEmail", "Email others can use", "email", ""]] },
    { id: "offerings", title: "Workshops, seminars & events I can offer", offerings: true, fields: [] }
  ];
  PROFILE_SECTIONS.forEach(function (sec) {
    if (sec.offerings) for (var i = 1; i <= 3; i++) {
      sec.fields.push(["off" + i + "_title", "Offering " + i + " — title", "text", ""], ["off" + i + "_type", "Type", "select", OFFER_TYPES], ["off" + i + "_desc", "Short description", "text", ""]);
    }
  });
  var PROFILE_KEYS = [];
  PROFILE_SECTIONS.forEach(function (sec) { sec.fields.forEach(function (f) { PROFILE_KEYS.push(f[0]); }); });

  function listingOf(name) { return state.listings[name] || null; }
  function ensureListing(name) {
    if (!state.listings[name]) state.listings[name] = { internal: false, referrals: false, publicStatus: "none", publicNote: "", updated: "", data: {}, show: {} };
    return state.listings[name];
  }
  /* exactly what a member chose to show (the rest stays empty) */
  function listingView(name) {
    var L = listingOf(name) || { data: {}, show: {} }, d = L.data || {}, sh = L.show || {};
    var v = { slug: "m-" + slugify(name), name: name, level: levelKeyFor(name), credentials: "", license: "", education: [], years: "", bio: "", about: "",
      city: "", state: "", country: "", languages: [], specialties: [], approach: "", populations: [], formats: [], accepting: "", gender: "", contactEmail: "", offerings: [], photo: null };
    if (sh.about) { v.bio = d.bio || ""; v.about = d.about || ""; }
    if (sh.credentials) { v.credentials = d.credentials || ""; v.license = d.license || ""; v.education = lines(d.education); v.years = d.years || ""; }
    if (sh.location) { v.city = d.city || ""; v.state = d.state || ""; v.country = d.country || ""; }
    if (sh.languages) v.languages = csv(d.languages);
    if (sh.focus) { v.specialties = csv(d.specialties); v.approach = d.approach || ""; v.populations = csv(d.populations); }
    if (sh.services) { v.formats = csv(d.formats); v.accepting = d.accepting || ""; }
    if (sh.gender) v.gender = d.gender || "";
    if (sh.contact) v.contactEmail = d.contactEmail || "";
    if (sh.offerings) for (var i = 1; i <= 3; i++) {
      if (d["off" + i + "_title"]) v.offerings.push({ title: d["off" + i + "_title"], type: d["off" + i + "_type"] || "Workshop", format: "In person · Online", duration: "Flexible", audience: "Organizations & community groups", desc: d["off" + i + "_desc"] || "" });
    }
    return v;
  }
  function previewHtml(v) {
    if (!v) return '<div class="empty">Nothing saved yet.</div>';
    var p = ['<h4>' + esc(v.name) + '</h4><p><span class="tag warn">' + esc(DIR_LEVELS[v.level] || "") + "</span> " + esc(v.credentials) + "</p>"];
    var loc = [v.city, v.state, v.country].filter(Boolean).join(", ");
    if (loc) p.push("<p>📍 " + esc(loc) + "</p>");
    if (v.bio) p.push("<p>" + esc(v.bio) + "</p>");
    if (v.about) p.push("<p>" + esc(v.about) + "</p>");
    if (v.specialties.length) p.push("<p><b>Specialties:</b> " + v.specialties.map(esc).join(", ") + "</p>");
    if (v.approach) p.push("<p><b>Approach:</b> " + esc(v.approach) + "</p>");
    if (v.populations.length) p.push("<p><b>Populations:</b> " + v.populations.map(esc).join(", ") + "</p>");
    if (v.languages.length) p.push("<p><b>Languages:</b> " + v.languages.map(esc).join(", ") + "</p>");
    if (v.formats.length) p.push("<p><b>Formats:</b> " + v.formats.map(esc).join(", ") + (v.accepting ? " · " + esc(v.accepting) : "") + "</p>");
    else if (v.accepting) p.push("<p><b>Availability:</b> " + esc(v.accepting) + "</p>");
    if (v.license) p.push("<p><b>Licensure:</b> " + esc(v.license) + "</p>");
    if (v.education.length) p.push("<p><b>Education:</b> " + v.education.map(esc).join("; ") + "</p>");
    if (v.years) p.push("<p><b>Experience:</b> " + esc(v.years) + " years</p>");
    if (v.gender) p.push("<p><b>Gender:</b> " + esc(v.gender) + "</p>");
    if (v.contactEmail) p.push("<p><b>Contact:</b> " + esc(v.contactEmail) + "</p>");
    if (v.offerings.length) p.push("<p><b>Can offer:</b> " + v.offerings.map(function (o) { return esc(o.title) + " (" + esc(o.type) + ")"; }).join("; ") + "</p>");
    if (p.length === 1) p.push('<p class="hidden-note">No sections are set to show yet — tick “Show” on the sections you want others to see.</p>');
    return '<div class="prev-card">' + p.join("") + "</div>";
  }

  /* ---- directory (members-only) ---- */
  var referralTarget = null;
  function memberDirCards() {
    var out = [];
    Object.keys(state.listings).forEach(function (n) {
      var L = state.listings[n];
      if (!L.internal || !canInternal(n)) return;
      var v = listingView(n);
      out.push({ name: n, cred: v.credentials || DIR_LEVELS[v.level] || "", city: [v.city, v.country].filter(Boolean).join(", ") || "Location not shown", region: "", tz: "",
        langs: v.languages, focus: v.specialties, lic: v.license || "", accepting: !!(L.referrals && standing(n) >= 2), level: v.level, member: true, bio: v.bio, email: v.contactEmail });
    });
    return out;
  }
  function renderDirCta() {
    var name = viewerName(), el = document.getElementById("dir-cta");
    if (state.role === "admin") { el.innerHTML = ""; return; }
    if (canInternal(name)) {
      var L = listingOf(name);
      el.innerHTML = '<div class="jr-banner" style="margin-bottom:16px;"><span class="grow"><b>Your listing:</b> ' +
        (L && L.internal ? '<span class="tag ok">Visible to members</span>' : '<span class="tag dim">Not listed yet</span>') +
        (L && L.referrals ? ' <span class="tag gold">Accepting referrals</span>' : "") + "</span>" +
        '<button class="btn btn-gold btn-xs" data-go="profile">' + (L && L.internal ? "Edit my listing" : "Create my listing") + "</button></div>";
    } else {
      el.innerHTML = '<div class="jr-banner" style="margin-bottom:16px;"><span class="grow"><b>Want to be listed?</b> Members who complete Level 1 can list themselves in this directory.</span><button class="btn btn-ghost btn-xs" data-go="certification">See my journey</button></div>';
    }
  }
  function renderDirectory() {
    renderDirCta();
    var q = (document.getElementById("dir-q").value || "").toLowerCase();
    var lvl = document.getElementById("dir-level").value;
    var lang = document.getElementById("dir-lang").value;
    var tz = document.getElementById("dir-tz").value;
    var focus = document.getElementById("dir-focus").value;
    var lic = document.getElementById("dir-lic").value;
    var ref = document.getElementById("dir-ref").value;
    var me = viewerName();
    var members = memberDirCards(), mine = {};
    members.forEach(function (m) { mine[m.name] = true; });
    var list = DIRECTORY.filter(function (d) { return !mine[d.name]; }).concat(members).filter(function (d) {
      if (q && (d.name + " " + d.city + " " + d.focus.join(" ") + " " + d.cred).toLowerCase().indexOf(q) === -1) return false;
      if (lvl && d.level !== lvl) return false;
      if (lang && d.langs.indexOf(lang) === -1) return false;
      if (tz && d.region !== tz) return false;
      if (focus && d.focus.join("|").toLowerCase().indexOf(focus.split(" ")[0].toLowerCase()) === -1) return false;
      if (lic && d.lic !== lic) return false;
      if (ref === "yes" && !d.accepting) return false;
      return true;
    });
    document.getElementById("dir-empty").style.display = list.length ? "none" : "block";
    document.getElementById("dir-grid").innerHTML = list.map(function (d) {
      var localTime = d.tz ? new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", timeZone: d.tz }).format(new Date()) : "";
      return '<div class="dir-card"><div class="head"><span class="avatar">' + initials(d.name) + '</span><span><b>' + esc(d.name) + "</b><small>" + esc(d.cred) + " · " + esc(d.city) + '</small></span></div>' +
        '<div class="tags"><span class="tag warn">' + esc(DIR_LEVELS[d.level] || "") + "</span>" +
        d.langs.map(function (l) { return '<span class="tag">' + esc(l) + "</span>"; }).join("") +
        d.focus.map(function (f) { return '<span class="tag gold">' + esc(f) + "</span>"; }).join("") +
        (d.lic ? '<span class="tag dim">' + esc(d.lic) + "</span>" : "") + "</div>" +
        (d.bio ? '<p style="font-size:.8rem;color:var(--muted);margin:6px 0 0;">' + esc(d.bio) + "</p>" : "") +
        (d.email ? '<p style="font-size:.78rem;margin:6px 0 0;">✉ <a href="mailto:' + esc(d.email) + '">' + esc(d.email) + "</a></p>" : "") +
        '<div class="foot"><span>' + (localTime ? "🕐 " + localTime + " local" : "") + "</span>" +
        (d.accepting ? '<span class="tag ok">Accepting referrals</span>' : '<span class="tag dim">' + (d.member ? "Not taking referrals" : "Waitlist") + "</span>") +
        (d.accepting && d.name !== me ? '<button class="btn btn-gold btn-xs" data-ref-to="' + esc(d.name) + '">Send referral</button>' : "") + "</div></div>";
    }).join("");
  }
  ["dir-q", "dir-level", "dir-lang", "dir-tz", "dir-focus", "dir-lic", "dir-ref"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderDirectory);
  });
  document.getElementById("dir-cta").addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]"); if (b) show(b.getAttribute("data-go"));
  });
  document.getElementById("dir-grid").addEventListener("click", function (e) {
    var b = e.target.closest("[data-ref-to]");
    if (!b) return;
    referralTarget = b.getAttribute("data-ref-to");
    document.getElementById("ref-to").textContent = "To " + referralTarget;
    var card = document.getElementById("referral-card");
    card.style.display = "block"; card.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  document.getElementById("ref-cancel").addEventListener("click", function () { document.getElementById("referral-card").style.display = "none"; referralTarget = null; });
  document.getElementById("referral-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!referralTarget) return;
    var from = viewerName(), lang = document.getElementById("rf2-lang").value, urg = document.getElementById("rf2-urg").value, note = document.getElementById("rf2-note").value.trim();
    state.referrals.unshift({ id: "rf" + Date.now(), to: referralTarget, from: from, lang: lang, urgency: urg, note: note, at: stamp(), status: "new" });
    notify(referralTarget, "community", "New referral from " + from + " (" + urg + ")", from + " referred a client to you through the TIIP directory.\nClient's language: " + lang + "\nUrgency: " + urg + "\nReason: " + note + "\n\nRespond in My Profile & Listing → Referrals received: portal.html#profile");
    notify(from, "community", "Referral sent to " + referralTarget, "Your referral was sent to " + referralTarget + ". They'll follow up with you directly.");
    save(); e.target.reset();
    document.getElementById("referral-card").style.display = "none";
    document.getElementById("dir-cta").insertAdjacentHTML("afterbegin", '<div class="invite-sent" style="margin-bottom:10px;">✓ Referral sent to ' + esc(referralTarget) + " (demo email — see Notifications).</div>");
    referralTarget = null;
  });

  /* ---- My Profile & Listing ---- */
  function renderProfile() {
    var name = viewerName(), allowed = canInternal(name);
    var locked = document.getElementById("prof-locked"), body = document.getElementById("prof-body");
    document.getElementById("prof-lead").textContent = "Build your listing for the member directory and — from Level 2 — a public profile on the main site. Every section is optional, and you choose exactly what is shown.";
    if (!allowed) {
      locked.style.display = "block"; body.style.display = "none";
      locked.innerHTML = 'Your listing unlocks when you <strong>complete Level 1</strong> — finish the Level 1 checklist in your Certification Journey. <button class="btn btn-gold btn-xs" data-go="certification" style="margin-left:8px;">Open my journey</button>';
      return;
    }
    locked.style.display = "none"; body.style.display = "block";
    var L = listingOf(name) || { data: {}, show: {}, internal: false, referrals: false, publicStatus: "none", publicNote: "" };
    document.getElementById("prof-sections").innerHTML = PROFILE_SECTIONS.map(function (sec) {
      var fields = sec.offerings
        ? [1, 2, 3].map(function (i) {
            return '<div class="field-row">' + sec.fields.slice((i - 1) * 3, i * 3).map(function (f) { return fieldHtml(f, L.data[f[0]]); }).join("") + "</div>";
          }).join("")
        : sec.fields.map(function (f) { return fieldHtml(f, L.data[f[0]]); }).join("");
      return '<div class="prof-sec"><div class="prof-head"><b>' + sec.title + '</b><label class="show-toggle"><input type="checkbox" data-show="' + sec.id + '"' + (L.show[sec.id] ? " checked" : "") + " /> Show</label></div><div class=\"prof-body\">" + fields + "</div></div>";
    }).join("");
    document.getElementById("pf-internal").checked = !!L.internal;
    var refOk = standing(name) >= 2;
    document.getElementById("pf-referrals").checked = refOk && !!L.referrals;
    document.getElementById("pf-referrals").disabled = !refOk;
    document.getElementById("pf-ref-wrap").style.opacity = refOk ? "1" : ".55";
    renderProfSide(name, L);
  }
  function fieldHtml(f, val) {
    var key = f[0], label = f[1], type = f[2], extra = f[3], v = val == null ? "" : val;
    if (type === "textarea") return '<div class="field"><label>' + label + '</label><textarea id="pf-' + key + '" placeholder="' + esc(extra) + '">' + esc(v) + "</textarea></div>";
    if (type === "select") return '<div class="field"><label>' + label + '</label><select id="pf-' + key + '">' + extra.map(function (o) { return "<option" + (o === v ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select></div>";
    return '<div class="field"><label>' + label + '</label><input type="' + type + '" id="pf-' + key + '" value="' + esc(v) + '" placeholder="' + esc(extra) + '" /></div>';
  }
  function renderProfSide(name, L) {
    var pubOK = canPublic(name), st = L.publicStatus || "none", slug = "m-" + slugify(name);
    var h = "<h3>📍 Where you appear</h3>" +
      '<div class="rows"><div class="row"><span class="grow"><b>Members-only directory</b><small>Visible to other TIIP members</small></span>' + (L.internal ? '<span class="tag ok">Listed</span>' : '<span class="tag dim">Not listed</span>') + "</div>" +
      '<div class="row"><span class="grow"><b>Referrals</b><small>From other members, via the directory</small></span>' + (L.referrals && standing(name) >= 2 ? '<span class="tag ok">Accepting</span>' : '<span class="tag dim">' + (standing(name) >= 2 ? "Off" : "Level 2+") + "</span>") + "</div>" +
      '<div class="row"><span class="grow"><b>Public directory</b><small>On the main site — admin approval required</small></span>' +
      (!pubOK ? '<span class="tag dim">🔒 Level 2+</span>' : st === "approved" ? '<span class="tag ok">Live</span>' : st === "pending" ? (L.publishedLive ? '<span class="tag ok">Live</span> <span class="tag warn">Edits pending review</span>' : '<span class="tag warn">Pending review</span>') : st === "changes" ? '<span class="tag retry">Changes requested</span>' : st === "declined" ? '<span class="tag bad">Declined</span>' : '<span class="tag dim">Not requested</span>') + "</div></div>";
    if (pubOK) {
      if (L.publicNote && (st === "changes" || st === "declined" || st === "approved")) h += '<div class="fb-note ' + (st === "approved" ? "passed" : "retry") + '"><b>Admin note:</b> ' + esc(L.publicNote) + "</div>";
      h += '<p style="margin:12px 0 0;">' +
        (st === "none" || st === "declined" ? '<button class="btn btn-gold btn-xs" data-pub="request">Request a public profile</button>' :
         st === "changes" ? '<button class="btn btn-gold btn-xs" data-pub="request">Resubmit for approval</button>' :
         st === "pending" ? '<button class="btn btn-ghost btn-xs" data-pub="withdraw">Withdraw request</button>' :
         '<a class="btn btn-ghost btn-xs" href="provider.html?p=' + encodeURIComponent(slug) + '" target="_blank" rel="noopener">View my public profile ↗</a>') + "</p>" +
        (st === "approved" ? '<p class="note">Editing your listing sends it back for re-approval before changes go live.</p>' : "") +
        '<div id="prof-msg"></div>';
    }
    document.getElementById("prof-status-card").innerHTML = h;
    document.getElementById("prof-preview").innerHTML = previewHtml(listingView(name));
    var refs = state.referrals.filter(function (r) { return r.to === name; });
    document.getElementById("prof-referrals-card").style.display = (refs.length || (L.referrals && standing(name) >= 2)) ? "block" : "none";
    document.getElementById("prof-referrals").innerHTML = refs.length ? refs.map(function (r) {
      var tag = r.status === "accepted" ? '<span class="tag ok">Accepted</span>' : r.status === "declined" ? '<span class="tag dim">Declined</span>' : '<span class="tag warn">New</span>';
      return '<div class="row"><span class="grow"><b>From ' + esc(r.from) + " · " + esc(r.urgency) + "</b><small>" + esc(r.lang) + " · " + esc(r.at) + " — " + esc(r.note) + "</small></span>" + tag +
        (r.status === "new" ? '<button class="btn btn-gold btn-xs" data-rf-ok="' + r.id + '">Accept</button><button class="btn btn-ghost btn-xs" data-rf-no="' + r.id + '">Decline</button>' : "") + "</div>";
    }).join("") : '<div class="empty">No referrals yet.</div>';
  }
  document.getElementById("prof-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = viewerName(), L = ensureListing(name);
    PROFILE_KEYS.forEach(function (k) { L.data[k] = document.getElementById("pf-" + k).value.trim(); });
    PROFILE_SECTIONS.forEach(function (sec) { L.show[sec.id] = document.querySelector('[data-show="' + sec.id + '"]').checked; });
    L.internal = document.getElementById("pf-internal").checked;
    L.referrals = standing(name) >= 2 && document.getElementById("pf-referrals").checked;
    L.updated = iso(new Date());
    if (L.publicStatus === "approved") {
      L.publicStatus = "pending";
      notify(ADMIN_NAME, "review", "Updated public profile needs re-approval — " + name, name + " edited an approved public profile. Review it in Administration → Directory requests.");
    }
    save(); renderProfile();
    var t = document.getElementById("prof-saved"); t.style.display = "inline-flex"; setTimeout(function () { t.style.display = "none"; }, 2500);
  });
  document.getElementById("prof-body").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var name = viewerName(), L = ensureListing(name);
    if (b.getAttribute("data-pub") === "request") {
      var v = listingView(name), missing = [];
      if (!v.bio) missing.push("a bio (About me — tick Show)");
      if (!v.city || !v.country) missing.push("your city and country (Location — tick Show)");
      if (!v.specialties.length) missing.push("at least one specialty (Specialties — tick Show)");
      if (missing.length) { document.getElementById("prof-msg").innerHTML = '<p class="invite-sent" style="color:var(--red-400);">Save your listing first with ' + missing.join(", ") + ".</p>"; return; }
      L.publicStatus = "pending"; L.publicNote = ""; L.updated = iso(new Date());
      notify(ADMIN_NAME, "review", "Public directory profile requested — " + name, name + " requested a public profile (" + (DIR_LEVELS[levelKeyFor(name)] || "") + ").\n\nReview it in Administration → Directory requests.");
      notify(name, "review", "We received your public profile request", "An admin will review exactly the sections you chose to show, and you'll be emailed the decision.");
      save(); renderProfile();
    } else if (b.getAttribute("data-pub") === "withdraw") {
      L.publicStatus = L.publishedLive ? "approved" : "none"; save(); renderProfile();
    } else if (b.hasAttribute("data-rf-ok") || b.hasAttribute("data-rf-no")) {
      var id = b.getAttribute("data-rf-ok") || b.getAttribute("data-rf-no");
      var r = state.referrals.find(function (x) { return x.id === id; });
      if (!r) return;
      r.status = b.hasAttribute("data-rf-ok") ? "accepted" : "declined";
      notify(r.from, "community", "Your referral to " + r.to + " was " + r.status, r.to + " " + r.status + " your referral (" + r.note + ")." + (r.status === "declined" ? " Consider another provider in the directory." : ""));
      save(); renderProfile();
    } else if (b.hasAttribute("data-go")) show(b.getAttribute("data-go"));
  });
  document.getElementById("prof-locked").addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]"); if (b) show(b.getAttribute("data-go"));
  });

  /* ---- Level 2 & 3: case conceptualization submissions (Resources & Modules) ---- */
  function subCardHtml(name, n) {
    var sb = findSubmission(name, n), sm = (sb && sb.summary) || {}, passed = sb && sb.status === "passed";
    var DOMAINS = ["Iḥsās", "ʿAql", "Nafs", "Rūḥ"];
    return '<div class="card" style="margin-top:16px;"><h3>📝 Level ' + n + " — " + (n === 3 ? "Written Case Conceptualization " : "Case Conceptualization ") + (sb ? subTags(sb) : '<span class="tag dim">Not submitted</span>') + "</h3>" +
      '<p class="view-lead" style="margin-bottom:12px;font-size:.85rem;">Submit a de-identified case conceptualization through the portal. An admin will <strong>pass</strong> it, or <strong>ask you to retry</strong> with feedback (and sometimes a graded copy) — you are emailed the result and can revise and resubmit here.' +
      (n === 3 ? " This is one of the Level 3 requirements before you can request your panel presentation." : "") + "</p>" +
      (sb ? feedbackNote(sb) : "") +
      (passed ? '<p class="note"><b>Passed.</b> This requirement is complete — well done.</p>'
        : '<form data-sc-form="' + n + '" style="margin-top:14px;">' +
          '<div class="field-row"><div class="field"><label>Case alias (never real names)</label><input type="text" id="sc' + n + '-alias" required value="' + esc(sb ? sb.alias : "") + '" placeholder="e.g., Case K-14" /></div>' +
          '<div class="field"><label>Dominant area of dysfunction</label><select id="sc' + n + '-dom">' + DOMAINS.map(function (d) { return "<option" + (sm.dominant === d ? " selected" : "") + ">" + d + "</option>"; }).join("") + "</select></div></div>" +
          '<div class="field"><label>Presenting problem</label><textarea id="sc' + n + '-pres" required>' + esc(sm.presenting || "") + "</textarea></div>" +
          '<div class="field"><label>Conceptualization (narrative)</label><textarea id="sc' + n + '-narr" required placeholder="How do ʿaql, nafs, iḥsās and rūḥ interlock to maintain the problem?">' + esc(sm.narrative || "") + "</textarea></div>" +
          '<div class="field"><label>Therapy plan</label><textarea id="sc' + n + '-plan">' + esc(sm.plan || "") + "</textarea></div>" +
          '<div class="field-row"><div class="field"><label>Prognosis</label><input type="text" id="sc' + n + '-prog" value="' + esc(sm.prognosis || "") + '" /></div>' +
          '<div class="field"><label>Attach your write-up <span style="text-transform:none;letter-spacing:0;font-weight:500;">(optional · PDF or Word)</span></label><input type="file" id="sc' + n + '-file" accept=".pdf,.doc,.docx" /></div></div>' +
          '<div class="check"><input type="checkbox" id="sc' + n + '-anon" required /> <span>This case is fully de-identified <em>(required)</em></span></div>' +
          '<button class="btn btn-gold" type="submit">' + (sb ? "Resubmit for review" : "Submit for admin review") + "</button></form>") + "</div>";
  }
  function renderSubCards() {
    var box = document.getElementById("sub-cards"), name = viewerName();
    if (state.role === "admin") { box.innerHTML = ""; return; }
    var html = "";
    if (fl(name, "l2_reg")) html += subCardHtml(name, 2);
    if (standing(name) === 3) html += subCardHtml(name, 3);
    box.innerHTML = html;
  }
  document.getElementById("sub-cards").addEventListener("submit", function (e) {
    var n = Number(e.target.getAttribute("data-sc-form"));
    if (!n) return;
    e.preventDefault();
    var g = function (id) { return document.getElementById("sc" + n + "-" + id); };
    readFileInfo(g("file").files[0], function (info) {
      submitConceptualization(n, g("alias").value.trim(), {
        presenting: g("pres").value, dominant: g("dom").value, narrative: g("narr").value, plan: g("plan").value, prognosis: g("prog").value
      }, info);
      renderLearning();
    });
  });

  /* ---- Intervention vault: Signature TIIP + Supervisor-approved ---- */
  var vaultTab = "signature";
  function canUploadVault() { return state.role === "practitioner" || state.role === "supervisor"; }
  function renderResources() {
    var q = (document.getElementById("res-q").value || "").toLowerCase();
    var lang = document.getElementById("res-lang").value;
    var type = document.getElementById("res-type").value;
    var approved = state.vault.filter(function (x) { return x.status === "approved"; });
    document.getElementById("vt-sig").textContent = RESOURCES.length;
    document.getElementById("vt-com").textContent = approved.length;
    document.querySelectorAll("[data-vtab]").forEach(function (b) { b.classList.toggle("sel", b.getAttribute("data-vtab") === vaultTab); });
    document.getElementById("vault-blurb").innerHTML = vaultTab === "signature"
      ? "<b>Signature TIIP interventions</b> — the reference set from the TIIP creators. Version-controlled and maintained by the core team."
      : "<b>Supervisor-approved interventions</b> — uploaded by fully certified clinicians and approved by a TIIP supervisor before they appear here.";
    var rows;
    if (vaultTab === "signature") {
      var list = RESOURCES.filter(function (r) {
        if (q && (r.title + " " + r.tags.join(" ")).toLowerCase().indexOf(q) === -1) return false;
        if (lang && r.lang !== lang) return false;
        if (type && r.type !== type) return false;
        return true;
      });
      document.getElementById("res-empty").style.display = list.length ? "none" : "block";
      rows = list.map(function (r) {
        return '<div class="row"><span class="grow"><b>' + esc(r.title) + "</b><small>" + r.type + " · from the TIIP creators · updated " + r.updated + " · " + r.tags.map(function (t) { return "#" + t; }).join(" ") + "</small></span>" +
          '<span class="tag">' + r.lang + '</span><span class="tag gold" title="' + esc(r.history) + '">v' + r.v + "</span>" +
          '<button class="btn btn-ghost btn-xs" data-dl="' + RESOURCES.indexOf(r) + '">Download</button></div>';
      }).join("");
    } else {
      var clist = approved.filter(function (r) {
        if (q && (r.title + " " + r.tags.join(" ") + " " + r.by).toLowerCase().indexOf(q) === -1) return false;
        if (lang && r.lang !== lang) return false;
        if (type && r.type !== type) return false;
        return true;
      });
      document.getElementById("res-empty").style.display = clist.length ? "none" : "block";
      rows = clist.map(function (r) {
        return '<div class="row"><span class="grow"><b>' + esc(r.title) + "</b><small>" + esc(r.type) + " · uploaded by " + esc(r.by) + " · approved by " + esc(r.approvedBy) + " · " + esc(r.at) + " · " + r.tags.map(function (t) { return "#" + esc(t); }).join(" ") + "</small><small style=\"display:block;margin-top:2px;\">" + esc(r.desc) + "</small></span>" +
          '<span class="tag">' + esc(r.lang) + '</span><span class="tag ok">✔ Supervisor-approved</span>' +
          '<button class="btn btn-ghost btn-xs" data-vdl="' + r.id + '">Download</button></div>';
      }).join("");
    }
    document.getElementById("res-rows").innerHTML = rows;

    /* upload + queue */
    var can = canUploadVault(), me = viewerName();
    document.getElementById("vault-upload-card").style.display = can ? "block" : "none";
    document.getElementById("vault-locked").style.display = (can || state.role === "admin") ? "none" : "block";
    var qc = document.getElementById("vault-queue-card");
    if (state.role === "supervisor") {
      var pend = state.vault.filter(function (x) { return x.status === "pending" && x.by !== me; });
      qc.style.display = "block";
      qc.innerHTML = '<h3>✅ Awaiting your approval <span class="tag gold">Supervisor</span></h3><p class="view-lead" style="font-size:.85rem;margin-bottom:10px;">Approve uploads from fully certified clinicians so they appear in the vault.</p><div class="rows">' + (pend.length ? pend.map(function (x) {
        return '<div class="row"><span class="grow"><b>' + esc(x.title) + "</b><small>" + esc(x.type) + " · " + esc(x.lang) + " · by " + esc(x.by) + " · " + esc(x.at) + " " + (x.fileInfo ? fileLink(x.fileInfo) : x.file ? "· 📎 " + esc(x.file) : "") + "</small><small style=\"display:block;\">" + esc(x.desc) + '</small><input type="text" data-vnote="' + x.id + '" placeholder="Note (required to decline)" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--line);border-radius:8px;font-size:.8rem;" /></span>' +
          '<button class="btn btn-gold btn-xs" data-v-ok="' + x.id + '">Approve</button><button class="btn btn-ghost btn-xs" data-v-no="' + x.id + '">Decline</button></div>';
      }).join("") : '<div class="empty">Nothing waiting for approval. 🌙</div>') + "</div>";
    } else if (state.role === "practitioner") {
      var mine = state.vault.filter(function (x) { return x.by === me; });
      qc.style.display = "block";
      qc.innerHTML = '<h3>📁 My uploads</h3><div class="rows">' + (mine.length ? mine.map(function (x) {
        var tag = x.status === "approved" ? '<span class="tag ok">Approved by ' + esc(x.approvedBy) + "</span>" : x.status === "declined" ? '<span class="tag bad">Declined</span>' : '<span class="tag warn">Awaiting supervisor approval</span>';
        return '<div class="row"><span class="grow"><b>' + esc(x.title) + "</b><small>" + esc(x.type) + " · " + esc(x.at) + (x.note ? " — " + esc(x.note) : "") + "</small></span>" + tag + "</div>";
      }).join("") : '<div class="empty">You haven’t uploaded anything yet.</div>') + "</div>";
    } else qc.style.display = "none";
  }
  ["res-q", "res-lang", "res-type"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderResources);
  });
  document.getElementById("vault-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-vtab]");
    if (!b) return;
    vaultTab = b.getAttribute("data-vtab"); renderResources();
  });
  document.getElementById("res-rows").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-dl")) {
      var r = RESOURCES[Number(b.getAttribute("data-dl"))];
      downloadText(r.title.replace(/[^\w؀-ۿ-]+/g, "_") + "_v" + r.v + ".txt", r.title + "\n" + "=".repeat(r.title.length) + "\n\nTIIP Community — Intervention Vault (demo placeholder)\nSignature TIIP intervention\nType: " + r.type + "\nLanguage: " + r.lang + "\nVersion: " + r.v + " (updated " + r.updated + ")\nTags: " + r.tags.join(", ") + "\n\nVersion history:\n" + r.history + "\n\nIn production this downloads the actual clinical asset (PDF/DOCX) from encrypted storage.");
    } else if (b.hasAttribute("data-vdl")) {
      var it = state.vault.find(function (x) { return x.id === b.getAttribute("data-vdl"); });
      if (!it) return;
      if (it.fileInfo && it.fileInfo.dataUrl) { var a = document.createElement("a"); a.href = it.fileInfo.dataUrl; a.download = it.fileInfo.name; a.click(); }
      else downloadText(it.title.replace(/[^\w]+/g, "_") + ".txt", it.title + "\n\n" + it.desc + "\n\nUploaded by " + it.by + ", approved by " + it.approvedBy + ".\n(Demo placeholder — in production this downloads " + (it.file || "the uploaded file") + ".)");
    }
  });
  document.getElementById("vault-queue-card").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var id = b.getAttribute("data-v-ok") || b.getAttribute("data-v-no");
    var x = state.vault.find(function (v) { return v.id === id; });
    if (!x) return;
    var inp = this.querySelector('[data-vnote="' + id + '"]'), note = inp ? inp.value.trim() : "";
    if (b.hasAttribute("data-v-ok")) {
      x.status = "approved"; x.approvedBy = viewerName(); x.note = note;
      notify(x.by, "review", "Your intervention was approved — " + x.title, "A TIIP supervisor approved your upload. It now appears in the Supervisor-approved section of the Intervention Vault." + (note ? "\n\nNote: " + note : ""));
    } else {
      if (!note) { inp.focus(); inp.style.borderColor = "#b64d4d"; return; }
      x.status = "declined"; x.note = note;
      notify(x.by, "review", "Your intervention was not approved — " + x.title, "A TIIP supervisor declined your upload.\nReason: " + note);
    }
    save(); renderResources();
  });
  document.getElementById("vault-up-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!canUploadVault()) return;
    var me = viewerName(), isSup = state.role === "supervisor";
    readFileInfo(document.getElementById("vu-file").files[0], function (info) {
      var item = { id: "vt" + Date.now(), title: document.getElementById("vu-title").value.trim(), type: document.getElementById("vu-type").value, lang: document.getElementById("vu-lang").value,
        tags: csv(document.getElementById("vu-tags").value), desc: document.getElementById("vu-desc").value.trim(), file: info ? info.name : "", fileInfo: info, by: me, at: iso(new Date()),
        status: isSup ? "approved" : "pending", approvedBy: isSup ? me + " (self)" : "", note: "" };
      state.vault.unshift(item);
      if (!isSup) {
        supervisorNames().forEach(function (s) { notify(s, "review", "Intervention awaiting your approval — " + item.title, me + " uploaded “" + item.title + "” to the Intervention Vault.\n\nReview it in the Intervention Vault → Supervisor-approved."); });
        notify(me, "review", "Intervention submitted for approval", "“" + item.title + "” was sent to the TIIP supervisors. You'll be emailed their decision.");
      }
      save(); e.target.reset(); vaultTab = "community"; renderResources();
    });
  });

  /* =========================================================
     Shared helpers: viewer, dates, text, files
  ========================================================= */
  function viewerName() { return ROLES[state.role].name; }
  function isViewer(name) { return name === viewerName(); }
  function stamp() { return new Date().toISOString().slice(0, 16).replace("T", " "); }
  function fmtDate(d) {
    var dt = new Date(d + "T12:00:00");
    return isNaN(dt) ? d : new Intl.DateTimeFormat([], { month: "short", day: "numeric", year: "numeric" }).format(dt);
  }
  function emailFor(name) { return name.toLowerCase().replace(/^dr\.\s+/, "").replace(/[^a-z]+/g, ".").replace(/^\.+|\.+$/g, "") + "@example.org"; }
  function slugify(t) { return String(t).toLowerCase().replace(/^dr\.\s+/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function csv(t) { return String(t || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean); }
  function lines(t) { return String(t || "").split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }

  /* Small files are kept (as data URLs) so the other side can actually open
     them in this demo; larger ones record the file name only. */
  var MAX_FILE = 400 * 1024;
  function readFileInfo(file, cb) {
    if (!file) { cb(null); return; }
    var info = { name: file.name, size: file.size, dataUrl: "" };
    if (file.size > MAX_FILE) { cb(info); return; }
    var fr = new FileReader();
    fr.onload = function () { info.dataUrl = String(fr.result); cb(info); };
    fr.onerror = function () { cb(info); };
    fr.readAsDataURL(file);
  }
  function fileLink(info) {
    if (!info) return "";
    return info.dataUrl
      ? '<a href="' + esc(info.dataUrl) + '" download="' + esc(info.name) + '">⬇ ' + esc(info.name) + "</a>"
      : "📎 " + esc(info.name) + ' <small>(demo: name only)</small>';
  }
  function downloadText(filename, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = filename; a.click(); URL.revokeObjectURL(a.href);
  }

  /* =========================================================
     Email notifications (demo outbox). Every important event calls
     notify(); the Notifications view shows the viewer's emails and the
     admin Email log shows everything sent. In production these go out via
     a transactional email service.
  ========================================================= */
  var ADMIN_NAME = ROLES.admin.name;
  var NOTIF_CATS = {
    training:  { label: "Training announcements", desc: "New Level 1 / Level 2 trainings and registration confirmations", optional: true },
    community: { label: "Community activity", desc: "Comments on your library posts, referrals, event decisions", optional: true },
    review:    { label: "Reviews & approvals", desc: "Case-conceptualization results, listing, vault and panel decisions", optional: false },
    account:   { label: "Account & journey", desc: "Invitations, level changes, journey milestones", optional: false }
  };
  function prefsOf(name) { return state.prefs[name] || (state.prefs[name] = {}); }
  function supervisorNames() { return ADMIN_USERS.filter(function (u) { return u.role === "Supervisor / Scholar"; }).map(function (u) { return u.name; }); }
  function notify(to, cat, subject, body) {
    var member = !/@/.test(to);
    if (member && NOTIF_CATS[cat] && NOTIF_CATS[cat].optional && prefsOf(to)[cat] === false) return;
    state.outbox.unshift({ id: "em" + Date.now() + Math.random().toString(36).slice(2, 6), to: to, cat: cat, subject: subject, body: body + "\n\n— TIIP Community (demo email)", at: stamp(), read: false });
    if (state.outbox.length > 250) state.outbox.length = 250;
    save(); updateBadge();
  }
  function updateBadge() {
    var b = document.getElementById("notif-badge");
    if (!b) return;
    var n = state.outbox.filter(function (e) { return e.to === viewerName() && !e.read; }).length;
    b.style.display = n ? "inline-block" : "none";
    b.textContent = n;
  }
  function renderNotifications() {
    var name = viewerName();
    var mine = state.outbox.filter(function (e) { return e.to === name; }).slice(0, 60);
    document.getElementById("notif-list").innerHTML = mine.length ? mine.map(function (e) {
      return '<div class="mail-item' + (e.read ? "" : " unread") + '"><div class="m-top"><b>' + esc(e.subject) + '</b><span class="m-meta">' + esc(e.at) + ' · ' + esc((NOTIF_CATS[e.cat] || {}).label || e.cat) + '</span></div><p class="m-body">' + esc(e.body) + "</p></div>";
    }).join("") : '<div class="empty">No emails yet — updates will appear here.</div>';
    var p = prefsOf(name);
    document.getElementById("notif-prefs").innerHTML = Object.keys(NOTIF_CATS).map(function (k) {
      var c = NOTIF_CATS[k];
      return '<label class="pref-row"><input type="checkbox" data-pref="' + k + '"' + (c.optional ? (p[k] === false ? "" : " checked") : " checked disabled") + ' /> <span><b>' + c.label + (c.optional ? "" : ' <span class="tag dim">always on</span>') + "</b><small>" + c.desc + "</small></span></label>";
    }).join("");
    /* viewing the inbox marks it read (the highlight stays until the next render) */
    var changed = false;
    state.outbox.forEach(function (e) { if (e.to === name && !e.read) { e.read = true; changed = true; } });
    if (changed) { save(); updateBadge(); }
  }
  document.getElementById("notif-prefs").addEventListener("change", function (e) {
    var k = e.target.getAttribute("data-pref");
    if (!k) return;
    prefsOf(viewerName())[k] = e.target.checked; save();
  });
  document.getElementById("notif-readall").addEventListener("click", function () {
    state.outbox.forEach(function (e) { if (e.to === viewerName()) e.read = true; });
    save(); updateBadge(); renderNotifications();
  });

  /* =========================================================
     Certification journey model
     A member's standing is the stage they are at; each level has a
     checklist. Level 1/2: register → attend → (modules) → submit case
     conceptualization → passed. Level 3: 200 hours, 10 cases, written case
     conceptualization (passed), scholar letter on farḍ al-ʿayn → request a
     panel presentation to 3+ supervisors → fully certified.
  ========================================================= */
  function J(name) {
    if (!state.journey[name]) state.journey[name] = { flags: {}, notified: {} };
    var j = state.journey[name];
    j.flags = j.flags || {}; j.notified = j.notified || {};
    return j;
  }
  function fl(name, k) { return J(name).flags[k]; }
  function setFl(name, k, v) { J(name).flags[k] = v; save(); }
  function subPassed(name, lvl) { var x = findSubmission(name, lvl); return !!(x && x.status === "passed"); }
  function hoursFor(name) {
    if (name === ROLES.trainee.name) return { hours: approvedHours(), cases: state.casesDone };
    return { hours: fl(name, "l3_hours") ? 200 : 0, cases: fl(name, "l3_cases") ? 10 : 0 };
  }
  function cohortById(id) { return state.cohorts.find(function (c) { return c.id === id; }) || null; }
  function cohortLabel(c) { return c ? c.title + " · " + c.loc + " · " + fmtDate(c.date) : ""; }

  /* requirement checklist for level n (1–3) */
  function reqs(name, n) {
    var f = J(name).flags, ov = !!f["done" + n], out = [];
    function it(key, label, done, extra) { out.push({ key: key, label: label, done: ov || !!done, extra: extra || "" }); }
    var sb = findSubmission(name, n);
    if (n === 1) {
      it("l1_reg", "Register for a Level 1 training", f.l1_reg, cohortLabel(cohortById(f.l1_reg)));
      it("l1_att", "Attend the Level 1 training", f.l1_att, "Confirmed by an admin after the training");
      var modsOk = f.l1_mod || (isViewer(name) && state.learning.l1.every(function (m) { return m.done; }));
      it("l1_mod", "Complete the Level 1 online modules", modsOk, modsOk ? "All modules complete" : isViewer(name) ? state.learning.l1.filter(function (m) { return m.done; }).length + " of " + state.learning.l1.length + " complete" : "");
    } else if (n === 2) {
      it("l2_reg", "Register for a Level 2 training", f.l2_reg, cohortLabel(cohortById(f.l2_reg)));
      it("l2_att", "Attend the Level 2 training", f.l2_att, "Confirmed by an admin after the training");
    } else {
      var h = hoursFor(name);
      it("l3_hours", "Complete 200 supervised practice hours", h.hours >= 200, Math.round(h.hours) + " / 200 hours approved by your supervisor");
      it("l3_cases", "Complete 10 supervised cases", h.cases >= 10, h.cases + " / 10 cases");
    }
    it("l" + n + "_sub", "Submit your written case conceptualization", sb, sb ? "Attempt " + (sb.attempts || 1) + " · " + sb.at : "Submitted in the portal and reviewed by an admin");
    it("l" + n + "_pass", "Case conceptualization passed by an admin", subPassed(name, n),
       sb && sb.status === "retry" ? "Retry requested — see feedback below" : sb && sb.status === "pending" ? "Awaiting admin review" : "");
    if (n === 3) {
      var L = J(name).letter;
      it("l3_letter", "Letter from a scholar on farḍ al-ʿayn", L && L.status === "verified",
         !L ? "Upload a letter from a scholar confirming your farḍ al-ʿayn knowledge" : L.status === "verified" ? "Verified by an admin" : L.status === "replace" ? "Replacement requested — " + (L.note || "") : "Uploaded — awaiting admin verification");
    }
    return out;
  }
  function levelComplete(name, n) { return reqs(name, n).every(function (r) { return r.done; }); }
  function isCertified(name) { return !!fl(name, "certified"); }
  function standing(name) {
    if (isCertified(name)) return 4;
    if (levelComplete(name, 2)) return 3;
    if (fl(name, "l2_reg")) return 2;
    if (levelComplete(name, 1) || fl(name, "l1_reg")) return 1;
    return 0;
  }
  function memberKind(name) { var u = ADMIN_USERS.find(function (x) { return x.name === name; }); return u ? u.role : ""; }
  function isClinicalMember(name) { return name !== ADMIN_NAME; }
  /* listing / profile permissions */
  function canInternal(name) { return isClinicalMember(name) && (levelComplete(name, 1) || standing(name) >= 2); }
  function canPublic(name) { return isClinicalMember(name) && standing(name) >= 2 && levelComplete(name, 1); }
  function levelKeyFor(name) {
    var st = standing(name);
    if (st >= 4) return memberKind(name) === "Supervisor / Scholar" ? "supervisor" : "certified";
    return st === 3 ? "level3" : st === 2 ? "level2" : "level1";
  }
  function syncRole(name, n) {
    var u = ADMIN_USERS.find(function (x) { return x.name === name; });
    if (!u) { ADMIN_USERS.push({ name: name, role: ROLE_OPTIONS[n] }); return; }
    if (ROLE_OPTIONS.indexOf(u.role) < n) u.role = ROLE_OPTIONS[n];
  }
  /* run after anything that could complete a level: credits it and emails the member once */
  function checkProgress(name) {
    var j = J(name);
    [1, 2, 3].forEach(function (n) {
      var key = "done" + n;
      if (j.flags[key] || j.notified[key] || !levelComplete(name, n)) return;
      j.notified[key] = true;
      if (n < 3) syncRole(name, n);
      var nextText = n === 1 ? "register for an upcoming Level 2 training from your Certification Journey" : n === 2 ? "begin Level 3 supervised practice" : "request your Level 3 panel presentation";
      notify(name, "account", "Level " + n + " complete — congratulations", "You have completed every Level " + n + " requirement.\nNext step: " + nextText + ".\n\nOpen your journey: portal.html#certification");
    });
    save();
  }
  function panelFor(name) {
    var l = state.panels.filter(function (x) { return x.member === name; });
    return l.length ? l[l.length - 1] : null;
  }

  /* ---- registering for a training ---- */
  function registerForTraining(name, cohortId) {
    var c = cohortById(cohortId);
    if (!c) return;
    setFl(name, "l" + c.level + "_reg", cohortId);
    if (c.level === 1) state.learning.l1EnabledUsers[name] = true;
    var email = emailFor(name);
    if (!state.registry.some(function (r) { return r.email === email && r.level === c.level; })) {
      state.registry.unshift({ id: "rg" + Date.now(), name: name, email: email, level: c.level, status: "Registered", year: Number(c.date.slice(0, 4)), loc: c.loc, inv: "joined" });
    }
    notify(name, "training", "You're registered — " + cohortLabel(c), "You are registered for " + cohortLabel(c) + " (" + c.mode + ").\nTraining materials unlock in your Certification Journey once you register.\n\nOpen your journey: portal.html#certification");
    notify(ADMIN_NAME, "training", "New training registration — " + name, name + " registered for " + cohortLabel(c) + ".");
    checkProgress(name);
  }

  /* ---- training materials (slides & readings) unlocked by registering ---- */
  var TRAINING_MATERIALS = {
    1: [["Slides", "Foundations of TIIP — session slides"], ["Slides", "The role of the TIIP clinician — session slides"], ["Slides", "Assessment & conceptualization — session slides"],
        ["Reading", "The human psyche in the Islamic tradition — core reading"], ["Reading", "ʿAql, nafs, iḥsās, rūḥ — reading packet"], ["Reading", "Islamic virtues in the clinic — reading list"]],
    2: [["Slides", "Advanced intervention seminars — slide deck"], ["Slides", "Applied skills lab — handouts"],
        ["Reading", "The four-stage model of change — reading"], ["Reading", "Scrupulosity and waswasah — case readings"], ["Reading", "Families and the communal layer (ijtimāʿī) — reading"]]
  };
  function materialsHtml(n) {
    return '<div class="jr-mat"><h4>📎 Level ' + n + " training materials — slides &amp; readings</h4><div class=\"rows\">" +
      TRAINING_MATERIALS[n].map(function (m, i) {
        return '<div class="row"><span class="grow"><b>' + esc(m[1]) + '</b><small>' + m[0] + ' · from the Level ' + n + ' training</small></span><button class="btn btn-ghost btn-xs" data-mat="' + n + ":" + i + '">Download</button></div>';
      }).join("") + "</div></div>";
  }

  /* ---- journey rendering ---- */
  function regControl(n) {
    var cs = state.cohorts.filter(function (c) { return c.level === n; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (!cs.length) return '<span class="tag dim">No upcoming Level ' + n + " trainings posted yet — you'll be emailed</span>";
    return '<select aria-label="Choose a Level ' + n + ' training">' + cs.map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.loc + " · " + fmtDate(c.date) + " · " + c.mode) + "</option>";
    }).join("") + '</select><button class="btn btn-gold btn-xs" data-reg-go="' + n + '">Register</button>';
  }
  function jrItem(r, act, below) {
    return '<li class="jr-item' + (r.done ? " done" : "") + '"><span class="jr-box">' + (r.done ? "✓" : "") + '</span><span class="jr-text"><b>' + r.label + "</b>" +
      (r.extra ? "<small>" + r.extra + "</small>" : "") + (below || "") + "</span>" + (act ? '<span class="jr-act">' + act + "</span>" : "") + "</li>";
  }
  function demoBtn(name, key, label) {
    return isViewer(name) ? '<button class="btn btn-ghost btn-xs btn-demo" data-demo="' + key + '" title="Demo shortcut for something an admin or supervisor normally confirms">demo: ' + label + "</button>" : "";
  }
  function stageCard(num, title, sub, cls, tag, inner) {
    return '<div class="jr-stage ' + cls + '" id="jr-stage-' + num + '"><span class="jr-dot">' + (cls.indexOf("done") !== -1 ? "✓" : num) + '</span><div class="jr-card"><div class="jr-head"><h3>' + title + "</h3>" + tag + "</div>" + (sub ? '<p class="jr-sub">' + sub + "</p>" : "") + inner + "</div></div>";
  }
  function statusTag(done, started, locked) {
    return done ? '<span class="tag ok">✓ Complete</span>' : locked ? '<span class="tag dim">🔒 Locked</span>' : started ? '<span class="tag warn">In progress</span>' : '<span class="tag gold">Next step</span>';
  }
  function nextStep(name) {
    if (isCertified(name)) return { text: "You are fully certified — every stage is complete.", stage: 4 };
    if (!levelComplete(name, 1)) {
      if (!fl(name, "l1_reg")) return { text: "Register for an upcoming Level 1 training.", stage: 1 };
      var r1 = reqs(name, 1).find(function (r) { return !r.done; });
      return { text: r1.label + ".", stage: 1 };
    }
    if (!levelComplete(name, 2)) {
      if (!fl(name, "l2_reg")) return { text: "Level 1 is complete — register for an upcoming Level 2 training.", stage: 2 };
      var r2 = reqs(name, 2).find(function (r) { return !r.done; });
      return { text: r2.label + ".", stage: 2 };
    }
    if (!levelComplete(name, 3)) return { text: reqs(name, 3).find(function (r) { return !r.done; }).label + ".", stage: 3 };
    var pn = panelFor(name);
    if (!pn || pn.status === "notyet") return { text: "Every Level 3 requirement is done — request your panel presentation.", stage: 3 };
    if (pn.status === "requested") return { text: "Your panel presentation is requested — waiting for the admin to schedule it.", stage: 3 };
    return { text: "Present to your panel on " + esc(pn.when.replace("T", " ")) + ".", stage: 3 };
  }
  function panelItemHtml(name, ready) {
    var pn = panelFor(name), done = isCertified(name), act = "", extra = "", below = "";
    if (done) { extra = "Presentation passed"; }
    else if (pn && pn.status === "requested") { extra = "Requested " + esc(pn.requestedAt) + " — the admin is scheduling a panel of at least 3 supervisors"; }
    else if (pn && pn.status === "scheduled") {
      extra = "Scheduled for <b>" + esc(pn.when.replace("T", " ")) + "</b> with " + pn.members.map(esc).join(", ") + (pn.link ? ' · <a href="' + esc(pn.link) + '" target="_blank" rel="noopener noreferrer">Join link</a>' : "");
    } else {
      if (pn && pn.status === "notyet") extra = "Last attempt: not yet — " + esc(pn.note || "see your email") + ". You can request another presentation.";
      else extra = ready ? "Ready to request" : "Unlocks when every Level 3 requirement above is done";
      if (ready) below = '<details class="prof-sec" style="margin-top:8px;"><summary><b>Request a panel presentation</b></summary><div class="prof-body">' +
        '<div class="field"><label>Your availability (dates / times / time zone)</label><textarea id="panel-avail" placeholder="e.g., Weekday evenings after 6 pm EST, any time on the 12th–14th"></textarea></div>' +
        '<button class="btn btn-gold btn-xs" data-panel-go="1">Send request</button></div></details>';
    }
    return jrItem({ done: done, label: "Present your case to a panel of at least 3 supervisors", extra: extra }, act, below);
  }

  function renderJourney() {
    var name = viewerName(), root = document.getElementById("journey"), sum = document.getElementById("jr-summary");
    var isAdmin = state.role === "admin";
    var supView = state.role === "supervisor";
    document.getElementById("hours-section").style.display = "none";
    document.getElementById("cert-supervisor").style.display = "none";
    document.getElementById("panel-assigned").style.display = "none";
    document.getElementById("compliance-card").style.display = (isAdmin || state.role === "explorer") ? "none" : "block";

    if (isAdmin) {
      sum.innerHTML = '<div class="jr-banner"><span class="grow"><b>Admin view.</b> Admins do not hold a level. This is the pathway every member follows — manage individual journeys (attendance, reviews, letters, panels) in Administration.</span><button class="btn btn-gold btn-xs" data-go="admin">Open Administration</button></div>';
      root.innerHTML = PATHWAY.map(function (p, i) {
        return stageCard(p.num, p.name + " · " + p.title, esc(p.desc), "", "", "");
      }).join("");
      return;
    }

    var std = standing(name), cert = isCertified(name), nx = nextStep(name);
    var stdLabel = cert ? (memberKind(name) === "Supervisor / Scholar" ? "TIIP Supervisor" : "Fully certified") : "Level " + std;
    sum.innerHTML = '<div class="jr-banner"><span class="grow"><b>You are at ' + stdLabel + '.</b> <span style="color:var(--muted);">Next step — ' + nx.text + "</span></span>" +
      (cert ? "" : '<button class="btn btn-gold btn-xs" data-jump="' + nx.stage + '">Go to this step</button>') + "</div>";

    /* ----- Level 0 ----- */
    var l0watched = std >= 1 || (isViewer(name) && state.learning.l0.every(function (m) { return m.done; }));
    var s0 = jrItem({ done: true, label: "Create your free account", extra: "" }) +
      jrItem({ done: l0watched, label: "Watch the six-part introductory series", extra: "Recommended before Level 1 — in Resources & Modules" }, l0watched ? "" : '<button class="btn btn-ghost btn-xs" data-go="learning">Open</button>');
    var l0next = (!fl(name, "l1_reg") && !levelComplete(name, 1))
      ? '<div class="jr-next"><b>Next step:</b> register for an upcoming <b>Level 1</b> training.<div class="jr-act">' + regControl(1) + "</div></div>" : "";
    var html = stageCard(0, "Level 0 · TIIP Trainee", "Open to everyone — starter modules, events, and forums.", "done", statusTag(true), '<ul class="jr-list">' + s0 + "</ul>" + l0next);

    /* ----- Levels 1 & 2 ----- */
    [1, 2].forEach(function (n) {
      var rs = reqs(name, n), complete = rs.every(function (r) { return r.done; });
      var locked = n === 2 && !levelComplete(name, 1);
      var started = rs.some(function (r) { return r.done; });
      var list = rs.map(function (r) {
        var act = "";
        if (!locked && !r.done) {
          if (r.key === "l" + n + "_reg") act = regControl(n);
          else if (r.key === "l" + n + "_att") act = fl(name, "l" + n + "_reg") ? demoBtn(name, r.key, "mark attended") : "";
          else if (r.key === "l1_mod") act = fl(name, "l1_reg") ? '<button class="btn btn-ghost btn-xs" data-go="learning">Open modules</button>' : "";
          else if (r.key === "l" + n + "_sub") act = (n === 1 ? fl(name, "l1_reg") : fl(name, "l2_reg")) ? '<button class="btn btn-ghost btn-xs" data-go="learning">Open</button>' : "";
        }
        var sb = findSubmission(name, n), below = "";
        if (r.key === "l" + n + "_pass" && sb) below = feedbackNote(sb);
        return jrItem(r, act, below);
      }).join("");
      var done = complete ? '<div class="jr-done-banner">✓ Level ' + n + " complete</div>" : "";
      var nextReg = "";
      if (complete && n === 1 && !fl(name, "l2_reg") && !levelComplete(name, 2)) nextReg = '<div class="jr-next"><b>Next step:</b> register for an upcoming <b>Level 2</b> training.<div class="jr-act">' + regControl(2) + "</div></div>";
      if (complete && n === 2) nextReg = '<div class="jr-next"><b>Next step:</b> Level 3 — supervised practice begins. Log hours, complete cases, and prepare your written case conceptualization and scholar letter.</div>';
      var showMat = !locked && (fl(name, "l" + n + "_reg") || complete || std > n);
      html += stageCard(n, "Level " + n + " · " + (n === 1 ? "Foundations" : "Intermediate"),
        n === 1 ? "Foundations coursework, the online modules, and your first case conceptualization." : "Advanced seminars, applied skills, and your second case conceptualization.",
        (complete ? "done" : locked ? "locked" : "current"), statusTag(complete, started, locked),
        '<ul class="jr-list">' + list + "</ul>" + done + nextReg + (showMat ? materialsHtml(n) : ""));
    });

    /* ----- Level 3 ----- */
    (function () {
      var n = 3, rs = reqs(name, 3), complete = cert, locked = !levelComplete(name, 2);
      var ready = rs.every(function (r) { return r.done; });
      var list = rs.map(function (r) {
        var act = "", below = "";
        if (!locked && !r.done) {
          if (r.key === "l3_hours" || r.key === "l3_cases") act = demoBtn(name, r.key, "mark complete") + (state.role === "trainee" && r.key === "l3_hours" ? '<button class="btn btn-ghost btn-xs" data-jump="hours">Log hours ↓</button>' : "");
          else if (r.key === "l3_sub") act = '<button class="btn btn-ghost btn-xs" data-go="learning">Open</button>';
          else if (r.key === "l3_letter") {
            below = '<div class="field-row" style="margin-top:8px;align-items:flex-end;"><div class="field" style="margin:0;"><label>Scholar\'s name</label><input type="text" id="jr-letter-scholar" /></div>' +
              '<div class="field" style="margin:0;"><label>Letter (PDF or Word)</label><input type="file" id="jr-letter-file" accept=".pdf,.doc,.docx" /></div>' +
              '<button class="btn btn-gold btn-xs" data-letter-go="1">Upload letter</button></div>';
          }
        }
        if (r.key === "l3_pass") { var sb3 = findSubmission(name, 3); if (sb3) below = feedbackNote(sb3); }
        if (r.key === "l3_letter" && J(name).letter && J(name).letter.info) below = '<div style="margin-top:4px;font-size:.8rem;">' + fileLink(J(name).letter.info) + "</div>" + below;
        return jrItem(r, act, below);
      }).join("") + (locked ? "" : panelItemHtml(name, ready && !locked));
      html += stageCard(3, "Level 3 · Supervised Practice", "200 supervised hours, 10 cases, a written case conceptualization, a scholar's letter, then a panel presentation.",
        (complete ? "done" : locked ? "locked" : "current"), statusTag(complete, rs.some(function (r) { return r.done; }), locked),
        '<ul class="jr-list">' + list + "</ul>" + (locked ? '<p class="jr-sub">Unlocks when Level 2 is complete.</p>' : ""));
    })();

    /* ----- Fully certified ----- */
    html += stageCard("✓", "Fully certified", "Full clinical and consultation privileges, the ability to post interventions in the vault, and eligibility for the TIIP Supervisor track.",
      cert ? "done" : "locked", statusTag(cert, false, !cert), "");
    root.innerHTML = html;

    /* ----- Level 3 tools ----- */
    if (state.role === "trainee") { document.getElementById("hours-section").style.display = "block"; renderHours(); }
    if (supView) { document.getElementById("cert-supervisor").style.display = "block"; renderSupervisorQueue(); renderAssignedPanels(); }
    if (!isAdmin && state.role !== "explorer") renderVault();
  }

  function renderHours() {
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
      Math.max(0, 200 - hrs) + " hours remaining" + (pend ? " · " + pend + "h pending supervisor approval" : "") + " · " + Math.max(0, 10 - state.casesDone) + " cases to go.";
    document.getElementById("hours-rows").innerHTML = state.hours.slice().reverse().map(function (h) {
      var tag = h.status === "approved" ? '<span class="tag ok">Approved</span>' : h.status === "declined" ? '<span class="tag bad">Declined</span>' : '<span class="tag warn">Pending</span>';
      return '<div class="row"><span class="grow"><b>' + h.hours + "h · " + esc(h.type) + "</b><small>" + h.date + (h.notes ? " — " + esc(h.notes) : "") + "</small></span>" + tag + "</div>";
    }).join("") || '<div class="empty">No entries yet — log your first supervised hours.</div>';
  }
  function renderSupervisorQueue() {
    var rows = pendingEntries();
    document.getElementById("approve-rows").innerHTML = rows.length ? rows.map(function (h) {
      var idx = state.hours.indexOf(h);
      return '<div class="row"><span class="grow"><b>Amina Yusuf — ' + h.hours + "h · " + esc(h.type) + "</b><small>" + h.date + (h.notes ? " — " + esc(h.notes) : "") + "</small></span>" +
        '<button class="btn btn-gold btn-xs" data-approve="' + idx + '">Approve</button>' +
        '<button class="btn btn-ghost btn-xs" data-decline="' + idx + '">Decline</button></div>';
    }).join("") : '<div class="empty">Queue clear — no hours awaiting approval. 🌙</div>';
    document.querySelectorAll("[data-approve]").forEach(function (b) {
      b.addEventListener("click", function () { state.hours[Number(b.getAttribute("data-approve"))].status = "approved"; save(); checkProgress(ROLES.trainee.name); renderJourney(); });
    });
    document.querySelectorAll("[data-decline]").forEach(function (b) {
      b.addEventListener("click", function () { state.hours[Number(b.getAttribute("data-decline"))].status = "declined"; save(); renderJourney(); });
    });
  }
  function renderAssignedPanels() {
    var me = viewerName();
    var mine = state.panels.filter(function (x) { return x.status === "scheduled" && x.members.indexOf(me) !== -1; });
    document.getElementById("panel-assigned").style.display = "block";
    document.getElementById("panel-assigned-rows").innerHTML = mine.length ? mine.map(function (x) {
      return '<div class="row"><span class="grow"><b>' + esc(x.member) + " — Level 3 presentation</b><small>" + esc(x.when.replace("T", " ")) + " · panel: " + x.members.map(esc).join(", ") + "</small></span>" +
        (x.link ? '<a class="btn btn-ghost btn-xs" href="' + esc(x.link) + '" target="_blank" rel="noopener noreferrer">Join link</a>' : "") + "</div>";
    }).join("") : '<div class="empty">No panel presentations assigned to you yet.</div>';
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
    save(); e.target.reset(); renderJourney();
  });

  /* demo shortcuts for items an admin / supervisor would normally confirm */
  function demoMark(key) {
    var name = viewerName();
    if (key === "l3_hours" && name === ROLES.trainee.name) state.approvedSeed += Math.max(0, 200 - approvedHours());
    else if (key === "l3_cases" && name === ROLES.trainee.name) state.casesDone = 10;
    else setFl(name, key, true);
    save(); checkProgress(name); renderJourney();
  }
  document.querySelector('section[data-view="certification"]').addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var name = viewerName();
    if (b.hasAttribute("data-reg-go")) {
      var sel = b.parentNode.querySelector("select");
      if (sel && sel.value) { registerForTraining(name, sel.value); renderJourney(); }
    } else if (b.hasAttribute("data-demo")) demoMark(b.getAttribute("data-demo"));
    else if (b.hasAttribute("data-go")) show(b.getAttribute("data-go"));
    else if (b.hasAttribute("data-jump")) {
      var id = b.getAttribute("data-jump") === "hours" ? "hours-section" : "jr-stage-" + b.getAttribute("data-jump");
      var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (b.hasAttribute("data-mat")) {
      var p = b.getAttribute("data-mat").split(":"), m = TRAINING_MATERIALS[p[0]][Number(p[1])];
      downloadText(m[1].replace(/[^\w]+/g, "_") + ".txt", m[1] + "\n" + "=".repeat(m[1].length) + "\n\nTIIP Level " + p[0] + " training — " + m[0] + " (demo placeholder).\nIn production this downloads the actual " + m[0].toLowerCase() + " from the training.");
    } else if (b.hasAttribute("data-letter-go")) {
      var file = document.getElementById("jr-letter-file").files[0], who = document.getElementById("jr-letter-scholar").value.trim();
      if (!file || !who) { alert("Please add the scholar's name and choose the letter file."); return; }
      readFileInfo(file, function (info) {
        J(name).letter = { scholar: who, info: info, at: stamp(), status: "pending", note: "" };
        save();
        notify(ADMIN_NAME, "review", "Scholar letter awaiting verification — " + name, name + " uploaded a farḍ al-ʿayn letter from " + who + ".\n\nVerify it in Administration → Reviews & letters.");
        notify(name, "review", "We received your scholar letter", "Your letter from " + who + " was uploaded and is awaiting admin verification.");
        renderJourney();
      });
    } else if (b.hasAttribute("data-panel-go")) {
      var av = (document.getElementById("panel-avail").value || "").trim();
      if (!av) { alert("Please add your availability so the panel can be scheduled."); return; }
      state.panels.push({ id: "pn" + Date.now(), member: name, status: "requested", availability: av, requestedAt: stamp(), when: "", link: "", members: [], note: "" });
      save();
      notify(ADMIN_NAME, "review", "Level 3 panel presentation requested — " + name, name + " completed every Level 3 requirement and requests a panel presentation.\nAvailability: " + av + "\n\nSchedule it (3+ supervisors) in Administration → Level 3 panels.");
      notify(name, "review", "Panel presentation request received", "Your request was received. An admin will schedule a panel of at least 3 supervisors and email you the date.");
      renderJourney();
    }
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
      t.thread.push({ author: ROLES[state.role].name, role: isScholar ? "Scholar" : ROLES[state.role].short, text: document.getElementById("tr-body").value, at: iso(new Date()) });
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
      thread: [{ author: ROLES[state.role].name, role: ROLES[state.role].short, text: document.getElementById("tf-body").value, at: iso(new Date()) }]
    });
    openTicketId = id;
    save(); e.target.reset(); renderFatwa();
  });

  /* ---- Research library ---- */
  var LIB_CATS = ["Foundations & ontology", "Clinical interventions", "Spiritual care & tazkiyah", "Trauma & grief", "Family & marriage",
    "Youth & identity", "Fiqh & mental health", "Research & evidence", "Practitioner wellbeing", "Other"];
  var libOpen = {};
  function libCanInteract() { return state.role !== "explorer"; }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : ""; }

  function renderLibrary() {
    var catSel = document.getElementById("lib-cat"), formCat = document.getElementById("lf-cat");
    if (!catSel.options.length) {
      catSel.innerHTML = '<option value="">All categories</option>' + LIB_CATS.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("");
      formCat.innerHTML = LIB_CATS.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("");
    }
    var can = libCanInteract(), me = ROLES[state.role].name;
    document.getElementById("lib-post-card").style.display = can ? "block" : "none";
    document.getElementById("lib-locked").style.display = can ? "none" : "block";

    var q = (document.getElementById("lib-q").value || "").trim().toLowerCase();
    var cat = catSel.value, kind = document.getElementById("lib-kind").value, sort = document.getElementById("lib-sort").value;
    var list = state.library.filter(function (it) {
      if (cat && it.category !== cat) return false;
      if (kind && it.kind !== kind) return false;
      if (q && (it.title + " " + it.author + " " + it.summary + " " + it.category).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    list.sort(function (a, b) {
      if (sort === "liked") return b.likes.length - a.likes.length || (a.at < b.at ? 1 : -1);
      if (sort === "discussed") return b.comments.length - a.comments.length || (a.at < b.at ? 1 : -1);
      return a.at < b.at ? 1 : a.at > b.at ? -1 : 0;
    });
    document.getElementById("lib-empty").style.display = list.length ? "none" : "block";

    document.getElementById("lib-list").innerHTML = list.map(function (it) {
      var liked = it.likes.indexOf(me) !== -1;
      var href = safeUrl(it.link);
      var comments = libOpen[it.id]
        ? '<div class="lib-comments">' + (it.comments.length ? it.comments.map(function (c) {
            return '<div class="msg"><span class="avatar">' + initials(c.author) + '</span><div class="m-body"><div class="m-who"><b>' + esc(c.author) + "</b> · " + esc(c.role) + " · " + esc(c.at) + "</div><p>" + esc(c.text) + "</p></div></div>";
          }).join("") : '<div class="empty" style="padding:12px;">No comments yet.</div>') +
          (libCanInteract() ? '<form data-comment-form="' + it.id + '"><input type="text" required maxlength="500" placeholder="Add a comment…" aria-label="Add a comment" /><button class="btn btn-gold btn-xs" type="submit">Comment</button></form>' : "") + "</div>"
        : "";
      return '<article class="lib-item"><div class="lib-tags"><span class="tag gold">' + esc(it.kind) + '</span><span class="tag">' + esc(it.category) + "</span></div>" +
        "<h4>" + esc(it.title) + "</h4>" +
        '<div class="lib-meta">By ' + esc(it.author) + " · shared by " + esc(it.by) + " · " + esc(it.at) + "</div>" +
        '<p class="lib-sum">' + esc(it.summary) + "</p>" +
        ((href || it.file) ? '<div class="lib-tags">' + (href ? '<a class="tag dim" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">🔗 Open link</a>' : "") + (it.file ? '<span class="tag dim">📎 ' + esc(it.file) + "</span>" : "") + "</div>" : "") +
        '<div class="lib-actions">' +
        '<button class="btn btn-ghost btn-xs btn-like' + (liked ? " liked" : "") + '" data-like="' + it.id + '"' + (can ? "" : ' disabled title="Level 1+ can like"') + ">" + (liked ? "♥" : "♡") + " " + it.likes.length + "</button>" +
        '<button class="btn btn-ghost btn-xs" data-toggle-comments="' + it.id + '">💬 ' + it.comments.length + (libOpen[it.id] ? " · hide" : "") + "</button>" +
        '<span class="spacer"></span>' +
        ((state.role === "admin" || it.by === me) ? '<button class="btn btn-ghost btn-xs" data-lib-del="' + it.id + '">Remove</button>' : "") +
        "</div>" + comments + "</article>";
    }).join("");

    /* category chips with counts */
    var counts = {};
    state.library.forEach(function (it) { counts[it.category] = (counts[it.category] || 0) + 1; });
    document.getElementById("lib-cats").innerHTML = LIB_CATS.map(function (c) {
      return '<button type="button" class="cat-chip' + (cat === c ? " sel" : "") + '" data-cat="' + esc(c) + '">' + esc(c) + "<i>" + (counts[c] || 0) + "</i></button>";
    }).join("");
  }

  /* delegated handlers (bound once) */
  document.getElementById("lib-list").addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    var me = ROLES[state.role].name;
    var id = t.getAttribute("data-like") || t.getAttribute("data-toggle-comments") || t.getAttribute("data-lib-del");
    var it = state.library.find(function (x) { return x.id === id; });
    if (!it) return;
    if (t.hasAttribute("data-like") && libCanInteract()) {
      var i = it.likes.indexOf(me);
      if (i === -1) it.likes.push(me); else it.likes.splice(i, 1);
      save(); renderLibrary();
    } else if (t.hasAttribute("data-toggle-comments")) {
      libOpen[id] = !libOpen[id]; renderLibrary();
    } else if (t.hasAttribute("data-lib-del")) {
      if (confirm("Remove “" + it.title + "” from the library?")) {
        state.library = state.library.filter(function (x) { return x.id !== id; });
        save(); renderLibrary();
      }
    }
  });
  document.getElementById("lib-list").addEventListener("submit", function (e) {
    var id = e.target.getAttribute("data-comment-form");
    if (!id) return;
    e.preventDefault();
    var it = state.library.find(function (x) { return x.id === id; });
    var input = e.target.querySelector("input");
    if (!it || !input.value.trim() || !libCanInteract()) return;
    it.comments.push({ author: ROLES[state.role].name, role: ROLES[state.role].short, text: input.value.trim(), at: iso(new Date()) });
    if (it.by !== ROLES[state.role].name) notify(it.by, "community", "New comment on your library post — " + it.title, ROLES[state.role].name + " commented: “" + input.value.trim() + "”\n\nOpen the library: portal.html#library");
    libOpen[id] = true; save(); renderLibrary();
  });
  document.getElementById("lib-cats").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]");
    if (!b) return;
    var sel = document.getElementById("lib-cat");
    sel.value = sel.value === b.getAttribute("data-cat") ? "" : b.getAttribute("data-cat");
    renderLibrary();
  });
  ["lib-q", "lib-cat", "lib-kind", "lib-sort"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderLibrary);
  });
  document.getElementById("lib-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!libCanInteract()) return;
    var me = ROLES[state.role].name;
    var file = document.getElementById("lf-file").files[0];
    state.library.unshift({
      id: "lb" + Date.now(), title: document.getElementById("lf-title").value.trim(), kind: document.getElementById("lf-kind").value,
      category: document.getElementById("lf-cat").value, author: document.getElementById("lf-author").value.trim() || me, by: me, at: iso(new Date()),
      summary: document.getElementById("lf-summary").value.trim(), link: document.getElementById("lf-link").value.trim(), file: file ? file.name : "",
      likes: [], comments: []
    });
    save(); e.target.reset(); renderLibrary();
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
          if (e) { e.status = "approved"; save(); notify(e.by, "community", "Your event was approved — " + e.title, "Your event is now on the community calendar (" + e.date + ").\n\nOpen events: portal.html#events"); renderEvents(); }
        });
      });
      document.querySelectorAll("[data-ev-no]").forEach(function (b) {
        b.addEventListener("click", function () {
          var e = state.memberEvents.find(function (x) { return x.id === b.getAttribute("data-ev-no"); });
          if (e) { e.status = "declined"; save(); notify(e.by, "community", "Your event was not approved — " + e.title, "An admin did not approve this event submission. You can edit and resubmit it from Events & Training."); renderEvents(); }
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
    notify(ADMIN_NAME, "review", "Event awaiting approval — " + document.getElementById("ef-title").value, ROLES[state.role].name + " submitted an event for approval.\n\nApprove it in Events & Training.");
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
    th.posts.push({ author: ROLES[state.role].name, role: ROLES[state.role].short, text: document.getElementById("rf-body").value, at: iso(new Date()) });
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
