"use client";

import { useStore, useToast } from "@/lib/store";
import { money } from "@/lib/format";

export default function AdminSubmissionsPage() {
  const { db, approveSubmission, rejectSubmission } = useStore();
  const { toast } = useToast();
  const pending = db.submissions.filter((s) => s.status === "pending").length;

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Builder Submissions</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        {pending} awaiting review · {db.submissions.length} total
      </p>
      <div className="tbl-wrap" style={{ marginTop: "1.2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Home</th>
              <th>Builder</th>
              <th>Price</th>
              <th>Specs</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {db.submissions.map((s) => (
              <tr key={s.id}>
                <td>
                  <b style={{ fontSize: ".86rem" }}>{s.home}</b>
                  <div className="muted" style={{ fontSize: ".74rem" }}>
                    {s.nb} · {s.style}
                  </div>
                </td>
                <td>
                  {s.builder}
                  <div className="muted" style={{ fontSize: ".74rem" }}>
                    {s.contact}
                  </div>
                </td>
                <td>{money(s.price)}</td>
                <td>
                  {s.beds}bd / {s.baths}ba ·{" "}
                  {s.sqft.toLocaleString("en-US")}sf
                </td>
                <td className="muted">{s.date}</td>
                <td>
                  {s.status === "pending" ? (
                    <span className="badge badge-amber">Pending</span>
                  ) : s.status === "approved" ? (
                    <span className="badge badge-green">Approved</span>
                  ) : (
                    <span className="badge badge-red">Rejected</span>
                  )}
                </td>
                <td>
                  {s.status === "pending" ? (
                    <div className="pill-row">
                      <button
                        className="ico-btn"
                        onClick={() => {
                          approveSubmission(s.id);
                          toast("✓ Submission approved & published");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="ico-btn danger"
                        onClick={() => {
                          rejectSubmission(s.id);
                          toast("Submission rejected");
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="muted" style={{ fontSize: ".78rem" }}>
                      Reviewed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
