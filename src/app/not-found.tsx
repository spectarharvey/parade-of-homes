import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <div className="wrap">
          <div className="empty" style={{ padding: "5rem" }}>
            <div style={{ fontSize: "3rem" }}>🏚️</div>
            <h2>Page not found</h2>
            <p className="muted">
              We couldn&apos;t find what you were looking for.
            </p>
            <Link href="/" className="btn btn-gold">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
