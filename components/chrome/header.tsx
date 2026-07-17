import Link from "next/link";
import { navItems } from "./nav-items";
import { MobileMenu } from "./mobile-menu";

// Server Component. The masthead name is the Home link — About/Work/Contact
// are the only nav items, in that order (see nav-items.ts). No theme toggle yet: dark mode
// doesn't exist until M8, and no active-route highlighting yet, since M1's
// acceptance criteria don't require it and Server Components have no
// built-in access to the current pathname without a client boundary this
// milestone doesn't otherwise need.
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-ink/16 bg-ivory/85 px-7 backdrop-blur-md">
      <Link
        href="/"
        className="font-mono text-meta uppercase text-ink hover:text-accent"
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
      <MobileMenu />
    </header>
  );
}
