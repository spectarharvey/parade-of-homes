"use client";

import React, { createContext, useContext, useMemo } from "react";
import { CMS_FIELDS, GLOBAL_PAGE, cmsOwner } from "./registry";
import type { CmsStore } from "./types";

/**
 * Website Content — front-end resolver.
 *
 * The whole override store is handed down from the server layout, so values are
 * already applied in the server-rendered HTML: no fetch, no flash, no SEO hit.
 * A key with no stored row falls back to the built-in default in the schema,
 * which is exactly the copy that used to be hard-coded in the markup.
 *
 * Attribute vocabulary → React equivalents:
 *   data-cms       → {cms.t(key)}            text, and <img src>/<a href>/alt
 *   data-cms-lines → {cms.lines(key)}        newlines become <br>
 *   data-cms-html  → {cms.html(key)}         rich text
 *   data-cms-bg    → style={{ backgroundImage: `url('${cms.t(key)}')` }}
 */
const CmsCtx = createContext<CmsStore>({});

export function CmsProvider({
  values,
  children,
}: {
  values: CmsStore;
  children: React.ReactNode;
}) {
  return <CmsCtx.Provider value={values}>{children}</CmsCtx.Provider>;
}

export interface PageCms {
  /** The page slug these keys resolve against. */
  page: string;
  /** Stored value, else the built-in default. Use for text, src, href and alt. */
  t: (key: string) => string;
  /** Same as `t`, but renders newlines as <br> (addresses, stacked headings). */
  lines: (key: string) => React.ReactNode;
  /** Renders a rich-text value as HTML. */
  html: (key: string) => React.ReactNode;
}

function resolve(store: CmsStore, page: string, key: string): string {
  const owner = cmsOwner(page, key);
  const stored = store[owner]?.[key];
  if (typeof stored === "string") return stored;
  const field = CMS_FIELDS[owner]?.[key];
  if (!field && process.env.NODE_ENV !== "production") {
    console.warn(
      `[site-content] "${key}" is not in the ${owner} schema — add it or run "npm run cms:check".`,
    );
  }
  return field?.default ?? "";
}

/**
 * Declare the page slug once per page component, e.g. `const cms = useCms("home")`.
 * `global.*` keys keep working from any page.
 */
export function useCms(page: string): PageCms {
  const store = useContext(CmsCtx);
  return useMemo<PageCms>(
    () => ({
      page,
      t: (key) => resolve(store, page, key),
      lines: (key) => {
        const value = resolve(store, page, key);
        return value.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </React.Fragment>
        ));
      },
      html: (key) => (
        <span dangerouslySetInnerHTML={{ __html: resolve(store, page, key) }} />
      ),
    }),
    [store, page],
  );
}

/** For the shared header/footer, which have no page of their own. */
export function useGlobalCms(): PageCms {
  return useCms(GLOBAL_PAGE);
}
