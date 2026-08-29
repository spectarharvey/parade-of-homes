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
  builderName: "",
  builderContact: "",
  builderPhone: "",
  builderEmail: "",
  website: "",
  officeStreet: "",
  officeCity: "",
  officeState: "Florida",
  officeZip: "",
  license: "",
  modelName: "",
  sqftLiving: "",
  sqftTotal: "",
  beds: "",
  baths: "",
  garage: "",
  subdivision: "",
  modelStreet: "",
  modelCity: "",
  modelState: "Florida",
  modelZip: "",
  price: "",
  salePrice: "",
  listingAgent: "",
  buildType: "",
  staged: "",
  features: "",
  finding: "",
  entryLevel: "",
  signature: "",
  billingFirst: "",
  billingLast: "",
  paymentMethod: "",
  billingStreet: "",
  billingStreet2: "",
  billingCity: "",
  billingState: "Florida",
  billingZip: "",
  receiptEmail: "",
};

type FormState = typeof EMPTY;

export default function BuilderEntryPage() {
  const cms = useCms("builder-entry");
  const [f, setF] = useState<FormState>(EMPTY);
  const [subs, setSubs] = useState<{ service: string; name: string }[]>(
    Array.from({ length: 6 }, () => ({ service: "", name: "" }))
  );
  const [uploads, setUploads] = useState<{ front?: string; logo?: string; floor?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paid, setPaid] = useState<PaidDetails | null>(null);
  const [showPay, setShowPay] = useState(false);

  // Reset any in-progress payment if the entry level or payment method changes.
  useEffect(() => {
    setPaid(null);
    setShowPay(false);
  }, [f.entryLevel, f.paymentMethod]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const setSub = (i: number, key: "service" | "name", v: string) =>
    setSubs((p) => p.map((s, idx) => (idx === i ? { ...s, [key]: v } : s)));

  const buildPayload = (payment?: PaidDetails | null) => {
    const features = f.features
      .split("\n")
      .map((x) => x.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 10);

    return {
      contactName: f.contactName,
      contactPhone: f.contactPhone,
      contactEmail: f.contactEmail,
      builderName: f.builderName,
      builderContact: f.builderContact,
      builderPhone: f.builderPhone,
      builderEmail: f.builderEmail,
      website: f.website,
      officeAddress: [f.officeStreet, f.officeCity, `${f.officeState} ${f.officeZip}`].filter(Boolean).join(", "),
      license: f.license,
      modelName: f.modelName,
      sqftLiving: f.sqftLiving,
      sqftTotal: f.sqftTotal,
      beds: f.beds,
      baths: f.baths,
      garage: f.garage,
      subdivision: f.subdivision,
      modelAddress: [f.modelStreet, f.modelCity, `${f.modelState} ${f.modelZip}`].filter(Boolean).join(", "),
      price: f.price,
      buildType: f.buildType,
      staged: f.staged,
      entryLevel: f.entryLevel,
      paymentMethod: payment ? "PayPal (paid online)" : f.paymentMethod,
      signature: f.signature,
      billingName: `${f.billingFirst} ${f.billingLast}`.trim(),
      receiptEmail: f.receiptEmail,
      billingAddress: [f.billingStreet, f.billingStreet2, f.billingCity, `${f.billingState} ${f.billingZip}`]
        .filter(Boolean)
        .join(", "),
      frontElevation: uploads.front,
      logo: uploads.logo,
      floorPlan: uploads.floor,
      details: {
        salePrice: f.salePrice,
        listingAgent: f.listingAgent,
        finding: f.finding,
        features,
        subcontractors: subs.filter((s) => s.service || s.name),
        ...(payment ? { payment: { paid: true, ...payment } } : {}),
      },
    };
  };

  const postEntry = async (payment?: PaidDetails | null) => {
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/builder-entry", {
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
    // Online payers pay first; the entry then submits automatically on capture.
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

  // Entry total incl. 3% card fee, parsed from the selected level (display only).
  const feeBase = (() => {
    const m = f.entryLevel.match(/\$([\d,]+)/);
    return m ? Number(m[1].replace(/,/g, "")) : 0;
  })();
  const payTotal = feeBase
    ? (feeBase * 1.03).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "";

  if (done) {
    return (
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="form-card" style={{ textAlign: "center", padding: "2rem", marginTop: "1rem" }}>
          <div style={{ fontSize: "3rem" }}>🎉</div>
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
        <p style={{ fontSize: ".86rem", color: "var(--red)", fontWeight: 600 }}>
          {cms.t("head.notice")}
        </p>
      </div>

      <form className="form-card" onSubmit={submit}>
        {/* Main Contact */}
        <h3 className="form-section">Main Contact</h3>
        <p className="muted form-hint">
          The person MCBIA will reach out to for information, content, and questions. This is NOT the contact person for the business.
        </p>
        <div className="form-grid">
          <div className="fld full"><label>Main Contact First / Last Name *</label><input value={f.contactName} onChange={set("contactName")} required /></div>
          <div className="fld"><label>Main Contact Phone *</label><input value={f.contactPhone} onChange={set("contactPhone")} required /></div>
          <div className="fld"><label>Main Contact Email *</label><input type="email" value={f.contactEmail} onChange={set("contactEmail")} required /></div>
        </div>

        {/* Builder Contact Info */}
        <h3 className="form-section">Builder Contact Info <span className="muted" style={{ fontWeight: 400, fontSize: ".8rem" }}>(seen by the public)</span></h3>
        <div className="form-grid">
          <div className="fld full"><label>Builder Name *</label><input value={f.builderName} onChange={set("builderName")} required /></div>
          <div className="fld full"><label>Main Contact First / Last Name</label><input value={f.builderContact} onChange={set("builderContact")} placeholder="Leave blank if you don't want to list an individual" /></div>
          <div className="fld"><label>Builder Phone Number *</label><input value={f.builderPhone} onChange={set("builderPhone")} required /></div>
          <div className="fld"><label>Main Builder Contact Email *</label><input type="email" value={f.builderEmail} onChange={set("builderEmail")} required /></div>
          <div className="fld full"><label>Website *</label><input value={f.website} onChange={set("website")} required placeholder="https://" /></div>
          <div className="fld full"><label>Builder / Company OFFICE Address *</label></div>
          <div className="fld full"><input value={f.officeStreet} onChange={set("officeStreet")} placeholder="Street Address" required /></div>
          <div className="fld"><input value={f.officeCity} onChange={set("officeCity")} placeholder="City" required /></div>
          <div className="fld">
            <select value={f.officeState} onChange={set("officeState")}>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="fld"><input value={f.officeZip} onChange={set("officeZip")} placeholder="ZIP Code" required /></div>
          <div className="fld full"><label>Builder License Number *</label><input value={f.license} onChange={set("license")} required /></div>
        </div>
        <p className="muted form-hint">This is the OFFICE address, not the model home address (unless your model home is your sales office).</p>

        {/* Model Home Info */}
        <h3 className="form-section">Model Home Info</h3>
        <div className="form-grid">
          <div className="fld full"><label>Model Name *</label><input value={f.modelName} onChange={set("modelName")} required /></div>
          <div className="fld"><label>Square Footage (Living Area) *</label><input value={f.sqftLiving} onChange={set("sqftLiving")} required /></div>
          <div className="fld"><label>Square Footage (Total Under Roof) * <span className="muted" style={{ fontWeight: 400 }}>(incl. porches, garages)</span></label><input value={f.sqftTotal} onChange={set("sqftTotal")} required /></div>
          <div className="fld"><label>Number of Bedrooms *</label><input value={f.beds} onChange={set("beds")} required /></div>
          <div className="fld"><label>Number of Bathrooms *</label><input value={f.baths} onChange={set("baths")} required /></div>
          <div className="fld"><label>Size of Garage (How many cars?) *</label><input value={f.garage} onChange={set("garage")} placeholder="2 Car, 3 Car…" required /></div>
          <div className="fld full"><label>Is this home in a subdivision? If so, name it. *</label><input value={f.subdivision} onChange={set("subdivision")} placeholder="No / subdivision name" required /></div>
          <div className="fld full"><label>Model Home Address *</label></div>
          <div className="fld full"><input value={f.modelStreet} onChange={set("modelStreet")} placeholder="Street Address" required /></div>
          <div className="fld"><input value={f.modelCity} onChange={set("modelCity")} placeholder="City" required /></div>
          <div className="fld">
            <select value={f.modelState} onChange={set("modelState")}>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="fld"><input value={f.modelZip} onChange={set("modelZip")} placeholder="ZIP / Postal Code" required /></div>
          <div className="fld full"><label>Price of Model AS SHOWN WITH UPGRADES (without lot) *</label><input value={f.price} onChange={set("price")} required placeholder="$" /></div>
          <div className="fld full"><label>If listing for sale, what is the listed sale price WITH lot?</label><input value={f.salePrice} onChange={set("salePrice")} placeholder="If applicable" /></div>
          <div className="fld full"><label>If listing for sale, please provide the listing agent&apos;s information.</label><input value={f.listingAgent} onChange={set("listingAgent")} placeholder="Leave blank if not applicable" /></div>
          <div className="fld"><label>What type of build is this home? *</label>
            <select value={f.buildType} onChange={set("buildType")} required>
              <option value="">Select…</option>
              <option>Custom Home</option>
              <option>Semi-Custom Home</option>
              <option>Spec Home</option>
            </select>
          </div>
          <div className="fld"><label>Will the house be staged? (Recommended) *</label>
            <select value={f.staged} onChange={set("staged")} required>
              <option value="">Select…</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="fld full"><label>List up to 10 Features * <span className="muted" style={{ fontWeight: 400 }}>(one per line, short bullet points)</span></label>
            <textarea rows={5} value={f.features} onChange={set("features")} required placeholder={"Heated pool\nSmart-home automation\n3-car garage"} />
          </div>
          <div className="fld full"><label>Specific instructions for finding the location of the house (if needed).</label><textarea rows={2} value={f.finding} onChange={set("finding")} /></div>
        </div>

        <div className="form-grid" style={{ marginTop: ".6rem" }}>
          <FileUpload label="Upload Front Elevation" required onChange={(url) => setUploads((p) => ({ ...p, front: url }))} help="High-quality image (300 DPI), JPG/PNG/WEBP/PDF, landscape, ideally 2000px+. Max 25 MB." />
          <FileUpload label="Upload Company Logo" required onChange={(url) => setUploads((p) => ({ ...p, logo: url }))} help="Large PNG with transparent background, ideally 1000px+ wide. Max 25 MB." />
          <FileUpload label="Upload 2nd Level Floor Plan (only if 2-story)" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(url) => setUploads((p) => ({ ...p, floor: url }))} help="High-quality (300 DPI), landscape, ideally 1500px+. Max 25 MB." />
        </div>

        {/* Sub-contractors */}
        <h3 className="form-section">Which MCBIA member sub-contractors did you use for this project?</h3>
        <div className="form-grid">
          {subs.map((s, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div className="fld"><label>Service {i + 1}</label><input value={s.service} onChange={(e) => setSub(i, "service", e.target.value)} placeholder="e.g. Roofing" /></div>
              <div className="fld"><label>Sub-Contractor {i + 1}</label><input value={s.name} onChange={(e) => setSub(i, "name", e.target.value)} placeholder="Company name" /></div>
            </div>
          ))}
        </div>

        {/* Entry Level */}
        <h3 className="form-section">Entry Level</h3>
        <div className="fld full" style={{ paddingLeft: 0 }}>
          <label>Entry Level *</label>
          <select value={f.entryLevel} onChange={set("entryLevel")} required>
            <option value="">Select your entry level…</option>
            <option>Standard Builder Entry (Members) - $2,500</option>
            <option>Premier Builder Entry (Members) - $5,000</option>
            <option>Premier Associate Entry (Members) - $5,000</option>
            <option> (after first entry) - $2,000</option>
          </select>
        </div>
        <p className="muted form-hint">A 3% processing fee applies to all credit card payments. You must be a member of MCBIA to enter.</p>

        {/* Billing */}
        <h3 className="form-section">Billing</h3>
        <div className="form-grid">
          <div className="fld"><label>Billing Contact First Name *</label><input value={f.billingFirst} onChange={set("billingFirst")} required /></div>
          <div className="fld"><label>Billing Contact Last Name *</label><input value={f.billingLast} onChange={set("billingLast")} required /></div>
          <div className="fld"><label>Paying by credit card or check? *</label>
            <select value={f.paymentMethod} onChange={set("paymentMethod")} required>
              <option value="">Select…</option>
              <option>Credit Card</option>
              <option>Check</option>
            </select>
          </div>
          <div className="fld"><label>Email Address for Receipt *</label><input type="email" value={f.receiptEmail} onChange={set("receiptEmail")} required /></div>
          <div className="fld full"><label>Billing Address *</label></div>
          <div className="fld full"><input value={f.billingStreet} onChange={set("billingStreet")} placeholder="Street Address" required /></div>
          <div className="fld full"><input value={f.billingStreet2} onChange={set("billingStreet2")} placeholder="Address Line 2" /></div>
          <div className="fld"><input value={f.billingCity} onChange={set("billingCity")} placeholder="City" required /></div>
          <div className="fld">
            <select value={f.billingState} onChange={set("billingState")}>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="fld"><input value={f.billingZip} onChange={set("billingZip")} placeholder="ZIP / Postal Code" required /></div>
        </div>

        {/* Signature */}
        <h3 className="form-section">Signature</h3>
        <div className="fld full">
          <label>Signature (type your full name) *</label>
          <input value={f.signature} onChange={set("signature")} required placeholder="Your full legal name" style={{ fontStyle: "italic", fontFamily: "'Lora', serif" }} />
          <p className="muted form-hint">By signing, you confirm the information above is accurate and authorize MCBIA to invoice you for the selected entry level.</p>
        </div>

        {err && <p style={{ color: "var(--red)", marginTop: "1rem" }}>⚠ {err}</p>}

        {f.paymentMethod === "Credit Card" && showPay && !paid && (
          <div id="pay-panel" className="panel" style={{ marginTop: "1.2rem" }}>
            <b style={{ fontSize: "1rem" }}>Pay your entry fee</b>
            <p className="muted" style={{ fontSize: ".86rem", margin: ".3rem 0 .9rem" }}>
              {f.entryLevel || "Selected level"} —{" "}
              <b style={{ color: "var(--navy)" }}>${payTotal}</b> (includes 3% card fee)
            </p>
            <PayPalCheckout formType="builder" level={f.entryLevel} onPaid={handlePaid} />
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
                : "Submit Entry →"}
          </button>
        )}
      </form>
    </div>
  );
}
