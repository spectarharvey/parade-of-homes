import { qrSVG } from "@/lib/format";

/** Renders the decorative deterministic QR as inline SVG. */
export default function QRCode({
  seed,
  className = "qr",
  style,
}: {
  seed: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: qrSVG(seed) }}
    />
  );
}
