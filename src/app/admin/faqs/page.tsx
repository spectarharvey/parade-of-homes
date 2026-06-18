"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";
import Modal from "@/components/Modal";

type Draft = {
  id?: string;
  q: string;
  a: string;
  order: number | string;
};

export default function AdminFaqsPage() {
  const { db, saveEntity, deleteEntity } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ q: "", a: "", order: 0 });

  const set = <K extends keyof Draft>(key: K, val: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const sorted = db.faqs
    .map((f, i) => ({ f, i }))
    .sort((a, b) => (a.f.order ?? a.i) - (b.f.order ?? b.i) || a.i - b.i)
    .map((x) => x.f);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h1 style={{ fontSize: "1.7rem" }}>FAQs</h1>
          <p className="muted" style={{ marginTop: "-.4rem" }}>
            {db.faqs.length} questions
          </p>
        </div>
        <button
          className="btn btn-gold btn-sm"
          onClick={() => {
            setDraft({ q: "", a: "", order: db.faqs.length });
            setOpen(true);
          }}
        >
          Add FAQ
        </button>
      </div>

      <div className="tbl-wrap" style={{ marginTop: "1.2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f) => (
              <tr key={f.id}>
                <td>
                  <b style={{ fontSize: ".86rem" }}>{f.q}</b>
                </td>
                <td>
                  <span className="muted" style={{ fontSize: ".8rem" }}>
                    {f.a.length > 90 ? f.a.slice(0, 90) + "…" : f.a}
                  </span>
                </td>
                <td>
                  <div className="pill-row">
                    <button
                      className="ico-btn"
                      onClick={() => {
                        setDraft({ ...f, order: f.order ?? 0 });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="ico-btn danger"
                      onClick={async () => {
                        if (f.id && window.confirm("Delete this FAQ?")) {
                          await deleteEntity("faqs", f.id);
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
          title={draft.id ? "Edit FAQ" : "Add FAQ"}
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveEntity("faqs", { ...draft });
              setOpen(false);
              toast("Saved");
            }}
          >
            <div className="form-grid">
              <div className="fld full">
                <label>Question</label>
                <input
                  value={draft.q}
                  onChange={(e) => set("q", e.target.value)}
                  required
                />
              </div>
              <div className="fld full">
                <label>Answer</label>
                <textarea
                  rows={4}
                  value={draft.a}
                  onChange={(e) => set("a", e.target.value)}
                />
              </div>
              <div className="fld">
                <label>Order</label>
                <input
                  type="number"
                  value={draft.order}
                  onChange={(e) => set("order", e.target.value)}
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
