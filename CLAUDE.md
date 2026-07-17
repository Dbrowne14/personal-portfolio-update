@AGENTS.md
# Project Instructions

## Objective

Build a premium personal portfolio for David Browne using Next.js App Router, TypeScript and Tailwind CSS.

The creative thesis is:

"From evaluating products to shipping them."

Read these files before making architectural or design decisions:

- docs/creative-direction.md
- docs/content-brief.md
- docs/references/

## Reference files

The files in `docs/references/claude-prototype` are design and interaction references only.

They may contain useful:

- Copy
- Layout concepts
- Canvas interactions
- Timeline logic
- Motion ideas
- Responsive behaviour

Do not port their markup directly into production.

Do not preserve their structure merely because it already exists.

Extract the strongest ideas and rebuild them with maintainable React and Next.js architecture.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion where justified
- React Server Components by default
- Client Components only where interactivity requires them
- Vercel deployment

Do not add large animation, WebGL or UI libraries without explaining the need first.

## Architecture rules

- Separate content from presentation.
- Store project and experience content in typed data files.
- Use semantic HTML.
- Use `next/image`, `next/font` and `next/link`.
- Prefer Server Components.
- Keep interactive islands small and focused.
- Do not place `"use client"` on complete pages without necessity.
- Avoid duplicated page-level markup.
- Do not create generic abstractions before repeated patterns exist.
- Keep the route structure straightforward.
- Preserve accessibility, keyboard operation and focus visibility.
- Respect `prefers-reduced-motion`.
- Mobile layouts must be deliberately designed, not compressed desktop versions.

## Design rules

- Light mode is the primary identity.
- The main canvas should be white or near-white.
- Do not use large concrete-grey section backgrounds.
- Use accent colour primarily as typography, lines, markers, controls and graphic structure.
- Use large colour fields only when conceptually justified.
- Avoid generic card grids.
- Avoid excessive rounded corners.
- Avoid decorative gradients and glass effects.
- Prefer strong composition, hierarchy, typography and image treatment.
- Each section should contain a visual moment without becoming visually noisy.
- The site must remain professional and recruiter-focused.

## Workflow

Before a substantial implementation:

1. Inspect the relevant reference and production files.
2. Explain what is worth preserving.
3. Explain what should be replaced.
4. List the files you intend to create or modify.
5. Identify Client Component boundaries.
6. Implement only the agreed scope.
7. Run lint and TypeScript checks.
8. Report changed files, trade-offs and unresolved issues.

Do not redesign unrelated sections during a focused task.

Do not complete the entire site in a single uncontrolled pass.
