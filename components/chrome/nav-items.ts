export interface NavItem {
  label: string;
  href: string;
}

// Home is reached via the masthead monogram, not a nav item — see
// header.tsx. Order is the numbered chapter sequence from the navigation
// reference (docs/references/screenshots/navigation-prototype.jpeg) — 01
// Work, 02 About, 03 Contact — which now takes precedence over the earlier
// Five Acts ordering (About before Work) once the header numbers the items:
// numbering makes the order itself part of the design, not an incidental
// detail free to diverge from the reference.
export const navItems: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
