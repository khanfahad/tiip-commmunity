/* TIIP Community — public provider directory (demo data) */
(function () {
  "use strict";

  var grid = document.getElementById("dir-grid");
  if (!grid) return;

  /* Provider data is shared with the profile page — see providers.js.
     The PUBLIC directory lists only fully certified clinicians, TIIP
     supervisors, and Level 3 trainees; Levels 1–2 are members-only. */
  var TIIP = window.TIIP;
  var PROVIDERS = TIIP.PROVIDERS;
  var LEVELS = TIIP.LEVELS;
  var PUBLIC_LEVELS = { supervisor: 1, certified: 1, level3: 1, level2: 1 }; /* level2 only once an admin approves a member's public profile */

  /* ------------------------------------------------------------------
     World-map reference (equirectangular, 1000×500). A dotted landmass
     with a pulsing marker per city that has listed providers; markers
     react to the active filters. Coordinates are approximate — the map
     is a decorative reference, not a precise cartographic figure.
  ------------------------------------------------------------------ */
  var CITY_COORDS = {
    "New York City": [40.71, -74.01], "Toronto": [43.65, -79.38], "Dallas": [32.78, -96.80],
    "London": [51.51, -0.13], "Dubai": [25.20, 55.27], "Karachi": [24.86, 67.01],
    "Chicago": [41.88, -87.63], "Los Angeles": [34.05, -118.24], "San Francisco": [37.77, -122.42],
    "Minneapolis": [44.98, -93.27], "Dearborn": [42.32, -83.18], "Vancouver": [49.28, -123.12],
    "Sydney": [-33.87, 151.21], "Houston": [29.76, -95.37], "Birmingham": [52.49, -1.89],
    "Durban": [-29.86, 31.02], "Montreal": [45.50, -73.57], "Kuala Lumpur": [3.14, 101.69],
    "Melbourne": [-37.81, 144.96], "Lahore": [31.52, 74.36], "Istanbul": [41.01, 28.98], "Cairo": [30.04, 31.24]
  };
  var CONTINENTS = {
    NAmerica: [[-168,66],[-160,71],[-140,70],[-125,71],[-100,73],[-82,73],[-62,66],[-64,60],[-78,63],[-95,68],[-90,58],[-79,54],[-64,52],[-56,51],[-60,47],[-67,44],[-70,42],[-74,40],[-76,35],[-81,31],[-80,25],[-90,29],[-97,28],[-97,22],[-106,23],[-105,20],[-96,16],[-88,15],[-84,10],[-83,8],[-91,14],[-96,16],[-105,20],[-110,23],[-117,32],[-124,40],[-124,48],[-133,54],[-141,60],[-150,59],[-165,60],[-168,66]],
    Greenland: [[-45,60],[-22,70],[-20,76],[-30,83],[-50,83],[-58,76],[-53,68],[-45,60]],
    SAmerica: [[-81,8],[-72,11],[-62,10],[-50,1],[-35,-6],[-38,-13],[-48,-25],[-53,-34],[-58,-39],[-65,-46],[-71,-53],[-75,-50],[-73,-42],[-71,-30],[-71,-18],[-77,-6],[-81,2],[-81,8]],
    Africa: [[-17,15],[-16,22],[-9,31],[0,36],[11,37],[24,32],[33,31],[43,12],[51,12],[45,-2],[40,-16],[33,-27],[20,-35],[18,-34],[13,-17],[9,0],[-4,5],[-8,4],[-13,8],[-17,15]],
    Europe: [[-10,36],[-9,43],[-2,48],[2,51],[-2,58],[6,58],[6,62],[14,65],[24,71],[30,70],[42,66],[40,55],[30,45],[28,41],[19,40],[13,45],[3,43],[-6,37],[-10,36]],
    Asia: [[30,45],[42,48],[48,42],[48,30],[60,25],[66,25],[78,8],[80,13],[89,22],[95,16],[98,8],[104,1],[104,10],[109,11],[108,21],[122,30],[121,38],[130,43],[135,35],[140,36],[143,46],[137,55],[155,60],[162,60],[170,66],[180,68],[178,70],[160,72],[140,73],[110,77],[75,76],[55,68],[42,66],[43,55],[40,50],[30,45]],
    India: [[68,24],[73,20],[77,8],[80,13],[89,22],[89,26],[78,30],[70,25],[68,24]],
    SEAsia: [[95,6],[100,1],[104,1],[112,-4],[118,-9],[132,-8],[141,-9],[130,-3],[120,0],[110,6],[100,7],[95,6]],
    Australia: [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[147,-20],[153,-28],[150,-38],[141,-38],[130,-32],[120,-34],[114,-35],[113,-28],[114,-22]],
    Japan: [[130,31],[136,35],[141,40],[143,44],[140,38],[135,34],[131,31],[130,31]],
    UK: [[-6,50],[-3,53],[-5,58],[-2,58],[0,53],[1,51],[-6,50]],
    NZ: [[166,-46],[171,-41],[175,-37],[178,-38],[174,-42],[170,-46],[166,-46]]
  };
  function px(lng) { return (lng + 180) / 360 * 1000; }
  function py(lat) { return (90 - lat) / 180 * 500; }
  function pip(x, y, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function isLand(lng, lat) { for (var k in CONTINENTS) if (pip(lng, lat, CONTINENTS[k])) return true; return false; }

  var mapSvg = document.getElementById("dir-map-svg");
  function buildLandDots() {
    if (!mapSvg) return;
    var s = "", step = 11;
    for (var y = step / 2; y < 500; y += step) {
      for (var x = step / 2; x < 1000; x += step) {
        var lng = x / 1000 * 360 - 180, lat = 90 - y / 500 * 180;
        if (isLand(lng, lat)) s += '<circle class="land-dot" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2"/>';
      }
    }
    document.getElementById("map-land").innerHTML = s;
  }
  function renderMarkers(results) {
    if (!mapSvg) return;
    var byCity = {};
    results.forEach(function (p) {
      if (!CITY_COORDS[p.city]) return;
      byCity[p.city] = byCity[p.city] || { c: CITY_COORDS[p.city], n: 0 };
      byCity[p.city].n++;
    });
    var s = "", cities = 0, total = 0;
    Object.keys(byCity).forEach(function (city) {
      var m = byCity[city], x = px(m.c[1]), y = py(m.c[0]), r = 4 + Math.min(m.n, 5) * 1.5;
      cities++; total += m.n;
      s += '<circle class="mk-ring" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '"/>' +
        '<circle class="mk ' + (m.n > 1 ? "mk-lg" : "mk-sm") + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '"><title>' + city + " — " + m.n + " provider" + (m.n === 1 ? "" : "s") + "</title></circle>";
    });
    document.getElementById("map-markers").innerHTML = s;
    var cap = document.getElementById("map-caption");
    if (cap) cap.textContent = total ? total + " providers across " + cities + " " + (cities === 1 ? "city" : "cities") : "No providers match the current filters.";
  }

  /* ---- elements ---- */
  var selCountry = document.getElementById("dir-country");
  var selState = document.getElementById("dir-state");
  var selCity = document.getElementById("dir-city");
  var selSpec = document.getElementById("dir-specialty");
  var selLevel = document.getElementById("dir-level");
  var selGender = document.getElementById("dir-gender");
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
    if (selGender && selGender.value && p.gender !== selGender.value) return false;
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
    renderMarkers(results);
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

      var url = TIIP.profileUrl(p);
      var img = document.createElement("img");
      img.alt = "Portrait of " + p.name;
      img.loading = "lazy";
      img.width = 120; img.height = 120;
      TIIP.setPhoto(img, p);

      var photoWrap = document.createElement("a");
      photoWrap.className = "pc-photo";
      photoWrap.href = url;
      photoWrap.setAttribute("aria-label", "View " + p.name + "'s full profile");
      photoWrap.appendChild(img);
      card.appendChild(photoWrap);

      var body = document.createElement("div");
      body.className = "pc-body";
      card.appendChild(body);

      var nameEl = document.createElement("h3");
      var nameLink = document.createElement("a");
      nameLink.href = url;
      nameLink.textContent = p.name;
      nameEl.appendChild(nameLink);
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
        "<a href='" + url + "'>View full profile →</a>";
      body.appendChild(foot);

      /* the whole card opens the profile (specialty chips + links keep their own action) */
      card.classList.add("is-link");
      card.addEventListener("click", function (e) {
        if (e.target.closest("a, button")) return;
        window.location.href = url;
      });

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
  selLevel.innerHTML = '<option value="">All levels</option>' +
    Object.keys(LEVELS).filter(function (k) { return PUBLIC_LEVELS[k]; }).map(function (k) {
      return '<option value="' + k + '">' + LEVELS[k].label + "</option>";
    }).join("");
  if (selGender) fillSelect(selGender, ["Male", "Female"], "All genders");
  refreshStateOptions();
  refreshCityOptions();
  buildLandDots();

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
  if (selGender) selGender.addEventListener("change", render);
  inputQ.addEventListener("input", render);
  clearBtn.addEventListener("click", function () {
    selCountry.value = ""; selSpec.value = ""; selLevel.value = ""; inputQ.value = "";
    if (selGender) selGender.value = "";
    refreshStateOptions();
    refreshCityOptions();
    render();
  });

  render();
})();
