# TIIP Community Website

A mock-up website for the **Traditional Islamically Integrated Psychotherapy (TIIP)** community — built as a fast, dependency-free static site and configured for hosting on **GitHub Pages** at [tiip.community](https://tiip.community).

## Purpose

This site serves three audiences and goals:

1. **Educate** — explain the TIIP model in an accessible, interactive way.
2. **Connect** — act as the home base and private network for clinicians trained in the model (forums, case consultation, mentorship, directory).
3. **Grow the field** — surface resources, recorded trainings, events, and research.

## Pages

| Page | File | What it shows |
|------|------|---------------|
| Home | `index.html` | Overview of the model and community, the open **certification pathway** (Level 0 → full certification), plus the public **TIIP Provider Directory** — searchable by country → state/province → city, specialty, TIIP level (listings begin at Level 1), and free text (demo profiles in `assets/js/directory.js`) |
| The Model | `model.html` | Interactive diagram of the soul's faculties, intervention domains (tabs), the therapeutic process (steps), and FAQ |
| Community | `community.html` | An interactive member-portal preview (feed, forums, case consultation, directory, library) + how to join |
| Resources | `resources.html` | Filterable video/training library and downloadable clinical tools |
| Events | `events.html` | Featured conference, filterable upcoming events, and a host-a-training CTA |
| Research | `research.html` | Publications, ongoing studies, and ways to collaborate |
| Member Portal | `portal.html` | Full front-end prototype of the practitioner platform (see below) |

## Member Portal prototype (`portal.html`)

The portal is a complete, clickable front-end prototype of the practitioner
platform. It runs entirely in the browser (state persists to `localStorage`)
and includes a **role switcher** to demonstrate role-based access control
across five permission levels: **Admin, Supervisor/Scholar, Certified
Practitioner, Trainee (Levels I–III), and TIIP Trainee (Level 0)**.

Registration is open to everyone: new members start as a **TIIP Trainee at
Level 0** (starter modules, events, and forums only — no consultations, no
directory listing) and progress through Levels 1–3 to full certification.
The **Certification Pathway** view shows the entire journey and highlights
the member's current stage.

| Module | Spec area | What the prototype demonstrates |
|--------|-----------|--------------------------------|
| Referral Directory | User architecture | Search + filters for language (Arabic/Urdu/Turkish/English), timezone region, clinical focus, licensure (PSYPACT, US state, Canada, UK/EU, international); live local-time display per practitioner |
| Certification Pathway | Certification | Full Level 0 → 1 → 2 → 3 → certification stepper with "you are here" marker; Level 0 starter modules; 200-hour + 10-case progress bars with dynamic percentages, hour-logging form, supervisor approval/decline queue |
| Compliance Vault | Certification | Dual categories (state CEUs vs. farḍ al-ʿayn), credit totals, expiration status with 60-day reminder badges |
| Case Sandbox | Clinical | Conceptualization forms mapped to ʿAql/Nafs/Rūḥ/Iḥsās domains, share-with-supervisor flow, supervisor read view |
| Scholar Desk | Clinical | Threaded consultation tickets with required anonymization confirmation, scholar routing, answered/closed states |
| Intervention Vault | Research/resources | Search, language/type filters, metadata tags, version badges with history, per-asset downloads |
| Publication Incubator | Research/resources | Project stages (draft → submission-ready), APA 7 checklist, planned Janeway API/webhook pipeline |
| Events Calendar | Community | Month calendar, automatic local-timezone conversion (`Intl`), RSVP tracking, join links, real `.ics` export |
| Tazkiyah Forums | Community | Boards → threads → posts with reply and new-thread forms |

### What requires a real backend before launch

The prototype intentionally stops where a static site must. Production needs:

- **Auth & RBAC enforcement** — real accounts and server-side permission
  checks (e.g., Supabase/Auth0/Keycloak + Postgres row-level security).
- **Encrypted clinical data** — the Case Sandbox and Scholar Desk handle
  PHI-adjacent content; production requires end-to-end encryption, audit
  logging, BAAs, and HIPAA/GDPR review. **Do not enter real patient data
  into the demo.**
- **File storage** — the Compliance and Intervention vaults need encrypted
  object storage (S3/GCS) with signed URLs and server-side version control.
- **Notifications** — expiration reminders and approval alerts need a
  scheduled job + email service (e.g., Postmark/SES).
- **Video conferencing** — event join links should come from a Zoom/Meet
  integration rather than static URLs.
- **Peer-review pipeline** — the Janeway API/webhook integration sketched
  in the incubator.

## Tech

- Pure HTML, CSS, and vanilla JavaScript — no build step, no frameworks.
- TIIP logo (`assets/img/tiip-logo.svg` / `tiip-mark.svg`) — the full TIIP
  emblem: the letters T·I·I·P grown into a rooted tree, a central ogee arch
  sheltering leaves of growth above, roots of tradition spreading below, in
  the TIIP brand palette (deep navy `#1e3468`, teal `#2e847e`). The
  site-wide color scheme is keyed to these two logo colors on warm cream.
- Design system in `assets/css/style.css`; interactions in `assets/js/main.js`.
- Provider directory data + search logic in `assets/js/directory.js`. Portrait
  images use a demo photo service with an automatic initials-avatar fallback,
  so the directory works fully offline too.
- Responsive, accessible, and fast.

## Running locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`)
that publishes the site automatically.

**One-time setup in the repository (GitHub UI):**

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to the configured branch — the workflow builds and deploys the site.

**Custom domain (`tiip.community`):**

- The `CNAME` file already points the site at `tiip.community`.
- In your DNS provider, add the records GitHub specifies for an apex domain:
  - `A` records to GitHub Pages IPs, **or** an `ALIAS`/`ANAME` to `<user>.github.io`,
  - and a `CNAME` for `www` → `<user>.github.io`.
- In **Settings → Pages → Custom domain**, confirm `tiip.community` and enable **Enforce HTTPS**.

> `.nojekyll` is included so GitHub Pages serves the files as-is.

## Content disclaimer

This is a **demonstration mock-up**. Statistics, publications, events, and member
content are illustrative placeholders. Replace them with authoritative copy,
the official TIIP curriculum/bibliography, real event listings, and a real
backend for the member portal before launch.
