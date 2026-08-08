-- Guest passes can now be secured with a password. Existing registrants keep a
-- NULL passwordHash until they set one (re-registering with the same email
-- claims the record and stores the hash).
ALTER TABLE "Registrant" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
