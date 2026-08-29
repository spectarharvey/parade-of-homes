import type { CmsPageSchema } from "../types";

export const SPONSOR_ENTRY_SCHEMA: CmsPageSchema = {
  page: "sponsor-entry",
  label: "Sponsor Form",
  path: "/sponsor-entry",
  blurb: "Only the surrounding copy is editable — the form fields themselves are not.",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Sponsor Form" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "2026 Parade Sponsor Form" },
        { key: "head.title", label: "Heading", type: "text", default: "Parade of Homes Sponsorship Form" },
        {
          key: "head.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default:
            "Thank you for sponsoring the 2026 Parade of Homes. Your involvement helps MCBIA continue supporting our builders and the local building community.",
        },
      ],
    },
    {
      title: "After submitting",
      fields: [
        { key: "done.title", label: "Heading", type: "text", default: "Sponsorship Received!" },
        {
          key: "done.body",
          label: "Body",
          type: "textarea",
          default:
            "Thank you for sponsoring the 2026 Parade of Homes. We'll follow up by email.",
        },
        {
          key: "done.paidNote",
          label: "Note when paid online",
          type: "textarea",
          default: "Your payment was received — a receipt will be emailed to you.",
        },
        {
          key: "done.invoiceNote",
          label: "Note when invoiced",
          type: "textarea",
          default: "We'll send your invoice based on the sponsorship level and payment method you selected.",
        },
        { key: "done.cta1", label: "Button 1", type: "text", default: "Back to Home" },
        { key: "done.cta2", label: "Button 2", type: "text", default: "Parade Schedule" },
      ],
    },
  ],
};
