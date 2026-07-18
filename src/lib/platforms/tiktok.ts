import "server-only";
import { apiJson, type FetchedPost, type PlatformIdentity, type TokenSet } from "./types";

/**
 * TikTok — official TikTok for Developers: Login Kit + Display API.
 *
 * Capabilities used (officially supported for approved apps):
 * - OAuth: tiktok.com/v2/auth/authorize → open.tiktokapis.com/v2/oauth/token
 * - Identity: /v2/user/info (scope user.info.basic)
 * - Own videos with basic public stats: /v2/video/list (scope video.list) —
 *   view/like/comment/share counts only.
 *
 * DEFERRED (not available in the Display API): deeper analytics such as watch
 * time, reach, audience breakdowns, and saves. Direct posting (Content Posting
 * API) requires a separate app audit and is also deferred.
 */

function clientKey(): string {
  return process.env.TIKTOK_CLIENT_KEY ?? "";
}
function clientSecret(): string {
  return process.env.TIKTOK_CLIENT_SECRET ?? "";
}

export function isTiktokConfigured(): boolean {
  return Boolean(clientKey() && clientSecret());
}

export function tiktokAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_key: clientKey(),
    scope: "user.info.basic,video.list",
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

interface TiktokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
}

export async function tiktokExchangeCode(
  code: string,
  redirectUri: string
): Promise<TokenSet & { openId: string }> {
  const token = await apiJson<TiktokTokenResponse>(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey(),
        client_secret: clientSecret(),
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    }
  );
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
    openId: token.open_id,
  };
}

export async function tiktokRefreshToken(refreshToken: string): Promise<TokenSet> {
  const token = await apiJson<TiktokTokenResponse>(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey(),
        client_secret: clientSecret(),
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    }
  );
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
  };
}

export async function tiktokFetchIdentity(
  accessToken: string
): Promise<PlatformIdentity> {
  const info = await apiJson<{
    data?: { user?: { open_id?: string; display_name?: string } };
  }>(
    `https://open.tiktokapis.com/v2/user/info/?${new URLSearchParams({
      fields: "open_id,display_name",
    })}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const user = info.data?.user;
  if (!user?.open_id) throw new Error("No TikTok user found for this account.");
  return { externalAccountId: user.open_id, accountName: user.display_name ?? null };
}

interface TiktokVideo {
  id: string;
  title?: string;
  share_url?: string;
  create_time?: number;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
}

export async function tiktokFetchRecentPosts(
  accessToken: string
): Promise<FetchedPost[]> {
  const list = await apiJson<{ data?: { videos?: TiktokVideo[] } }>(
    `https://open.tiktokapis.com/v2/video/list/?${new URLSearchParams({
      fields: "id,title,share_url,create_time,view_count,like_count,comment_count,share_count",
    })}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 10 }),
    }
  );

  return (list.data?.videos ?? []).map((v) => ({
    externalPostId: v.id,
    externalUrl: v.share_url ?? null,
    title: v.title ? v.title.slice(0, 120) : null,
    publishedAt: v.create_time ? new Date(v.create_time * 1000) : null,
    metrics: {
      views: v.view_count ?? null,
      likes: v.like_count ?? null,
      comments: v.comment_count ?? null,
      shares: v.share_count ?? null,
    },
  }));
}
