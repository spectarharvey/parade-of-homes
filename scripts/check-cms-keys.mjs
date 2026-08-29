#!/usr/bin/env node
/**
 * Website Content — 1:1 check between the markup and the content schema.
 *
 * Greps every `cms.t("…") / cms.lines("…") / cms.html("…")` key used under
 * src/ and diffs it, per page, against the fields declared in
 * src/lib/cms/schema. Both directions are errors:
 *   • a key used in the markup with no schema field  → editors can never edit it
 *   • a schema field no page ever reads              → a dead box in the admin
 *
 * It also asserts that every page component that reads content sits under the
 * (public) route group, i.e. inside the layout that provides the values —
 * the React equivalent of "every hooked page must load the hydrator".
 *
 * Run: npm run cms:check
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "src");
const SCHEMA_DIR = path.join(SRC, "lib/cms/schema");
const GLOBAL_PAGE = "global";

const errors = [];
function fail(msg) {
  errors.push(msg);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.tsx?$/.test(p) ? [p] : [];
  });

// ---------------------------------------------------------------- schema side
const declared = new Map(); // page -> Set(key)
const pagePaths = new Map(); // page -> public path
for (const file of fs.readdirSync(SCHEMA_DIR)) {
  const src = fs.readFileSync(path.join(SCHEMA_DIR, file), "utf8");
  const page = src.match(/^\s*page:\s*"([^"]+)"/m)?.[1];
  if (!page) continue;
  pagePaths.set(page, src.match(/^\s*path:\s*"([^"]*)"/m)?.[1] ?? "");
  const keys = new Set(
    [...src.matchAll(/^\s*\{?\s*key:\s*"([^"]+)"/gm)].map((m) => m[1]),
  );
  declared.set(page, keys);

  const dupes = [...src.matchAll(/^\s*\{?\s*key:\s*"([^"]+)"/gm)].map((m) => m[1]);
  const seen = new Set();
  for (const k of dupes) {
    if (seen.has(k)) fail(`${file}: duplicate schema key "${k}"`);
    seen.add(k);
  }
}

// ---------------------------------------------------------------- markup side
const used = new Map(); // page -> Map(key -> [files])

for (const file of walk(SRC)) {
  if (file.startsWith(SCHEMA_DIR)) continue;
  const src = fs.readFileSync(file, "utf8");

  // A component declares its page once: useCms("home") / useGlobalCms().
  const slugs = [...src.matchAll(/useCms\(\s*"([^"]+)"\s*\)/g)].map((m) => m[1]);
  if (/useGlobalCms\(/.test(src)) slugs.push(GLOBAL_PAGE);
  const keys = [
    ...src.matchAll(/\bcms\.(?:t|lines|html)\(\s*"([^"]+)"\s*\)/g),
  ].map((m) => m[1]);

  // Some keys are read through a lookup table (e.g. the nav array in Header),
  // so `cms.t(key)` carries a variable. Count any bare string literal in the
  // file that is an exact schema key as a use too — dot-paths don't collide
  // with ordinary copy.
  const literals = [...src.matchAll(/"([A-Za-z][\w-]*(?:\.[\w-]+)+)"/g)].map(
    (m) => m[1],
  );

  if (!keys.length) continue;
  const rel = path.relative(root, file);

  if (!slugs.length) {
    fail(`${rel}: reads content but never calls useCms("<page>") / useGlobalCms()`);
    continue;
  }
  const unique = [...new Set(slugs)];
  if (unique.length > 1) {
    fail(`${rel}: declares more than one page slug (${unique.join(", ")})`);
    continue;
  }
  const page = unique[0];

  // Values are provided by the (public) layout, so anything reading them must
  // live inside that route group (or be a component only used there).
  const isPublicRoute = /src\/app\//.test(rel) && !/src\/app\/\(public\)\//.test(rel);
  if (isPublicRoute)
    fail(`${rel}: reads content but is outside the (public) layout that provides it`);

  const bucket = used.get(page) ?? new Map();
  const indirect = literals.filter(
    (k) =>
      declared.get(k.startsWith(`${GLOBAL_PAGE}.`) ? GLOBAL_PAGE : page)?.has(k),
  );
  for (const key of [...keys, ...indirect]) {
    const owner = key.startsWith(`${GLOBAL_PAGE}.`) ? GLOBAL_PAGE : page;
    const target = owner === page ? bucket : used.get(GLOBAL_PAGE) ?? new Map();
    (target.get(key) ?? target.set(key, []).get(key)).push(rel);
    if (owner !== page) used.set(GLOBAL_PAGE, target);
  }
  used.set(page, bucket);
}

// ------------------------------------------------------------------- the diff
const allPages = new Set([...declared.keys(), ...used.keys()]);
for (const page of [...allPages].sort()) {
  const schemaKeys = declared.get(page);
  const markupKeys = used.get(page) ?? new Map();

  if (!schemaKeys) {
    fail(`page "${page}" is used in markup but has no schema module`);
    continue;
  }
  for (const key of markupKeys.keys())
    if (!schemaKeys.has(key))
      fail(`[${page}] "${key}" is used in ${markupKeys.get(key)[0]} but not declared in the schema`);
  for (const key of schemaKeys)
    if (!markupKeys.has(key))
      fail(`[${page}] "${key}" is declared in the schema but never rendered`);
}

// ---------------------------------------------------------------------- report
const total = [...declared.values()].reduce((n, s) => n + s.size, 0);
if (errors.length) {
  console.error(`✗ Website Content check failed (${errors.length} problem(s)):\n`);
  for (const e of errors) console.error("  • " + e);
  process.exit(1);
}
console.log(
  `✓ Website Content: ${total} fields across ${declared.size} pages — schema and markup match 1:1.`,
);
