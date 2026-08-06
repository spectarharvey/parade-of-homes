"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { builderLogoSources } from "@/lib/builderAssets";
import type { Builder } from "@/lib/types";

type BuilderLogoProps = {
  builder?: Pick<Builder, "name" | "website"> | null;
  className: string;
  style?: CSSProperties;
};

/** Shows a local builder logo or the icon from its website; nothing if neither is available. */
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
  if (!src) return null;

  return (
    <span className={className} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${builder?.name ?? "Builder"} logo`}
        onError={() => setSourceIndex((index) => index + 1)}
      />
    </span>
  );
}
