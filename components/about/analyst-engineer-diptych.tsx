import Image from "next/image";

const PORTRAIT_SRC: string | undefined = "/supporting-images/display-photo.png";

type DiptychSide = {
  range: string;
  title: string;
  copy: string;
  alignment: "left" | "right";
  accent?: boolean;
};

const diptychSides: DiptychSide[] = [
  {
    range: "2017 — 2025",
    title: "Investor",
    copy: "Priced the companies. Modelled the businesses. Learned to ask what was worth investing in.",
    alignment: "left",
  },
  {
    range: "2025 — NOW",
    title: "Engineer",
    copy: "Now I build the products. The same judgement—what's worth building—applied through software instead of deals.",
    alignment: "right",
    accent: true,
  },
];

const DiptychCopy = ({
  range,
  title,
  copy,
  alignment,
  accent = false,
}: DiptychSide) => {
  const isRight = alignment === "right";

  return (
    <div
      className={[
        "reveal-on-scroll",
        isRight
          ? "ml-auto max-w-[85%] text-right [animation-delay:300ms] lg:col-start-3 lg:ml-0 lg:max-w-none"
          : "mr-auto max-w-[45%] lg:col-start-1 lg:mr-0 lg:max-w-none",
      ].join(" ")}
    >
      <p
        className={[
          "font-mono text-meta uppercase tracking-[0.14em]",
          accent ? "text-accent" : "text-ink/50",
        ].join(" ")}
      >
        {range}
      </p>

      <h2
        className={[
          "mt-4 font-bold leading-[0.9] tracking-[-0.04em]",
          accent ? "text-ink" : "text-ink/55",
        ].join(" ")}
      >
        <span className="block text-[clamp(2.5rem,5vw,5.25rem)]">The</span>
        <span className="block text-[clamp(2.5rem,5vw,5.25rem)]">{title}</span>
      </h2>

      <p
        className={[
          "mt-8 max-w-sm text-body",
          isRight ? "ml-auto text-ink/70" : "text-ink/60",
        ].join(" ")}
      >
        {copy}
      </p>
    </div>
  );
};

const DiptychPortrait = () => {
  return (
    <div className="reveal-on-scroll relative z-10 mx-auto [animation-delay:150ms] lg:absolute lg:top-1/2 lg:left-1/2 lg:mx-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
      <div className="relative h-40 w-40 overflow-hidden rounded-full border border-ink/16 bg-ivory sm:h-78 sm:w-78">
        {PORTRAIT_SRC ? (
          <Image
            src={PORTRAIT_SRC}
            alt="Portrait of David Browne"
            fill
            sizes="(min-width: 640px) 12rem, 10rem"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_11px)]">
            <span className="bg-ivory px-2 py-1 text-center font-mono text-meta text-ink/62 uppercase tracking-[0.08em]">
              Portrait
              <br />
              to follow
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AnalystEngineerDiptych = () => {
  const [analyst, engineer] = diptychSides;

  return (
    <section
      className="flex h-[calc(100dvh-4rem)] flex-col border-t border-ink/16 bg-ivory px-7 py-8 md:h-auto md:min-h-[calc(100vh-4rem)] md:py-20"
    >
      <div className="mx-auto flex w-full max-w-350 flex-1 flex-col">
        <div className="relative grid flex-1 grid-cols-1 place-content-between gap-y-4 lg:grid-cols-[1fr_13rem_1fr] py-6 lg:py-none lg:place-content-start  lg:gap-x-12 lg:gap-y-14 lg:pt-16 xl:gap-x-20">
          <span
            aria-hidden="true"
            className="absolute pointer-events-none inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-ink/16 sm:block "
          />

          <DiptychCopy {...analyst} />

          <DiptychPortrait />

          <DiptychCopy {...engineer} />
        </div>

        <div
          className="reveal-on-scroll hidden border-t border-ink/16 pt-6 text-center md:block md:pt-10 md:pb-6"
        >
          <p className="text-xl font-bold text-ink md:text-3xl">
            Both halves compound.
          </p>
        </div>
      </div>
    </section>
  );
};
