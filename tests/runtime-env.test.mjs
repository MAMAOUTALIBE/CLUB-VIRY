import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadRuntimeEnv, parseRuntimeEnv, runtimeEnvFiles } from "../scripts/runtime-env.mjs";

test("parseRuntimeEnv reads common dotenv syntax", () => {
  const parsed = parseRuntimeEnv(`
# ignored
PLAIN=value
SPACED = value with spaces
INLINE=value # comment
QUOTED="line\\nnext"
SINGLE='single value'
export EXPORTED=yes
INVALID LINE
`);

  assert.deepEqual(parsed, {
    PLAIN: "value",
    SPACED: "value with spaces",
    INLINE: "value",
    QUOTED: "line\nnext",
    SINGLE: "single value",
    EXPORTED: "yes"
  });
});

test("loadRuntimeEnv applies env files without overriding existing runtime variables", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "club-viry-env-"));

  try {
    await writeFile(path.join(root, ".env"), "BASE=from-env\nSHARED=from-env\nKEEP=from-env\n");
    await writeFile(path.join(root, ".env.production"), "PROD=from-production\nSHARED=from-production\n");
    await writeFile(path.join(root, ".env.local"), "LOCAL=from-local\nSHARED=from-local\n");
    await writeFile(path.join(root, ".env.production.local"), "FINAL=from-production-local\nSHARED=from-production-local\nKEEP=from-file\n");

    const target = { KEEP: "already-set" };
    const result = loadRuntimeEnv({ root, nodeEnv: "production", target });

    assert.deepEqual(
      result.loadedFiles.map((file) => path.basename(file)),
      [".env", ".env.production", ".env.local", ".env.production.local"]
    );
    assert.equal(target.BASE, "from-env");
    assert.equal(target.PROD, "from-production");
    assert.equal(target.LOCAL, "from-local");
    assert.equal(target.FINAL, "from-production-local");
    assert.equal(target.SHARED, "from-production-local");
    assert.equal(target.KEEP, "already-set");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("runtimeEnvFiles uses production order by default", () => {
  assert.deepEqual(
    runtimeEnvFiles("/app").map((file) => file.replace("/app/", "")),
    [".env", ".env.production", ".env.local", ".env.production.local"]
  );
});
