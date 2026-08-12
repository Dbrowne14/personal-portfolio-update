import { personalInfo } from "@/lib/content/personal-info";

export const ElsewhereCard = () => {
  return (
    <div className="reveal-on-scroll border-t border-ink/16 pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-10">
      <p className={labelClass}>Elsewhere</p>
      <ul className="mt-4 flex flex-col gap-2">
        {personalInfo.map((info) => {
          return (
            <li>
              <a href={info.link} className={linkClass}>
                {info.name} ↗
              </a>
            </li>
          );
        })}
      </ul>

      <p className={`${labelClass} mt-10`}>Currently open to</p>
      <p className="mt-4 max-w-xs text-body text-ink/70">
        Full-time engineering roles, recruiter conversations, and product or
        technical discussions. Occasionally available for the right freelance
        work.
      </p>
    </div>
  );
};

const labelClass = "font-mono text-meta text-ink/62 uppercase tracking-[0.1em]";
const linkClass =
  "font-mono text-meta text-ink uppercase tracking-[0.1em] transition-colors duration-200 hover:text-accent";
