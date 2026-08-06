"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

// The one pathname-aware piece of chrome navigation. Header stays a Server
// Component for everything else — this is scoped narrowly to the
// active-item dot, the same "deliberately narrow client boundary" pattern
// MobileMenu already uses (ADR-005), rather than making Header itself a
// Client Component just to call usePathname().
//
// Only ever mounted in the primary (JS-enabled) nav — the <noscript>
// fallback in header.tsx intentionally stays static/dot-less, since it
// only ever renders when there's no JS to hydrate this with anyway.
//
// Active match is prefix-based, not exact-only: `pathname === href` or
// `pathname` starts with `href + "/"`, so a nested route like
// `/work/[slug]` still keeps Work active, not just `/work` itself.
export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item, index) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.08em] leading-none text-ink hover:text-accent"
          >
            {/* Space is reserved regardless of active state (fixed size,
                opacity toggled rather than conditionally rendered) so
                every item's number lines up at the same x-position. */}
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 shrink-0 rounded-full bg-accent ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
            <span>
              <span className="text-accent">0{index + 1}</span> {item.label}
            </span>
          </Link>
        );
      })}
    </>
  );
};
