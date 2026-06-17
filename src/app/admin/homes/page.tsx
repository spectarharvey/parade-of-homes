"use client";

import { useStore, useToast } from "@/lib/store";
import { money, stars, homePhoto } from "@/lib/format";

export default function AdminHomesPage() {
  const { db, builder, nbhd, toggleFeatureHome, removeHome } = useStore();
  const { toast } = useToast();

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Home Listings Manager</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        {db.homes.length} live listings ·{" "}
        {db.homes.reduce((s, h) => s + h.checkins, 0)} total check-ins
      </p>
      <div className="tbl-wrap" style={{ marginTop: "1.2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Home</th>
              <th>Builder</th>
              <th>Style</th>
              <th>Price</th>
              <th>Check-Ins</th>
              <th>Avg Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.homes.map((h) => (
              <tr key={h.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: ".7rem",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={homePhoto(h)}
                      style={{
                        width: "48px",
                        height: "36px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                    <div>
                      <b style={{ fontSize: ".86rem" }}>{h.name}</b>
                      <div className="muted" style={{ fontSize: ".74rem" }}>
                        {nbhd(h.nb)?.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{builder(h.builder)?.name}</td>
                <td>
                  <span className="badge badge-navy">{h.style}</span>
                </td>
                <td>{money(h.price)}</td>
                <td>{h.checkins}</td>
                <td>
                  <span className="stars">{stars(h.rating)}</span>
                  <div className="muted" style={{ fontSize: ".72rem" }}>
                    {h.rating} ({h.ratings})
                  </div>
                </td>
                <td>
                  {h.featured ? (
                    <span className="badge badge-gold">★ Featured</span>
                  ) : (
                    <span className="badge badge-green">Live</span>
                  )}
                </td>
                <td>
                  <div className="pill-row">
                    <button
                      className="ico-btn"
                      onClick={() => toggleFeatureHome(h.id)}
                    >
                      {h.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      className="ico-btn danger"
                      onClick={() => {
                        if (window.confirm("Remove this listing?")) {
                          removeHome(h.id);
                          toast("Listing removed");
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
