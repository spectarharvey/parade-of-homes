import type { CmsPageSchema } from "../types";

export const EVENT_SCHEMA: CmsPageSchema = {
  page: "event",
  label: "Parade Schedule",
  path: "/event",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Parade Schedule" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "Parade Schedule" },
        { key: "head.title", label: "Heading", type: "text", default: "2026 Parade of Homes" },
        {
          key: "head.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default: "The 2026 MCBIA Parade of Homes will take place this November.",
        },
      ],
    },
    {
      title: "Key dates panel",
      fields: [
        { key: "facts.1.label", label: "Fact 1 — label", type: "text", default: "Parade Weekends" },
        { key: "facts.1.value", label: "Fact 1 — value", type: "multiline", default: "Nov 6–8 & 13–15, 2026" },
        { key: "facts.2.label", label: "Fact 2 — label", type: "text", default: "Fri & Sat Hours" },
        { key: "facts.2.value", label: "Fact 2 — value", type: "multiline", default: "11 AM – 5 PM" },
        { key: "facts.3.label", label: "Fact 3 — label", type: "text", default: "Sunday Hours" },
        { key: "facts.3.value", label: "Fact 3 — value", type: "multiline", default: "12 PM – 5 PM" },
        { key: "facts.4.label", label: "Fact 4 — label", type: "text", default: "Location" },
        { key: "facts.4.value", label: "Fact 4 — value", type: "multiline", default: "Marion County, FL" },
      ],
    },
    {
      title: "Featured builder card",
      fields: [
        { key: "featured.badge", label: "Badge", type: "text", default: "2026 Featured Builder" },
        { key: "featured.name", label: "Builder name", type: "text", default: "Brije Homes" },
        {
          key: "featured.blurb",
          label: "Description",
          type: "textarea",
          default: "Brije Homes is the Featured Builder for this year's Parade.",
        },
        { key: "featured.cta", label: "Button", type: "text", default: "Visit Brije Homes →" },
      ],
    },
    {
      title: "Plan your visit",
      fields: [
        { key: "plan.title", label: "Heading", type: "text", default: "Plan your Parade visit" },
        {
          key: "plan.body",
          label: "Body",
          type: "textarea",
          default:
            "Take a look at this year’s Parade of Homes, map your route, and register to vote for your favorites so that you can participate in the giveaway.",
        },
        { key: "plan.cta1", label: "Button 1", type: "text", default: "Browse Homes →" },
        { key: "plan.cta2", label: "Button 2", type: "text", default: "Plan My Route →" },
        { key: "plan.cta3", label: "Button 3", type: "text", default: "Register to Vote →" },
      ],
    },
  ],
};
