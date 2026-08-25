-- Per-neighborhood switch for the public price range. Defaults to true so every
-- existing neighborhood keeps showing its range until an admin hides it.
ALTER TABLE "Neighborhood" ADD COLUMN IF NOT EXISTS "showPrice" BOOLEAN NOT NULL DEFAULT true;
