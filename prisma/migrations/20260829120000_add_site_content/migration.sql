-- Admin-editable website copy/imagery ("Website Content" CMS).
-- Purely additive: every row is an OVERRIDE of a built-in default that lives in
-- src/lib/cms/schema, so an empty table renders the site exactly as before.
CREATE TABLE IF NOT EXISTS "SiteContent" (
    "id"        TEXT NOT NULL,
    "page"      TEXT NOT NULL,
    "key"       TEXT NOT NULL,
    "type"      TEXT NOT NULL DEFAULT 'text',
    "value"     TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteContent_page_key_key" ON "SiteContent"("page", "key");
CREATE INDEX IF NOT EXISTS "SiteContent_page_idx" ON "SiteContent"("page");
