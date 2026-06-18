"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Sparkles, Info, Trophy, Home, MessageSquare, Search } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: Sparkles },
  { id: "general", label: "General Info", icon: Info },
  { id: "contest", label: "Check-in & Contest", icon: Trophy },
  { id: "homes", label: "Homes & Builders", icon: Home }
];

export default function FAQPage() {
  const { db } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const getCategory = (q: string) => {
    const qLower = q.toLowerCase();
    if (qLower.includes("where") || qLower.includes("admission") || qLower.includes("free") || qLower.includes("when")) {
      return "general";
    }
    if (qLower.includes("check in") || qLower.includes("giveaway") || qLower.includes("contest") || qLower.includes("vote") || qLower.includes("rating") || qLower.includes("check-in") || qLower.includes("stamp")) {
      return "contest";
    }
    if (qLower.includes("sale") || qLower.includes("builder") || qLower.includes("buy") || qLower.includes("purchase")) {
      return "homes";
    }
    return "general";
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find(c => c.id === cat);
    return found ? found.label : "General";
  };

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case "general":
        return { background: "rgba(116, 167, 202, 0.15)", color: "var(--gold-dark)" };
      case "contest":
        return { background: "rgba(217, 154, 43, 0.12)", color: "var(--amber)" };
      case "homes":
        return { background: "rgba(47, 125, 91, 0.12)", color: "var(--green)" };
      default:
        return { background: "rgba(92, 103, 125, 0.1)", color: "var(--muted)" };
    }
  };

  const filteredFaqs = db.faqs
    .map((faq, index) => ({ ...faq, originalIndex: index, category: getCategory(faq.q) }))
    .filter(
      (f) =>
        (selectedCategory === "all" || f.category === selectedCategory) &&
        (f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="wrap" style={{ maxWidth: 900, paddingBottom: "4rem" }}>
      <div className="crumb" style={{ marginBottom: "2rem" }}>
        <Link href="/">Home</Link> / FAQ
      </div>
      
      <div className="sec-head" style={{ marginBottom: "3rem", textAlign: "center" }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: "0.5rem" }}>Have Questions?</span>
        <h2 style={{ fontSize: "2.5rem", color: "var(--navy-deep)", fontWeight: 700 }}>Frequently Asked Questions</h2>
        <p style={{ maxWidth: "600px", margin: "0 auto", color: "var(--muted)" }}>
          Find answers to common questions about touring homes, contest entries, ratings, check-ins, and builders.
        </p>
      </div>

      {/* Search Box */}
      <div style={{ position: "relative", marginBottom: "2.5rem" }}>
        <input
          type="text"
          placeholder="Search FAQs by keywords (e.g., tickets, check-in, dates)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpenIndex(null); // Close active to avoid confusion
          }}
          style={{
            width: "100%",
            padding: "1.2rem 3rem 1.2rem 3.5rem",
            borderRadius: "16px",
            border: "1.5px solid var(--line)",
            fontSize: "1.1rem",
            background: "#ffffff",
            boxShadow: "var(--shadow)",
            outline: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="faq-search-input"
        />
        <svg
          style={{
            position: "absolute",
            left: "1.4rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--navy)",
            pointerEvents: "none"
          }}
          width="20"
          height="20"
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
              right: "1.4rem",
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
              borderRadius: "50%",
            }}
            title="Clear search"
          >
            <svg
              width="18"
              height="18"
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

      {/* Category Tabs */}
      <div 
        style={{ 
          display: "flex", 
          gap: "0.8rem", 
          marginBottom: "2.5rem", 
          overflowX: "auto", 
          paddingBottom: "0.5rem",
          scrollbarWidth: "none",
        }}
        className="faq-tabs-container"
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setOpenIndex(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.4rem",
                borderRadius: "50px",
                border: isActive ? "1px solid transparent" : "1.5px solid var(--line)",
                background: isActive ? "linear-gradient(135deg, var(--navy), var(--navy-soft))" : "#ffffff",
                color: isActive ? "#ffffff" : "var(--ink)",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                boxShadow: isActive ? "0 8px 20px rgba(17, 103, 153, 0.2)" : "none"
              }}
              className="faq-tab-btn"
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search results banner if filters active */}
      {(searchQuery || selectedCategory !== "all") && (
        <div style={{ marginBottom: "1.5rem", fontSize: "0.95rem", color: "var(--muted)", fontWeight: 500 }}>
          Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"}
          {selectedCategory !== "all" && ` in "${getCategoryLabel(selectedCategory)}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* FAQ Accordion List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((f, i) => {
            const isOpen = openIndex === i;
            const badgeStyle = getCategoryBadgeStyle(f.category);
            return (
              <div
                key={f.originalIndex}
                style={{
                  border: "1.5px solid var(--line)",
                  borderRadius: "16px",
                  background: "#ffffff",
                  boxShadow: isOpen ? "var(--shadow-lg)" : "var(--shadow)",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  overflow: "hidden",
                  borderLeft: isOpen ? "4px solid var(--navy)" : "1.5px solid var(--line)"
                }}
                className="faq-item-card"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.4rem 1.6rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    outline: "none",
                    fontSize: "1.15rem",
                    fontWeight: 650,
                    color: isOpen ? "var(--navy)" : "var(--ink)",
                    transition: "color 0.2s ease",
                    gap: "1.5rem"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1 }}>
                    <span style={{ color: isOpen ? "var(--navy)" : "var(--ink)" }}>{f.q}</span>
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                    {selectedCategory === "all" && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "0.3rem 0.7rem",
                          borderRadius: "30px",
                          letterSpacing: "0.03em",
                          ...badgeStyle
                        }}
                      >
                        {getCategoryLabel(f.category)}
                      </span>
                    )}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        color: isOpen ? "var(--navy)" : "var(--gold-dark)",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>
                
                {/* Collapsible content wrapper */}
                <div
                  style={{
                    maxHeight: isOpen ? "500px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      padding: "0 1.6rem 1.6rem 1.6rem",
                      color: "var(--muted)",
                      lineHeight: "1.7",
                      fontSize: "1rem",
                      borderTop: "1px dashed var(--line)",
                      paddingTop: "1.2rem",
                    }}
                  >
                    {f.a}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty" style={{ padding: "4rem 2rem", background: "#ffffff", borderRadius: "16px", border: "1.5px solid var(--line)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Search size={40} style={{ color: "var(--muted)", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.4rem", color: "var(--navy-deep)", margin: "0 0 0.5rem" }}>No results found</h3>
            <p className="muted" style={{ margin: 0 }}>We couldn&apos;t find any FAQs matching your query. Try different terms or browse another category.</p>
          </div>
        )}
      </div>

      {/* Premium Support Banner */}
      <div
        style={{
          marginTop: "4rem",
          background: "linear-gradient(135deg, var(--navy-deep), var(--navy))",
          borderRadius: "20px",
          padding: "3rem 2.5rem",
          color: "#ffffff",
          textAlign: "center",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative backdrop shapes */}
        <div style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(116, 167, 202, 0.12)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(116, 167, 202, 0.08)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ 
            marginBottom: "0.8rem", 
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "60px",
            height: "60px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.1)",
            color: "#ffffff"
          }}>
            <MessageSquare size={26} />
          </div>
          <h3 style={{ fontSize: "1.75rem", color: "#ffffff", margin: "0 0 0.6rem", fontWeight: 700 }}>Still have questions?</h3>
          <p style={{ color: "#d0dbec", maxWidth: "520px", margin: "0 auto 2rem", fontSize: "1rem", lineHeight: "1.6" }}>
            Our event team is ready to help you coordinate your tours, check-in errors, or builder registrations.
          </p>
          <div style={{ display: "flex", gap: "1.2rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:events@mcbia.org" className="btn btn-gold" style={{ border: "none", color: "var(--navy-deep)", padding: "0.85rem 1.8rem" }}>
              Email Support
            </a>
            <a href="tel:3525550100" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#ffffff", padding: "0.85rem 1.8rem", background: "rgba(255,255,255,0.05)" }}>
              Call (352) 555-0100
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
