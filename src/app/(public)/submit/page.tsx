"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, useToast } from "@/lib/store";

export default function SubmitPage() {
  const { db, addSubmission } = useStore();
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  return (
    <div className="wrap" style={{ maxWidth: 880 }}>
      <div className="crumb">
        <Link href="/">Home</Link> / Submit a Home
      </div>
      <div className="sec-head">
        <span className="eyebrow">For Builders</span>
        <h2>Submit Your Home Listing</h2>
        <p>
          Complete the form below to enter your home in the Parade. Our team
          reviews every submission before it goes live.
        </p>
      </div>
      <div className="form-card">
        {!done ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget as any;
              addSubmission({
                id: "sub" + Date.now(),
                builder: f.builder.value,
                home: f.home.value,
                nb: f.nb.value,
                style: f.style.value,
                price: +f.price.value,
                beds: +f.beds.value,
                baths: +f.baths.value,
                sqft: +f.sqft.value,
                status: "pending",
                date: "2026-06-17",
                contact: f.contact.value,
              });
              setDone(true);
              toast("✓ Submission received — pending review");
            }}
          >
            <div className="form-grid">
              <div className="fld">
                <label>Builder / Company Name *</label>
                <input name="builder" required />
              </div>
              <div className="fld">
                <label>Contact Email *</label>
                <input name="contact" type="email" required />
              </div>
              <div className="fld full">
                <label>Home / Model Name *</label>
                <input name="home" required placeholder="The Magnolia Estate" />
              </div>
              <div className="fld">
                <label>Neighborhood *</label>
                <select name="nb" required>
                  {db.neighborhoods.map((n) => (
                    <option key={n.id}>{n.name}</option>
                  ))}
                  <option>Other</option>
                </select>
              </div>
              <div className="fld">
                <label>Architectural Style *</label>
                <select name="style" required>
                  <option>Luxury</option>
                  <option>Estate</option>
                  <option>Farmhouse</option>
                  <option>Coastal</option>
                  <option>Transitional</option>
                  <option>Modern</option>
                </select>
              </div>
              <div className="fld">
                <label>List Price ($) *</label>
                <input name="price" type="number" required placeholder="450000" />
              </div>
              <div className="fld">
                <label>Square Feet *</label>
                <input name="sqft" type="number" required placeholder="2400" />
              </div>
              <div className="fld">
                <label>Bedrooms *</label>
                <input name="beds" type="number" required placeholder="4" />
              </div>
              <div className="fld">
                <label>Bathrooms *</label>
                <input name="baths" type="number" step="0.5" required placeholder="3" />
              </div>
              <div className="fld full">
                <label>Key Features (comma separated)</label>
                <textarea
                  name="features"
                  rows={2}
                  placeholder="Heated pool, smart home, 3-car garage…"
                ></textarea>
              </div>
              <div className="fld full">
                <label>Description</label>
                <textarea
                  name="desc"
                  rows={3}
                  placeholder="Tell visitors what makes this home special…"
                ></textarea>
              </div>
              <div className="fld full">
                <label className="check">
                  <input type="checkbox" required />
                  <span>
                    I confirm I am authorized to list this home and the details
                    are accurate. *
                  </span>
                </label>
              </div>
            </div>
            <button
              className="btn btn-gold btn-block"
              style={{ marginTop: "1.2rem" }}
              type="submit"
            >
              Submit for Review →
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "1.4rem" }}>
            <div style={{ fontSize: "3rem" }}>✅</div>
            <h3>Submission received!</h3>
            <p className="muted">
              Thanks! Our team will review your listing and notify you by email
              once it&apos;s approved. You can track its status in the admin
              portal.
            </p>
            <Link href="/" className="btn btn-gold">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
