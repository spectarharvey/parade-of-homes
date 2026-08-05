"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import Modal from "@/components/Modal";

const SEEN_KEY = "poh_register_prompt_seen";

/**
 * Pop-up shown once per session when the app opens, inviting unregistered
 * visitors to register so they can vote on their favorite homes. Skipped for
 * already-registered guests and on the registration page itself.
 */
export default function RegisterPrompt() {
  const pathname = usePathname();
  const { ready, guestUser } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ready || guestUser || pathname === "/register") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = setTimeout(() => setShow(true), 700);
    return () => clearTimeout(t);
  }, [ready, guestUser, pathname]);

  const close = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <Modal title="Register to Vote" onClose={close}>
      <div style={{ textAlign: "center", padding: ".4rem 0" }}>
        <div style={{ fontSize: "2.4rem", marginBottom: ".5rem" }}>🗳️</div>
        <p style={{ fontSize: "1.02rem", lineHeight: 1.5, margin: "0 0 1.3rem" }}>
          Register now to vote for your favorite homes in the 2026 Parade of
          Homes!
        </p>
        <div
          style={{
            display: "flex",
            gap: ".6rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/register" className="btn btn-gold" onClick={close}>
            Register Now
          </Link>
          <button className="btn btn-outline" onClick={close}>
            Maybe Later
          </button>
        </div>
        <p className="muted" style={{ fontSize: ".8rem", margin: "1rem 0 0" }}>
          Already have a guest pass?{" "}
          <Link href="/register?tab=login" onClick={close} style={{ color: "var(--navy)", fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </Modal>
  );
}
