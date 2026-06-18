"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";
import { moneyK } from "@/lib/format";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";

type Draft = {
  id?: string;
  name: string;
  city: string;
  color: string;
  img: string;
  blurb: string;
  low: number | string;
  high: number | string;
};

const empty: Draft = {
  name: "",
  city: "",
  color: "#1b2a4a",
  img: "",
  blurb: "",
  low: "",
  high: "",
};

export default function AdminNeighborhoodsPage() {
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
          <h1 style={{ fontSize: "1.7rem" }}>Neighborhoods</h1>
          <p className="muted" style={{ marginTop: "-.4rem" }}>
            {db.neighborhoods.length} neighborhoods
          </p>
        </div>
        <button
          className="btn btn-gold btn-sm"
          onClick={() => {
            setDraft(empty);
            setOpen(true);
          }}
        >
          Add Neighborhood
        </button>
      </div>

      <div className="tbl-wrap" style={{ marginTop: "1.2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Neighborhood</th>
              <th>City</th>
              <th>Price Range</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.neighborhoods.map((n) => (
              <tr key={n.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: ".7rem",
                      alignItems: "center",
                    }}
                  >
                    {n.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.img}
                        alt=""
                        style={{
                          width: 48,
                          height: 36,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 48,
                          height: 36,
                          borderRadius: 6,
                          background: n.color,
                          display: "block",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <b style={{ fontSize: ".86rem" }}>{n.name}</b>
                  </div>
                </td>
                <td>{n.city}</td>
                <td>
                  {moneyK(n.low)}–{moneyK(n.high)}
                </td>
                <td>
                  <div className="pill-row">
                    <button
                      className="ico-btn"
                      onClick={() => {
                        setDraft({ ...n });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="ico-btn danger"
                      onClick={async () => {
                        if (window.confirm("Delete this neighborhood?")) {
                          await deleteEntity("neighborhoods", n.id);
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
          title={draft.id ? "Edit Neighborhood" : "Add Neighborhood"}
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveEntity("neighborhoods", { ...draft });
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
                <label>City</label>
                <input
                  value={draft.city}
                  onChange={(e) => set("city", e.target.value)}
                  required
                />
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
                <ImageUpload
                  value={draft.img}
                  onChange={(url) => set("img", url)}
                  label="Image"
                />
              </div>
              <div className="fld full">
                <label>Blurb</label>
                <textarea
                  rows={3}
                  value={draft.blurb}
                  onChange={(e) => set("blurb", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>Low Price</label>
                <input
                  type="number"
                  value={draft.low}
                  onChange={(e) => set("low", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>High Price</label>
                <input
                  type="number"
                  value={draft.high}
                  onChange={(e) => set("high", e.target.value)}
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
