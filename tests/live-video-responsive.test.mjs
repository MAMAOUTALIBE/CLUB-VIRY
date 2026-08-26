import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const liveVideoSource = await readFile(new URL("../src/components/LiveVideo.tsx", import.meta.url), "utf8");

test("mobile and tablet keep a tall non-shrinking video frame with the full image visible", () => {
  assert.match(liveVideoSource, /club-shell relative shrink-0 overflow-hidden/);
  assert.match(liveVideoSource, /relative h-\[20rem\] w-full shrink-0 bg-black sm:h-\[28rem\] xl:h-auto xl:aspect-video/);
  assert.match(liveVideoSource, /className="absolute inset-0 h-full w-full object-contain xl:object-cover"/);
});

test("desktop preserves the existing widescreen crop", () => {
  assert.match(liveVideoSource, /xl:h-auto xl:aspect-video/);
  assert.match(liveVideoSource, /object-contain xl:object-cover/);
});
