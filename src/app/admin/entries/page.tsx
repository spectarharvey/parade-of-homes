"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/store";

type BuilderEntry = {
  id: string;
  createdAt: string;
  status: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  builderName: string;
  builderPhone: string;
  builderEmail: string;
  website: string;
  officeAddress: string | null;
  license: string;
  modelName: string;
  sqftLiving: string;
  sqftTotal: string;
  beds: string;
  baths: string;
  garage: string;
  subdivision: string | null;
  modelAddress: string | null;
  price: string;
  buildType: string;
  staged: string;
  entryLevel: string;
  paymentMethod: string;
  signature: string;
  billingName: string | null;
  receiptEmail: string | null;
  billingAddress: string | null;
  frontElevation: string | null;
  logo: string | null;
  floorPlan: string | null;
  details: any;
};

type SponsorEntry = {
  id: string;
  createdAt: string;
  status: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  website: string;
  companyAddress: string | null;
  level: string;
  paymentMethod: string;
  signature: string;
  billingName: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  logo: string | null;
  ad: string | null;
};

const STATUSES = ["NEW", "REVIEWED", "APPROVED", "ARCHIVED"];

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "NEW" ? "badge badge-blue" :
    status === "APPROVED" ? "badge badge-gold" :
    status === "ARCHIVED" ? "badge" : "badge badge-blue";
  return <span className={cls}>{status}</span>;
}

