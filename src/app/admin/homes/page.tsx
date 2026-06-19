"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";
import { money, stars, homePhoto } from "@/lib/format";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import type { Home } from "@/lib/types";

type HomeDraft = Partial<Record<keyof Home, unknown>> & {
  imgs?: string[];
  features?: string | string[];
};

const emptyHome = (): HomeDraft => ({
  name: "",
  builder: "",
  nb: "",
  style: "",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  garage: "",
  blurb: "",
  features: "",
  imgs: [],
  featured: false,
  x: "",
  y: "",
});

export default function AdminHomesPage() {
  const { db, builder, nbhd, toggleFeatureHome, deleteEntity, saveEntity } =
    useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HomeDraft>(emptyHome);

  const openAdd = () => {
    setDraft(emptyHome());
    setOpen(true);
  };

  const openEdit = (h: Home) => {
    setDraft({
      ...h,
      imgs: [...(h.imgs || [])],
      features: (h.features || []).join(", "),
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveEntity("homes", draft as Record<string, unknown>);
      setOpen(false);
      toast(draft.id ? "Listing updated" : "Listing added");
    } catch (err) {
      toast((err as Error).message || "Save failed");
    }
  };

  const imgs = draft.imgs || [];
  const setImg = (i: number, url: string) => {
    const next = [...imgs];
    next[i] = url;
    setDraft({ ...draft, imgs: next });
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h1 style={{ fontSize: "1.7rem" }}>Home Listings Manager</h1>
          <p className="muted" style={{ marginTop: "-.4rem" }}>
            {db.homes.length} live listings ·{" "}
            {db.homes.reduce((s, h) => s + h.checkins, 0)} total check-ins
          </p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={openAdd}>
          Add Home
        </button>
      </div>
      <div className="tbl-wrap" style={{ marginTop: "1.2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Home</th>
              <th>Builder</th>
              <th>Style</th>
              <th>Price</th>
              <th>Check-Ins</th>
              <th>Avg Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.homes.map((h) => (
              <tr key={h.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: ".7rem",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={homePhoto(h)}
                      style={{
                        width: "48px",
                        height: "36px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                    <div>
                      <b style={{ fontSize: ".86rem" }}>{h.name}</b>
                      <div className="muted" style={{ fontSize: ".74rem" }}>
                        {nbhd(h.nb)?.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{builder(h.builder)?.name}</td>
                <td>
                  <span className="badge badge-navy">{h.style}</span>
                </td>
                <td>{money(h.price)}</td>
                <td>{h.checkins}</td>
                <td>
                  <span className="stars">{stars(h.rating)}</span>
                  <div className="muted" style={{ fontSize: ".72rem" }}>
                    {h.rating} ({h.ratings})
                  </div>
                </td>
                <td>
                  {h.featured ? (
                    <span className="badge badge-gold">★ Featured</span>
                  ) : (
                    <span className="badge badge-green">Live</span>
                  )}
                </td>
                <td>
                  <div className="pill-row">
                    <button className="ico-btn" onClick={() => openEdit(h)}>
                      Edit
                    </button>
                    <button
                      className="ico-btn"
                      onClick={() => toggleFeatureHome(h.id)}
                    >
                      {h.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      className="ico-btn danger"
                      onClick={async () => {
                        if (window.confirm("Remove this listing?")) {
                          try {
                            await deleteEntity("homes", h.id);
                            toast("Listing removed");
                          } catch (err) {
                            toast((err as Error).message || "Remove failed");
                          }
                        }
                      }}
                    >
                      Remove
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
          title={draft.id ? "Edit Home" : "Add Home"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit}>
            <div className="fld">
              <label>Name</label>
              <input
                value={(draft.name as string) || ""}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </div>
            <div className="form-grid">
              <div className="fld">
                <label>Builder</label>
                <select
                  value={(draft.builder as string) || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, builder: e.target.value })
                  }
                  required
                >
                  <option value="">Select builder…</option>
                  {db.builders.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label>Neighborhood</label>
                <select
                  value={(draft.nb as string) || ""}
                  onChange={(e) => setDraft({ ...draft, nb: e.target.value })}
                  required
                >
                  <option value="">Select neighborhood…</option>
                  {db.neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fld">
              <label>Style</label>
              <input
                value={(draft.style as string) || ""}
                onChange={(e) => setDraft({ ...draft, style: e.target.value })}
              />
            </div>
            <div className="form-grid">
              <div className="fld">
                <label>Price</label>
                <input
                  type="number"
                  value={(draft.price as string) ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, price: e.target.value })
                  }
                />
              </div>
              <div className="fld">
                <label>Beds</label>
                <input
                  type="number"
                  value={(draft.beds as string) ?? ""}
                  onChange={(e) => setDraft({ ...draft, beds: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Baths</label>
                <input
                  type="number"
                  value={(draft.baths as string) ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, baths: e.target.value })
                  }
                />
              </div>
              <div className="fld">
                <label>Sq Ft</label>
                <input
                  type="number"
                  value={(draft.sqft as string) ?? ""}
                  onChange={(e) => setDraft({ ...draft, sqft: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Garage</label>
                <input
                  type="number"
                  value={(draft.garage as string) ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, garage: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="fld">
                <label>Map X %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={(draft.x as string) ?? ""}
                  onChange={(e) => setDraft({ ...draft, x: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Map Y %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={(draft.y as string) ?? ""}
                  onChange={(e) => setDraft({ ...draft, y: e.target.value })}
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
              <label>Features (comma-separated)</label>
              <textarea
                rows={2}
                value={(draft.features as string) || ""}
                onChange={(e) =>
                  setDraft({ ...draft, features: e.target.value })
                }
              />
            </div>
            <div className="form-grid">
              {[0, 1, 2, 3].map((i) => (
                <ImageUpload
                  key={i}
                  label={`Photo ${i + 1}`}
                  value={imgs[i]}
                  onChange={(url) => setImg(i, url)}
                />
              ))}
            </div>
            <div className="fld">
              <label
                style={{
                  display: "flex",
                  gap: ".5rem",
                  alignItems: "center",
                  fontSize:"14px"
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
              Save Home
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
