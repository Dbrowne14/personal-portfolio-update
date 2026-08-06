import Link from "next/link";

// Plain typeset link — no icon, no boxed button. Two real consumers
// (homepage's PortfolioArtifactCard, /work's expanded rows), so this lives
// in its own file rather than being duplicated or awkwardly cross-imported.
export const ArtifactLink = ({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) => {
  const linkProps = external ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <Link
      href={href}
      {...linkProps}
      className="group inline-flex items-baseline gap-1.5 transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="border-b border-transparent transition-colors duration-200 group-hover:border-accent">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
};
