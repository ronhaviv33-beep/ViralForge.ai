import "server-only";
import { apiJson, type FetchedPost, type PlatformIdentity, type TokenSet } from "./types";

/**
 * Instagram — official "Instagram API with Instagram Login".
 * Requires a professional (business/creator) Instagram account.
 *
 * Capabilities used:
 * - OAuth: instagram.com/oauth/authorize → api.instagram.com/oauth/access_token
 * - Long-lived token (60 days) via ig_exchange_token, refreshable after 24h
 * - Identity: graph.instagram.com/me
 * - Media list with like/comment counts; per-media insights add
 *   views/reach/saves/shares where the media type supports them
 */

const GRAPH = "https://graph.instagram.com/v23.0";

function clientId(): string {
  return process.env.INSTAGRAM_APP_ID ?? "";
}
function clientSecret(): string {
  return process.env.INSTAGRAM_APP_SECRET ?? "";
}

export function isInstagramConfigured(): boolean {
  return Boolean(clientId() && clientSecret());
}

export function instagramAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_manage_insights",
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

export async function instagramExchangeCode(
  code: string,
  redirectUri: string
): Promise<TokenSet> {
  // Step 1: code → short-lived token.
  const shortLived = await apiJson<{ access_token: string; user_id: string }>(
    "https://api.instagram.com/oauth/access_token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId(),
        client_secret: clientSecret(),
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    }
  );

  // Step 2: short-lived → long-lived (60 days).
  const longLived = await apiJson<{ access_token: string; expires_in: number }>(
    `https://graph.instagram.com/access_token?${new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: clientSecret(),
      access_token: shortLived.access_token,
    })}`
  );

  return {
    accessToken: longLived.access_token,
    refreshToken: null,
    expiresAt: new Date(Date.now() + longLived.expires_in * 1000),
  };
}

/** Long-lived tokens refresh in place (must be >24h old, not expired). */
export async function instagramRefreshToken(accessToken: string): Promise<TokenSet> {
  const refreshed = await apiJson<{ access_token: string; expires_in: number }>(
    `https://graph.instagram.com/refresh_access_token?${new URLSearchParams({
      grant_type: "ig_refresh_token",
      access_token: accessToken,
    })}`
  );
  return {
    accessToken: refreshed.access_token,
    refreshToken: null,
    expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
  };
}

export async function instagramFetchIdentity(
  accessToken: string
): Promise<PlatformIdentity> {
  const me = await apiJson<{ id: string; username?: string }>(
    `${GRAPH}/me?${new URLSearchParams({
      fields: "id,username",
      access_token: accessToken,
    })}`
  );
  return { externalAccountId: me.id, accountName: me.username ?? null };
}

interface IgMedia {
  id: string;
  caption?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

interface IgInsightValue {
  name: string;
  values?: Array<{ value?: number }>;
}

export async function instagramFetchRecentPosts(
  accessToken: string
): Promise<FetchedPost[]> {
  const media = await apiJson<{ data?: IgMedia[] }>(
    `${GRAPH}/me/media?${new URLSearchParams({
      fields: "id,caption,permalink,timestamp,like_count,comments_count",
      limit: "10",
      access_token: accessToken,
    })}`
  );

  const posts: FetchedPost[] = [];
  for (const m of media.data ?? []) {
    const post: FetchedPost = {
      externalPostId: m.id,
      externalUrl: m.permalink ?? null,
      title: m.caption ? m.caption.slice(0, 120) : null,
      publishedAt: m.timestamp ? new Date(m.timestamp) : null,
      metrics: {
        likes: m.like_count ?? null,
        comments: m.comments_count ?? null,
      },
    };

    // Insights are best-effort: availability varies by media type/age, and a
    // failure on one post must not sink the whole sync.
    try {
      const insights = await apiJson<{ data?: IgInsightValue[] }>(
        `${GRAPH}/${m.id}/insights?${new URLSearchParams({
          metric: "views,reach,saved,shares",
          access_token: accessToken,
        })}`
      );
      for (const item of insights.data ?? []) {
        const value = item.values?.[0]?.value;
        if (typeof value !== "number") continue;
        if (item.name === "views") post.metrics.views = value;
        if (item.name === "reach") post.metrics.reach = value;
        if (item.name === "saved") post.metrics.saves = value;
        if (item.name === "shares") post.metrics.shares = value;
      }
    } catch {
      // Keep like/comment counts from the media list.
    }

    posts.push(post);
  }
  return posts;
}
