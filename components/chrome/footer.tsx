export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/16 px-7 py-5 font-mono text-meta tracking-[0.08em] text-ink/45">
      <span>© {new Date().getFullYear()} David Browne</span>
      <span>London 51.5072°N — 0.1276°W</span>
      <span className="flex gap-4">
        <a href="#" className="hover:text-accent">
          GitHub
        </a>
        <a href="#" className="hover:text-accent">
          LinkedIn
        </a>
        <a href="#" className="hover:text-accent">
          CV
        </a>
      </span>
    </footer>
  );
}
