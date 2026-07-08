/* TIIP Community — public events calendar (demo data)
   Powers the List / Calendar view toggle on events.html. The calendar
   renders a navigable month grid from the EVENTS array below; the list
   view is the static markup already on the page. */
(function () {
  "use strict";

  var calWrap = document.getElementById("ev-calendar-view");
  if (!calWrap) return;

  /* cat matches the list-view filter chips: training | webinar | retreat | conference */
  var EVENTS = [
    { title: "Foundations of TIIP — Cohort 41 begins", y: 2026, m: 6, d: 14, cat: "training" },
    { title: "Spiritual Resources for Anxiety & Panic", y: 2026, m: 6, d: 23, cat: "webinar" },
    { title: "Advanced Supervision Cohort", y: 2026, m: 7, d: 6, cat: "training" },
    { title: "Practitioner Retreat: Caring for the Caregiver", y: 2026, m: 8, d: 19, cat: "retreat" },
    { title: "Annual TIIP Conference 2026", y: 2026, m: 9, d: 16, cat: "conference" },
    { title: "Research Methods in Integrated Psychotherapy", y: 2026, m: 10, d: 4, cat: "webinar" }
  ];

  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var now = new Date();
  /* Start on the current month so the nearest events are visible; if there
     are no events on/after today's month, fall back to the first event. */
  var view = { y: now.getFullYear(), m: now.getMonth() };
  var hasCurrent = EVENTS.some(function (e) {
    return e.y > view.y || (e.y === view.y && e.m >= view.m);
  });
  if (!hasCurrent && EVENTS.length) { view.y = EVENTS[0].y; view.m = EVENTS[0].m; }

  function render() {
    var y = view.y, m = view.m;
    var first = new Date(y, m, 1);
    var startDow = first.getDay();
    var daysIn = new Date(y, m + 1, 0).getDate();
    var monthEvents = EVENTS.filter(function (e) { return e.y === y && e.m === m; });

    var html = '<div class="cal-wrap">' +
      '<div class="cal-nav">' +
      '<button type="button" id="cal-prev" aria-label="Previous month">‹</button>' +
      '<h3>' + MONTHS[m] + " " + y + "</h3>" +
      '<button type="button" id="cal-next" aria-label="Next month">›</button>' +
      "</div>" +
      '<div class="cal-dow">' + DOW.map(function (d) { return "<span>" + d + "</span>"; }).join("") + "</div>" +
      '<div class="cal-days">';

    for (var i = 0; i < startDow; i++) html += '<div class="cal-day empty"></div>';
    for (var day = 1; day <= daysIn; day++) {
      var dayEvents = monthEvents.filter(function (e) { return e.d === day; });
      var isToday = y === now.getFullYear() && m === now.getMonth() && day === now.getDate();
      html += '<div class="cal-day' + (dayEvents.length ? " has" : "") + (isToday ? " today" : "") + '">' +
        '<span class="dnum">' + day + "</span>" +
        dayEvents.map(function (e) {
          return '<span class="cal-ev ' + e.cat + '" title="' + esc(e.title) + '">' + esc(e.title) + "</span>";
        }).join("") +
        "</div>";
    }
    html += "</div>";

    html += '<div class="cal-legend">' +
      '<span><i style="background:var(--gold-500)"></i> Training</span>' +
      '<span><i style="background:var(--emerald-500)"></i> Webinar</span>' +
      '<span><i style="background:var(--plum-700)"></i> Retreat</span>' +
      '<span><i style="background:var(--emerald-800)"></i> Conference</span>' +
      "</div>";
    if (!monthEvents.length) {
      html += '<p class="cal-empty-note">No events this month — use the arrows to browse other months.</p>';
    }
    html += "</div>";

    calWrap.innerHTML = html;
    document.getElementById("cal-prev").addEventListener("click", function () {
      view.m--; if (view.m < 0) { view.m = 11; view.y--; } render();
    });
    document.getElementById("cal-next").addEventListener("click", function () {
      view.m++; if (view.m > 11) { view.m = 0; view.y++; } render();
    });
  }

  /* ---- List / Calendar view toggle ---- */
  var listView = document.getElementById("ev-list-view");
  var toggles = document.querySelectorAll("[data-ev-view]");
  var rendered = false;
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.getAttribute("data-ev-view");
      toggles.forEach(function (b) { b.classList.toggle("active", b === btn); });
      var showCal = v === "calendar";
      if (showCal && !rendered) { render(); rendered = true; }
      calWrap.hidden = !showCal;
      if (listView) listView.hidden = showCal;
    });
  });
})();
