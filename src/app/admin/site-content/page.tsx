"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/lib/store";
import ImageUpload from "@/components/ImageUpload";
import { CMS_PAGES } from "@/lib/cms/registry";
import type { CmsField, CmsPageSchema, CmsWrite } from "@/lib/cms/types";
import { RotateCcw } from "lucide-react";

/** Every field on a page, flattened — used for defaults and diffing. */
const fieldsOf = (schema: CmsPageSchema): CmsField[] =>
  schema.sections.flatMap((s) => s.fields);

const defaultsOf = (schema: CmsPageSchema): Record<string, string> =>
  Object.fromEntries(fieldsOf(schema).map((f) => [f.key, f.default]));

export default function AdminSiteContentPage() {
  const { toast } = useToast();
  const [pageSlug, setPageSlug] = useState(CMS_PAGES[0].page);
  const schema = useMemo(
    () => CMS_PAGES.find((p) => p.page === pageSlug) ?? CMS_PAGES[0],
    [pageSlug],
  );

  // `saved` is what the database holds right now (stored value, else default).
  // `values` is what the editor shows. A field is dirty when the two differ.
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setOk(false);
    try {
      const res = await fetch(
        `/api/site-content?page=${encodeURIComponent(schema.page)}&verbose=1`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`Could not load content (${res.status})`);
      const stored = (await res.json()) as Record<string, { value: string }>;
      const base = defaultsOf(schema);
      for (const [key, entry] of Object.entries(stored)) {
        if (key in base) base[key] = entry.value;
      }
      setSaved(base);
      setValues(base);
    } catch (e) {
      setErr((e as Error).message);
      const base = defaultsOf(schema);
      setSaved(base);
      setValues(base);
    } finally {
      setLoading(false);
    }
  }, [schema]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirtyKeys = useMemo(
    () => Object.keys(values).filter((k) => values[k] !== saved[k]),
    [values, saved],
  );

  const set = (key: string, value: string) => {
    setOk(false);
    setValues((v) => ({ ...v, [key]: value }));
  };

  const save = async () => {
    if (!dirtyKeys.length) return;
    setBusy(true);
    setErr(null);
    setOk(false);

    // Only the changed fields go over the wire. A field that is back at its
    // built-in default is sent as `null`, which deletes the override.
    const byKey = Object.fromEntries(fieldsOf(schema).map((f) => [f.key, f]));
    const payload: CmsWrite = {};
    for (const key of dirtyKeys) {
      const field = byKey[key];
      payload[key] =
        values[key] === field.default
          ? null
          : { value: values[key], type: field.type };
    }

    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: schema.page, values: payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Save failed (${res.status})`);
      setSaved(values);
      setOk(true);
      toast(`✓ Saved ${dirtyKeys.length} change${dirtyKeys.length === 1 ? "" : "s"}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Website Content</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        Edit the words and pictures on the public website. Pick a page, change a
        field, and save — the live site updates straight away.
      </p>

      {/* Page tabs — Global first, then each page in nav order. */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: ".4rem",
          margin: "1.2rem 0 1rem",
        }}
      >
        {CMS_PAGES.map((p) => (
          <button
            key={p.page}
            className={
              "btn btn-sm " + (p.page === schema.page ? "btn-navy" : "btn-outline")
            }
            onClick={() => {
              if (
                dirtyKeys.length &&
                !window.confirm(
                  "You have unsaved changes on this page. Switch anyway and lose them?",
                )
              )
                return;
              setPageSlug(p.page);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        className="panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <div>
          <b style={{ fontSize: "1.05rem" }}>{schema.label}</b>
          <div className="muted" style={{ fontSize: ".8rem" }}>
            {schema.blurb ??
              "Anything you leave untouched keeps the wording that is on the site now."}
          </div>
        </div>
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
          <Link
            href={schema.path}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            View page ↗
          </Link>
          <button
            className="btn btn-gold btn-sm"
            onClick={save}
            disabled={busy || loading || !dirtyKeys.length}
          >
            {busy
              ? "Saving…"
              : dirtyKeys.length
                ? `Save ${dirtyKeys.length} change${dirtyKeys.length === 1 ? "" : "s"}`
                : "No changes"}
          </button>
        </div>
      </div>

      {ok && (
        <p
          style={{
            color: "var(--green, #1e7a4c)",
            fontWeight: 600,
            fontSize: ".88rem",
            margin: ".8rem 0 0",
          }}
        >
          ✓ Saved — changes are live on the website.
        </p>
      )}
      {err && (
        <p style={{ color: "var(--red, #c0392b)", fontSize: ".88rem", margin: ".8rem 0 0" }}>
          {err}
        </p>
      )}

      {loading ? (
        <p className="muted" style={{ marginTop: "1.2rem" }}>
          Loading…
        </p>
      ) : (
        schema.sections.map((section) => (
          <div className="panel" key={section.title} style={{ marginTop: "1rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginTop: 0 }}>{section.title}</h3>
            {section.fields.map((field) => (
              <FieldRow
                key={field.key}
                field={field}
                value={values[field.key] ?? field.default}
                dirty={values[field.key] !== saved[field.key]}
                onChange={(v) => set(field.key, v)}
                onReset={() => set(field.key, field.default)}
              />
            ))}
          </div>
        ))
      )}
    </>
  );
}

function FieldRow({
  field,
  value,
  dirty,
  onChange,
  onReset,
}: {
  field: CmsField;
  value: string;
  dirty: boolean;
  onChange: (v: string) => void;
  onReset: () => void;
}) {
  const isDefault = value === field.default;

  return (
    <div
      style={{
        borderTop: "1px solid var(--line)",
        padding: "1rem 0 .2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: ".6rem",
          marginBottom: ".3rem",
        }}
      >
        <label style={{ fontWeight: 600, fontSize: ".88rem" }}>
          {field.label}
          {dirty && (
            <span className="badge badge-amber" style={{ marginLeft: ".5rem", fontSize: ".66rem" }}>
              unsaved
            </span>
          )}
        </label>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onReset}
          disabled={isDefault}
          title="Put the original wording back"
          style={{ padding: ".25rem .6rem", fontSize: ".72rem", gap: ".3rem" }}
        >
          <RotateCcw size={12} /> Reset to default
        </button>
      </div>

      {field.type === "image" ? (
        <ImageUpload label="" value={value} onChange={onChange} />
      ) : field.type === "textarea" ||
        field.type === "multiline" ||
        field.type === "html" ? (
        <textarea
          rows={field.type === "multiline" ? 3 : 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%" }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%" }}
        />
      )}

      {(field.help || field.type === "multiline" || field.type === "url") && (
        <p className="muted" style={{ fontSize: ".74rem", margin: ".25rem 0 0" }}>
          {field.help ??
            (field.type === "multiline"
              ? "Each new line becomes a new line on the website."
              : "A web address, or tel:… / mailto:… for a phone or email link.")}
        </p>
      )}
    </div>
  );
}
