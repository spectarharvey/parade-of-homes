import type { CmsPageSchema } from "../types";

export const COMMUNITIES_SCHEMA: CmsPageSchema = {
  page: "communities",
  label: "Communities",
  path: "/communities",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Communities" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "Explore Local" },
        { key: "head.title", label: "Heading", type: "text", default: "Our Communities" },
        {
          key: "head.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default: "Browse the current 2026 Parade subdivisions and model-home locations.",
        },
      ],
    },
    {
      title: "Community card labels",
      fields: [
        {
          key: "card.priceRangeLabel",
          label: "Price range label",
          type: "text",
          default: "Price Range",
          help: "The community names, photos and figures come from Admin → Neighborhoods.",
        },
        { key: "card.avgPriceLabel", label: "Average price label", type: "text", default: "Avg Price" },
      ],
    },
  ],
};
