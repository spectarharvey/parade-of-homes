/**
 * Website Content ("site CMS") — shared types.
 *
 * The content schema in ./schema is the single source of truth for a field's
 * LABEL, TYPE and DEFAULT. The database only ever stores overrides, so deleting
 * a row restores the built-in copy that ships with the markup.
 */

/** Widget used by the admin editor, and how the value is rendered on the site. */
export type CmsFieldType =
  /** Single-line copy → `cms.t(key)` */
  | "text"
  /** Multi-line copy rendered as one paragraph → `cms.t(key)` */
  | "textarea"
  /** Multi-line copy where newlines become <br> → `cms.lines(key)` */
  | "multiline"
  /** Rich text → `cms.html(key)` */
  | "html"
  /** Image URL (uploader) → `cms.t(key)` used as a src / background */
  | "image"
  /** Link target: URL, `tel:` or `mailto:` → `cms.t(key)` used as an href */
  | "url";

export interface CmsField {
  /** Dot-path within the page. Shared keys start with `global.`. */
  key: string;
  label: string;
  type: CmsFieldType;
  /** MUST match what the site renders today, so unedited fields never change. */
  default: string;
  /** Optional hint shown under the input in the admin. */
  help?: string;
}

export interface CmsSection {
  title: string;
  fields: CmsField[];
}

export interface CmsPageSchema {
  /** "global" or a page slug. Stored in SiteContent.page. */
  page: string;
  /** Tab label in the admin. */
  label: string;
  /** Public path, used by the "View page ↗" link. Empty for `global`. */
  path: string;
  /** Short line under the tab title explaining what the group covers. */
  blurb?: string;
  sections: CmsSection[];
}

/** Flat map returned by GET /api/site-content. */
export type CmsValues = Record<string, string>;
/** page → key → value. What the provider holds. */
export type CmsStore = Record<string, CmsValues>;
/** Verbose form (`?verbose=1`) used by the admin editor. */
export type CmsVerboseValues = Record<string, { value: string; type: string }>;

/** The write payload for PUT /api/site-content. `null` deletes the override. */
export type CmsWrite = Record<
  string,
  { value: string; type: CmsFieldType } | null
>;
