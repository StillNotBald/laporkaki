import { SceneArt, type Scene } from "./SceneArt";

export function PhotoFrame({
  src,
  scene = "road",
  alt,
  caption,
  ratio = "16 / 10",
  className,
}: {
  src?: string | null;
  scene?: Scene;
  alt: string;
  caption?: string;
  /** CSS aspect-ratio, e.g. "16 / 10" (home) or "4 / 3" (ticket). */
  ratio?: string;
  className?: string;
}) {
  return (
    <div
      style={{ aspectRatio: ratio }}
      className={["relative w-full overflow-hidden rounded-card bg-sunken", className]
        .filter(Boolean)
        .join(" ")}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <SceneArt scene={scene} className="size-full" />
      )}
      {caption && (
        <span className="glass absolute bottom-2.5 left-2.5 max-w-[calc(100%-20px)] truncate rounded-full px-2.5 py-1 text-caption text-ink">
          {caption}
        </span>
      )}
    </div>
  );
}
