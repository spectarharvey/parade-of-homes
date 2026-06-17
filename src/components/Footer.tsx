import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="fbrand">
              <span className="brand">
                <span className="logo" style={{ width: 38, height: 38 }}>
                  P
                </span>
              </span>
              <b style={{ fontFamily: "Lora", fontSize: "1.1rem" }}>
                Parade of Homes
              </b>
            </div>
            <p style={{ fontSize: ".86rem", maxWidth: 320 }}>
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
          </div>
          <div>
            <h4>Get Involved</h4>
            <Link href="/register">Register</Link>
            <Link href="/contest">Contest</Link>
            <Link href="/submit">Submit a Home</Link>
            <Link href="/sponsors">Become a Sponsor</Link>
            <Link href="/admin">Admin Login</Link>
          </div>
        </div>
        <div className="bottom">
          <span>© 2026 MCBIA Parade of Homes. All rights reserved.</span>
          <span>Built for the community of Marion County, Florida.</span>
        </div>
      </div>
    </footer>
  );
}
