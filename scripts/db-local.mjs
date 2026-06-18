// Starts a local, no-signup Postgres for development using embedded-postgres.
// First run downloads a Postgres binary and initialises a data cluster in
// ./.pgdata (gitignored); subsequent runs just start it. Keeps running until
// you press Ctrl+C. Point DATABASE_URL at it (see .env.example).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(root, ".pgdata");
const PORT = Number(process.env.PGLOCAL_PORT || 5433);
const USER = "postgres";
const PASSWORD = "postgres";
const DB_NAME = "parade";

const alreadyInitialised = fs.existsSync(path.join(DATA_DIR, "PG_VERSION"));

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
});

async function main() {
  if (!alreadyInitialised) {
    console.log("• Initialising local Postgres cluster (first run, downloading binary)…");
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(DB_NAME);
    console.log(`• Created database "${DB_NAME}"`);
  } catch {
    /* already exists */
  }

  const url = `postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}`;
  console.log("\n✓ Local Postgres is running.");
  console.log(`  DATABASE_URL="${url}"`);
  console.log("\n  Next (first time, in another terminal):  npm run db:setup");
  console.log("  Then:                                     npm run dev");
  console.log("\n  (Leave this running. Press Ctrl+C to stop.)\n");

  const shutdown = async () => {
    console.log("\n• Stopping local Postgres…");
    try {
      await pg.stop();
    } catch {
      /* ignore */
    }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error("Failed to start local Postgres:", e);
  process.exit(1);
});
