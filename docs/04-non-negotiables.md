# Non-negotiables

This document assumes `01-vision.md` and `02-architecture.md` as read. It is the checklist, not the argument — every line here is a distillation of doctrine stated in full elsewhere. Use it during review; use the other two documents to understand why a line exists.

- No second full-bleed colour plate anywhere on the site — the chart's ink plate is unique.
- The career chart is the site's only signature interaction.
- Dark mode is a material adaptation only. Typography, spacing, hierarchy, and interaction timing remain identical.
- No idle-looping animation.
- Every motion must have a narrative, usability, or feedback purpose.
- No standalone skills or toolset grid.
- No motion or hover state on the hero title block — it is text, not a component.
- No `mailto:` contact form. The contact form must function with client JavaScript unavailable.
- No client-managed accordion or expand state for case studies — case studies are real routes.
- Content is server-rendered by default. Client Components exist only where behaviour genuinely requires them.
- Content is never duplicated. Shared information is derived from common typed data.
- No React Context for cross-component coordination unless no simpler DOM or CSS mechanism exists.
- No duplicated page-level chrome. Header, footer, and navigation render once from the root layout.
