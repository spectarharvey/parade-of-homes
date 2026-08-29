import type { CmsPageSchema } from "../types";

export const REGISTER_SCHEMA: CmsPageSchema = {
  page: "register",
  label: "Register / Log In",
  path: "/register",
  sections: [
    {
      title: "Register heading",
      fields: [
        { key: "register.eyebrow", label: "Eyebrow", type: "text", default: "Join the Parade" },
        { key: "register.title", label: "Heading", type: "text", default: "Register to Win" },
        {
          key: "register.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default:
            "Create your free guest pass to track home check-ins, fill your contest card, and get notified about builder specials. It only takes a moment.",
        },
      ],
    },
    {
      title: "Log In heading",
      fields: [
        { key: "login.eyebrow", label: "Eyebrow", type: "text", default: "Welcome Back" },
        { key: "login.title", label: "Heading", type: "text", default: "Log In to Your Pass" },
        {
          key: "login.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default:
            "Enter the email and password you registered with to pick up right where you left off.",
        },
      ],
    },
    {
      title: "Already signed in",
      fields: [
        { key: "signedIn.eyebrow", label: "Eyebrow", type: "text", default: "Your Guest Pass" },
        { key: "signedIn.title", label: "Heading", type: "text", default: "You're all set" },
        {
          key: "signedIn.blurb",
          label: "Intro paragraph",
          type: "textarea",
          default:
            "You're already signed in. Head to your contest card, or log out to switch accounts.",
        },
        { key: "signedIn.cardTitle", label: "Card heading", type: "text", default: "You're signed in" },
        { key: "signedIn.cta", label: "Contest card button", type: "text", default: "Go to My Contest Card →" },
        { key: "signedIn.logout", label: "Log out button", type: "text", default: "Log out" },
      ],
    },
    {
      title: "Form labels & buttons",
      fields: [
        { key: "tab.register", label: "Register tab", type: "text", default: "New here? Register" },
        { key: "tab.login", label: "Log in tab", type: "text", default: "Returning? Log In" },
        {
          key: "form.smsLabel",
          label: "SMS opt-in label",
          type: "textarea",
          default:
            "Yes! Send me SMS updates about builder specials, contest reminders, and event news. (Opt out anytime.)",
        },
        { key: "submit.register", label: "Register button", type: "text", default: "Create My Guest Pass →" },
        { key: "submit.login", label: "Log in button", type: "text", default: "Log In →" },
        { key: "switch.toLogin", label: "\"Already have a pass?\" prompt", type: "text", default: "Already have a pass?" },
        { key: "switch.toLoginLabel", label: "\"Already have a pass?\" link", type: "text", default: "Log in instead" },
        { key: "switch.toRegister", label: "\"No guest pass yet?\" prompt", type: "text", default: "No guest pass yet?" },
        { key: "switch.toRegisterLabel", label: "\"No guest pass yet?\" link", type: "text", default: "Register instead" },
      ],
    },
    {
      title: "Confirmation screens",
      fields: [
        { key: "done.register.title", label: "After registering — heading", type: "text", default: "You're registered!" },
        {
          key: "done.register.body",
          label: "After registering — body",
          type: "textarea",
          default: "Your guest pass is ready. Start checking in at homes to fill your contest card.",
        },
        { key: "done.login.title", label: "After logging in — heading", type: "text", default: "Welcome back!" },
        {
          key: "done.login.body",
          label: "After logging in — body",
          type: "textarea",
          default:
            "You're signed back in — your check-ins and contest card are right where you left them.",
        },
        { key: "done.cta", label: "Button", type: "text", default: "Go to My Contest Card →" },
      ],
    },
    {
      title: "Install-the-app panel",
      fields: [
        { key: "app.badge", label: "Badge", type: "text", default: "Save to Your Phone" },
        { key: "app.title", label: "Heading", type: "text", default: "Take the app with you" },
        {
          key: "app.body",
          label: "Body",
          type: "textarea",
          default:
            "Scan this code to open the Parade of Homes app on your phone — check in at each home with one tap.",
        },
        { key: "app.scanNote", label: "Below the QR code", type: "text", default: "Scan to open, or install it as an app:" },
        { key: "app.perk1", label: "Benefit 1", type: "text", default: "One-tap QR check-in at every home" },
        { key: "app.perk2", label: "Benefit 2", type: "text", default: "Automatic contest entry tracking" },
        { key: "app.perk3", label: "Benefit 3", type: "text", default: "Save favorites & plan your route" },
      ],
    },
  ],
};
