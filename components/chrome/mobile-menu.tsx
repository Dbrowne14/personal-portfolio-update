"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { navItems } from "./nav-items";

// The one genuine client boundary in this milestone (ADR-005): everything
// else in components/chrome is a Server Component. Scope is deliberately
// narrow — open/close state and the focus trap it requires — rather than
// making Header itself a client component.
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    focusable?.[0]?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center md:hidden"
      >
        <span aria-hidden className="block h-px w-6 bg-ink" />
      </button>

      {open
        ? createPortal(
            // Portalled straight to <body>: Header sets backdrop-blur, which
            // per spec creates a new containing block for `position: fixed`
            // descendants. Rendered inside Header, this dialog's inset-0
            // would resolve against Header's own 64px box instead of the
            // viewport. Escaping to <body> avoids that entirely.
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="fixed inset-0 z-60 flex flex-col bg-ivory px-7 pb-6"
            >
              <div className="flex h-16 items-center justify-between border-b border-ink/16">
                <span
                  id={titleId}
                  className="font-mono text-meta uppercase text-ink"
                >
                  David Browne
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center text-lg text-ink"
                >
                  ×
                </button>
              </div>
              <nav className="mt-4 flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-ink/16 py-5 font-sans text-2xl font-extrabold tracking-tight text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
