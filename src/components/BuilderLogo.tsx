"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { builderLogoSources } from "@/lib/builderAssets";
import type { Builder } from "@/lib/types";

type BuilderLogoProps = {
  builder?: (Pick<Builder, "name" | "website"> & { logo?: string | null; initials?: string }) | null;
  className: string;
  style?: CSSProperties;
};

/** Shows a local/database builder logo or high-res favicon from Google CDN; falls back to initials. */
export default function BuilderLogo({
  builder,
  className,
  style,
}: BuilderLogoProps) {
  const sources = useMemo(() => builderLogoSources(builder), [builder]);
  const sourcesKey = sources.join("|");
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourcesKey]);

  const src = sources[sourceIndex];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={`${builder?.name ?? "Builder"} logo`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setSourceIndex((index) => index + 1)}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        builder?.initials || builder?.name?.[0] || ""
      )}
    </span>
  );
}