function StatusSelect({
  kind,
  id,
  status,
  onUpdated,
}: {
  kind: "builder" | "sponsor";
  id: string;
  status: string;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  return (
    <select
      defaultValue={status}
      onChange={async (e) => {
        const res = await fetch("/api/admin/entries", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, id, status: e.target.value }),
        });
        if (res.ok) {
          toast("Status updated");
          onUpdated();
        }
      }}
      style={{ fontSize: ".8rem", padding: ".25rem .4rem" }}
    >
      {STATUSES.map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: ".5rem", padding: ".15rem 0", fontSize: ".84rem" }}>
      <span className="muted" style={{ minWidth: 120 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function FileLink({ label, url }: { label: string; url?: string | null }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ fontSize: ".78rem" }}>
      {label} ↗
    </a>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function EntriesPage() {
  const [tab, setTab] = useState<"builder" | "sponsor">("builder");
  const [data, setData] = useState<{ builderEntries: BuilderEntry[]; sponsorEntries: SponsorEntry[] }>({
    builderEntries: [],
    sponsorEntries: [],
  });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/entries", { cache: "no-store" });
    if (res.ok) setData(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const builders = data.builderEntries;
  const sponsors = data.sponsorEntries;
  const list = tab === "builder" ? builders : sponsors;

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>2026 Entries &amp; Sponsorships</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        Builder Model Home entries and Sponsor Form submissions from the public site.
      </p>

      <div style={{ display: "flex", gap: ".5rem", margin: "1.2rem 0" }}>
        <button
          className={"btn btn-sm " + (tab === "builder" ? "btn-navy" : "btn-outline")}
          onClick={() => { setTab("builder"); setOpen(null); }}
        >
          Builder Entries ({builders.length})
        </button>
        <button
          className={"btn btn-sm " + (tab === "sponsor" ? "btn-navy" : "btn-outline")}
          onClick={() => { setTab("sponsor"); setOpen(null); }}
        >
          Sponsor Forms ({sponsors.length})
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : list.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", color: "var(--muted)" }}>
          No {tab === "builder" ? "builder entries" : "sponsor forms"} yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
          {tab === "builder"
            ? builders.map((e) => {
                const d = e.details || {};
                const isOpen = open === e.id;
                return (
                  <div key={e.id} className="panel" style={{ padding: "1rem 1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".8rem", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <b>{e.builderName}</b>
                          <StatusBadge status={e.status} />
                        </div>
                        <div className="muted" style={{ fontSize: ".82rem" }}>
                          {e.modelName} · {e.entryLevel} · {fmtDate(e.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
                        <StatusSelect kind="builder" id={e.id} status={e.status} onUpdated={load} />
                        <button className="btn btn-outline btn-sm" onClick={() => setOpen(isOpen ? null : e.id)}>
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ marginTop: ".8rem", borderTop: "1px solid var(--line)", paddingTop: ".8rem" }}>
                        <div className="grid-2" style={{ alignItems: "start" }}>
                          <div>
                            <h4 style={{ fontSize: ".9rem", marginBottom: ".3rem" }}>Model Home</h4>
                            <Row label="Build type" value={e.buildType} />
                            <Row label="Price" value={e.price} />
                            <Row label="Living sqft" value={e.sqftLiving} />
                            <Row label="Total sqft" value={e.sqftTotal} />
                            <Row label="Beds / Baths" value={`${e.beds} / ${e.baths}`} />
                            <Row label="Garage" value={e.garage} />
                            <Row label="Staged" value={e.staged} />
                            <Row label="Subdivision" value={e.subdivision} />
                            <Row label="Model address" value={e.modelAddress} />
                            {d.features?.length > 0 && (
                              <div style={{ marginTop: ".4rem" }}>
                                <div className="muted" style={{ fontSize: ".78rem" }}>Features</div>
                                <ul style={{ margin: ".2rem 0 .2rem 1.2rem", fontSize: ".82rem" }}>
                                  {d.features.map((x: string, i: number) => <li key={i}>{x}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 style={{ fontSize: ".9rem", marginBottom: ".3rem" }}>Contact &amp; Billing</h4>
                            <Row label="Main contact" value={e.contactName} />
                            <Row label="Contact phone" value={e.contactPhone} />
                            <Row label="Contact email" value={e.contactEmail} />
                            <Row label="Builder phone" value={e.builderPhone} />
                            <Row label="Builder email" value={e.builderEmail} />
                            <Row label="Website" value={e.website} />
                            <Row label="License" value={e.license} />
                            <Row label="Office" value={e.officeAddress} />
                            <Row label="Billing" value={e.billingName} />
                            <Row label="Receipt email" value={e.receiptEmail} />
                            <Row label="Billing address" value={e.billingAddress} />
                            <Row label="Payment" value={e.paymentMethod} />
                            <Row label="Signature" value={e.signature} />
                            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginTop: ".6rem" }}>
                              <FileLink label="Front Elevation" url={e.frontElevation} />
                              <FileLink label="Logo" url={e.logo} />
                              <FileLink label="Floor Plan" url={e.floorPlan} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            : sponsors.map((e) => {
                const isOpen = open === e.id;
                return (
                  <div key={e.id} className="panel" style={{ padding: "1rem 1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".8rem", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <b>{e.companyName}</b>
                          <StatusBadge status={e.status} />
                        </div>
                        <div className="muted" style={{ fontSize: ".82rem" }}>
                          {e.level} · {fmtDate(e.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
                        <StatusSelect kind="sponsor" id={e.id} status={e.status} onUpdated={load} />
                        <button className="btn btn-outline btn-sm" onClick={() => setOpen(isOpen ? null : e.id)}>
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ marginTop: ".8rem", borderTop: "1px solid var(--line)", paddingTop: ".8rem" }}>
                        <div className="grid-2" style={{ alignItems: "start" }}>
                          <div>
                            <h4 style={{ fontSize: ".9rem", marginBottom: ".3rem" }}>Company</h4>
                            <Row label="Company phone" value={e.companyPhone} />
                            <Row label="Company email" value={e.companyEmail} />
                            <Row label="Website" value={e.website} />
                            <Row label="Address" value={e.companyAddress} />
                            <Row label="Level" value={e.level} />
                            <Row label="Payment" value={e.paymentMethod} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: ".9rem", marginBottom: ".3rem" }}>Contact &amp; Billing</h4>
                            <Row label="Contact" value={e.contactName} />
                            <Row label="Contact phone" value={e.contactPhone} />
                            <Row label="Contact email" value={e.contactEmail} />
                            <Row label="Billing" value={e.billingName} />
                            <Row label="Billing email" value={e.billingEmail} />
                            <Row label="Billing address" value={e.billingAddress} />
                            <Row label="Signature" value={e.signature} />
                            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginTop: ".6rem" }}>
                              <FileLink label="Logo" url={e.logo} />
                              <FileLink label="Ad Graphic" url={e.ad} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      )}
    </>
  );
}
