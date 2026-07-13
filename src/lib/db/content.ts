import "server-only";

import type {
  AdminMediaAlbumPayload,
  AdminMediaAssetPayload,
  AdminNewsPayload,
  AdminPartnerPayload,
  AdminPartnershipRequestReviewPayload
} from "@/lib/api/validation";
import { notifyTeamMediaAdded, notifyTeamNews } from "@/lib/db/family-notifications";
import { recordActivity } from "@/lib/db/foundations";
import { queueAdminNotification } from "@/lib/db/notifications";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { MediaAlbum, MediaAsset, NewsArticle, Partner, PartnershipRequest } from "@/lib/db/types";

export type MediaPayload = {
  albums: MediaAlbum[];
  assets: MediaAsset[];
};

export type CreatePartnershipRequestInput = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function newsPayloadToRow(input: AdminNewsPayload, authorId?: string) {
  return {
    ...(input.title ? { title: input.title } : {}),
    ...(input.slug || input.title ? { slug: input.slug ?? slugify(input.title as string) } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt ?? null } : {}),
    ...(input.content ? { content: input.content } : {}),
    ...(input.coverImageUrl !== undefined ? { cover_image_url: input.coverImageUrl ?? null } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.publishedAt !== undefined ? { published_at: input.publishedAt ?? null } : {}),
    ...(input.teamId !== undefined ? { team_id: input.teamId ?? null } : {}),
    ...(authorId ? { author_id: authorId } : {}),
    ...(input.seoTitle !== undefined ? { seo_title: input.seoTitle ?? null } : {}),
    ...(input.seoDescription !== undefined ? { seo_description: input.seoDescription ?? null } : {})
  };
}

function mediaAlbumPayloadToRow(input: AdminMediaAlbumPayload) {
  return {
    ...(input.title ? { title: input.title } : {}),
    ...(input.slug || input.title ? { slug: input.slug ?? slugify(input.title as string) } : {}),
    ...(input.description !== undefined ? { description: input.description ?? null } : {}),
    ...(input.coverImageUrl !== undefined ? { cover_image_url: input.coverImageUrl ?? null } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.publishedAt !== undefined ? { published_at: input.publishedAt ?? null } : {})
  };
}

function mediaAssetPayloadToRow(input: AdminMediaAssetPayload) {
  return {
    ...(input.albumId !== undefined ? { album_id: input.albumId ?? null } : {}),
    ...(input.teamId !== undefined ? { team_id: input.teamId ?? null } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.title ? { title: input.title } : {}),
    ...(input.url ? { url: input.url } : {}),
    ...(input.thumbnailUrl !== undefined ? { thumbnail_url: input.thumbnailUrl ?? null } : {}),
    ...(input.altText !== undefined ? { alt_text: input.altText ?? null } : {}),
    ...(input.isFeatured !== undefined ? { is_featured: input.isFeatured } : {}),
    ...(input.publishedAt !== undefined ? { published_at: input.publishedAt ?? null } : {})
  };
}

