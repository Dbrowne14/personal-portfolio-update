"use client";

import { useId, useState } from "react";

// The one client boundary this section needs — each toggle is independent
// local state, not coordinated like the Work page's single-open accordion,
// since these read as footnotes on their own principle, not siblings in
// one list where only one should be open at a time.
export const InPracticeToggle = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-6">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex items-baseline gap-1.5 font-mono text-meta font-semibold uppercase tracking-widest text-ink transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-accent">
          In practice
        </span>
        <span
          aria-hidden="true"
          className={`text-xs transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "-rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* Same grid-rows 0fr/1fr technique as the Work page accordion — no
          JS height measurement, no bounce. inert keeps the closed panel
          out of the tab order while it stays in the DOM (required for the
          CSS transition to animate at all). */}
      <div
        id={panelId}
        role="region"
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`max-w-xl pt-5 text-body text-ink/70 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
              open ? "translate-y-0 opacity-100 delay-150" : "-translate-y-1 opacity-0"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
