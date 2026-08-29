"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import PayPalCheckout, { type PaidDetails } from "@/components/PayPalCheckout";
import { US_STATES } from "@/lib/usStates";
import { useCms } from "@/lib/cms/context";

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
  const cms = useCms("sponsor-entry");
  const [f, setF] = useState<FormState>(EMPTY);
  const [uploads, setUploads] = useState<{ logo?: string; ad?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paid, setPaid] = useState<PaidDetails | null>(null);
  const [showPay, setShowPay] = useState(false);

  // Reset any in-progress payment if the level or payment method changes.
  useEffect(() => {
    setPaid(null);
    setShowPay(false);
  }, [f.level, f.paymentMethod]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const buildPayload = (payment?: PaidDetails | null) => ({
    contactName: f.contactName,
    contactPhone: f.contactPhone,
    contactEmail: f.contactEmail,
    companyName: f.companyName,
    companyPhone: f.companyPhone,
    companyEmail: f.companyEmail,
    website: f.website,
    companyAddress: [f.companyStreet, f.companyCity, `${f.companyState} ${f.companyZip}`].filter(Boolean).join(", "),
    level: f.level,
    paymentMethod: payment ? "PayPal (paid online)" : f.paymentMethod,
    signature: f.signature,
    billingName: `${f.billingFirst} ${f.billingLast}`.trim(),
    billingEmail: f.billingEmail,
    billingAddress: [f.billingStreet, f.billingStreet2, f.billingCity, `${f.billingState} ${f.billingZip}`]
      .filter(Boolean)
      .join(", "),
    logo: uploads.logo,
    ad: uploads.ad,
    details: payment ? { payment: { paid: true, ...payment } } : undefined,
  });

  const postEntry = async (payment?: PaidDetails | null) => {
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/sponsor-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(payment)),
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

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErr(null);
    if (f.paymentMethod === "Credit Card" && !paid) {
      setShowPay(true);
      setTimeout(
        () => document.getElementById("pay-panel")?.scrollIntoView({ behavior: "smooth", block: "center" }),
        60,
      );
      return;
    }
    await postEntry(paid);
  };

  const handlePaid = async (details: PaidDetails) => {
    setPaid(details);
    await postEntry(details);
  };

  // Sponsorship total incl. 3% card fee, parsed from the selected level (display only).
  const feeBase = (() => {
    const m = f.level.match(/\$([\d,]+)/);
    return m ? Number(m[1].replace(/,/g, "")) : 0;
  })();
  const payTotal = feeBase
    ? (feeBase * 1.03).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "";

  if (done) {
    return (
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="form-card" style={{ textAlign: "center", padding: "2rem", marginTop: "1rem" }}>
          <div style={{ fontSize: "3rem" }}>🤝</div>
          <h2>{cms.t("done.title")}</h2>
          <p className="muted">
            {cms.t("done.body")}{" "}
            {paid ? cms.t("done.paidNote") : cms.t("done.invoiceNote")}
          </p>
          <div style={{ display: "flex", gap: ".6rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
            <Link href="/" className="btn btn-navy">{cms.t("done.cta1")}</Link>
            <Link href="/event" className="btn btn-outline">{cms.t("done.cta2")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ maxWidth: 880 }}>
      <div className="crumb">
        <Link href="/">{cms.t("global.crumb.home")}</Link> /{" "}
        <Link href="/event">{cms.t("global.nav.event")}</Link> / {cms.t("crumb")}
      </div>
      <div className="sec-head">
        <span className="eyebrow">{cms.t("head.eyebrow")}</span>
        <h2>{cms.t("head.title")}</h2>
        <p className="muted">{cms.t("head.blurb")}</p>
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

        {f.paymentMethod === "Credit Card" && showPay && !paid && (
          <div id="pay-panel" className="panel" style={{ marginTop: "1.2rem" }}>
            <b style={{ fontSize: "1rem" }}>Pay your sponsorship fee</b>
            <p className="muted" style={{ fontSize: ".86rem", margin: ".3rem 0 .9rem" }}>
              {f.level || "Selected level"} —{" "}
              <b style={{ color: "var(--navy)" }}>${payTotal}</b> (includes 3% card fee)
            </p>
            <PayPalCheckout formType="sponsor" level={f.level} onPaid={handlePaid} />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ marginTop: ".7rem" }}
              onClick={() => setShowPay(false)}
            >
              ← Back to form
            </button>
          </div>
        )}

        {f.paymentMethod === "Credit Card" && !paid && showPay ? null : (
          <button className="btn btn-gold btn-block" style={{ marginTop: "1.2rem" }} type="submit" disabled={submitting}>
            {submitting
              ? "Submitting…"
              : f.paymentMethod === "Credit Card" && !paid
                ? `Continue to Payment${payTotal ? ` — $${payTotal}` : ""} →`
                : "Submit Sponsorship →"}
          </button>
        )}
      </form>
    </div>
  );
}
