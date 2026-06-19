"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Search } from "lucide-react";

export default function FAQPage() {
  const { db } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = db.faqs
    .map((faq, index) => ({ ...faq, originalIndex: index }))
    .filter(
      (f) =>
        f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="wrap" style={{ maxWidth: 800, paddingBottom: "3rem" }}>
      <div className="crumb" style={{ marginBottom: "1.5rem" }}>
        <Link href="/">Home</Link> / FAQ
      </div>
      
      <div className="sec-head" style={{ marginBottom: "2rem", textAlign: "center" }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: "0.5rem" }}>Have Questions?</span>
        <h2 style={{ fontSize: "2.2rem", color: "var(--navy-deep)", fontWeight: 700 }}>Frequently Asked Questions</h2>
        <p style={{ maxWidth: "600px", margin: "0 auto", color: "var(--muted)" }}>
          Find answers to common questions about touring homes, contest entries, ratings, check-ins, and builders.
        </p>
      </div>

      {/* Search Box */}
      <div style={{ position: "relative", marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpenIndex(null);
          }}
          style={{
            width: "100%",
            padding: "0.9rem 2.5rem 0.9rem 2.8rem",
            borderRadius: "6px",
            border: "1px solid var(--line)",
            fontSize: "1rem",
            background: "#ffffff",
            outline: "none",
          }}
        />
        <svg
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            pointerEvents: "none"
          }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: "0.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Clear search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Search results banner if search active */}
      {searchQuery && (
        <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--muted)" }}>
          Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"} matching "{searchQuery}"
        </div>
      )}

      {/* FAQ Accordion List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={f.originalIndex}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  background: "#ffffff",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 1.2rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    outline: "none",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: isOpen ? "var(--navy)" : "var(--ink)",
                    gap: "1rem"
                  }}
                >
                  <span>{f.q}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: isOpen ? "var(--navy)" : "var(--muted)",
                      flexShrink: 0
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {/* Collapsible content wrapper */}
                <div
                  style={{
                    maxHeight: isOpen ? "500px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    transition: "max-height 0.25s ease, opacity 0.2s ease",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      padding: "0 1.2rem 1.2rem 1.2rem",
                      color: "var(--muted)",
                      lineHeight: "1.6",
                      fontSize: "0.95rem",
                      borderTop: "1px solid var(--line)",
                      paddingTop: "0.8rem",
                    }}
                  >
                    {f.a}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: "3rem 1.5rem", background: "#ffffff", borderRadius: "6px", border: "1px solid var(--line)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Search size={32} style={{ color: "var(--muted)", marginBottom: "0.8rem" }} />
            <h3 style={{ fontSize: "1.2rem", color: "var(--navy-deep)", margin: "0 0 0.4rem" }}>No results found</h3>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>We couldn&apos;t find any FAQs matching your query.</p>
          </div>
        )}
      </div>

      {/* Premium Support Banner */}
      <div
        style={{
          marginTop: "3rem",
          background: "linear-gradient(135deg, var(--navy-deep), var(--navy))",
          borderRadius: "8px",
          padding: "2rem",
          color: "#ffffff",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <h3 style={{ fontSize: "1.5rem", color: "#ffffff", margin: "0 0 0.5rem", fontWeight: 700 }}>Still have questions?</h3>
          <p style={{ color: "#d0dbec", maxWidth: "520px", margin: "0 auto 1.5rem", fontSize: "0.95rem", lineHeight: "1.6" }}>
            Our event team is ready to help you coordinate your tours, check-in errors, or builder registrations.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:events@mcbia.org" className="btn btn-gold" style={{ border: "none", color: "var(--navy-deep)", padding: "0.75rem 1.5rem" }}>
              Email Support
            </a>
            <a href="tel:3525550100" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#ffffff", padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.05)" }}>
              Call (352) 555-0100
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
