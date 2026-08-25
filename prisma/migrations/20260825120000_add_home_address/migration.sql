-- The model home's street address, promoted out of the `features` array into a
-- first-class column. It renders as its own "Address" section on /home/<id> and
-- is edited in the admin + builder home forms.
ALTER TABLE "Home" ADD COLUMN IF NOT EXISTS "address" TEXT NOT NULL DEFAULT '';

-- Backfill from the legacy "Model location: …" feature so existing listings keep
-- their address without a re-entry pass.
UPDATE "Home" AS h
SET "address" = btrim(regexp_replace(loc.f, '^model location:[[:space:]]*', '', 'i'))
FROM (
  SELECT
    "id",
    (SELECT x FROM unnest("features") AS x WHERE x ~* '^model location:' LIMIT 1) AS f
  FROM "Home"
) AS loc
WHERE h."id" = loc."id" AND loc.f IS NOT NULL AND h."address" = '';

-- Drop the now-duplicated feature entry.
UPDATE "Home" AS h
SET "features" = ARRAY(SELECT x FROM unnest(h."features") AS x WHERE x !~* '^model location:')
WHERE EXISTS (SELECT 1 FROM unnest(h."features") AS x WHERE x ~* '^model location:');