function partnerPayloadToRow(input: AdminPartnerPayload) {
  return {
    ...(input.name ? { name: input.name } : {}),
    ...(input.slug || input.name ? { slug: input.slug ?? slugify(input.name as string) } : {}),
    ...(input.logoUrl !== undefined ? { logo_url: input.logoUrl ?? null } : {}),
    ...(input.websiteUrl !== undefined ? { website_url: input.websiteUrl ?? null } : {}),
    ...(input.tier !== undefined ? { tier: input.tier ?? null } : {}),
    ...(input.description !== undefined ? { description: input.description ?? null } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

export async function listPublishedNews(limit = 12): Promise<NewsArticle[]> {
  // Publication programmée : un article PUBLISHED daté dans le futur reste masqué
  // jusqu'à sa date. Sans date (published_at null), il est visible immédiatement.
  const nowIso = new Date().toISOString();
  const { data, error } = await getSupabaseAdminClient()
    .from("news")
    .select("*")
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch news: ${error.message}`);
  }

  return (data ?? []) as NewsArticle[];
}

export async function listNewsForAdmin(limit = 50): Promise<NewsArticle[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("news")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch admin news: ${error.message}`);
  }

  return (data ?? []) as NewsArticle[];
}

export async function getPublishedNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch news article: ${error.message}`);
  }

  return data as NewsArticle | null;
}

// Diffusion ciblée : à la première publication d'un article rattaché à une équipe, notifie les familles.
async function maybeNotifyPublishedNews(article: NewsArticle): Promise<void> {
  if (article.status !== "PUBLISHED" || !article.team_id || article.notified_at) {
    return;
  }
  try {
    // Réservation atomique AVANT diffusion : notified_at passe de null à maintenant.
    // Un seul appel concurrent gagne -> pas de double fan-out aux familles.
    const { data: claimed, error } = await getSupabaseAdminClient()
      .from("news")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", article.id)
      .is("notified_at", null)
      .select("id");
    if (error) {
      console.error("maybeNotifyPublishedNews: claim failed", error);
      return;
    }
    if (!claimed || claimed.length === 0) {
      return; // déjà notifié par un autre appel concurrent
    }
    await notifyTeamNews(article.team_id, { title: article.title });
  } catch (error) {
    // la diffusion ne doit jamais bloquer la publication
    console.error("maybeNotifyPublishedNews failed", error);
  }
}

export async function createNewsArticle(input: AdminNewsPayload, authorId: string): Promise<NewsArticle> {
  const { data, error } = await getSupabaseAdminClient()
    .from("news")
    .insert({
      ...newsPayloadToRow(input, authorId),
      status: input.status ?? "DRAFT"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create news article: ${error.message}`);
  }

  const article = data as NewsArticle;
  await maybeNotifyPublishedNews(article);
  return article;
}

export async function updateNewsArticle(id: string, input: AdminNewsPayload): Promise<NewsArticle | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("news")
    .update(newsPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update news article: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const article = data as NewsArticle;
  await maybeNotifyPublishedNews(article);
  return article;
}

/** Médias publiés rattachés à une équipe (pour la galerie de la page équipe). */
export async function listTeamMedia(teamId: string, limit = 12): Promise<MediaAsset[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("media_assets")
    .select("*")
    .eq("team_id", teamId)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch team media: ${error.message}`);
  }

  return (data ?? []) as MediaAsset[];
}

export async function listPublicMedia(): Promise<MediaPayload> {
  const supabase = getSupabaseAdminClient();
  const [{ data: albums, error: albumsError }, { data: assets, error: assetsError }] = await Promise.all([
    supabase.from("media_albums").select("*").eq("status", "PUBLISHED").order("published_at", { ascending: false }),
    supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(60)
  ]);

  if (albumsError) {
    throw new Error(`Unable to fetch media albums: ${albumsError.message}`);
  }

  if (assetsError) {
    throw new Error(`Unable to fetch media assets: ${assetsError.message}`);
  }

  return {
    albums: (albums ?? []) as MediaAlbum[],
    assets: (assets ?? []) as MediaAsset[]
  };
}

export async function listMediaForAdmin(limit = 100): Promise<MediaPayload> {
  const supabase = getSupabaseAdminClient();
  const [{ data: albums, error: albumsError }, { data: assets, error: assetsError }] = await Promise.all([
    supabase.from("media_albums").select("*").order("created_at", { ascending: false }).limit(limit),
    supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(limit)
  ]);

  if (albumsError) {
    throw new Error(`Unable to fetch admin media albums: ${albumsError.message}`);
  }

  if (assetsError) {
    throw new Error(`Unable to fetch admin media assets: ${assetsError.message}`);
  }

  return {
    albums: (albums ?? []) as MediaAlbum[],
    assets: (assets ?? []) as MediaAsset[]
  };
}

export async function createMediaAlbum(input: AdminMediaAlbumPayload): Promise<MediaAlbum> {
  const { data, error } = await getSupabaseAdminClient()
    .from("media_albums")
    .insert({
      ...mediaAlbumPayloadToRow(input),
      status: input.status ?? "DRAFT"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create media album: ${error.message}`);
  }

  return data as MediaAlbum;
}

