"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";

type Tier = "platinum" | "gold" | "silver";

type Draft = {
  id?: string;
  name: string;
  tier: Tier;
  color: string;
  cat: string;
  img: string;
};

const empty: Draft = {
  name: "",
  tier: "platinum",
  color: "#1b2a4a",
  cat: "",
  img: "",
};

const tierBadge: Record<Tier, string> = {
  platinum: "badge-navy",
  gold: "badge-gold",
  silver: "badge-green",
};

export default function AdminSponsorsPage() {
  const { db, saveEntity, deleteEntity } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);

  const set = <K extends keyof Draft>(key: K, val: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h1 style={{ fontSize: "1.7rem" }}>Sponsors</h1>
          <p className="muted" style={{ marginTop: "-.4rem" }}>
            {db.sponsors.length} sponsors
          </p>
        </div>
        <button
          className="btn btn-gold btn-sm"
          onClick={() => {
            setDraft(empty);
            setOpen(true);
          }}
        >
          Add Sponsor
        </button>
      </div>

      <div className="tbl-wrap" style={{ marginTop: "1.2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Sponsor</th>
              <th>Tier</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.sponsors.map((s) => (
              <tr key={s.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: ".7rem",
                      alignItems: "center",
                    }}
                  >
                    {s.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.img}
                        alt=""
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          objectFit: "contain",
                          background: "#fff",
                          border: "1px solid var(--line)",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          background: s.color,
                          display: "block",
                          flexShrink: 0,
                          border: "1px solid var(--line)",
                        }}
                      />
                    )}
                    <b style={{ fontSize: ".86rem" }}>{s.name}</b>
                  </div>
                </td>
                <td>
                  <span className={`badge ${tierBadge[s.tier as Tier]}`}>
                    {s.tier}
                  </span>
                </td>
                <td>{s.cat}</td>
                <td>
                  <div className="pill-row">
                    <button
                      className="ico-btn"
                      onClick={() => {
                        setDraft({ ...s, tier: s.tier as Tier });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="ico-btn danger"
                      onClick={async () => {
                        if (window.confirm("Delete this sponsor?")) {
                          await deleteEntity("sponsors", s.id);
                          toast("Deleted");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title={draft.id ? "Edit Sponsor" : "Add Sponsor"}
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveEntity("sponsors", { ...draft });
              setOpen(false);
              toast("Saved");
            }}
          >
            <div className="form-grid">
              <div className="fld">
                <label>Name</label>
                <input
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>
              <div className="fld">
                <label>Tier</label>
                <select
                  value={draft.tier}
                  onChange={(e) => set("tier", e.target.value as Tier)}
                >
                  <option value="platinum">platinum</option>
                  <option value="gold">gold</option>
                  <option value="silver">silver</option>
                </select>
              </div>
              <div className="fld">
                <label>Color</label>
                <input
                  type="color"
                  value={draft.color}
                  onChange={(e) => set("color", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>Category</label>
                <input
                  value={draft.cat}
                  onChange={(e) => set("cat", e.target.value)}
                />
              </div>
              <div className="fld full">
                <ImageUpload
                  label="Sponsor Logo"
                  value={draft.img}
                  onChange={(url) => set("img", url)}
                />
              </div>
            </div>
            <div className="pill-row" style={{ marginTop: "1rem" }}>
              <button type="submit" className="btn btn-gold btn-sm">
                Save
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
