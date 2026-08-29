import type { CmsPageSchema } from "../types";

export const FAQ_SCHEMA: CmsPageSchema = {
  page: "faq",
  label: "FAQ",
  path: "/faq",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "FAQ" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "Have Questions?" },
        { key: "head.title", label: "Heading", type: "text", default: "Frequently Asked Questions" },
        {
          key: "head.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default:
            "Find answers to common questions about touring homes, contest entries, ratings, check-ins, and builders.",
          help: "The questions and answers themselves are managed in Admin → FAQs.",
        },
      ],
    },
    {
      title: "No search results",
      fields: [
        { key: "noResults.title", label: "Heading", type: "text", default: "No results found" },
        {
          key: "noResults.body",
          label: "Body",
          type: "textarea",
          default: "We couldn't find any FAQs matching your query.",
        },
      ],
    },
    {
      title: "Support banner",
      fields: [
        { key: "support.title", label: "Heading", type: "text", default: "Still have questions?" },
        {
          key: "support.body",
          label: "Body",
          type: "textarea",
          default:
            "Our event team is ready to help you coordinate your tours, check-in errors, or builder registrations.",
        },
        { key: "support.emailLabel", label: "Email button", type: "text", default: "Email Support" },
        {
          key: "support.emailHref",
          label: "Email button link",
          type: "url",
          default:
            "https://mail.google.com/mail/?view=cm&fs=1&to=admin@mcbia.org&su=Parade%20of%20Homes%20Support",
        },
        { key: "support.phoneLabel", label: "Phone button", type: "text", default: "Call (352) 694-4133" },
        { key: "support.phoneHref", label: "Phone button link", type: "url", default: "tel:3526944133" },
      ],
    },
  ],
};
