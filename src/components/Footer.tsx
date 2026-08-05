import Link from "next/link";
import Image from "next/image";
import logo from "../assets/parade-logo.webp"

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="fbrand">
              <Image
                src={logo}
                alt="Parade of Homes"
                className="nav-logo"
              />
            </div>
            <p style={{ fontSize: "1.2rem", maxWidth: 395 }}>
              Presented by the Marion County Building Industry Association.
              Explore the finest new homes, plan your tour, vote for your
              favorites, and enter to win.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link href="/homes">All Homes</Link>
            <Link href="/neighborhoods">Neighborhoods</Link>
            <Link href="/builders">Builders</Link>
            <Link href="/map">Map &amp; Route</Link>
            <Link href="/event">Parade Schedule</Link>
          </div>
          <div>
            <h4>Get Involved</h4>
            <Link href="/register">Register</Link>
            <Link href="/contest">Contest</Link>
            <Link href="/builder-entry">Builder Entry Form</Link>
            <Link href="/sponsor-entry">Sponsor Form</Link>
            <Link href="/builder">Builder Portal</Link>
            <Link href="/admin">Admin Login</Link>
          </div>
        </div>
        <div className="bottom">
          <span>© 2026 MCBIA Parade of Homes. All rights reserved.</span>
          <span>
            Crafted with care by{" "}
            <a
              href="https://dillonmediagroup.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline",
                color: "var(--gold-light)",
                fontSize: "inherit",
                fontWeight: 600,
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Dillon Media Group
            </a>
            .
          </span>
          <span>Built for the community of Marion County, Florida.</span>
        </div>
      </div>
    </footer>
  );
}
