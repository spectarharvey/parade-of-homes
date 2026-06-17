"use client";

import { useStore } from "@/lib/store";

export default function AdminUsersPage() {
  const { db } = useStore();
  const target = db.contest.target;

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Registered Users</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        {db.users.length} registered · {db.users.filter((u) => u.sms).length} SMS
        opt-ins · {db.users.filter((u) => u.checkins >= target).length} contest
        entrants
      </p>
      <div className="tbl-wrap" style={{ marginTop: "1.2rem" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>ZIP</th>
              <th>Check-Ins</th>
              <th>Contest</th>
              <th>SMS Opt-In</th>
            </tr>
          </thead>
          <tbody>
            {db.users.map((u) => {
              const entered = u.checkins >= target;
              return (
                <tr key={u.id}>
                  <td>
                    <b style={{ fontSize: ".86rem" }}>
                      {u.first} {u.last}
                    </b>
                    <div className="muted" style={{ fontSize: ".74rem" }}>
                      Joined {u.date}
                    </div>
                  </td>
                  <td>
                    {u.email}
                    <div className="muted" style={{ fontSize: ".74rem" }}>
                      {u.phone || "—"}
                    </div>
                  </td>
                  <td>{u.zip}</td>
                  <td>
                    <b>{u.checkins}</b> <span className="muted">/ {target}</span>
                  </td>
                  <td>
                    {entered ? (
                      <span className="badge badge-green">✓ Entered</span>
                    ) : (
                      <span className="badge badge-amber">In progress</span>
                    )}
                  </td>
                  <td>
                    {u.sms ? (
                      <span className="badge badge-blue">✓ Opted In</span>
                    ) : (
                      <span className="badge badge-red">Opted Out</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
