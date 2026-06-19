"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";

export default function AdminNotificationsPage() {
  const { db, sendNotification } = useStore();
  const { toast } = useToast();
  const optin = db.users.filter((u) => u.sms).length;

  const [type, setType] = useState("Announcement");
  const [audience, setAudience] = useState("All opted-in users");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendNotification({
      id: "nt" + Date.now(),
      type,
      msg,
      audience,
      sent: "2026-06-17 12:00",
      count: audience.includes("opted") ? optin : Math.round(optin * 0.7),
    });
    setType("Announcement");
    setAudience("All opted-in users");
    setMsg("");
    toast("🔔 Notification sent to " + optin + " users");
  };

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Notifications</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        Send announcements, contest updates, and reminders to your {optin}{" "}
        opted-in users.
      </p>
      <div className="grid-2" style={{ alignItems: "start", marginTop: "1.2rem" }}>
        <div className="panel">
          <h3>Compose Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="fld" style={{ marginBottom: ".8rem" }}>
              <label>Type</label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Announcement</option>
                <option>Contest Update</option>
                <option>Reminder</option>
              </select>
            </div>
            <div className="fld" style={{ marginBottom: ".8rem" }}>
              <label>Audience</label>
              <select
                name="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option>All opted-in users</option>
                <option>Active visitors</option>
                <option>Contest entrants</option>
              </select>
            </div>
            <div className="fld" style={{ marginBottom: ".8rem" }}>
              <label>Message</label>
              <textarea
                name="msg"
                rows={4}
                required
                placeholder="Type your message…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
            </div>
            <button className="btn btn-gold btn-block" type="submit">
               Send Notification
            </button>
          </form>
        </div>
        <div className="panel">
          <h3>Notification History</h3>
          {db.notifications.map((n) => (
            <div
              key={n.id}
              style={{ padding: ".8rem 0", borderBottom: "1px solid var(--line)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="badge badge-blue">{n.type}</span>
                <span className="muted" style={{ fontSize: ".74rem" }}>
                  {n.sent}
                </span>
              </div>
              <p style={{ fontSize: ".86rem", margin: ".4rem 0 .2rem" }}>
                {n.msg}
              </p>
              <span className="muted" style={{ fontSize: ".74rem" }}>
                📤 {n.count} recipients · {n.audience}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
