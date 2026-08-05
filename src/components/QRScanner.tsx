"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-screen camera QR scanner. Opens the rear camera, decodes QR codes, and
 * calls `onScan` with the decoded text on the first hit. Uses the native
 * BarcodeDetector API where available (Android/Chrome) and falls back to the
 * `jsqr` decoder (iOS Safari, which has no BarcodeDetector).
 */
export default function QRScanner({
  onScan,
  onClose,
}: {
  onScan: (text: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");

  // Keep the latest onScan without restarting the camera when it changes.
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let busy = false;
    let done = false;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Prefer the native detector; lazily load jsqr only if it's missing.
    const BD = (window as unknown as { BarcodeDetector?: any }).BarcodeDetector;
    let detector: any = BD ? new BD({ formats: ["qr_code"] }) : null;
    let jsQR: ((d: Uint8ClampedArray, w: number, h: number, o?: any) => any) | null = null;

    const finish = (text: string) => {
      if (done || cancelled) return;
      done = true;
      onScanRef.current(text);
    };

    const tick = async () => {
      if (busy || done || cancelled) return;
      const video = videoRef.current;
      if (!video || video.readyState < video.HAVE_ENOUGH_DATA || !ctx) return;
      busy = true;
      try {
        if (detector) {
          const codes = await detector.detect(video);
          if (codes?.length && codes[0].rawValue) finish(codes[0].rawValue);
        } else {
          if (!jsQR) jsQR = (await import("jsqr")).default;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, {
            inversionAttempts: "dontInvert",
          });
          if (code?.data) finish(code.data);
        }
      } catch {
        /* transient decode/detector error — keep scanning */
      } finally {
        busy = false;
      }
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        timer = setInterval(tick, 300);
      } catch (e) {
        const name = (e as { name?: string })?.name;
        setError(
          name === "NotAllowedError" || name === "SecurityError"
            ? "Camera access was blocked. Allow camera permission in your browser to scan the check-in code."
            : "Couldn't open the camera on this device."
        );
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {!error && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "min(70vw, 260px)",
                aspectRatio: "1 / 1",
                border: "3px solid rgba(255,255,255,.9)",
                borderRadius: 18,
                boxShadow: "0 0 0 100vmax rgba(0,0,0,.45)",
              }}
            />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "1rem 1.2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#fff",
          }}
        >
          <b style={{ fontSize: ".95rem" }}>Scan Check-In Code</b>
          <button
            onClick={onClose}
            aria-label="Close scanner"
            style={{
              background: "rgba(0,0,0,.5)",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              width: 36,
              height: 36,
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              padding: "2rem",
              textAlign: "center",
              color: "#fff",
              background: "rgba(0,0,0,.85)",
            }}
          >
            <div>
              <p style={{ marginBottom: "1.2rem", lineHeight: 1.5 }}>{error}</p>
              <button className="btn btn-gold" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {!error && (
        <div
          style={{
            padding: "1rem",
            textAlign: "center",
            color: "#fff",
            background: "#0a1c30",
            fontSize: ".85rem",
          }}
        >
          Point your camera at the QR code posted inside the home.
        </div>
      )}
    </div>
  );
}
