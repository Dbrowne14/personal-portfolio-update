export interface NavItem {
  label: string;
  href: string;
}

// Home is reached via the masthead name, not a nav item — see header.tsx.
export const navItems: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
