-- Real per-home map coordinates (nullable = not yet pinned). Placement now
-- prefers these over the legacy homeGeo.HOME_COORDS lookup; x/y stay as dead
-- columns for now. Backfill the seeded homes from the current homeGeo values
-- so existing placement doesn't regress.
ALTER TABLE "Home" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION;
ALTER TABLE "Home" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;

UPDATE "Home" SET "lat"=29.1153, "lng"=-82.2812 WHERE "id"='h_dr_horton_holden' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.0049, "lng"=-82.2007 WHERE "id"='h_deltona_mustang' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.2461, "lng"=-82.2795 WHERE "id"='h_secure_built_rutherford' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.2508, "lng"=-82.2903 WHERE "id"='h_curington_sebastian' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.2836, "lng"=-82.4534 WHERE "id"='h_brije_aspen' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.2381, "lng"=-82.2447 WHERE "id"='h_luetgert_golden_hills' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.125,  "lng"=-82.285  WHERE "id"='h_otow_whitmore' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.135,  "lng"=-82.215  WHERE "id"='h_calesa_heritage' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.165,  "lng"=-82.105  WHERE "id"='h_townsley_wyrick' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.18,   "lng"=-82.128  WHERE "id"='h_stentiford_fortking' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=29.135,  "lng"=-82.035  WHERE "id"='h_almilton_hemlock' AND "lat" IS NULL;
UPDATE "Home" SET "lat"=28.915,  "lng"=-82.457  WHERE "id"='h_dream_valencia' AND "lat" IS NULL;
