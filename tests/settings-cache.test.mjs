import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("site settings use one tagged cache invalidated immediately after every write", async () => {
  const source = await readFile(new URL("../src/lib/db/settings.ts", import.meta.url), "utf8");
  assert.match(source, /unstable_cache\(fetchAllSettings/);
  assert.match(source, /tags:\s*\[SITE_SETTINGS_CACHE_TAG\]/);
  assert.match(source, /revalidateTag\(SITE_SETTINGS_CACHE_TAG,\s*\{\s*expire:\s*0\s*\}\)/);
  assert.ok(source.indexOf("revalidateTag(SITE_SETTINGS_CACHE_TAG") > source.indexOf("if (error)"), "invalidation must happen only after the database write succeeds");
});
