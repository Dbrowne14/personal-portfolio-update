# Architecture

This document assumes `01-vision.md` as read. It states the technical doctrine that governs how the vision is implemented. Where this document and code disagree, this document wins until it is deliberately revised.

- Server Components by default. A client boundary must be justified by a genuine interaction requirement — canvas, pointer tracking, form state, scroll listening — never by convenience.
- Client components wrap server-rendered content through `children` and props. They own behaviour, not content.
- Case studies are real routes (`/work/[slug]`), not client-managed in-place expansion. The browser owns focus, history, and the back button.
- Route-level Next.js conventions (`generateStaticParams`, `generateMetadata`) are exported directly from the route's `page.tsx`. No separate convention files.
- The contact form is a Server Action with native `<form>` and plain inputs. It must function correctly with client JavaScript unavailable; client code enhances feedback, it never gates submission.
- Cross-component coordination prefers DOM state and CSS over React Context — a data attribute observed via `MutationObserver`, or a CSS selector keyed to a class or attribute, before a Context provider. Context is introduced only when no simpler mechanism exists.
- One typed content layer (`lib/content/`) is the single source of truth for projects and journey milestones. Every derived value — About's credential line, Work's colophon, the mobile timeline — is computed from those files, never hand-authored a second time. The full shape of this content is defined before the first page consuming it is built, so later milestones extend data, not schema.
- The chart's milestone data is always rendered as real, accessible text; the canvas rendering of it is a progressive enhancement layered on top, not the baseline.
- Any component rendering decorative or duplicate information alongside real accessible text carries `aria-hidden`. The accessible text is never `display: none`.
