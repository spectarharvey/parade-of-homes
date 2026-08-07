-- Keep public sponsor profiles with the company contact information supplied
-- in the sponsorship form. Defaults preserve existing sponsor records.
ALTER TABLE "Sponsor" ADD COLUMN IF NOT EXISTS "img" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Sponsor" ADD COLUMN IF NOT EXISTS "website" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Sponsor" ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Sponsor" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Sponsor" ADD COLUMN IF NOT EXISTS "address" TEXT NOT NULL DEFAULT '';
