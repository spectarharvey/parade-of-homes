"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";

/** Single-image uploader: uploads to Cloudinary and returns the resulting URL. */
export default function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const { uploadImage } = useStore();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  return (
    <div className="fld">
      <label>{label}</label>
      <div style={{ display: "flex", gap: ".7rem", alignItems: "center" }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            style={{
              width: 56,
              height: 56,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid var(--line)",
            }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              background: "var(--cream)",
              border: "1px dashed var(--line)",
              display: "grid",
              placeItems: "center",
              fontSize: ".7rem",
              color: "var(--muted)",
            }}
          >
            none
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              const url = await uploadImage(file);
              onChange(url);
              toast("Image uploaded");
            } catch (err) {
              toast((err as Error).message || "Upload failed");
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
        {busy && <span className="muted" style={{ fontSize: ".8rem" }}>Uploading…</span>}
      </div>
      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginTop: ".4rem", fontSize: ".75rem" }}
          placeholder="Image URL"
        />
      )}
    </div>
  );
}
