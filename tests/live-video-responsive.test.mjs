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

test("the match viewer exposes the twelve supplied media in order", () => {
  const sequenceEntries = liveVideoSource.match(/label: "Séquence \d+"/g) ?? [];
  assert.equal(sequenceEntries.length, 12);
  for (let index = 1; index <= 12; index += 1) {
    assert.match(liveVideoSource, new RegExp(`match-direct-sequence-${index}\\.(?:mp4|jpg)`));
  }
});

test("photos are represented as images and video controls are conditional", () => {
  assert.match(liveVideoSource, /type MatchMedia =/);
  assert.match(liveVideoSource, /type: "image"; alt: string/);
  assert.equal((liveVideoSource.match(/type: "image"/g) ?? []).length, 3);
  assert.match(liveVideoSource, /activeMedia\.type === "video" \? \(/);
  assert.match(liveVideoSource, /activeMedia\.type === "video" && !playing/);
  assert.match(liveVideoSource, /className="object-contain xl:object-cover"/);
});

test("sequence buttons scroll horizontally without overflowing on mobile", () => {
  assert.match(liveVideoSource, /w-full max-w-full snap-x gap-2 overflow-x-auto/);
  assert.match(liveVideoSource, /shrink-0 snap-start whitespace-nowrap/);
  assert.match(liveVideoSource, /aria-label="Choisir une séquence du match"/);
});
