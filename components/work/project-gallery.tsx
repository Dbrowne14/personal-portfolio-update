import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
}

// Server Component, no JavaScript. CSS scroll-snap gives touch-swipe and
// keyboard scrolling natively, with no controller needed — per
// 03-roadmap.md's own architectural decision, a client-side indicator is
// only added if it proves genuinely necessary, and nothing about a simple
// horizontal strip of images requires one. Renders nothing when no
// project has gallery images yet, rather than an empty scroll strip.
export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto py-2">
      {images.map((image) => (
        <div
          key={image.src}
          className="relative aspect-4/3 w-4/5 flex-none snap-start overflow-hidden border border-ink/16 sm:w-2/5"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 640px) 40vw, 80vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
