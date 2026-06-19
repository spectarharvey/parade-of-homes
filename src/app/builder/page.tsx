"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/lib/store";
import { money } from "@/lib/format";
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
interface BuilderSubmission {
  id: string;
  home: string;
  nb: string;
  style: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: "pending" | "approved" | "rejected";
  date: string;
  blurb: string;
  imgs: string[];
}

const STYLES = ["Luxury", "Estate", "Farmhouse", "Coastal", "Transitional", "Modern"];
const emptyDraft = {
  home: "",
  nb: "",
  style: "Luxury",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  blurb: "",
  imgs: [] as string[],
};

export default function BuilderPortalPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [submissions, setSubmissions] = useState<BuilderSubmission[]>([]);
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...emptyDraft });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/builder/overview");
    if (!res.ok) return;
    const data = await res.json();
    setEmail(data.email);
    setProfile(data.builder);
    setSubmissions(data.submissions || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  async function submitListing(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/builder/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("✓ Listing submitted for review");
      setDraft({ ...emptyDraft });
      await load();
    } catch (e) {
      toast((e as Error).message || "Could not submit");
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
        Signed in as {email}. Submit new homes and manage your profile — the
        Parade team reviews each submission before it goes live.
      </p>

      <div className="grid-2" style={{ alignItems: "start", marginTop: "1.4rem" }}>
        {/* Submit a new listing */}
        <div className="panel">
          <h3>Submit a Home / Neighborhood</h3>
          <form onSubmit={submitListing}>
            <div className="form-grid">
              <div className="fld full">
                <label>Home / Model Name *</label>
                <input
                  required
                  value={(draft.home as string) || ""}
                  onChange={(e) => setDraft({ ...draft, home: e.target.value })}
                  placeholder="The Magnolia Estate"
                />
              </div>
              <div className="fld">
                <label>Neighborhood</label>
                <input
                  value={(draft.nb as string) || ""}
                  onChange={(e) => setDraft({ ...draft, nb: e.target.value })}
                  placeholder="Stone Creek"
                />
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
                <label>List Price ($)</label>
                <input
                  type="number"
                  value={(draft.price as string) || ""}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  placeholder="450000"
                />
              </div>
              <div className="fld">
                <label>Square Feet</label>
                <input
                  type="number"
                  value={(draft.sqft as string) || ""}
                  onChange={(e) => setDraft({ ...draft, sqft: e.target.value })}
                  placeholder="2400"
                />
              </div>
              <div className="fld">
                <label>Bedrooms</label>
                <input
                  type="number"
                  value={(draft.beds as string) || ""}
                  onChange={(e) => setDraft({ ...draft, beds: e.target.value })}
                  placeholder="4"
                />
              </div>
              <div className="fld">
                <label>Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  value={(draft.baths as string) || ""}
                  onChange={(e) => setDraft({ ...draft, baths: e.target.value })}
                  placeholder="3"
                />
              </div>
              <div className="fld full">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={(draft.blurb as string) || ""}
                  onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
                  placeholder="Tell visitors what makes this home special…"
                />
              </div>
            </div>
            <p
              className="muted"
              style={{ fontSize: ".78rem", margin: "1rem 0 .4rem", fontWeight: 700 }}
            >
              Photos (upload up to 4)
            </p>
            <div className="form-grid">
              {[0, 1, 2, 3].map((i) => (
                <ImageUpload
                  key={i}
                  value={imgs[i]}
                  label={`Photo ${i + 1}`}
                  onChange={(url) => setImg(i, url)}
                />
              ))}
            </div>
            <button
              className="btn btn-gold btn-block"
              style={{ marginTop: "1.2rem" }}
              type="submit"
              disabled={saving}
            >
              {saving ? "Submitting…" : "Submit for Review →"}
            </button>
          </form>
        </div>

        {/* Profile + submissions */}
        <div>
          {profile && (
            <div className="panel">
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
                    onChange={(e) =>
                      setProfile({ ...profile, years: Number(e.target.value) })
                    }
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

          <div className="panel">
            <h3>Your Submissions ({submissions.length})</h3>
            {submissions.length === 0 ? (
              <div className="empty" style={{ padding: "1.4rem" }}>
                No submissions yet. Use the form to submit your first listing.
              </div>
            ) : (
              submissions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    gap: ".8rem",
                    alignItems: "center",
                    padding: ".7rem 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {s.imgs?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.imgs[0]}
                      alt=""
                      style={{ width: 52, height: 40, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : null}
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: ".88rem" }}>{s.home}</b>
                    <div className="muted" style={{ fontSize: ".76rem" }}>
                      {s.style} · {money(s.price)} · {s.beds}bd/{s.baths}ba
                    </div>
                  </div>
                  <span
                    className={
                      "badge " +
                      (s.status === "approved"
                        ? "badge-green"
                        : s.status === "rejected"
                          ? "badge-red"
                          : "badge-amber")
                    }
                  >
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
