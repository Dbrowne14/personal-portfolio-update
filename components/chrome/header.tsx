import Link from "next/link";
import { navItems } from "./nav-items";
import { Masthead } from "./masthead";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

// Server Component. The masthead is the Home link — About/Work/Contact are
// the only nav items, in that order (see nav-items.ts). Masthead,
// ThemeToggle and NavLinks are the three Client Components this renders;
// each owns its own narrow slice of behaviour (scroll position, theme, and
// — NavLinks — active-route detection via usePathname) rather than Header
// needing any client-side knowledge of scroll, theme or the current route
// itself.
//
// The masthead starts as a small circular monogram, not a text repeat of
// the hero name — it doesn't compete with the monumental "DAVID BROWNE"
// below it the way full text would on page load — then crossfades to the
// name once the hero has scrolled out of view (see Masthead).
export const Header = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-ink/16 bg-ivory/85 px-7 backdrop-blur-md">
      <Masthead />
      <div className="flex gap-10">
        <nav className="hidden items-center gap-7 md:flex">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-5">
          <ThemeToggle />
          <MobileMenu />
          {/*
            M9: MobileMenu's hamburger is entirely onClick-driven — with no
            client JavaScript, it renders but does nothing, leaving no way to
            reach About/Work/Contact below the md breakpoint at all. This
            <noscript> block only exists in the DOM when scripting is
            unavailable, so JS-enabled visitors never see it duplicated
            alongside the real mobile menu; md:hidden keeps it out of the way
            on wider viewports, where the plain nav above already shows.
          */}
          <noscript>
            <nav className="md:hidden">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="ml-4 font-mono text-xs font-medium uppercase tracking-[0.08em] leading-none text-ink hover:text-accent"
                >
                  <span className="text-accent">0{index + 1}</span>{" "}
                  {item.label}
                </Link>
              ))}
            </nav>
          </noscript>
        </div>
      </div>
    </header>
  );
};
