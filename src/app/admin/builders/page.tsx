"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";
import Modal from "@/components/Modal";
import type { Builder } from "@/lib/types";

type BuilderDraft = Partial<Record<keyof Builder, unknown>>;

const emptyBuilder = (): BuilderDraft => ({
  name: "",
  initials: "",
  color: "#2c3e50",
  phone: "",
  website: "",
  years: "",
  blurb: "",
  ad: "",
  featured: false,
});

export default function AdminBuildersPage() {
  const { db, setFeaturedBuilder, saveEntity, deleteEntity } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<BuilderDraft>(emptyBuilder);
  const [loginFor, setLoginFor] = useState<Builder | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  const provisionLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginFor) return;
    try {
      const res = await fetch(`/api/admin/builders/${loginFor.id}/account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPw }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Builder login saved");
      setLoginFor(null);
      setLoginEmail("");
      setLoginPw("");
    } catch (err) {
      toast((err as Error).message || "Could not save login");
    }
  };

  const openAdd = () => {
    setDraft(emptyBuilder());
    setOpen(true);
  };

  const openEdit = (b: Builder) => {
    setDraft({ ...b });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveEntity("builders", draft as Record<string, unknown>);
      setOpen(false);
      toast(draft.id ? "Builder updated" : "Builder added");
    } catch (err) {
      toast((err as Error).message || "Save failed");
    }
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h1 style={{ fontSize: "1.7rem" }}>Builder Manager</h1>
          <p className="muted" style={{ marginTop: "-.4rem" }}>
            Set the featured builder and edit each builder&apos;s profile.
          </p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={openAdd}>
          Add Builder
        </button>
      </div>
      <div className="grid-2" style={{ marginTop: "1.2rem" }}>
        {db.builders.map((b) => (
          <div className="panel" key={b.id}>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "11px",
                  background: b.color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Lora",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {b.initials}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <b>{b.name}</b>
                  {b.featured ? (
                    <span className="badge badge-gold">★ Featured</span>
                  ) : (
                    <button
                      className="ico-btn"
                      onClick={() => {
                        setFeaturedBuilder(b.id);
                        toast("Featured builder updated");
                      }}
                    >
                      Set Featured
                    </button>
                  )}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: ".8rem", margin: ".2rem 0" }}
                >
                  {db.homes.filter((h) => h.builder === b.id).length} homes ·{" "}
                  {b.phone}
                </div>
                {b.ad && (
                  <div
                    className="muted"
                    style={{ fontSize: ".78rem", marginTop: ".4rem" }}
                  >
                    {b.ad}
                  </div>
                )}
                <div className="pill-row" style={{ marginTop: ".6rem" }}>
                  <button className="ico-btn" onClick={() => openEdit(b)}>
                    Edit
                  </button>
                  <button
                    className="ico-btn"
                    onClick={() => {
                      setLoginFor(b);
                      setLoginEmail("");
                      setLoginPw("");
                    }}
                  >
                    Set Login
                  </button>
                  <button
                    className="ico-btn danger"
                    onClick={async () => {
                      if (window.confirm("Delete this builder?")) {
                        try {
                          await deleteEntity("builders", b.id);
                          toast("Builder deleted");
                        } catch (err) {
                          toast((err as Error).message || "Delete failed");
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal
          title={draft.id ? "Edit Builder" : "Add Builder"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="fld">
                <label>Name</label>
                <input
                  value={(draft.name as string) || ""}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                />
              </div>
              <div className="fld">
                <label>Initials</label>
                <input
                  value={(draft.initials as string) || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, initials: e.target.value })
                  }
                />
              </div>
              <div className="fld">
                <label>Color</label>
                <input
                  type="color"
                  value={(draft.color as string) || "#2c3e50"}
                  onChange={(e) =>
                    setDraft({ ...draft, color: e.target.value })
                  }
                />
              </div>
              <div className="fld">
                <label>Phone</label>
                <input
                  value={(draft.phone as string) || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, phone: e.target.value })
                  }
                />
              </div>
              <div className="fld">
                <label>Website</label>
                <input
                  value={(draft.website as string) || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, website: e.target.value })
                  }
                />
              </div>
              <div className="fld">
                <label>Years</label>
                <input
                  type="number"
                  value={(draft.years as string) ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, years: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="fld full">
              <label>Blurb</label>
              <textarea
                rows={3}
                value={(draft.blurb as string) || ""}
                onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
              />
            </div>
            <div className="fld full">
              <label>Ad Space Text</label>
              <textarea
                rows={2}
                value={(draft.ad as string) || ""}
                onChange={(e) => setDraft({ ...draft, ad: e.target.value })}
              />
            </div>
            <div className="fld">
              <label
                style={{
                  display: "flex",
                  gap: ".5rem",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!draft.featured}
                  onChange={(e) =>
                    setDraft({ ...draft, featured: e.target.checked })
                  }
                />
                Featured
              </label>
            </div>
            <button type="submit" className="btn btn-gold">
              Save Builder
            </button>
          </form>
        </Modal>
      )}

      {loginFor && (
        <Modal
          title={`Builder Login — ${loginFor.name}`}
          onClose={() => setLoginFor(null)}
        >
          <p className="muted" style={{ fontSize: ".84rem", marginTop: 0 }}>
            Create or update the login this builder uses at{" "}
            <b>/builder</b>. Share these credentials with them.
          </p>
          <form onSubmit={provisionLogin}>
            <div className="fld" style={{ marginBottom: ".7rem" }}>
              <label>Login Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="builder@company.com"
              />
            </div>
            <div className="fld" style={{ marginBottom: ".9rem" }}>
              <label>Password (min 6 chars)</label>
              <input
                type="text"
                required
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder="set a password"
              />
            </div>
            <button type="submit" className="btn btn-gold">
              Save Login
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
