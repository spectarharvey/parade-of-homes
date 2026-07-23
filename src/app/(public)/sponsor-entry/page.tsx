"use client";

import { useState } from "react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { US_STATES } from "@/lib/usStates";

const EMPTY = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  companyName: "",
  companyPhone: "",
  companyEmail: "",
  website: "",
  companyStreet: "",
  companyCity: "",
  companyState: "Florida",
  companyZip: "",
  level: "",
  paymentMethod: "",
  signature: "",
  billingFirst: "",
  billingLast: "",
  billingEmail: "",
  billingStreet: "",
  billingStreet2: "",
  billingCity: "",
  billingState: "Florida",
  billingZip: "",
};

type FormState = typeof EMPTY;

export default function SponsorEntryPage() {
  const [f, setF] = useState<FormState>(EMPTY);
  const [uploads, setUploads] = useState<{ logo?: string; ad?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErr(null);
    setSubmitting(true);

    const payload = {
      contactName: f.contactName,
      contactPhone: f.contactPhone,
      contactEmail: f.contactEmail,
      companyName: f.companyName,
      companyPhone: f.companyPhone,
      companyEmail: f.companyEmail,
      website: f.website,
      companyAddress: [f.companyStreet, f.companyCity, `${f.companyState} ${f.companyZip}`].filter(Boolean).join(", "),
      level: f.level,
      paymentMethod: f.paymentMethod,
      signature: f.signature,
      billingName: `${f.billingFirst} ${f.billingLast}`.trim(),
      billingEmail: f.billingEmail,
      billingAddress: [f.billingStreet, f.billingStreet2, f.billingCity, `${f.billingState} ${f.billingZip}`]
        .filter(Boolean)
        .join(", "),
      logo: uploads.logo,
      ad: uploads.ad,
    };

    try {
      const res = await fetch("/api/sponsor-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Submission failed");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="form-card" style={{ textAlign: "center", padding: "2rem", marginTop: "1rem" }}>
          <div style={{ fontSize: "3rem" }}>🤝</div>
          <h2>Sponsorship Received!</h2>
          <p className="muted">
            Thank you for sponsoring the 2026 Parade of Homes. We&apos;ll follow up
            by email and send your invoice based on the sponsorship level and
            payment method you selected.
          </p>
          <div style={{ display: "flex", gap: ".6rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
            <Link href="/" className="btn btn-navy">Back to Home</Link>
            <Link href="/event" className="btn btn-outline">Event Calendar</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ maxWidth: 880 }}>
      <div className="crumb">
        <Link href="/">Home</Link> / <Link href="/event">Event Calendar</Link> / Sponsor Form
      </div>
      <div className="sec-head">
        <span className="eyebrow">2026 Parade Sponsor Form</span>
        <h2>Parade of Homes Sponsorship Form</h2>
        <p className="muted">
          Thank you for sponsoring the 2026 Parade of Homes. Your involvement
          helps MCBIA continue supporting our builders and the local building
          community.
        </p>
      </div>

      <form className="form-card" onSubmit={submit}>
        {/* Contact for the ad */}
        <h3 className="form-section">Contact Person for the Ad</h3>
        <p className="muted form-hint">The main person we can reach out to for information, content, and questions.</p>
        <div className="form-grid">
          <div className="fld full"><label>Contact First / Last Name *</label><input value={f.contactName} onChange={set("contactName")} required /></div>
          <div className="fld"><label>Contact Phone Number *</label><input value={f.contactPhone} onChange={set("contactPhone")} required /></div>
          <div className="fld"><label>Contact Email *</label><input type="email" value={f.contactEmail} onChange={set("contactEmail")} required /></div>
        </div>

        {/* Company info */}
        <h3 className="form-section">Company Info <span className="muted" style={{ fontWeight: 400, fontSize: ".8rem" }}>(shown to the public)</span></h3>
        <div className="form-grid">
          <div className="fld full"><label>Company Name *</label><input value={f.companyName} onChange={set("companyName")} required /></div>
          <div className="fld"><label>Company Phone Number *</label><input value={f.companyPhone} onChange={set("companyPhone")} required /></div>
          <div className="fld"><label>Company Email *</label><input type="email" value={f.companyEmail} onChange={set("companyEmail")} required /></div>
          <div className="fld full"><label>Company Website *</label><input value={f.website} onChange={set("website")} required placeholder="https://" /></div>
          <div className="fld full"><label>Company Address *</label></div>
          <div className="fld full"><input value={f.companyStreet} onChange={set("companyStreet")} placeholder="Street Address" required /></div>
          <div className="fld"><input value={f.companyCity} onChange={set("companyCity")} placeholder="City" required /></div>
          <div className="fld">
            <select value={f.companyState} onChange={set("companyState")}>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="fld"><input value={f.companyZip} onChange={set("companyZip")} placeholder="ZIP / Postal Code" required /></div>
        </div>

        {/* Logo & Ad */}
        <h3 className="form-section">Logo &amp; Ad Files</h3>
        <p className="muted form-hint">
          These are due no later than April 15. If not ready now, we can collect
          them later.
        </p>
        <div className="form-grid">
          <FileUpload label="Company Logo" accept="image/png,image/jpeg,image/webp" onChange={(url) => setUploads((p) => ({ ...p, logo: url }))} help="Large PNG with transparent background, at least 1000px wide. Max 25 MB." />
          <FileUpload label="Ad Graphic" accept="application/pdf,image/png,image/jpeg" onChange={(url) => setUploads((p) => ({ ...p, ad: url }))} help={"PDF, 300 DPI. Full page 8.625in × 11.125in w/ .125in bleed · Half page 7.5in × 5in. Max 25 MB."} />
        </div>

        {/* Level + payment */}
        <h3 className="form-section">Sponsorship / Ad Level</h3>
        <div className="form-grid">
          <div className="fld full">
            <label>Sponsorship / Ad Level * <span className="muted" style={{ fontWeight: 400 }}>(3% fee on card payments)</span></label>
            <select value={f.level} onChange={set("level")} required>
              <option value="">Select your level…</option>
              <option>Premier Associate Entry - $5,000</option>
              <option>Full Page Ad Only - $2,000</option>
              <option>Half Page Ad Only - $1,200</option>
            </select>
          </div>
          <div className="fld full">
            <label>Paying by credit card or check? *</label>
            <select value={f.paymentMethod} onChange={set("paymentMethod")} required>
              <option value="">Select…</option>
              <option>Credit Card</option>
              <option>Check</option>
            </select>
          </div>
        </div>

        {/* Billing */}
        <h3 className="form-section">Billing</h3>
        <div className="form-grid">
          <div className="fld"><label>Billing Contact First Name *</label><input value={f.billingFirst} onChange={set("billingFirst")} required /></div>
          <div className="fld"><label>Billing Contact Last Name *</label><input value={f.billingLast} onChange={set("billingLast")} required /></div>
          <div className="fld full"><label>Billing Email *</label><input type="email" value={f.billingEmail} onChange={set("billingEmail")} required /></div>
          <div className="fld full"><label>Billing Address *</label></div>
          <div className="fld full"><input value={f.billingStreet} onChange={set("billingStreet")} placeholder="Street Address" required /></div>
          <div className="fld full"><input value={f.billingStreet2} onChange={set("billingStreet2")} placeholder="Address Line 2" /></div>
          <div className="fld"><input value={f.billingCity} onChange={set("billingCity")} placeholder="City" required /></div>
          <div className="fld">
            <select value={f.billingState} onChange={set("billingState")}>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="fld"><input value={f.billingZip} onChange={set("billingZip")} placeholder="ZIP Code" required /></div>
        </div>

        {/* Signature */}
        <h3 className="form-section">Signature</h3>
        <div className="fld full">
          <label>Signature (type your full name) *</label>
          <input value={f.signature} onChange={set("signature")} required placeholder="Your full legal name" style={{ fontStyle: "italic", fontFamily: "'Lora', serif" }} />
          <p className="muted form-hint">By signing, you confirm the information above is accurate and authorize MCBIA to invoice you for the selected sponsorship level.</p>
        </div>

        {err && <p style={{ color: "var(--red)", marginTop: "1rem" }}>⚠ {err}</p>}

        <button className="btn btn-gold btn-block" style={{ marginTop: "1.2rem" }} type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Sponsorship →"}
        </button>
      </form>
    </div>
  );
}
