/* TIIP Community — shared provider data (demo)
   Used by the public directory (directory.js) and the individual provider
   profile page (provider.js). The public site lists only supervisors, fully
   certified clinicians, and Level 3 trainees; Level 1–2 trainees appear only
   in the members-only directory inside the portal.

   Every profile below is an illustrative sample for this mock-up — not a
   real practitioner. */
(function () {
  "use strict";
  var T = (window.TIIP = window.TIIP || {});

  T.LEVELS = {
    supervisor: { label: "TIIP Supervisor", cls: "lv-supervisor" },
    certified:  { label: "Fully Certified", cls: "lv-certified" },
    level3:     { label: "Level 3 Trainee", cls: "lv-3" },
    level2:     { label: "Level 2 Trainee", cls: "lv-2" }
  };

  /* offering helper: events / workshops / seminars a provider can conduct */
  function o(title, type, format, duration, audience, desc) {
    return { title: title, type: type, format: format, duration: duration, audience: audience, desc: desc };
  }

  /* photo: {g, id} indexes a demo portrait; if it can't load, an initials
     avatar is generated instead. state is null where a state/province tier
     does not apply (e.g. UK city-level search). */
  T.PROVIDERS = [
    {
      slug: "omar-el-sayed", name: "Dr. Omar El-Sayed", credentials: "PhD · Licensed Psychologist", level: "supervisor",
      specialties: ["OCD & Waswasah", "Anxiety"], languages: ["English", "Arabic"],
      country: "United States", state: "New York", city: "New York City", photo: { g: "men", id: 75 },
      bio: "Directs a specialty clinic for scrupulosity and religious OCD, pairing exposure-based care with TIIP’s model of the nafs. Supervises certification cohorts and consults internationally.",
      about: "Dr. El-Sayed has spent nearly two decades treating scrupulosity, intrusive thoughts, and anxiety in Muslim clients, helping clinicians and imams alike tell clinical OCD apart from waswasah. His clinic partners with local masjids on referral pathways, and he supervises TIIP trainees working with obsessional presentations.",
      years: 19, education: ["PhD, Clinical Psychology — Fordham University", "Postdoctoral fellowship, anxiety & OCD disorders"],
      license: "Licensed Psychologist (New York)", approach: "Exposure & response prevention integrated with TIIP’s work on the nafs, rūḥ, and the heart.",
      populations: ["Adults", "Adolescents", "Clergy & community leaders"], formats: ["In person", "Telehealth (NY residents)"], accepting: "Waitlist",
      offerings: [
        o("Waswasah vs. OCD: a clinician’s workshop", "Workshop", "In person · Online", "Half day", "Clinicians, trainees, imams", "Differential assessment, ERP adapted for religious obsessions, and when to involve a scholar."),
        o("Supervising scrupulosity cases", "Seminar", "Online", "90 minutes", "Supervisors & certified clinicians", "A case-based seminar on consultation, exposure design, and keeping treatment faith-consistent."),
        o("Masjid–clinic referral pathways", "Community talk", "In person", "60 minutes", "Imams, community leaders", "How congregations can recognize distress and refer well without pathologizing devotion.")
      ]
    },
    {
      slug: "hana-saleh", name: "Dr. Hana Saleh", credentials: "C.Psych · Clinical Psychologist", level: "supervisor",
      specialties: ["Trauma & PTSD", "Clinical Supervision"], languages: ["English", "Arabic"],
      country: "Canada", state: "Ontario", city: "Toronto", photo: { g: "women", id: 68 },
      bio: "Senior TIIP supervisor with two decades of trauma work. Leads the monthly group consultation on trauma and the heart, and mentors clinicians entering the model.",
      about: "Dr. Saleh integrates phase-based trauma treatment with TIIP’s understanding of the qalb, grief, and meaning-making. She chairs the monthly trauma consultation group and has mentored dozens of clinicians through their supervised practice hours.",
      years: 21, education: ["PhD, Clinical Psychology — University of Toronto", "TIIP Supervisor credential"],
      license: "Registered Psychologist (Ontario)", approach: "Phase-based trauma care with spiritually integrated stabilization and meaning-oriented work.",
      populations: ["Adults", "Refugees & newcomers", "Clinicians (supervision)"], formats: ["Telehealth", "In person (Toronto)"], accepting: "Accepting new clients",
      offerings: [
        o("Trauma and the heart: a TIIP approach", "Workshop", "Online", "Full day", "Licensed clinicians", "Stabilization, processing, and integration for trauma survivors through a faith-rooted lens."),
        o("Group supervision intensive", "Training", "Online", "6 sessions", "Trainees (Levels 2–3)", "Structured group supervision toward practicum hours, with live case review."),
        o("Vicarious trauma & the caregiver’s heart", "Seminar", "Online · In person", "2 hours", "Mental health teams, chaplains", "Recognizing and tending to the toll of this work with tazkiyah-based practices.")
      ]
    },
    {
      slug: "bilal-hutchinson", name: "Dr. Bilal Hutchinson", credentials: "PsyD · Clinical Psychologist", level: "certified",
      specialties: ["Addiction & Recovery", "Men's Mental Health"], languages: ["English"],
      country: "United States", state: "Texas", city: "Dallas", photo: { g: "men", id: 52 },
      bio: "Built a TIIP-informed recovery program integrating twelve-step work with tazkiyah practices. Special interest in fathers, providers, and men returning to faith.",
      about: "Dr. Hutchinson’s recovery program blends relapse-prevention skills with purification of the heart, accountability, and brotherhood. He works with men navigating addiction, shame, and the pressures of providing for a family.",
      years: 12, education: ["PsyD, Clinical Psychology — Baylor University"],
      license: "Licensed Psychologist (Texas)", approach: "Motivational interviewing and relapse prevention woven with tazkiyah practices and community support.",
      populations: ["Adult men", "Fathers", "Recent converts"], formats: ["In person (Dallas)", "Telehealth (TX)"], accepting: "Accepting new clients",
      offerings: [
        o("Recovery and the heart: faith-integrated addiction care", "Workshop", "In person · Online", "Half day", "Clinicians, counselors", "Adapting evidence-based addiction treatment with TIIP’s model of the nafs."),
        o("Men’s wellbeing circle facilitation", "Training", "In person", "Full day", "Masjid program leads", "Preparing community facilitators to host safe, structured men’s support circles."),
        o("Fatherhood, provision, and burnout", "Community talk", "In person · Online", "60 minutes", "Community members", "Practical reflections on identity, stress, and presence in the home.")
      ]
    },
    {
      slug: "musa-adebayo", name: "Dr. Musa Adebayo", credentials: "MRCPsych · Consultant Psychiatrist", level: "supervisor",
      specialties: ["Severe Mental Illness", "Psychiatric Consultation"], languages: ["English", "Yoruba"],
      country: "United Kingdom", state: null, city: "London", photo: { g: "men", id: 22 },
      bio: "Consultant psychiatrist bridging medication management and spiritually integrated care. Advises TIIP clinicians on complex presentations and psychiatric referral.",
      about: "Dr. Adebayo consults to TIIP clinicians on psychosis, bipolar disorder, and complex presentations where medication and spiritual care must work together. He is a frequent bridge between psychiatric services and faith communities.",
      years: 17, education: ["MBBS — King’s College London", "MRCPsych — Royal College of Psychiatrists"],
      license: "GMC-registered psychiatrist", approach: "Collaborative, recovery-oriented psychiatry that honors religious meaning without displacing clinical care.",
      populations: ["Adults with severe mental illness", "Families", "Referring clinicians"], formats: ["Clinical consultation (clinicians)", "Outpatient (London)"], accepting: "Clinician consultation open",
      offerings: [
        o("Psychosis, spirituality, and religious experience", "Seminar", "Online · In person", "2 hours", "Clinicians, chaplains", "Distinguishing religious experience from psychopathology, and collaborating with families and scholars."),
        o("Medication literacy for TIIP clinicians", "Workshop", "Online", "3 hours", "Non-prescribing clinicians", "What non-prescribers need to know when clients are on psychotropic medication, including fasting."),
        o("Referral pathways with psychiatry", "Training", "Online", "90 minutes", "Counselors, clinic teams", "Building safe, timely referral routes between community clinics and psychiatric services.")
      ]
    },
    {
      slug: "rania-khalil", name: "Dr. Rania Khalil", credentials: "PhD · Counseling Psychology", level: "certified",
      specialties: ["Cross-Cultural Adjustment", "Family Therapy"], languages: ["Arabic", "English"],
      country: "United Arab Emirates", state: null, city: "Dubai", photo: { g: "women", id: 65 },
      bio: "Works with expatriate and multicultural families navigating identity, belonging, and transition. Anchors the Gulf regional supervision circle.",
      about: "Dr. Khalil supports families relocating across cultures and generations, addressing identity, parenting, and marital strain in transition. She anchors the Gulf regional supervision circle for TIIP trainees.",
      years: 14, education: ["PhD, Counseling Psychology — American University of Beirut"],
      license: "Licensed Counseling Psychologist (UAE)", approach: "Systemic family work with TIIP’s attention to ijtimāʿī (the communal layer) and the heart.",
      populations: ["Families", "Expatriates", "Couples"], formats: ["In person (Dubai)", "Telehealth"], accepting: "Accepting new clients",
      offerings: [
        o("Raising Muslim children between cultures", "Workshop", "In person · Online", "Half day", "Parents, educators", "Identity, belonging, and communication strategies for multicultural households."),
        o("Cross-cultural adjustment for professionals", "Seminar", "Online", "90 minutes", "Employers, HR teams, clinicians", "Understanding relocation stress and supporting employees and families."),
        o("Regional supervision circle: starter session", "Training", "Online", "2 hours", "Trainees in the Gulf", "An introduction to group supervision and case formulation within TIIP.")
      ]
    },
    {
      slug: "saad-farooqi", name: "Dr. Saad Farooqi", credentials: "FCPS · Psychiatrist", level: "supervisor",
      specialties: ["Mood Disorders", "Clinical Supervision"], languages: ["Urdu", "English"],
      country: "Pakistan", state: "Sindh", city: "Karachi", photo: { g: "men", id: 29 },
      bio: "Trains residents and community clinicians in Islamically integrated psychiatry. Leads South Asia’s TIIP study group and supervises early-career therapists.",
      about: "Dr. Farooqi teaches Islamically integrated psychiatry to residents and community clinicians across South Asia. He leads the regional TIIP study group and supervises early-career therapists building their practice.",
      years: 16, education: ["MBBS — Aga Khan University", "FCPS Psychiatry"],
      license: "PMDC-registered psychiatrist", approach: "Biopsychosocial-spiritual formulation with culturally grounded psychoeducation in Urdu and English.",
      populations: ["Adults", "Residents & early-career clinicians"], formats: ["In person (Karachi)", "Telehealth"], accepting: "Waitlist",
      offerings: [
        o("Mood disorders and the spiritual life", "Seminar", "In person · Online", "2 hours", "Clinicians, residents", "Depression, bipolar presentations, and spiritual distress in South Asian communities."),
        o("Starting a TIIP study group", "Training", "Online", "90 minutes", "Clinician networks", "How to structure a regional study group, case rounds, and peer supervision."),
        o("Urdu-language psychoeducation workshop", "Workshop", "In person", "Half day", "Community health workers", "Delivering clear, stigma-reducing mental health education in Urdu.")
      ]
    },
    {
      slug: "aisha-karim", name: "Dr. Aisha Karim", credentials: "DClinPsy · Clinical Psychologist", level: "certified",
      specialties: ["Anxiety", "Trauma & PTSD"], languages: ["English", "Urdu"],
      country: "United Kingdom", state: null, city: "London", photo: { g: "women", id: 44 },
      bio: "Blends TIIP formulation with trauma-focused CBT for first- and second-generation clients. Writes and teaches on anxiety, tawakkul, and the regulation of the heart.",
      about: "Dr. Karim works with first- and second-generation British Muslims on anxiety and trauma, combining trauma-focused CBT with TIIP formulation. She writes and teaches on tawakkul and the regulation of the heart.",
      years: 11, education: ["DClinPsy — University College London"],
      license: "HCPC-registered Clinical Psychologist", approach: "Trauma-focused CBT with TIIP case formulation and spiritual resources.",
      populations: ["Adults", "Young adults", "Second-generation clients"], formats: ["Telehealth (UK)", "In person (London)"], accepting: "Accepting new clients",
      offerings: [
        o("Anxiety, tawakkul, and the regulation of the heart", "Workshop", "Online · In person", "Half day", "Clinicians, counselors", "Integrating CBT tools with trust in God without bypassing real distress."),
        o("Trauma-informed care for community organizations", "Training", "Online", "2 hours", "Charities, youth workers", "Practical trauma-informed practice for community settings."),
        o("TIIP formulation clinic", "Seminar", "Online", "90 minutes", "Level 1–3 trainees", "A guided walk-through of case formulation with live feedback.")
      ]
    },
    {
      slug: "yusuf-rahman", name: "Yusuf Rahman", credentials: "LPC · Licensed Professional Counselor", level: "certified",
      specialties: ["Couples & Marriage", "Mood Disorders"], languages: ["English"],
      country: "United States", state: "Illinois", city: "Chicago", photo: { g: "men", id: 32 },
      bio: "Couples therapist helping partners rebuild trust and rahmah at home. Known in the community for his dhikr-based grounding protocol for acute anxiety.",
      about: "Yusuf works with couples in conflict and individuals with mood and anxiety concerns. His dhikr-based grounding protocol is widely used by TIIP clinicians for acute anxiety.",
      years: 9, education: ["MA, Clinical Mental Health Counseling — Loyola University Chicago"],
      license: "Licensed Professional Counselor (Illinois)", approach: "Emotion-focused couples work with TIIP’s emphasis on rahmah, accountability, and the heart.",
      populations: ["Couples", "Adults"], formats: ["In person (Chicago)", "Telehealth (IL)"], accepting: "Accepting new clients",
      offerings: [
        o("Rebuilding trust: a couples workshop", "Workshop", "In person", "Half day", "Couples, premarital groups", "Communication, repair, and rahmah practices for strained marriages."),
        o("Dhikr-based grounding for acute anxiety", "Training", "Online · In person", "2 hours", "Clinicians", "Teaching and adapting the grounding protocol safely in session."),
        o("Marriage readiness evenings", "Community talk", "In person", "90 minutes", "Masjid youth & young adults", "Expectations, conflict, and family dynamics before and after nikah.")
      ]
    },
    {
      slug: "maryam-siddiqui", name: "Maryam Siddiqui", credentials: "LMFT · Marriage & Family Therapist", level: "level3",
      specialties: ["Couples & Marriage", "Premarital Counseling"], languages: ["English", "Urdu"],
      country: "United States", state: "California", city: "Los Angeles", photo: { g: "women", id: 21 },
      bio: "Sees engaged and newly married couples through a TIIP lens — aligning expectations, families, and faith before conflict patterns set in.",
      about: "Maryam focuses on premarital and early-marriage work, helping couples align expectations, extended-family dynamics, and spiritual goals before patterns harden.",
      years: 6, education: ["MA, Marriage & Family Therapy — Pepperdine University"],
      license: "Licensed Marriage & Family Therapist (California)", approach: "Gottman-informed couples work with TIIP formulation; practicing under TIIP supervision toward certification.",
      populations: ["Engaged & newly married couples"], formats: ["Telehealth (CA)", "In person (Los Angeles)"], accepting: "Accepting new clients",
      offerings: [
        o("Premarital preparation series", "Workshop", "In person · Online", "3 evenings", "Engaged couples", "Expectations, finances, family, and faith before marriage."),
        o("In-law dynamics and boundaries", "Community talk", "Online", "60 minutes", "Families, community members", "Healthy boundaries within close-knit extended families.")
      ]
    },
    {
      slug: "zainab-qureshi", name: "Dr. Zainab Qureshi", credentials: "PsyD · Clinical Psychologist", level: "certified",
      specialties: ["Women's Mental Health", "Perinatal & Postpartum"], languages: ["English", "Urdu", "Hindi"],
      country: "United States", state: "California", city: "San Francisco", photo: { g: "women", id: 57 },
      bio: "Supports mothers through fertility struggles, birth trauma, and the postpartum year, weaving TIIP’s care of the rūḥ into perinatal evidence-based practice.",
      about: "Dr. Qureshi supports women through fertility struggles, pregnancy loss, birth trauma, and the postpartum year, integrating spiritual care into evidence-based perinatal treatment.",
      years: 10, education: ["PsyD, Clinical Psychology — Palo Alto University", "Postpartum Support International training"],
      license: "Licensed Psychologist (California)", approach: "Perinatal-focused CBT and IPT with TIIP’s care of the rūḥ and the heart.",
      populations: ["Women", "Mothers", "Couples facing infertility"], formats: ["Telehealth (CA)", "In person (San Francisco)"], accepting: "Waitlist",
      offerings: [
        o("The postpartum year: faith, identity, and mood", "Workshop", "Online · In person", "Half day", "Clinicians, doulas, midwives", "Perinatal mood disorders and culturally attuned support."),
        o("Supporting families through pregnancy loss", "Seminar", "Online", "90 minutes", "Chaplains, clinicians", "Grief, sabr, and practical support after loss."),
        o("Mothers’ circle facilitation", "Training", "In person", "Full day", "Community facilitators", "Running a safe peer-support circle for new mothers.")
      ]
    },
    {
      slug: "khadija-mohamed", name: "Khadija Mohamed", credentials: "LICSW · Clinical Social Worker", level: "level3",
      specialties: ["Refugee & Migration Trauma", "Community Mental Health"], languages: ["English", "Somali"],
      country: "United States", state: "Minnesota", city: "Minneapolis", photo: { g: "women", id: 90 },
      bio: "Serves East African refugee families in community settings, adapting TIIP for collective healing, resettlement stress, and intergenerational repair.",
      about: "Khadija provides community-based care to East African refugee families, adapting TIIP for collective healing and resettlement stress in Somali and English.",
      years: 8, education: ["MSW — University of Minnesota"],
      license: "Licensed Independent Clinical Social Worker (Minnesota)", approach: "Community-based, strengths-focused care with attention to collective healing and intergenerational repair.",
      populations: ["Refugee families", "Youth", "Elders"], formats: ["In person (Minneapolis)", "Community settings", "Telehealth"], accepting: "Accepting new clients",
      offerings: [
        o("Resettlement stress and collective healing", "Workshop", "In person", "Half day", "Social workers, schools", "Understanding migration trauma and culturally rooted recovery."),
        o("Working with Somali families: a primer", "Seminar", "Online · In person", "90 minutes", "Clinicians, case managers", "Language, trust, and community context for effective engagement.")
      ]
    },
    {
      slug: "layla-hassan", name: "Dr. Layla Hassan", credentials: "PhD · Licensed Psychologist", level: "certified",
      specialties: ["Adolescents & Teens", "Family Therapy"], languages: ["English", "Arabic"],
      country: "United States", state: "Michigan", city: "Dearborn", photo: { g: "women", id: 33 },
      bio: "Works with teens caught between cultures and the parents who love them — identity, school stress, and faith formation in adolescence.",
      about: "Dr. Hassan works with adolescents and their parents on identity, academic stress, and faith formation, helping families communicate across generational and cultural gaps.",
      years: 13, education: ["PhD, Clinical Psychology — Wayne State University"],
      license: "Licensed Psychologist (Michigan)", approach: "Family systems and adolescent-focused therapy with TIIP attention to fiṭrah and identity.",
      populations: ["Teens", "Parents", "Families"], formats: ["In person (Dearborn)", "Telehealth (MI)"], accepting: "Accepting new clients",
      offerings: [
        o("Parenting Muslim teens", "Workshop", "In person · Online", "Half day", "Parents, youth leaders", "Communication, limits, and faith formation during adolescence."),
        o("Youth mental health first response", "Training", "In person", "3 hours", "Youth workers, teachers", "Recognizing warning signs and responding with care."),
        o("School stress and the anxious student", "Seminar", "Online", "60 minutes", "Educators, parents", "Practical tools for exam stress and perfectionism.")
      ]
    },
    {
      slug: "tariq-aziz", name: "Dr. Tariq Aziz", credentials: "R.Psych · Registered Psychologist", level: "level3",
      specialties: ["Chronic Illness & Health", "Depression"], languages: ["English", "Punjabi"],
      country: "Canada", state: "British Columbia", city: "Vancouver", photo: { g: "men", id: 64 },
      bio: "Health psychologist helping patients carry chronic illness with sabr and agency — pain, diagnosis grief, and meaning-making in long-term care.",
      about: "Dr. Aziz supports people living with chronic illness and pain, working on diagnosis grief, adherence, and meaning-making with sabr and agency.",
      years: 9, education: ["PhD, Health Psychology — University of British Columbia"],
      license: "Registered Psychologist (British Columbia)", approach: "Acceptance-based health psychology with TIIP’s spiritual resources for illness and loss.",
      populations: ["Adults with chronic illness", "Caregivers"], formats: ["Telehealth (BC)", "In person (Vancouver)"], accepting: "Accepting new clients",
      offerings: [
        o("Living with illness: sabr, agency, and care", "Workshop", "Online · In person", "Half day", "Healthcare staff, chaplains", "Supporting patients through diagnosis, pain, and long-term care."),
        o("Caregiver burnout and the heart", "Community talk", "Online", "60 minutes", "Family caregivers", "Sustaining compassion without depletion.")
      ]
    },
    {
      slug: "amina-yusuf", name: "Amina Yusuf", credentials: "MPsych (Clinical) · Psychologist", level: "certified",
      specialties: ["Trauma & PTSD", "EMDR-Informed Therapy"], languages: ["English", "Somali"],
      country: "Australia", state: "New South Wales", city: "Sydney", photo: { g: "women", id: 26 },
      bio: "Trauma specialist combining EMDR with TIIP’s staged model of change. Works extensively with refugee-background women and first responders.",
      about: "Amina combines EMDR with TIIP’s staged model of change, working extensively with refugee-background women and first responders in Sydney.",
      years: 10, education: ["MPsych (Clinical) — University of New South Wales", "EMDR Association-accredited training"],
      license: "Registered Psychologist (AHPRA)", approach: "Staged trauma treatment: stabilization, EMDR-informed processing, and spiritual integration.",
      populations: ["Women", "Refugees", "First responders"], formats: ["In person (Sydney)", "Telehealth (Australia)"], accepting: "Waitlist",
      offerings: [
        o("EMDR and spiritual integration", "Workshop", "In person · Online", "Full day", "Licensed clinicians", "Integrating EMDR with faith-based meaning-making in trauma recovery."),
        o("Supporting first responders", "Seminar", "In person", "2 hours", "Emergency services teams", "Trauma exposure, resilience, and culturally attuned peer support."),
        o("Trauma-informed practice with refugee women", "Training", "Online", "3 hours", "Social workers, community groups", "Safety, trust, and cultural humility in trauma work.")
      ]
    },
    {
      slug: "ahmad-chaudhry", name: "Ahmad Chaudhry", credentials: "LPC-Associate (supervised)", level: "level3",
      specialties: ["Young Adults & Identity", "Depression"], languages: ["English", "Punjabi"],
      country: "United States", state: "Texas", city: "Houston", photo: { g: "men", id: 11 },
      bio: "Early-career counselor walking with college students and young professionals through quarter-life questions of purpose, deen, and direction.",
      about: "Ahmad supports college students and young professionals through questions of purpose, identity, and direction. He practices under supervision toward full licensure and TIIP certification.",
      years: 3, education: ["MA, Counseling — University of Houston"],
      license: "LPC-Associate (Texas), under supervision", approach: "Person-centered and CBT-informed counseling with TIIP formulation, under supervision.",
      populations: ["College students", "Young professionals"], formats: ["Telehealth (TX)", "In person (Houston)"], accepting: "Accepting new clients",
      offerings: [
        o("Quarter-life: purpose, deen, and direction", "Workshop", "In person · Online", "2 hours", "MSAs, young adult groups", "Identity, career pressure, and meaning for young Muslims."),
        o("Mental health basics for student leaders", "Training", "In person", "90 minutes", "MSA officers", "Spotting distress, listening well, and referring safely.")
      ]
    }
  ];

  /* Member-published profiles. Level 2+ members request a public profile in the
     portal; once an admin approves it, a snapshot of exactly the sections the
     member chose to show is stored with the listing and appears here. (Demo:
     the portal and this site share the browser's localStorage; in production
     this would be an API.) */
  T.LS_KEY = "tiip-portal-demo-v2";
  function memberProfiles() {
    try {
      var st = JSON.parse(localStorage.getItem(T.LS_KEY) || "null");
      if (!st || !st.listings) return [];
      return Object.keys(st.listings).map(function (k) {
        var l = st.listings[k];
        return l && l.published && (l.publishedLive || l.publicStatus === "approved") ? l.published : null;
      }).filter(Boolean);
    } catch (e) { return []; }
  }
  T.PROVIDERS = T.PROVIDERS.concat(memberProfiles());

  /* ---- shared helpers ---- */
  T.bySlug = function (slug) {
    for (var i = 0; i < T.PROVIDERS.length; i++) if (T.PROVIDERS[i].slug === slug) return T.PROVIDERS[i];
    return null;
  };
  T.profileUrl = function (p) { return "provider.html?p=" + encodeURIComponent(p.slug); };
  T.gender = function (p) { return p.gender || (p.photo ? (p.photo.g === "women" ? "Female" : "Male") : ""); };
  T.PROVIDERS.forEach(function (p) { p.gender = T.gender(p); });

  function initials(name) {
    return name.replace(/^Dr\.\s+/, "").split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join("").toUpperCase();
  }
  var AV_PALETTES = [["#1e3468", "#3a589c"], ["#1c5a55", "#2e847e"], ["#5b2a4e", "#8a4a78"], ["#16264e", "#6a83b8"]];
  T.avatarDataUri = function (name, i) {
    var p = AV_PALETTES[i % AV_PALETTES.length];
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='" + p[0] + "'/><stop offset='1' stop-color='" + p[1] + "'/>" +
      "</linearGradient></defs>" +
      "<rect width='120' height='120' fill='url(#g)'/>" +
      "<circle cx='60' cy='60' r='44' fill='none' stroke='rgba(255,255,255,.25)' stroke-dasharray='3 6'/>" +
      "<text x='60' y='60' dy='.36em' text-anchor='middle' font-family='Georgia,serif' font-size='40' fill='#fff'>" + initials(name) + "</text></svg>";
    return "data:image/svg+xml," + encodeURIComponent(svg);
  };
  /* Sets a provider's portrait on <img>, falling back to an initials avatar. */
  T.setPhoto = function (img, p) {
    var i = Math.max(0, T.PROVIDERS.indexOf(p));
    if (!p.photo) { img.src = T.avatarDataUri(p.name, i); return; }
    img.src = "https://randomuser.me/api/portraits/" + p.photo.g + "/" + p.photo.id + ".jpg";
    img.addEventListener("error", function () { img.src = T.avatarDataUri(p.name, i); }, { once: true });
  };
})();
