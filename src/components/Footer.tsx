"use client";

import Link from "next/link";
import logo from "../assets/parade-logo-mcbia.webp";
import { useGlobalCms } from "@/lib/cms/context";
import CmsImage from "@/components/CmsImage";

export default function Footer() {
  const cms = useGlobalCms();

  return (
    <footer className="site">
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="fbrand">
              <CmsImage
                src={cms.t("global.footer.logo")}
                fallback={logo}
                alt="Parade of Homes"
                className="nav-logo"
              />
            </div>
            <p style={{ fontSize: "1.2rem", maxWidth: 395 }}>
              {cms.t("global.footer.blurb")}
            </p>
          </div>
          <div>
            <h4>{cms.t("global.footer.explore.title")}</h4>
            <Link href="/homes">{cms.t("global.footer.explore.homes")}</Link>
            <Link href="/communities">{cms.t("global.footer.explore.communities")}</Link>
            <Link href="/builders">{cms.t("global.footer.explore.builders")}</Link>
            <Link href="/map">{cms.t("global.footer.explore.map")}</Link>
            <Link href="/event">{cms.t("global.footer.explore.event")}</Link>
          </div>
          <div>
            <h4>{cms.t("global.footer.involved.title")}</h4>
            <Link href="/register">{cms.t("global.footer.involved.register")}</Link>
            <Link href="/contest">{cms.t("global.footer.involved.contest")}</Link>
            {/* <Link href="/builder-entry">Builder Entry Form</Link> */}
            {/* <Link href="/sponsor-entry">Sponsor Form</Link> */}
            <Link href="/builder">{cms.t("global.footer.involved.builder")}</Link>
            <Link href="/admin">{cms.t("global.footer.involved.admin")}</Link>
          </div>
        </div>
        <div className="bottom">
          <span>{cms.t("global.footer.copyright")}</span>
          <span>
            {cms.t("global.footer.credit.prefix")}{" "}
            <a
              href={cms.t("global.footer.credit.href")}
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
              {cms.t("global.footer.credit.name")}
            </a>
            .
          </span>
          <span>{cms.t("global.footer.tagline")}</span>
        </div>
      </div>
    </footer>
  );
}
