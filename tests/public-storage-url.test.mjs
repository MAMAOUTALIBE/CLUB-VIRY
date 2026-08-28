import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolvePublicStorageUrl } from "../src/lib/public-storage-url.ts";

test("les uploads Supabase internes sont servis par le domaine public du site", () => {
  assert.equal(
    resolvePublicStorageUrl(
      "http://kong:8000/storage/v1/object/public/site-uploads/medias/photo.jpg",
      "http://kong:8000",
      "https://esvirychatillonfootball.org"
    ),
    "https://esvirychatillonfootball.org/storage/v1/object/public/site-uploads/medias/photo.jpg"
  );
});

test("une URL Supabase déjà publique reste inchangée", () => {
  const url = "https://club.supabase.co/storage/v1/object/public/site-uploads/medias/photo.jpg";
  assert.equal(resolvePublicStorageUrl(url, "https://club.supabase.co", "https://club.example"), url);
});

test("une configuration invalide ne produit pas une URL inventée", () => {
  assert.equal(resolvePublicStorageUrl("/photo.jpg", "not-a-url", "https://club.example"), "/photo.jpg");
});

test("l'upload CRM et nginx utilisent la même route publique de stockage", async () => {
  const uploadSource = await readFile(new URL("../src/lib/api/image-upload.ts", import.meta.url), "utf8");
  const nginxSource = await readFile(new URL("../infra/nginx/esvirychatillonfootball.org.conf", import.meta.url), "utf8");
  assert.match(uploadSource, /resolvePublicStorageUrl\(data\.publicUrl/);
  assert.match(nginxSource, /location \^~ \/storage\/v1\/object\/public\//);
  assert.match(nginxSource, /proxy_pass http:\/\/127\.0\.0\.1:8000/);
});
