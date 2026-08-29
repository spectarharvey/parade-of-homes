import type { CmsPageSchema } from "../types";

/**
 * Shared header + footer. Stored under page = "global" and every key is
 * prefixed `global.` so it can be referenced from any page without colliding
 * with that page's own keys. Editing anything here updates every page at once.
 */
export const GLOBAL_SCHEMA: CmsPageSchema = {
  page: "global",
  label: "Header & Footer (all pages)",
  path: "/",
  blurb:
    "Shared across every page of the public site. A change here shows up everywhere.",
  sections: [
    {
      title: "Header",
      fields: [
        {
          key: "global.header.logo",
          label: "Logo",
          type: "image",
          default: "",
          help: "Leave empty to keep the built-in Parade of Homes logo.",
        },
        { key: "global.nav.homes", label: "Nav — Homes", type: "text", default: "Homes" },
        { key: "global.nav.communities", label: "Nav — Communities", type: "text", default: "Communities" },
        { key: "global.nav.builders", label: "Nav — Builders", type: "text", default: "Builders" },
        { key: "global.nav.event", label: "Nav — Parade Schedule", type: "text", default: "Parade Schedule" },
        { key: "global.nav.map", label: "Nav — Map & Route", type: "text", default: "Map & Route" },
        { key: "global.nav.contest", label: "Nav — Contest", type: "text", default: "Contest" },
        { key: "global.nav.sponsors", label: "Nav — Sponsors", type: "text", default: "Sponsors" },
        { key: "global.nav.faq", label: "Nav — FAQ", type: "text", default: "FAQ" },
        { key: "global.nav.login", label: "Nav — Log In link", type: "text", default: "Log In" },
        {
          key: "global.nav.register",
          label: "Nav — Register button",
          type: "text",
          default: "Register",
          help: "The gold call-to-action button at the end of the navigation.",
        },
      ],
    },
    {
      title: "Breadcrumbs",
      fields: [
        {
          key: "global.crumb.home",
          label: "\"Home\" breadcrumb link",
          type: "text",
          default: "Home",
          help: "The first crumb at the top of every inner page.",
        },
      ],
    },
    {
      title: "Footer — About",
      fields: [
        {
          key: "global.footer.logo",
          label: "Footer logo",
          type: "image",
          default: "",
          help: "Leave empty to keep the built-in Parade of Homes logo.",
        },
        {
          key: "global.footer.blurb",
          label: "About paragraph",
          type: "textarea",
          default:
            "Presented by the Marion County Building Industry Association. Explore the finest new homes, plan your tour, vote for your favorites, and enter to win.",
        },
      ],
    },
    {
      title: "Footer — Explore column",
      fields: [
        { key: "global.footer.explore.title", label: "Column heading", type: "text", default: "Explore" },
        { key: "global.footer.explore.homes", label: "Link — All Homes", type: "text", default: "All Homes" },
        { key: "global.footer.explore.communities", label: "Link — Communities", type: "text", default: "Communities" },
        { key: "global.footer.explore.builders", label: "Link — Builders", type: "text", default: "Builders" },
        { key: "global.footer.explore.map", label: "Link — Map & Route", type: "text", default: "Map & Route" },
        { key: "global.footer.explore.event", label: "Link — Parade Schedule", type: "text", default: "Parade Schedule" },
      ],
    },
    {
      title: "Footer — Get Involved column",
      fields: [
        { key: "global.footer.involved.title", label: "Column heading", type: "text", default: "Get Involved" },
        { key: "global.footer.involved.register", label: "Link — Register", type: "text", default: "Register" },
        { key: "global.footer.involved.contest", label: "Link — Contest", type: "text", default: "Contest" },
        { key: "global.footer.involved.builder", label: "Link — Builder Portal", type: "text", default: "Builder Portal" },
        { key: "global.footer.involved.admin", label: "Link — Admin Login", type: "text", default: "Admin Login" },
      ],
    },
    {
      title: "Footer — Bottom bar",
      fields: [
        {
          key: "global.footer.copyright",
          label: "Copyright",
          type: "text",
          default: "© 2026 MCBIA Parade of Homes. All rights reserved.",
        },
        { key: "global.footer.credit.prefix", label: "Credit — lead-in", type: "text", default: "Crafted with care by" },
        { key: "global.footer.credit.name", label: "Credit — name", type: "text", default: "Dillon Media Group" },
        {
          key: "global.footer.credit.href",
          label: "Credit — link",
          type: "url",
          default: "https://dillonmediagroup.com",
        },
        {
          key: "global.footer.tagline",
          label: "Tagline",
          type: "text",
          default: "Built for the community of Marion County, Florida.",
        },
      ],
    },
  ],
};
