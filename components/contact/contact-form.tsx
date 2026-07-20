import { SubmitStatus } from "./submit-status";

const fieldLabelClass =
  "font-mono text-meta text-ink/62 uppercase tracking-[0.1em]";
const fieldClass =
  "border-b border-ink/25 bg-transparent py-2 text-body text-ink outline-none transition-colors duration-200 focus:border-accent";

// Server Component (01-vision.md, Act V — "Open" is the site's single
// largest word, spent in bronze at its highest concentration). The
// labels, inputs, and copy here are static, server-rendered markup;
// SubmitStatus supplies only the <form> action binding and the
// pending/error state around them (02-architecture.md's client-wraps-
// server-content pattern, reused from HeroStage and TimelineActivator).
export function ContactForm() {
  return (
    <div className="reveal-on-scroll">
      <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
        The open position
      </p>
      <h1 className="mt-4 max-w-2xl text-h1 font-bold text-ink text-balance">
        <span className="text-accent">Open</span>
        {" "}to what&rsquo;s next.
      </h1>
      <p className="mt-6 max-w-md text-body text-ink/70">
        I&rsquo;m currently exploring full-time engineering roles, alongside
        recruiter conversations, product and technical discussions, and the
        occasional freelance collaboration. If any of that sounds like you,
        say hello below.
      </p>

      <div className="mt-12 max-w-md">
        <SubmitStatus>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={fieldLabelClass}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={fieldLabelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className={fieldLabelClass}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className={`${fieldClass} resize-none`}
            />
          </div>
        </SubmitStatus>
      </div>
    </div>
  );
}
