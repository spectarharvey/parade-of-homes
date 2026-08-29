import type { CmsPageSchema } from "../types";

export const HOME_SCHEMA: CmsPageSchema = {
  page: "home",
  label: "Home Page",
  path: "/",
  sections: [
    {
      title: "Hero",
      fields: [
        { key: "hero.dates", label: "Date badge", type: "text", default: "Nov 6-8 & 13-15, 2026 · Fri-Sun" },
        { key: "hero.title.line1", label: "Headline — first line", type: "text", default: "Discover Marion County's" },
        {
          key: "hero.title.line2",
          label: "Headline — second line (gold)",
          type: "text",
          default: "Finest New Homes",
        },
        {
          key: "hero.lede",
          label: "Intro paragraph",
          type: "textarea",
          default:
            "Tour award-winning builder showcases, plan your perfect route, vote for your favorites, and enter the visitor giveaway.",
        },
        { key: "hero.cta1.label", label: "Primary button", type: "text", default: "Browse Homes" },
        { key: "hero.cta1.href", label: "Primary button link", type: "url", default: "/homes" },
        { key: "hero.cta2.label", label: "Secondary button", type: "text", default: "Plan My Route →" },
        { key: "hero.cta2.href", label: "Secondary button link", type: "url", default: "/map" },
      ],
    },
    {
      title: "Countdown bar",
      fields: [
        {
          key: "countdown.title",
          label: "Heading (before the Parade)",
          type: "text",
          default: "Countdown to the 2026 Parade of Homes (EST)",
        },
        {
          key: "countdown.doneTitle",
          label: "Heading (once the Parade starts)",
          type: "text",
          default: "The 2026 Parade of Homes is here",
        },
        { key: "countdown.days", label: "Label — days", type: "text", default: "Days" },
        { key: "countdown.hours", label: "Label — hours", type: "text", default: "Hours" },
        { key: "countdown.minutes", label: "Label — minutes", type: "text", default: "Minutes" },
        { key: "countdown.seconds", label: "Label — seconds", type: "text", default: "Seconds" },
      ],
    },
    {
      title: "Featured Builder",
      fields: [
        { key: "featured.eyebrow", label: "Eyebrow", type: "text", default: "Builder Spotlight" },
        { key: "featured.title", label: "Heading", type: "text", default: "Featured Builder" },
        { key: "featured.badge", label: "Badge", type: "text", default: "★ Featured Builder" },
        { key: "featured.cta", label: "Button", type: "text", default: "View Builder Profile" },
        {
          key: "featured.pendingBadge",
          label: "Badge shown while photos are missing",
          type: "text",
          default: "Assets pending",
          help: "Only appears when the featured builder has no home photos yet.",
        },
      ],
    },
    {
      title: "Contest call-out",
      fields: [
        { key: "contest.badge", label: "Badge", type: "text", default: "Win Big" },
        {
          key: "contest.title",
          label: "Heading",
          type: "text",
          default: "Tour the homes. Enter to win. Pack your bags!",
        },
        {
          key: "contest.body",
          label: "Body",
          type: "textarea",
          default:
            "Visit at least 8 homes across the two Parade weekends for your chance to win our grand-prize giveaway — a relaxing three-day oceanview getaway for two. Full prize details will be announced soon!",
        },
        {
          key: "contest.note.text",
          label: "Sign-in note",
          type: "text",
          default: "You must be registered and logged in to participate in the contest.",
          help: "Shown only to visitors who are not logged in.",
        },
        { key: "contest.note.loginLabel", label: "Sign-in note — log in link", type: "text", default: "Log in" },
        { key: "contest.note.registerLabel", label: "Sign-in note — register link", type: "text", default: "register" },
        { key: "contest.cta", label: "Button", type: "text", default: "Track My Progress" },
      ],
    },
    {
      title: "Get Inspired slider",
      fields: [
        { key: "inspired.eyebrow", label: "Eyebrow", type: "text", default: "Get Inspired" },
        { key: "inspired.title", label: "Heading", type: "text", default: "by The Parade of Homes" },
        { key: "inspired.cta", label: "Button", type: "text", default: "View All Homes →" },
      ],
    },
    {
      title: "Sponsor bar",
      fields: [
        {
          key: "sponsors.title",
          label: "Heading",
          type: "text",
          default: "Proudly Supported By Our Sponsors",
        },
        { key: "sponsors.cta", label: "Button", type: "text", default: "See all Sponsors" },
      ],
    },
  ],
};
