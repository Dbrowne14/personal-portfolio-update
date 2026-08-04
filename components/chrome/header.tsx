import Link from "next/link";
import { navItems } from "./nav-items";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

// Server Component. The masthead name is the Home link — About/Work/Contact
// are the only nav items, in that order (see nav-items.ts). ThemeToggle and
// NavLinks are the two Client Components this renders; like MobileMenu,
// each owns its own narrow slice of behaviour (theme, and — NavLinks —
// active-route detection via usePathname) rather than Header needing any
// client-side knowledge of theme or the current route itself.
//
// The masthead is a small circular monogram, not a text repeat of the hero
// name — it doesn't compete with the monumental "DAVID BROWNE" below it the
// way full text would, so unlike the previous treatment it's permanently
// visible rather than faded in only once the hero scroll-compresses.
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-ink/16 bg-ivory/85 px-7 backdrop-blur-md">
      <Link
        href="/"
        aria-label="David Browne — home"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink font-mono text-xs font-semibold text-ink hover:border-accent hover:text-accent"
      >
        DB
      </Link>
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
    </header>
  );
}
