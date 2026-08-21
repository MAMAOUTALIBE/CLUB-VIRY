import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonOk } from "@/lib/api/http";
import { countPublishedNews, listPublishedNewsTimestampsForActivity } from "@/lib/db/content";
import { listPublicCalendarRangeExact } from "@/lib/db/calendar";
import { getAllSettings } from "@/lib/db/settings";
import { countUpcomingMatches, listUpcomingMatches } from "@/lib/db/teams";
import { getVisibleAnnouncements, validateAnnouncementsSetting } from "@/lib/announcements";
import { countRegistrationsForAdmin } from "@/lib/db/registrations";
import { bucketPublicationActivity, getParisWeekWindow } from "@/lib/publication-activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");

  if (!admin.ok) {
    admin.response.headers.set("Cache-Control", "private, no-store");
    return admin.response;
  }

  try {
    const now = new Date();
    const week = getParisWeekWindow(now);
    const weekEndInclusive = new Date(new Date(week.endExclusiveIso).getTime() - 1).toISOString();
    const [publishedNewsCount, publicationTimestamps, upcomingMatchCount, registrationCount, upcomingMatches, calendar, settings] = await Promise.all([
      countPublishedNews(), listPublishedNewsTimestampsForActivity(now), countUpcomingMatches(), countRegistrationsForAdmin(), listUpcomingMatches(20),
      listPublicCalendarRangeExact(week.startIso, weekEndInclusive), getAllSettings()
    ]);
    const validation = validateAnnouncementsSetting(settings.announcements);
    const announcements = getVisibleAnnouncements(validation.ok ? validation.announcements : null, now.getTime());
    const response = jsonOk({
      metrics: [{ key: "registrations", count: registrationCount }], publishedNewsCount, upcomingMatchCount,
      upcomingMatches: upcomingMatches.map(({ id, opponent_name, starts_at, venue, competition, location }) => ({ id, opponent_name, starts_at, venue, competition, location })),
      week: { from: week.startIso, to: week.endExclusiveIso,
        events: calendar.events.map(({ id, title, starts_at, ends_at, venue }) => ({ id, title, starts_at, ends_at, venue })),
        matches: calendar.matches.map(({ id, opponent_name, starts_at, venue, competition, location }) => ({ id, opponent_name, starts_at, venue, competition, location })) },
      announcements: announcements.map(({ id, message, type }) => ({ id, message, type })),
      publicationActivity: bucketPublicationActivity(publicationTimestamps, now)
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    const response = handleDbError("admin/dashboard", error); response.headers.set("Cache-Control", "private, no-store"); return response;
  }
}
