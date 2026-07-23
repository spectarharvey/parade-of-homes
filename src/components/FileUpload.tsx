"use client";

import { useRef, useState } from "react";

// Public file upload for the entry forms. Uploads to /api/entry-upload and
// surfaces the resulting Cloudinary URL via onChange.
export default function FileUpload({
  label,
  accept = "image/png,image/jpeg,image/webp,application/pdf",
  help,
  required,
  onChange,
}: {
  label: string;
  accept?: string;
  help?: string;
  required?: boolean;
  onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<{ busy: boolean; url?: string; name?: string; err?: string }>({ busy: false });

  const handle = async (file?: File) => {
    if (!file) return;
    setState({ busy: true, name: file.name });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/entry-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setState({ busy: false, url: data.url, name: file.name });
      onChange(data.url);
    } catch (e) {
      setState({ busy: false, err: (e as Error).message });
    }
  };

  return (
    <div className="fld full">
      <label>
        {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
      </label>
      {help && (
        <span className="muted" style={{ fontSize: ".76rem", display: "block", marginBottom: ".3rem" }}>
          {help}
        </span>
      )}
      <div className="file-upload">
        <input
          ref={ref}
          type="file"
          accept={accept}
          required={required && !state.url}
          onChange={(e) => handle(e.target.files?.[0])}
        />
        {state.busy && <span className="muted">Uploading…</span>}
        {state.url && <span className="muted" style={{ color: "var(--green)" }}>✓ {state.name}</span>}
        {state.err && <span style={{ color: "var(--red)", fontSize: ".8rem" }}>{state.err}</span>}
      </div>
    </div>
  );
}
