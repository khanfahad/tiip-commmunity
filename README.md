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
| Home | `index.html` | Overview of the model, the community, and what's inside |
| The Model | `model.html` | Interactive diagram of the soul's faculties, intervention domains (tabs), the therapeutic process (steps), and FAQ |
| Community | `community.html` | An interactive member-portal preview (feed, forums, case consultation, directory, library) + how to join |
| Resources | `resources.html` | Filterable video/training library and downloadable clinical tools |
| Events | `events.html` | Featured conference, filterable upcoming events, and a host-a-training CTA |
| Research | `research.html` | Publications, ongoing studies, and ways to collaborate |

## Tech

- Pure HTML, CSS, and vanilla JavaScript — no build step, no frameworks.
- Design system in `assets/css/style.css`; interactions in `assets/js/main.js`.
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
