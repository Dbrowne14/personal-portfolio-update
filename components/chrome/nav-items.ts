export interface NavItem {
  label: string;
  href: string;
}

// Home is reached via the masthead name, not a nav item — see header.tsx.
// Order matches the agreed narrative in 01-vision.md's Five Acts:
// Home (Opening Position + Inflection) -> About (the Decision) ->
// Work (the Evidence) -> Contact (the Open Position).
export const navItems: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Work", href: "/work" },
  { label: "Contact", href: "/contact" },
];
