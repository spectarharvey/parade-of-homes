import type { CmsField, CmsPageSchema } from "./types";
import { GLOBAL_SCHEMA } from "./schema/global";
import { HOME_SCHEMA } from "./schema/home";
import { HOMES_SCHEMA } from "./schema/homes";
import { COMMUNITIES_SCHEMA } from "./schema/communities";
import { BUILDERS_SCHEMA } from "./schema/builders";
import { EVENT_SCHEMA } from "./schema/event";
import { MAP_SCHEMA } from "./schema/map";
import { CONTEST_SCHEMA } from "./schema/contest";
import { SPONSORS_SCHEMA } from "./schema/sponsors";
import { FAQ_SCHEMA } from "./schema/faq";
import { REGISTER_SCHEMA } from "./schema/register";
import { BUILDER_ENTRY_SCHEMA } from "./schema/builderEntry";
import { SPONSOR_ENTRY_SCHEMA } from "./schema/sponsorEntry";

/** Every editable page, in the order the admin tabs are shown. Global first. */
export const CMS_PAGES: CmsPageSchema[] = [
  GLOBAL_SCHEMA,
  HOME_SCHEMA,
  HOMES_SCHEMA,
  COMMUNITIES_SCHEMA,
  BUILDERS_SCHEMA,
  EVENT_SCHEMA,
  MAP_SCHEMA,
  CONTEST_SCHEMA,
  SPONSORS_SCHEMA,
  FAQ_SCHEMA,
  REGISTER_SCHEMA,
  BUILDER_ENTRY_SCHEMA,
  SPONSOR_ENTRY_SCHEMA,
];

/** The shared header/footer group. Its keys are usable from any page. */
export const GLOBAL_PAGE = GLOBAL_SCHEMA.page;

export const CMS_PAGE_SLUGS: string[] = CMS_PAGES.map((p) => p.page);

export function cmsPage(page: string): CmsPageSchema | undefined {
  return CMS_PAGES.find((p) => p.page === page);
}

/** page → key → field. Built once; the lookup table behind every default. */
export const CMS_FIELDS: Record<string, Record<string, CmsField>> =
  Object.fromEntries(
    CMS_PAGES.map((p) => [
      p.page,
      Object.fromEntries(
        p.sections.flatMap((s) => s.fields).map((f) => [f.key, f]),
      ),
    ]),
  );

/**
 * Keys starting with `global.` always live in the shared group, whatever page
 * they are referenced from. Everything else belongs to the page itself.
 */
export function cmsOwner(page: string, key: string): string {
  return key.startsWith(`${GLOBAL_PAGE}.`) ? GLOBAL_PAGE : page;
}

/** The built-in copy that ships with the markup, or "" for an unknown key. */
export function cmsDefault(page: string, key: string): string {
  return CMS_FIELDS[cmsOwner(page, key)]?.[key]?.default ?? "";
}
