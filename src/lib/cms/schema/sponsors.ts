import type { CmsPageSchema } from "../types";

export const SPONSORS_SCHEMA: CmsPageSchema = {
  page: "sponsors",
  label: "Sponsors",
  path: "/sponsors",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Sponsors" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "Thank You" },
        { key: "head.title", label: "Heading", type: "text", default: "Our Sponsors" },
        {
          key: "head.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default: "The 2026 sponsor list will be added as sponsorships are confirmed.",
        },
      ],
    },
    {
      title: "Featured builder banner",
      fields: [
        { key: "featured.badge", label: "Badge", type: "text", default: "★ 2026 Featured Builder" },
        {
          key: "featured.body.prefix",
          label: "Thank-you — before the name",
          type: "text",
          default: "A special thank you to our 2026 Featured Builder,",
        },
        {
          key: "featured.body.name",
          label: "Thank-you — name (bold)",
          type: "text",
          default: "Brije Homes",
        },
        {
          key: "featured.body.suffix",
          label: "Thank-you — after the name",
          type: "textarea",
          default:
            ", for helping make this year's Parade of Homes possible! Brije Homes is an award-winning custom home builder serving Central Florida with a design-first, client-focused building process.",
          help: "Starts right after the bold name, so it usually begins with a comma.",
        },
        { key: "featured.cta", label: "Button", type: "text", default: "View Brije Homes →" },
      ],
    },
    {
      title: "Sponsor tiers",
      fields: [
        {
          key: "empty",
          label: "No-sponsors message",
          type: "textarea",
          default: "Sponsor logos and ads are coming soon.",
        },
        {
          key: "tier.platinum",
          label: "Platinum ribbon",
          type: "text",
          default: "Platinum Sponsors",
          help: "The sponsor logos and details themselves come from Admin → Sponsors.",
        },
        { key: "tier.gold", label: "Gold ribbon", type: "text", default: "Gold Sponsors" },
        { key: "tier.silver", label: "Silver ribbon", type: "text", default: "Silver Sponsors" },
        { key: "card.websiteLabel", label: "Sponsor card website button", type: "text", default: "Visit Website ↗" },
      ],
    },
  ],
};
