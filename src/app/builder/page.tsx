"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/lib/store";
import { money, homePhoto } from "@/lib/format";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";

interface BuilderProfile {
  id: string;
  name: string;
  blurb: string;
  phone: string;
  website: string;
  ad: string;
  years: number;
}
interface NbOption { id: string; name: string; city: string }
interface MyHome {
  id: string;
  name: string;
  nb: string;
  style: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  garage: number;
  blurb: string;
  features: string[];
  imgs: string[];
  featured: boolean;
}

const STYLES = ["Luxury", "Estate", "Farmhouse", "Coastal", "Transitional", "Modern"];
const emptyHome = (): Record<string, unknown> => ({
  name: "",
  nb: "",
  style: "Luxury",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  garage: "",
  blurb: "",
  features: "",
  imgs: [] as string[],
});

export default function BuilderPortalPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [homes, setHomes] = useState<MyHome[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NbOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(emptyHome());

  const load = useCallback(async () => {
    const res = await fetch("/api/builder/overview");
    if (!res.ok) return;
    const data = await res.json();
    setEmail(data.email);
    setProfile(data.builder);
    setHomes(data.homes || []);
    setNeighborhoods(data.neighborhoods || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setDraft({ ...emptyHome(), nb: neighborhoods[0]?.id || "" });
    setOpen(true);
  };
  const openEdit = (h: MyHome) => {
    setDraft({ ...h, features: (h.features || []).join(", "), imgs: h.imgs || [] });
    setOpen(true);
  };

  async function saveHome(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const id = draft.id as string | undefined;
      const res = await fetch(
        id ? `/api/builder/homes/${id}` : "/api/builder/homes",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error);
      toast(id ? "Home updated" : "Home posted — it's now live on the site");
      setOpen(false);
      await load();
    } catch (err) {
      toast((err as Error).message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteHome(h: MyHome) {
    if (!window.confirm(`Remove "${h.name}" from the Parade?`)) return;
    try {
      const res = await fetch(`/api/builder/homes/${h.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Home removed");
      await load();
    } catch (err) {
      toast((err as Error).message || "Could not delete");
    }
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/builder/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Profile saved");
      await load();
    } catch (e) {
      toast((e as Error).message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const imgs = (draft.imgs as string[]) || [];
  const setImg = (i: number, url: string) => {
    const next = [...imgs];
    next[i] = url;
    setDraft({ ...draft, imgs: next.filter(Boolean) });
  };

  return (
    <div className="wrap" style={{ paddingTop: "1.4rem", paddingBottom: "2rem" }}>
      <span className="eyebrow">Builder Portal</span>
      <h1 style={{ fontSize: "1.9rem", marginTop: ".2rem" }}>
        {profile ? profile.name : "Welcome"}
      </h1>
      <p className="muted" style={{ marginTop: "-.3rem" }}>
        Signed in as {email}. Homes you post here go live on the public site under
        your name and appear in the Parade admin.
      </p>

      <div className="admin-toolbar">
        <h2 style={{ fontSize: "1.3rem", margin: 0 }}>My Homes ({homes.length})</h2>
        <button className="btn btn-gold btn-sm" onClick={openAdd} disabled={!profile}>
          + Post a Home
        </button>
      </div>

      {homes.length === 0 ? (
        <div className="empty" style={{ padding: "2rem" }}>
          You haven&apos;t posted any homes yet. Click <b>Post a Home</b> to add your
          first listing — it will appear on the public site right away.
        </div>
      ) : (
        <div className="grid-3">
          {homes.map((h) => (
            <div className="card" key={h.id} style={{ overflow: "hidden" }}>
              <div style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={homePhoto(h as never) || "/placeholder.png"}
                  alt={h.name}
                  style={{ width: "100%", height: 150, objectFit: "cover", background: "var(--cream)" }}
                />
                {h.featured && (
                  <span
                    className="badge badge-gold"
                    style={{ position: "absolute", top: 8, left: 8 }}
                  >
                    ★ Featured
                  </span>
                )}
              </div>
              <div style={{ padding: "1rem" }}>
                <b>{h.name}</b>
                <div className="muted" style={{ fontSize: ".8rem", margin: ".2rem 0 .5rem" }}>
                  {h.style} · {money(h.price)} · {h.beds}bd/{h.baths}ba ·{" "}
                  {h.sqft?.toLocaleString("en-US")} sf
                </div>
                <div className="pill-row">
                  <Link href={`/home/${h.id}`} className="ico-btn" target="_blank">
                    View
                  </Link>
                  <button className="ico-btn" onClick={() => openEdit(h)}>
                    Edit
                  </button>
                  <button className="ico-btn danger" onClick={() => deleteHome(h)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {profile && (
        <div className="panel" style={{ marginTop: "1.6rem" }}>
          <h3>Your Builder Profile</h3>
          <div className="fld" style={{ marginBottom: ".6rem" }}>
            <label>About / Blurb</label>
            <textarea
              rows={3}
              value={profile.blurb}
              onChange={(e) => setProfile({ ...profile, blurb: e.target.value })}
            />
          </div>
          <div className="form-grid">
            <div className="fld">
              <label>Phone</label>
              <input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="fld">
              <label>Website</label>
              <input
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              />
            </div>
            <div className="fld">
              <label>Years in Business</label>
              <input
                type="number"
                value={profile.years}
                onChange={(e) => setProfile({ ...profile, years: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="fld" style={{ margin: ".6rem 0" }}>
            <label>Ad / Promo Text</label>
            <textarea
              rows={2}
              value={profile.ad}
              onChange={(e) => setProfile({ ...profile, ad: e.target.value })}
            />
          </div>
          <button className="btn btn-navy btn-sm" onClick={saveProfile} disabled={saving}>
            Save Profile
          </button>
        </div>
      )}

      {open && (
        <Modal
          title={draft.id ? "Edit Home" : "Post a Home"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={saveHome}>
            <div className="form-grid">
              <div className="fld full">
                <label>Home / Model Name *</label>
                <input
                  required
                  value={(draft.name as string) || ""}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="The Magnolia Estate"
                />
              </div>
              <div className="fld">
                <label>Neighborhood *</label>
                <select
                  required
                  value={(draft.nb as string) || ""}
                  onChange={(e) => setDraft({ ...draft, nb: e.target.value })}
                >
                  <option value="">Select…</option>
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.city})
                    </option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label>Style</label>
                <select
                  value={(draft.style as string) || "Luxury"}
                  onChange={(e) => setDraft({ ...draft, style: e.target.value })}
                >
                  {STYLES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label>Price ($)</label>
                <input type="number" value={(draft.price as string) || ""}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="450000" />
              </div>
              <div className="fld">
                <label>Square Feet</label>
                <input type="number" value={(draft.sqft as string) || ""}
                  onChange={(e) => setDraft({ ...draft, sqft: e.target.value })} placeholder="2400" />
              </div>
              <div className="fld">
                <label>Bedrooms</label>
                <input type="number" value={(draft.beds as string) || ""}
                  onChange={(e) => setDraft({ ...draft, beds: e.target.value })} placeholder="4" />
              </div>
              <div className="fld">
                <label>Bathrooms</label>
                <input type="number" step="0.5" value={(draft.baths as string) || ""}
                  onChange={(e) => setDraft({ ...draft, baths: e.target.value })} placeholder="3" />
              </div>
              <div className="fld">
                <label>Garage (cars)</label>
                <input type="number" value={(draft.garage as string) || ""}
                  onChange={(e) => setDraft({ ...draft, garage: e.target.value })} placeholder="2" />
              </div>
              <div className="fld full">
                <label>Description</label>
                <textarea rows={3} value={(draft.blurb as string) || ""}
                  onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
                  placeholder="What makes this home special…" />
              </div>
              <div className="fld full">
                <label>Features (comma separated)</label>
                <textarea rows={2} value={(draft.features as string) || ""}
                  onChange={(e) => setDraft({ ...draft, features: e.target.value })}
                  placeholder="Heated pool, smart home, 3-car garage…" />
              </div>
            </div>
            <p className="muted" style={{ fontSize: ".78rem", margin: "1rem 0 .4rem", fontWeight: 700 }}>
              Photos (upload up to 4)
            </p>
            <div className="form-grid">
              {[0, 1, 2, 3].map((i) => (
                <ImageUpload key={i} value={imgs[i]} label={`Photo ${i + 1}`}
                  onChange={(url) => setImg(i, url)} />
              ))}
            </div>
            <button className="btn btn-gold btn-block" style={{ marginTop: "1.2rem" }}
              type="submit" disabled={saving}>
              {saving ? "Saving…" : draft.id ? "Save Changes" : "Post Home →"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
