// Server Component. Placeholder hrefs match Footer's established pattern
// (components/chrome/footer.tsx) — no real profile URLs exist yet, so "#"
// stands in rather than a fake path. Status copy follows content-brief.md's
// contact-language guidance: full-time roles, recruiter conversations,
// product/technical discussions, collaboration, networking, and occasional
// freelance work — no sales language, no mailto link.
export function ElsewhereCard() {
  return (
    <div className="reveal-on-scroll border-t border-ink/16 pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-10">
      <p className={labelClass}>Elsewhere</p>
      <ul className="mt-4 flex flex-col gap-2">
        <li>
          <a href="#" className={linkClass}>
            GitHub ↗
          </a>
        </li>
        <li>
          <a href="#" className={linkClass}>
            LinkedIn ↗
          </a>
        </li>
        <li>
          <a href="#" className={linkClass}>
            CV ↗
          </a>
        </li>
      </ul>

      <p className={`${labelClass} mt-10`}>Currently open to</p>
      <p className="mt-4 max-w-xs text-body text-ink/70">
        Full-time engineering roles, recruiter conversations, and product or
        technical discussions. Occasionally available for the right
        freelance work.
      </p>
    </div>
  );
}

const labelClass =
  "font-mono text-meta text-ink/62 uppercase tracking-[0.1em]";
const linkClass =
  "font-mono text-meta text-ink uppercase tracking-[0.1em] transition-colors duration-200 hover:text-accent";
