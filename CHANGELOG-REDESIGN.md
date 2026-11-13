# Redesign 2026 — Wix UX Designer reference (template 1885)

## What changed

- Redesigned the complete single-page experience in a dark slate / electric-green editorial visual system.
- Introduced a fixed responsive navbar with active-section highlighting and a mobile menu.
- Replaced the original hero with large typographic treatment and a grayscale portrait of Bayu from the supplied archive.
- Rebuilt Professional with a biography, expertise areas, and self-assessed software proficiency bars.
- Rebuilt Portfolio with six original project thumbnails, category filters, and detail dialogs.
- Rebuilt Experience as a vertical timeline using existing work history.
- Retained education, professional milestones, and certifications in a redesigned supplementary section.
- Redesigned Contact with email / WhatsApp links and a prefilled-message form (mailto:; no server-side sending).
- Replaced favicon, tuned responsive breakpoints, added keyboard focus styles, reduced-motion support, and SEO metadata.
- Updated the project README with editing and deployment instructions.

## Compatibility / verification

- Astro component frontmatter parsed with Babel's TypeScript parser.
- Vue component parsed and compiled with `@vue/compiler-sfc` successfully.
- HTML / CSS visual layout inspected as a static preview at desktop (1440×900) and mobile (390×844) sizes.
- **A complete `astro build` could not be run in this Linux sandbox**, because the supplied archive's `node_modules` contains Windows-only native packages and network access to reinstall the Linux equivalents is unavailable. On the intended Windows machine, run `npm ci` followed by `npm run build` to perform full integration testing.

## Reference and content

Visual direction: [Wix UX Designer template 1885](https://www.wix.com/website-template/view/html/1885).
All application source code is newly authored for Astro + Vue and does not use Wix runtime code or Wix imagery.
