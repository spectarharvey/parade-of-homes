import type { CmsPageSchema } from "../types";

export const BUILDERS_SCHEMA: CmsPageSchema = {
  page: "builders",
  label: "Builders",
  path: "/builders",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Builders" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "Meet the Makers" },
        { key: "head.title", label: "Heading", type: "text", default: "Participating Builders" },
      ],
    },
    {
      title: "Featured builder banner",
      fields: [
        {
          key: "featured.badge",
          label: "Badge",
          type: "text",
          default: "★ Featured Builder of the Parade",
          help: "The builder shown here is chosen in Admin → Builders.",
        },
        {
          key: "featured.pendingBadge",
          label: "Badge shown while photos are missing",
          type: "text",
          default: "Assets pending",
        },
      ],
    },
  ],
};
