import Link from "next/link";
import { navItems } from "./nav-items";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

// Server Component. The masthead name is the Home link — About/Work/Contact
// are the only nav items, in that order (see nav-items.ts). ThemeToggle
// (M8) is the one Client Component this renders; like MobileMenu, it
// receives no props and owns its own tiny behaviour rather than Header
// needing any client-side knowledge of theme. No active-route highlighting,
// since M1's acceptance criteria don't require it and Server Components
// have no built-in access to the current pathname without a client
// boundary this milestone doesn't otherwise need.
//
// The masthead-name class's opacity is governed entirely by CSS in
// globals.css, keyed to data-page/data-hero-compressed attributes that
// HeroStage sets on <html> (see components/hero/hero-stage.tsx). Header
// itself needs no knowledge of the hero, the current route, or scroll state.
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-ink/16 bg-ivory/85 px-7 backdrop-blur-md">
      <Link
        href="/"
        className="masthead-name font-mono text-meta uppercase text-ink hover:text-accent"
      >
        David Browne
      </Link>
      <nav className="hidden items-center gap-7 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="font-mono text-meta uppercase text-ink/70 hover:text-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-5">
        <ThemeToggle />
        <MobileMenu />
      </div>
    </header>
  );
}