export async function updateMediaAlbum(id: string, input: AdminMediaAlbumPayload): Promise<MediaAlbum> {
  const { data, error } = await getSupabaseAdminClient()
    .from("media_albums")
    .update(mediaAlbumPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update media album: ${error.message}`);
  }

  return data as MediaAlbum;
}

export async function createMediaAsset(input: AdminMediaAssetPayload): Promise<MediaAsset> {
  const { data, error } = await getSupabaseAdminClient()
    .from("media_assets")
    .insert({
      ...mediaAssetPayloadToRow(input),
      type: input.type ?? "PHOTO",
      is_featured: input.isFeatured ?? false
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create media asset: ${error.message}`);
  }

  const asset = data as MediaAsset;
  // CRM intelligent : un média rattaché à une équipe prévient automatiquement les familles concernées.
  if (asset.team_id) {
    await notifyTeamMediaAdded(asset.team_id, { type: asset.type, title: asset.title });
  }
  return asset;
}

export async function updateMediaAsset(id: string, input: AdminMediaAssetPayload): Promise<MediaAsset> {
  const { data, error } = await getSupabaseAdminClient()
    .from("media_assets")
    .update(mediaAssetPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update media asset: ${error.message}`);
  }

  return data as MediaAsset;
}

/** Supprime un média. Renvoie false si l'id n'existe pas (-> 404 côté route). */
export async function deleteMediaAsset(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdminClient()
    .from("media_assets")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Unable to delete media asset: ${error.message}`);
  }

  return (data ?? []).length > 0;
}

export async function listActivePartners(): Promise<Partner[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("partners")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch partners: ${error.message}`);
  }

  return (data ?? []) as Partner[];
}

export async function listPartnersForAdmin(limit = 100): Promise<Partner[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("partners")
    .select("*")
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch admin partners: ${error.message}`);
  }

  return (data ?? []) as Partner[];
}

export async function createPartner(input: AdminPartnerPayload): Promise<Partner> {
  const { data, error } = await getSupabaseAdminClient()
    .from("partners")
    .insert({
      ...partnerPayloadToRow(input),
      is_active: input.isActive ?? true
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create partner: ${error.message}`);
  }

  return data as Partner;
}

export async function updatePartner(id: string, input: AdminPartnerPayload): Promise<Partner | null> {
  const { data, error } = await getSupabaseAdminClient().from("partners").update(partnerPayloadToRow(input)).eq("id", id).select("*").maybeSingle();

  if (error) {
    throw new Error(`Unable to update partner: ${error.message}`);
  }

  return (data as Partner) ?? null;
}

export async function createPartnershipRequest(input: CreatePartnershipRequestInput): Promise<PartnershipRequest> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("partnership_requests")
    .insert({
      company_name: input.companyName,
      contact_name: input.contactName,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message ?? null,
      status: "PENDING"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create partnership request: ${error.message}`);
  }

  await queueAdminNotification(
    {
      template: "partnership_request_received",
      subject: `Nouvelle demande partenaire : ${input.companyName}`,
      payload: {
        partnershipRequestId: data.id,
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email
      }
    },
    supabase
  );

  await recordActivity({
    action: "partnership.request_created",
    entityType: "partnership_request",
    entityId: data.id,
    metadata: {
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email
    }
  });

  return data as PartnershipRequest;
}

export async function listPartnershipRequestsForAdmin(limit = 100): Promise<PartnershipRequest[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("partnership_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch partnership requests: ${error.message}`);
  }

  return (data ?? []) as PartnershipRequest[];
}

export async function reviewPartnershipRequest(
  id: string,
  input: AdminPartnershipRequestReviewPayload
): Promise<PartnershipRequest> {
  const { data, error } = await getSupabaseAdminClient()
    .from("partnership_requests")
    .update({ status: input.status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to review partnership request: ${error.message}`);
  }

  return data as PartnershipRequest;
}
