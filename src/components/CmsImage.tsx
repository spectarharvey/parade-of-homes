"use client";

import Image, { type StaticImageData } from "next/image";

/**
 * An image whose source can be replaced from Admin → Website Content.
 *
 * When the CMS value is empty the bundled asset is rendered through next/image
 * exactly as before; once an admin uploads a replacement we render that URL
 * directly (uploads are already Cloudinary-optimised, and a plain <img> avoids
 * having to whitelist every future host in next.config).
 */
export default function CmsImage({
  src,
  fallback,
  alt,
  className,
  style,
  priority,
}: {
  /** CMS value — empty means "use the built-in asset". */
  src: string;
  fallback: StaticImageData;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={style} />;
  }
  return (
    <Image
      src={fallback}
      alt={alt}
      className={className}
      style={style}
      priority={priority}
    />
  );
}
