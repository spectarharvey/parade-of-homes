import type { CmsPageSchema } from "../types";

export const BUILDER_ENTRY_SCHEMA: CmsPageSchema = {
  page: "builder-entry",
  label: "Builder Entry Form",
  path: "/builder-entry",
  blurb: "Only the surrounding copy is editable — the form fields themselves are not.",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Builder Entry Form" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "2026 Parade Model Entry" },
        { key: "head.title", label: "Heading", type: "text", default: "Builder Model Home Entry Form" },
        {
          key: "head.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default:
            "Thank you for entering the 2026 Parade of Homes. Please read all directions carefully and provide as much detail as possible so we can present your model accurately and professionally.",
        },
        {
          key: "head.notice",
          label: "Membership notice (red)",
          type: "textarea",
          default: "* You must be a member of MCBIA to enter a house in the Parade of Homes.",
        },
      ],
    },
    {
      title: "After submitting",
      fields: [
        { key: "done.title", label: "Heading", type: "text", default: "Entry Received!" },
        {
          key: "done.body",
          label: "Body",
          type: "textarea",
          default:
            "Thank you for entering the 2026 Parade of Homes. We'll review your model home entry and follow up by email.",
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
          default: "Watch for your invoice based on the entry level and payment method you selected.",
        },
        { key: "done.cta1", label: "Button 1", type: "text", default: "Back to Home" },
        { key: "done.cta2", label: "Button 2", type: "text", default: "Parade Schedule" },
      ],
    },
  ],
};
