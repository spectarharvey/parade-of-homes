"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";

/**
 * Renders a real, scannable QR code as inline SVG.
 * Pass `value` (the URL/text to encode). `seed` is accepted for backwards
 * compatibility and used only if `value` is omitted.
 */
export default function QRCode({
  value,
  seed,
  className = "qr",
  style,
}: {
  value?: string;
  seed?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [svg, setSvg] = useState("");
  const data = value || seed || "";

  useEffect(() => {
    if (!data) return;
    let active = true;
    QRCodeLib.toString(data, {
      type: "svg",
      margin: 1,
      color: { dark: "#0a1c30", light: "#ffffff" },
    })
      .then((s) => {
        if (active) setSvg(s);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [data]);

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
