"use client";

import { useState } from "react";
import { useStore, useToast } from "@/lib/store";

export default function AdminSettingsPage() {
  const { db, saveSettings, resetDB } = useStore();
  const { toast } = useToast();

  const [target, setTarget] = useState(String(db.contest.target));
  const [prize, setPrize] = useState(db.contest.prize);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(Number(target), prize);
    toast("✓ Contest settings saved");
  };

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Contest Settings</h1>
      <p className="muted" style={{ marginTop: "-.4rem" }}>
        Configure the giveaway target and prize description shown across the app.
      </p>
      <div className="panel" style={{ marginTop: "1.2rem", maxWidth: "620px" }}>
        <form onSubmit={handleSubmit}>
          <div className="fld" style={{ marginBottom: "1rem" }}>
            <label>Target Number of Homes to Visit</label>
            <input
              name="target"
              type="number"
              min="1"
              max="20"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <p className="muted" style={{ fontSize: ".76rem", margin: ".3rem 0 0" }}>
              Guests must check in at this many homes to be entered to win.
            </p>
          </div>
          <div className="fld" style={{ marginBottom: "1rem" }}>
            <label>Prize Description</label>
            <textarea
              name="prize"
              rows={3}
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
            />
          </div>
          <button className="btn btn-gold" type="submit">
            Save Settings
          </button>
        </form>
        <hr className="soft" />
        <h3 style={{ fontSize: "1rem" }}>Danger Zone</h3>
        <p className="muted" style={{ fontSize: ".84rem" }}>
          Restore all demo data to its original state.
        </p>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            if (
              window.confirm(
                "Reset ALL data back to the original demo seed? This clears edits, submissions, and registrations."
              )
            ) {
              resetDB();
              toast("Data reset to defaults");
            }
          }}
        >
          ↺ Reset Demo Data
        </button>
      </div>
    </>
  );
}
