import type { CmsPageSchema } from "../types";

export const HOMES_SCHEMA: CmsPageSchema = {
  page: "homes",
  label: "All Homes",
  path: "/homes",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Homes" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "Showcase Listings" },
        { key: "head.title", label: "Heading", type: "text", default: "Explore All Homes" },
      ],
    },
    {
      title: "Filter labels",
      fields: [
        { key: "filters.price", label: "Price filter label", type: "text", default: "Price" },
        { key: "filters.beds", label: "Beds filter label", type: "text", default: "Beds" },
        { key: "filters.baths", label: "Baths filter label", type: "text", default: "Baths" },
        { key: "filters.sqft", label: "Square feet filter label", type: "text", default: "Sq Ft" },
      ],
    },
    {
      title: "Results",
      fields: [
        {
          key: "empty",
          label: "No-results message",
          type: "textarea",
          default: "No homes match your filters. Try clearing them.",
        },
      ],
    },
  ],
};
