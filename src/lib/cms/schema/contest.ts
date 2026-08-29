import type { CmsPageSchema } from "../types";

export const CONTEST_SCHEMA: CmsPageSchema = {
  page: "contest",
  label: "Contest",
  path: "/contest",
  sections: [
    {
      title: "Page header",
      fields: [
        { key: "crumb", label: "Breadcrumb label", type: "text", default: "Contest" },
        { key: "head.eyebrow", label: "Eyebrow", type: "text", default: "Visit · Vote · Win" },
        { key: "head.title", label: "Heading", type: "text", default: "Contest Tracker" },
      ],
    },
    {
      title: "Sign-in prompt",
      fields: [
        {
          key: "signin.text",
          label: "Message",
          type: "text",
          default: "You must be registered and logged in to participate in the giveaway contest.",
          help: "Shown only to visitors who are not logged in.",
        },
        { key: "signin.loginLabel", label: "Log in link", type: "text", default: "Log in" },
        { key: "signin.registerLabel", label: "Register link", type: "text", default: "register" },
      ],
    },
    {
      title: "Grand prize banner",
      fields: [
        {
          key: "prize.image",
          label: "Background photo",
          type: "image",
          default: "/parade-entries/2026/prize.jpg",
          help: "Sits behind a sunset gradient. Use a wide (landscape) photo you have the rights to.",
        },
        { key: "prize.eyebrow", label: "Eyebrow", type: "text", default: "Grand Prize" },
        { key: "prize.title", label: "Heading", type: "text", default: "An Oceanview Getaway Awaits" },
        {
          key: "prize.fallback",
          label: "Prize description (fallback)",
          type: "textarea",
          default:
            "Tour the Parade, check in at the required number of homes, and you could win a relaxing three-day oceanview getaway for two. The full prize will be announced soon — keep stamping your contest card to stay eligible!",
          help: "Only used when the prize text in Admin → Contest Settings is empty.",
        },
      ],
    },
    {
      title: "Progress card",
      fields: [
        { key: "progress.title", label: "Heading", type: "text", default: "Your Progress" },
        { key: "progress.enteredNote", label: "Entered note", type: "text", default: "You’re entered to win!" },
        { key: "progress.enteredBadge", label: "Entered badge", type: "text", default: "✓ Entered to Win" },
        { key: "progress.inProgressBadge", label: "In-progress badge", type: "text", default: "In Progress" },
      ],
    },
    {
      title: "Visit lists",
      fields: [
        { key: "visited.title", label: "Visited heading", type: "text", default: "Homes You've Visited" },
        { key: "visited.rateHint", label: "Rate prompt", type: "text", default: "☆ Tap to rate this home" },
        { key: "visited.voteLabel", label: "Your-vote label", type: "text", default: "Your vote" },
        { key: "remaining.title", label: "Still-to-visit heading", type: "text", default: "Still to Visit" },
        {
          key: "remaining.allVisited",
          label: "All stops visited message",
          type: "textarea",
          default: "You’ve visited every stop on your route — amazing!",
        },
        {
          key: "remaining.empty",
          label: "No route message",
          type: "textarea",
          default: "No route planned yet. Tap “Plan My Route” to add your stops.",
        },
        { key: "remaining.cta", label: "Button", type: "text", default: "Plan My Route →" },
      ],
    },
    {
      title: "Giveaway terms",
      fields: [
        {
          key: "terms",
          label: "Terms",
          type: "textarea",
          default:
            "Giveaway terms: Based on availability. Excludes holidays and special events. Blackout dates may apply. Certificate cannot be extended and has no cash value. Valid through May 15, 2027.",
        },
      ],
    },
  ],
};
