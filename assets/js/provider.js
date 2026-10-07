/* TIIP Community — individual provider profile page (demo data)
   Reads ?p=<slug>, renders the full profile from the shared provider data
   (providers.js), and wires the request form. */
(function () {
  "use strict";

  var root = document.getElementById("pf-root");
  if (!root || !window.TIIP) return;
  var TIIP = window.TIIP;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function list(items) { return items.map(esc).join(", "); }

  var slug = new URLSearchParams(location.search).get("p");
  var p = TIIP.bySlug(slug);

  if (!p) {
    document.title = "Provider not found — TIIP Community";
    root.innerHTML =
      '<section class="bg-white"><div class="container text-center" style="max-width:640px;">' +
      '<h1 style="font-size:2rem;">We couldn’t find that provider</h1>' +
      '<p class="lead muted">The profile may have moved, or the link may be incomplete.</p>' +
      '<a class="btn btn-primary" href="index.html#directory">← Back to the directory</a></div></section>';
    return;
  }

  var lv = TIIP.LEVELS[p.level];
  var location_ = [p.city, p.state, p.country].filter(Boolean).join(", ");
  document.title = p.name + " — TIIP Provider Profile";

  /* ---- build the page ---- */
  var offerCards = p.offerings.map(function (o, i) {
    return '<article class="pf-offer">' +
      '<div class="pf-offer-top"><span class="tag teal">' + esc(o.type) + "</span>" +
      '<span class="pf-offer-meta">⏱ ' + esc(o.duration) + "</span></div>" +
      "<h3>" + esc(o.title) + "</h3>" +
      "<p>" + esc(o.desc) + "</p>" +
      '<div class="pf-offer-foot"><span>📍 ' + esc(o.format) + "<br>👥 " + esc(o.audience) + "</span>" +
      '<button type="button" class="btn btn-outline btn-sm" data-request-offer="' + i + '">Request this</button></div>' +
      "</article>";
  }).join("");

  var offerOptions = p.offerings.map(function (o, i) {
    return '<option value="' + i + '">' + esc(o.title) + " (" + esc(o.type) + ")</option>";
  }).join("");

  var formatOptions = p.formats.map(function (f) { return "<option>" + esc(f) + "</option>"; }).join("");
  var langOptions = p.languages.map(function (l) { return "<option>" + esc(l) + "</option>"; }).join("");

  root.innerHTML =
    /* hero */
    '<section class="page-head pf-hero">' +
    '<span class="girih deco" aria-hidden="true"></span>' +
    '<div class="container">' +
    '<div class="breadcrumb"><a href="index.html">Home</a> / <a href="index.html#directory">Find a Provider</a> / ' + esc(p.name) + "</div>" +
    '<div class="pf-head">' +
    '<div class="pf-photo"><img id="pf-img" alt="Portrait of ' + esc(p.name) + '" width="140" height="140" /></div>' +
    "<div>" +
    '<span class="pf-badge ' + lv.cls + '">' + esc(lv.label) + "</span>" +
    "<h1>" + esc(p.name) + "</h1>" +
    '<p class="pf-cred">' + esc(p.credentials) + "</p>" +
    '<p class="pf-loc">📍 ' + esc(location_) + ' · <span class="pf-status">' + esc(p.accepting) + "</span></p>" +
    '<div class="pf-cta">' +
    '<a class="btn btn-gold" href="#request" data-mode-link="provider">Request as my provider</a>' +
    '<a class="btn btn-ghost" href="#request" data-mode-link="event">Request for an event</a>' +
    "</div></div></div></div>" +
    '<div class="page-head-wave"><svg viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,32 C240,60 480,4 720,24 C960,44 1200,60 1440,28 L1440,56 L0,56 Z" fill="#ffffff"></path></svg></div>' +
    "</section>" +

    /* body */
    '<section class="bg-white"><div class="container"><div class="pf-layout">' +
    '<div class="pf-main">' +

    '<div class="pf-section"><h2>About</h2><p>' + esc(p.bio) + "</p><p>" + esc(p.about) + "</p></div>" +

    '<div class="pf-section"><h2>Specialties &amp; approach</h2>' +
    '<div class="pc-specs" style="justify-content:flex-start;">' +
    p.specialties.map(function (s) { return '<span class="pc-spec" style="cursor:default;">' + esc(s) + "</span>"; }).join("") + "</div>" +
    '<p><strong>Approach.</strong> ' + esc(p.approach) + "</p>" +
    '<p><strong>Populations served.</strong> ' + list(p.populations) + ".</p></div>" +

    '<div class="pf-section"><h2>Training &amp; credentials</h2><ul class="pf-list">' +
    "<li><b>Licensure</b> — " + esc(p.license) + "</li>" +
    p.education.map(function (e) { return "<li><b>Education</b> — " + esc(e) + "</li>"; }).join("") +
    "<li><b>TIIP standing</b> — " + esc(lv.label) + "</li>" +
    "<li><b>Experience</b> — " + esc(p.years) + " years in practice</li></ul></div>" +

    '<div class="pf-section" id="offerings"><h2>Workshops, seminars &amp; events I can offer</h2>' +
    '<p class="muted">Available for organizations, masjids, clinics, schools, and training bodies. Choose one to start a request.</p>' +
    '<div class="pf-offers">' + offerCards + "</div></div>" +

    /* request form */
    '<div class="pf-section" id="request"><h2>Make a request</h2>' +
    '<div class="pf-tabs" role="tablist">' +
    '<button type="button" class="chip active" role="tab" data-mode="provider">Request as my provider</button>' +
    '<button type="button" class="chip" role="tab" data-mode="event">Request for an event or workshop</button></div>' +
    '<form class="join-form pf-form" id="pf-form" novalidate>' +
    '<div class="demo-pill" id="pf-status">Demo only — requests are not sent in this mock-up.</div>' +
    '<div class="notice" style="margin-bottom:18px;"><span class="ni" aria-hidden="true">🔒</span><p>Please <strong>do not include health details or other sensitive personal information</strong> in this form. ' + esc(p.name) + ' will follow up to discuss next steps.</p></div>' +
    '<div class="pf-row"><div class="field"><label for="pf-name">Your name</label><input type="text" id="pf-name" required /></div>' +
    '<div class="field"><label for="pf-email">Email</label><input type="email" id="pf-email" required /></div></div>' +
    '<div class="field"><label for="pf-phone">Phone <em style="font-weight:500;color:var(--ink-400);">(optional)</em></label><input type="tel" id="pf-phone" /></div>' +

    '<div data-for="provider">' +
    '<div class="pf-row"><div class="field"><label for="pf-format">Preferred format</label><select id="pf-format">' + formatOptions + "</select></div>" +
    '<div class="field"><label for="pf-lang">Preferred language</label><select id="pf-lang">' + langOptions + "</select></div></div>" +
    '<div class="field"><label for="pf-focus">What would you like support with? <em style="font-weight:500;color:var(--ink-400);">(a brief, general description)</em></label>' +
    '<select id="pf-focus">' + p.specialties.map(function (s) { return "<option>" + esc(s) + "</option>"; }).join("") + "<option>Something else</option></select></div>" +
    '<div class="field"><label for="pf-when">Best times to reach you</label><input type="text" id="pf-when" placeholder="e.g., weekday evenings" /></div>' +
    "</div>" +

    '<div data-for="event" hidden>' +
    '<div class="field"><label for="pf-offer">Workshop / seminar</label><select id="pf-offer">' + offerOptions + '<option value="custom">A custom topic (describe below)</option></select></div>' +
    '<div class="pf-row"><div class="field"><label for="pf-org">Organization</label><input type="text" id="pf-org" placeholder="Masjid, clinic, school…" /></div>' +
    '<div class="field"><label for="pf-size">Expected audience</label><select id="pf-size"><option>Under 20</option><option>20–50</option><option>50–150</option><option>150+</option></select></div></div>' +
    '<div class="pf-row"><div class="field"><label for="pf-date">Preferred date</label><input type="date" id="pf-date" /></div>' +
    '<div class="field"><label for="pf-evformat">Format</label><select id="pf-evformat"><option>In person</option><option>Online</option><option>Either</option></select></div></div>' +
    '<div class="field"><label for="pf-evloc">Event location (city)</label><input type="text" id="pf-evloc" /></div>' +
    "</div>" +

    '<div class="field"><label for="pf-msg">Anything else we should know?</label><textarea id="pf-msg" rows="4" style="width:100%;padding:.82em 1em;border:1px solid var(--cream-300);border-radius:12px;font:inherit;background:var(--cream-50);"></textarea></div>' +
    '<label class="pf-check"><input type="checkbox" id="pf-ack" required /> <span>I understand this is a request, not an appointment or a booking, and that the provider may suggest a different referral.</span></label>' +
    '<button class="btn btn-gold" type="submit" id="pf-submit">Send request</button>' +
    "</form></div>" +

    "</div>" + /* /pf-main */

    /* sidebar */
    '<aside class="pf-side"><div class="card">' +
    "<h3>Quick facts</h3>" +
    '<dl class="pf-facts">' +
    "<dt>Location</dt><dd>" + esc(location_) + "</dd>" +
    "<dt>Languages</dt><dd>" + list(p.languages) + "</dd>" +
    "<dt>Session formats</dt><dd>" + list(p.formats) + "</dd>" +
    "<dt>Availability</dt><dd>" + esc(p.accepting) + "</dd>" +
    "<dt>Experience</dt><dd>" + esc(p.years) + " years</dd>" +
    "<dt>Licensure</dt><dd>" + esc(p.license) + "</dd>" +
    "</dl>" +
    '<a class="btn btn-primary" style="width:100%;justify-content:center;margin-top:6px;" href="#request" data-mode-link="provider">Request as my provider</a>' +
    '<a class="btn btn-outline" style="width:100%;justify-content:center;margin-top:10px;" href="#request" data-mode-link="event">Request for an event</a>' +
    "</div>" +
    '<p class="muted" style="font-size:.8rem;margin-top:14px;">Demo profile — an illustrative sample clinician for this mock-up, not a real practitioner.</p>' +
    '<a class="feature-link" href="index.html#directory" style="margin-top:6px;">← Back to the directory</a>' +
    "</aside>" +

    "</div></div></section>";

  /* portrait with initials fallback */
  TIIP.setPhoto(document.getElementById("pf-img"), p);

  /* ---- request form: provider vs event mode ---- */
  var form = document.getElementById("pf-form");
  var status = document.getElementById("pf-status");
  var tabs = root.querySelectorAll("[data-mode]");
  var mode = "provider";

  function setMode(m) {
    mode = m;
    tabs.forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-mode") === m); });
    form.querySelectorAll("[data-for]").forEach(function (g) { g.hidden = g.getAttribute("data-for") !== m; });
    document.getElementById("pf-submit").textContent = m === "event" ? "Send event request" : "Send request";
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { setMode(t.getAttribute("data-mode")); });
  });
  root.querySelectorAll("[data-mode-link]").forEach(function (a) {
    a.addEventListener("click", function () { setMode(a.getAttribute("data-mode-link")); });
  });
  root.querySelectorAll("[data-request-offer]").forEach(function (b) {
    b.addEventListener("click", function () {
      setMode("event");
      document.getElementById("pf-offer").value = b.getAttribute("data-request-offer");
      document.getElementById("request").scrollIntoView({ behavior: "smooth" });
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var name = document.getElementById("pf-name").value.trim();
    var what = mode === "event" ? "event request" : "provider request";
    status.textContent = "✓ Demo only — in production your " + what + " would now be sent to " + p.name + ". Thank you, " + name + ".";
    status.scrollIntoView({ behavior: "smooth", block: "center" });
    form.reset();
    setMode(mode);
  });

  /* honor a #request deep link coming from elsewhere */
  if (location.hash === "#request") document.getElementById("request").scrollIntoView();
})();
