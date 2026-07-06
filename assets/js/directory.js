/* TIIP Community — public provider directory (demo data) */
(function () {
  "use strict";

  var grid = document.getElementById("dir-grid");
  if (!grid) return;

  /* ------------------------------------------------------------------
     Demo provider data.
     level: supervisor | certified | level3 | level2 | level1
     (Level 0 trainees are registered members only — they are not
     eligible for the public directory.)
     state is null for countries where a state/province tier
     does not apply (e.g. UK city-level search).
     photo: {gender, id} indexes a demo portrait; if the image can't
     load, an initials avatar is generated instead.
  ------------------------------------------------------------------ */
  var PROVIDERS = [
    {
      name: "Dr. Omar El-Sayed", credentials: "PhD · Licensed Psychologist", level: "supervisor",
      specialties: ["OCD & Waswasah", "Anxiety"], languages: ["English", "Arabic"],
      country: "United States", state: "New York", city: "New York City",
      photo: { g: "men", id: 75 },
      bio: "Directs a specialty clinic for scrupulosity and religious OCD, pairing exposure-based care with TIIP’s model of the nafs. Supervises certification cohorts and consults internationally."
    },
    {
      name: "Dr. Hana Saleh", credentials: "C.Psych · Clinical Psychologist", level: "supervisor",
      specialties: ["Trauma & PTSD", "Clinical Supervision"], languages: ["English", "Arabic"],
      country: "Canada", state: "Ontario", city: "Toronto",
      photo: { g: "women", id: 68 },
      bio: "Senior TIIP supervisor with two decades of trauma work. Leads the monthly group consultation on trauma and the heart, and mentors clinicians entering the model."
    },
    {
      name: "Dr. Bilal Hutchinson", credentials: "PsyD · Clinical Psychologist", level: "certified",
      specialties: ["Addiction & Recovery", "Men's Mental Health"], languages: ["English"],
      country: "United States", state: "Texas", city: "Dallas",
      photo: { g: "men", id: 52 },
      bio: "Built a TIIP-informed recovery program integrating twelve-step work with tazkiyah practices. Special interest in fathers, providers, and men returning to faith."
    },
    {
      name: "Dr. Musa Adebayo", credentials: "MRCPsych · Consultant Psychiatrist", level: "supervisor",
      specialties: ["Severe Mental Illness", "Psychiatric Consultation"], languages: ["English", "Yoruba"],
      country: "United Kingdom", state: null, city: "London",
      photo: { g: "men", id: 22 },
      bio: "Consultant psychiatrist bridging medication management and spiritually integrated care. Advises TIIP clinicians on complex presentations and psychiatric referral."
    },
    {
      name: "Dr. Rania Khalil", credentials: "PhD · Counseling Psychology", level: "certified",
      specialties: ["Cross-Cultural Adjustment", "Family Therapy"], languages: ["Arabic", "English"],
      country: "United Arab Emirates", state: null, city: "Dubai",
      photo: { g: "women", id: 65 },
      bio: "Works with expatriate and multicultural families navigating identity, belonging, and transition. Anchors the Gulf regional supervision circle."
    },
    {
      name: "Dr. Saad Farooqi", credentials: "FCPS · Psychiatrist", level: "supervisor",
      specialties: ["Mood Disorders", "Clinical Supervision"], languages: ["Urdu", "English"],
      country: "Pakistan", state: "Sindh", city: "Karachi",
      photo: { g: "men", id: 29 },
      bio: "Trains residents and community clinicians in Islamically integrated psychiatry. Leads South Asia’s TIIP study group and supervises early-career therapists."
    },
    {
      name: "Dr. Aisha Karim", credentials: "DClinPsy · Clinical Psychologist", level: "certified",
      specialties: ["Anxiety", "Trauma & PTSD"], languages: ["English", "Urdu"],
      country: "United Kingdom", state: null, city: "London",
      photo: { g: "women", id: 44 },
      bio: "Blends TIIP formulation with trauma-focused CBT for first- and second-generation clients. Writes and teaches on anxiety, tawakkul, and the regulation of the heart."
    },
    {
      name: "Yusuf Rahman", credentials: "LPC · Licensed Professional Counselor", level: "certified",
      specialties: ["Couples & Marriage", "Mood Disorders"], languages: ["English"],
      country: "United States", state: "Illinois", city: "Chicago",
      photo: { g: "men", id: 32 },
      bio: "Couples therapist helping partners rebuild trust and rahmah at home. Known in the community for his dhikr-based grounding protocol for acute anxiety."
    },
    {
      name: "Maryam Siddiqui", credentials: "LMFT · Marriage & Family Therapist", level: "level3",
      specialties: ["Couples & Marriage", "Premarital Counseling"], languages: ["English", "Urdu"],
      country: "United States", state: "California", city: "Los Angeles",
      photo: { g: "women", id: 21 },
      bio: "Sees engaged and newly married couples through a TIIP lens — aligning expectations, families, and faith before conflict patterns set in."
    },
    {
      name: "Dr. Zainab Qureshi", credentials: "PsyD · Clinical Psychologist", level: "certified",
      specialties: ["Women's Mental Health", "Perinatal & Postpartum"], languages: ["English", "Urdu", "Hindi"],
      country: "United States", state: "California", city: "San Francisco",
      photo: { g: "women", id: 57 },
      bio: "Supports mothers through fertility struggles, birth trauma, and the postpartum year, weaving TIIP’s care of the rūḥ into perinatal evidence-based practice."
    },
    {
      name: "Khadija Mohamed", credentials: "LICSW · Clinical Social Worker", level: "level3",
      specialties: ["Refugee & Migration Trauma", "Community Mental Health"], languages: ["English", "Somali"],
      country: "United States", state: "Minnesota", city: "Minneapolis",
      photo: { g: "women", id: 90 },
      bio: "Serves East African refugee families in community settings, adapting TIIP for collective healing, resettlement stress, and intergenerational repair."
    },
    {
      name: "Dr. Layla Hassan", credentials: "PhD · Licensed Psychologist", level: "certified",
      specialties: ["Adolescents & Teens", "Family Therapy"], languages: ["English", "Arabic"],
      country: "United States", state: "Michigan", city: "Dearborn",
      photo: { g: "women", id: 33 },
      bio: "Works with teens caught between cultures and the parents who love them — identity, school stress, and faith formation in adolescence."
    },
    {
      name: "Dr. Tariq Aziz", credentials: "R.Psych · Registered Psychologist", level: "level3",
      specialties: ["Chronic Illness & Health", "Depression"], languages: ["English", "Punjabi"],
      country: "Canada", state: "British Columbia", city: "Vancouver",
      photo: { g: "men", id: 64 },
      bio: "Health psychologist helping patients carry chronic illness with sabr and agency — pain, diagnosis grief, and meaning-making in long-term care."
    },
    {
      name: "Sofia Begum", credentials: "BABCP Accredited CBT Therapist", level: "level2",
      specialties: ["Depression", "Self-Worth & Shame"], languages: ["English", "Bengali"],
      country: "United Kingdom", state: null, city: "Birmingham",
      photo: { g: "women", id: 75 },
      bio: "Integrates behavioural activation with TIIP’s account of the fiṭrah to help clients recover worth, hope, and daily structure after long depressive episodes."
    },
    {
      name: "Amina Yusuf", credentials: "MPsych (Clinical) · Psychologist", level: "certified",
      specialties: ["Trauma & PTSD", "EMDR-Informed Therapy"], languages: ["English", "Somali"],
      country: "Australia", state: "New South Wales", city: "Sydney",
      photo: { g: "women", id: 26 },
      bio: "Trauma specialist combining EMDR with TIIP’s staged model of change. Works extensively with refugee-background women and first responders."
    },
    {
      name: "Fatima Patel", credentials: "MA Clin Psych · Clinical Psychologist", level: "level2",
      specialties: ["Eating Disorders", "Women's Mental Health"], languages: ["English"],
      country: "South Africa", state: "KwaZulu-Natal", city: "Durban",
      photo: { g: "women", id: 82 },
      bio: "Runs a body-image and eating disorder practice grounded in the TIIP understanding of the nafs — appetite, restraint, and compassion toward the self."
    },
    {
      name: "Ahmad Chaudhry", credentials: "LPC-Associate (supervised)", level: "level3",
      specialties: ["Young Adults & Identity", "Depression"], languages: ["English", "Punjabi"],
      country: "United States", state: "Texas", city: "Houston",
      photo: { g: "men", id: 11 },
      bio: "Early-career counselor walking with college students and young professionals through quarter-life questions of purpose, deen, and direction."
    },
    {
      name: "Ibrahim Diallo", credentials: "MHC-LP · Mental Health Counselor", level: "level2",
      specialties: ["Grief & Loss", "Spiritual Struggles"], languages: ["English", "French"],
      country: "United States", state: "New York", city: "New York City",
      photo: { g: "men", id: 85 },
      bio: "Sits with clients in bereavement and crises of faith, drawing on TIIP’s language of the qalb to hold doubt and loss without rushing either."
    },
    {
      name: "Nadia Bouchard", credentials: "RP (Qualifying) · Psychotherapist", level: "level1",
      specialties: ["Converts & Identity", "Anxiety"], languages: ["English", "French"],
      country: "Canada", state: "Quebec", city: "Montreal",
      photo: { g: "women", id: 12 },
      bio: "A convert herself, Nadia supports new Muslims navigating family reaction, community belonging, and the anxieties of a changing identity."
    },
    {
      name: "Hafiz Roslan", credentials: "Registered Counsellor (LKM)", level: "level1",
      specialties: ["Addiction & Recovery", "Youth & Adolescents"], languages: ["Malay", "English"],
      country: "Malaysia", state: null, city: "Kuala Lumpur",
      photo: { g: "men", id: 40 },
      bio: "Community counselor working with young people in early recovery, pairing relapse-prevention skills with mentorship and masjid-based support."
    },
    {
      name: "Zayd Ibrahim", credentials: "Provisional Psychologist", level: "level1",
      specialties: ["Anxiety", "Students & Academic Stress"], languages: ["English", "Arabic"],
      country: "Australia", state: "Victoria", city: "Melbourne",
      photo: { g: "men", id: 17 },
      bio: "Works in university counselling services with international and local Muslim students — exam anxiety, homesickness, and perfectionism."
    }
  ];

  var LEVELS = {
    supervisor: { label: "TIIP Supervisor", cls: "lv-supervisor" },
    certified:  { label: "Fully Certified", cls: "lv-certified" },
    level3:     { label: "Level 3 Trainee", cls: "lv-3" },
    level2:     { label: "Level 2 Trainee", cls: "lv-2" },
    level1:     { label: "Level 1 Trainee", cls: "lv-1" }
  };

  /* ---- elements ---- */
  var selCountry = document.getElementById("dir-country");
  var selState = document.getElementById("dir-state");
  var selCity = document.getElementById("dir-city");
  var selSpec = document.getElementById("dir-specialty");
  var selLevel = document.getElementById("dir-level");
  var inputQ = document.getElementById("dir-q");
  var countEl = document.getElementById("dir-count");
  var emptyEl = document.getElementById("dir-empty");
  var clearBtn = document.getElementById("dir-clear");

  /* ---- helpers ---- */
  function uniqueSorted(arr) {
    return arr.filter(function (v, i, a) { return v && a.indexOf(v) === i; }).sort();
  }
  function fillSelect(sel, options, placeholder) {
    sel.innerHTML = "";
    var first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    sel.appendChild(first);
    options.forEach(function (o) {
      var op = document.createElement("option");
      op.value = o; op.textContent = o;
      sel.appendChild(op);
    });
  }
  function initials(name) {
    return name.replace(/^Dr\.\s+/, "").split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join("").toUpperCase();
  }
  var AV_PALETTES = [["#16605a", "#2aa39a"], ["#9c6f1e", "#d8a541"], ["#5b2a4e", "#8a4a78"], ["#114440", "#4ec2b8"]];
  function avatarDataUri(name, i) {
    var p = AV_PALETTES[i % AV_PALETTES.length];
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='" + p[0] + "'/><stop offset='1' stop-color='" + p[1] + "'/>" +
      "</linearGradient></defs>" +
      "<rect width='120' height='120' fill='url(#g)'/>" +
      "<circle cx='60' cy='60' r='44' fill='none' stroke='rgba(255,255,255,.25)' stroke-dasharray='3 6'/>" +
      "<text x='60' y='60' dy='.36em' text-anchor='middle' font-family='Georgia,serif' font-size='40' fill='#fff'>" + initials(name) + "</text></svg>";
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  /* ---- state of the cascade ---- */
  function countryHasStates(country) {
    return PROVIDERS.some(function (p) { return p.country === country && p.state; });
  }
  function refreshStateOptions() {
    var c = selCountry.value;
    if (c && countryHasStates(c)) {
      var states = uniqueSorted(PROVIDERS.filter(function (p) { return p.country === c; }).map(function (p) { return p.state; }));
      fillSelect(selState, states, "All states / provinces");
      selState.disabled = false;
    } else {
      fillSelect(selState, [], c ? "Not applicable" : "Choose a country first");
      selState.disabled = true;
    }
  }
  function refreshCityOptions() {
    var c = selCountry.value, s = selState.value;
    if (!c) {
      fillSelect(selCity, [], "Choose a country first");
      selCity.disabled = true;
      return;
    }
    var cities = uniqueSorted(PROVIDERS.filter(function (p) {
      return p.country === c && (!s || p.state === s);
    }).map(function (p) { return p.city; }));
    fillSelect(selCity, cities, "All cities");
    selCity.disabled = false;
  }

  /* ---- filtering + render ---- */
  function matches(p) {
    if (selCountry.value && p.country !== selCountry.value) return false;
    if (!selState.disabled && selState.value && p.state !== selState.value) return false;
    if (!selCity.disabled && selCity.value && p.city !== selCity.value) return false;
    if (selSpec.value && p.specialties.indexOf(selSpec.value) === -1) return false;
    if (selLevel.value && p.level !== selLevel.value) return false;
    var q = (inputQ.value || "").trim().toLowerCase();
    if (q) {
      var hay = [p.name, p.credentials, p.bio, p.city, p.state || "", p.country, LEVELS[p.level].label,
        p.specialties.join(" "), p.languages.join(" ")].join(" ").toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function locationLine(p) {
    return [p.city, p.state, p.country].filter(Boolean).join(", ");
  }

  function render() {
    var results = PROVIDERS.filter(matches);
    grid.innerHTML = "";
    results.forEach(function (p) {
      var i = PROVIDERS.indexOf(p);
      var lv = LEVELS[p.level];
      var card = document.createElement("article");
      card.className = "provider-card";

      var banner = document.createElement("div");
      banner.className = "pc-banner";
      var level = document.createElement("span");
      level.className = "pc-level " + lv.cls;
      level.textContent = lv.label;
      banner.appendChild(level);
      card.appendChild(banner);

      var img = document.createElement("img");
      img.alt = "Portrait of " + p.name;
      img.loading = "lazy";
      img.width = 120; img.height = 120;
      img.src = "https://randomuser.me/api/portraits/" + p.photo.g + "/" + p.photo.id + ".jpg";
      img.addEventListener("error", function () {
        img.src = avatarDataUri(p.name, i);
      }, { once: true });

      var photoWrap = document.createElement("div");
      photoWrap.className = "pc-photo";
      photoWrap.appendChild(img);
      card.appendChild(photoWrap);

      var body = document.createElement("div");
      body.className = "pc-body";
      card.appendChild(body);

      var nameEl = document.createElement("h3");
      nameEl.textContent = p.name;
      body.appendChild(nameEl);

      var cred = document.createElement("div");
      cred.className = "pc-cred";
      cred.textContent = p.credentials;
      body.appendChild(cred);

      var loc = document.createElement("div");
      loc.className = "pc-loc";
      loc.innerHTML = "<span aria-hidden='true'>📍</span> " + locationLine(p);
      body.appendChild(loc);

      var specs = document.createElement("div");
      specs.className = "pc-specs";
      p.specialties.forEach(function (s) {
        var t = document.createElement("button");
        t.type = "button";
        t.className = "pc-spec";
        t.textContent = s;
        t.title = "Filter by " + s;
        t.addEventListener("click", function () {
          selSpec.value = s;
          render();
          document.getElementById("directory").scrollIntoView({ behavior: "smooth" });
        });
        specs.appendChild(t);
      });
      body.appendChild(specs);

      var bio = document.createElement("p");
      bio.className = "pc-bio";
      bio.textContent = p.bio;
      body.appendChild(bio);

      var foot = document.createElement("div");
      foot.className = "pc-foot";
      foot.innerHTML =
        "<span class='pc-lang'><span aria-hidden='true'>🗣</span> " + p.languages.join(", ") + "</span>" +
        "<a href='mailto:referrals@tiip.community?subject=" + encodeURIComponent("Referral inquiry — " + p.name) + "'>Request referral →</a>";
      body.appendChild(foot);

      grid.appendChild(card);
    });

    countEl.textContent = results.length === 1
      ? "1 provider found"
      : results.length + " providers found";
    emptyEl.classList.toggle("hidden", results.length > 0);
  }

  /* ---- init ---- */
  fillSelect(selCountry, uniqueSorted(PROVIDERS.map(function (p) { return p.country; })), "All countries");
  var allSpecs = [];
  PROVIDERS.forEach(function (p) { allSpecs = allSpecs.concat(p.specialties); });
  fillSelect(selSpec, uniqueSorted(allSpecs), "All specialties");
  selLevel.innerHTML = '<option value="">All levels (1+)</option>' +
    Object.keys(LEVELS).map(function (k) {
      return '<option value="' + k + '">' + LEVELS[k].label + "</option>";
    }).join("");
  refreshStateOptions();
  refreshCityOptions();

  selCountry.addEventListener("change", function () {
    refreshStateOptions();
    refreshCityOptions();
    render();
  });
  selState.addEventListener("change", function () {
    refreshCityOptions();
    render();
  });
  selCity.addEventListener("change", render);
  selSpec.addEventListener("change", render);
  selLevel.addEventListener("change", render);
  inputQ.addEventListener("input", render);
  clearBtn.addEventListener("click", function () {
    selCountry.value = ""; selSpec.value = ""; selLevel.value = ""; inputQ.value = "";
    refreshStateOptions();
    refreshCityOptions();
    render();
  });

  render();
})();
