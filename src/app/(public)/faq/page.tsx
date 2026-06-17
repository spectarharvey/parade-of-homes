"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export default function FAQPage() {
  const { db } = useStore();

  return (
    <div className="wrap" style={{ maxWidth: 820 }}>
      <div className="crumb">
        <Link href="/">Home</Link> / FAQ
      </div>
      <div className="sec-head">
        <span className="eyebrow">Need Help?</span>
        <h2>Frequently Asked Questions</h2>
        <p>
          Everything you need to know about visiting the Parade and entering the
          contest.
        </p>
      </div>
      {db.faqs.map((f, i) => (
        <details key={i} className="acc" open={i === 0}>
          <summary>
            {f.q}
            <span className="ic">＋</span>
          </summary>
          <div className="ans">{f.a}</div>
        </details>
      ))}
      <div className="panel center" style={{ marginTop: "1.6rem" }}>
        <h3>Still have questions?</h3>
        <p className="muted">
          Reach the MCBIA event team at <b>events@mcbia.org</b> or (352)
          555-0100.
        </p>
      </div>
    </div>
  );
}
