import { expect, test } from "@playwright/test";

const json = (data: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ ok: true, data })
});

test("une famille autorisée retrouve, télécharge ses ressources et ouvre le direct sécurisé", async ({ page }) => {
  await page.route("**/api/family", (route) => route.fulfill(json({ players: [{ id: "player-1", first_name: "Lina", last_name: "Test" }] })));
  await page.route("**/api/family/notifications", (route) => route.fulfill(json({ notifications: [], unread: 0 })));
  await page.route("**/api/family/notifications/preferences", (route) => route.fulfill(json({ preferences: [] })));
  await page.route("**/api/family/media-pass", (route) => route.fulfill(json({
    passes: [{
      id: "pass-1",
      status: "ACTIVE",
      startsOn: "2026-08-01",
      endsOn: "2027-07-31",
      allowPhotos: true,
      allowTrainingVideos: true,
      allowLiveMatches: true,
      teamNames: ["U16"]
    }]
  })));
  await page.route("**/api/family/media?limit=100", (route) => route.fulfill(json({
    assets: [{
      id: "asset-1",
      team_id: "team-1",
      type: "PHOTO",
      content_kind: "MATCH",
      playback_kind: "VIDEO",
      title: "Photos U16 - Viry contre Massy",
      thumbnail_url: null,
      alt_text: "Équipe U16 pendant le match",
      is_live: false,
      published_at: "2026-08-30T10:00:00Z",
      access_path: "/api/family/media/asset-1/access"
    }]
  })));
  await page.route("**/api/family/matches/live", (route) => route.fulfill(json({
    matches: [{
      id: "match-1",
      teamId: "team-1",
      teamName: "U16 Viry-Châtillon",
      opponentName: "Massy",
      opponentLogoUrl: null,
      location: "HOME",
      startsAt: "2026-08-30T15:00:00Z",
      competition: "Championnat",
      homeScore: 2,
      awayScore: 1,
      liveMinute: 67,
      accessPath: "/api/family/matches/match-1/live"
    }]
  })));
  let secureLiveChecks = 0;
  await page.route("**/api/family/matches/match-1/live", (route) => {
    secureLiveChecks += 1;
    return route.fulfill(json({ url: "/espace-famille?direct=ouvert" }));
  });
  await page.route(/.*/, (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/family/media/asset-1/file") {
      const shouldDownload = url.searchParams.get("download") === "1";
      return route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        headers: { "Content-Disposition": shouldDownload ? "attachment; filename=photos-u16.jpg" : "inline" },
        body: "photo-test"
      });
    }
    return route.fallback();
  });

  await page.goto("/espace-famille");
  await expect(page.getByRole("heading", { name: "Mon espace famille" }).filter({ visible: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Photos U16 - Viry contre Massy" }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText("U16 Viry-Châtillon - Massy").filter({ visible: true })).toBeVisible();
  await expect(page.getByText("2 - 1 · Championnat").filter({ visible: true })).toBeVisible();
  await expect(page.getByText(/En direct · 67/).filter({ visible: true })).toBeVisible();

  const downloadLink = page.getByRole("link", { name: "Télécharger" }).filter({ visible: true });
  await expect(downloadLink).toHaveAttribute("href", "/api/family/media/asset-1/file?download=1");
  await expect(downloadLink).toHaveAttribute("download", "");

  await page.getByRole("button", { name: "Voir le match" }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/direct=ouvert/);
  expect(secureLiveChecks).toBe(1);
});
