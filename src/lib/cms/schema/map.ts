import type { CmsPageSchema } from "../types";

export const MAP_SCHEMA: CmsPageSchema = {
  page: "map",
  label: "Map & Route",
  path: "/map",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Map & Route" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "Plan Your Visit" },
        { key: "head.title", label: "Heading", type: "text", default: "Interactive Map" },
        {
          key: "head.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default: "Click a pin to preview a home, or build a numbered route.",
        },
      ],
    },
    {
      title: "Sign-in prompt",
      fields: [
        {
          key: "signin.text",
          label: "Message",
          type: "text",
          default: "You must be registered and logged in to plan your route.",
          help: "Shown only to visitors who are not logged in.",
        },
        { key: "signin.loginLabel", label: "Log in link", type: "text", default: "Log in" },
        { key: "signin.registerLabel", label: "Register link", type: "text", default: "register" },
      ],
    },
    {
      title: "Sidebar",
      fields: [
        { key: "side.homesTitle", label: "Home list heading", type: "text", default: "Homes" },
        { key: "side.homesHint", label: "Home list hint", type: "text", default: "Tap to show or hide on the map." },
        { key: "side.printLabel", label: "Print button", type: "text", default: "🖨 Print Tour Map" },
        {
          key: "side.routeHint",
          label: "Route-building hint",
          type: "textarea",
          default: "Click pins on the map to add numbered stops. Drag stops to reorder your route.",
        },
        { key: "side.emptyRoute", label: "Empty route message", type: "text", default: "No stops yet." },
      ],
    },
  ],
};
