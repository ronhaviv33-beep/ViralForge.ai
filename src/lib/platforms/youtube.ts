import "server-only";
import { apiJson, type FetchedPost, type PlatformIdentity, type TokenSet } from "./types";

/**
 * YouTube — official Google OAuth 2.0 + YouTube Data API v3 (read-only scope).
 *
 * Capabilities used:
 * - OAuth with offline access → refresh token
 * - Identity + uploads playlist: channels?mine=true
 * - Recent uploads: playlistItems → videos?part=statistics (views/likes/comments)
 */

const DATA_API = "https://www.googleapis.com/youtube/v3";

function clientId(): string {
  return process.env.GOOGLE_CLIENT_ID ?? "";
}
function clientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET ?? "";
}

export function isYoutubeConfigured(): boolean {
  return Boolean(clientId() && clientSecret());
}

export function youtubeAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function youtubeExchangeCode(
  code: string,
  redirectUri: string
): Promise<TokenSet> {
  const token = await apiJson<GoogleTokenResponse>(
    "https://oauth2.googleapis.com/token",
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
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? null,
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
  };
}

export async function youtubeRefreshToken(refreshToken: string): Promise<TokenSet> {
  const token = await apiJson<GoogleTokenResponse>(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId(),
        client_secret: clientSecret(),
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    }
  );
  return {
    accessToken: token.access_token,
    // Google keeps the same refresh token unless revoked.
    refreshToken,
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
  };
}

interface YtChannelResponse {
  items?: Array<{
    id: string;
    snippet?: { title?: string };
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }>;
}

export async function youtubeFetchIdentity(
  accessToken: string
): Promise<PlatformIdentity> {
  const channels = await apiJson<YtChannelResponse>(
    `${DATA_API}/channels?${new URLSearchParams({ part: "snippet", mine: "true" })}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const channel = channels.items?.[0];
  if (!channel) throw new Error("No YouTube channel found for this account.");
  return {
    externalAccountId: channel.id,
    accountName: channel.snippet?.title ?? null,
  };
}

export async function youtubeFetchRecentPosts(
  accessToken: string
): Promise<FetchedPost[]> {
  const auth = { headers: { Authorization: `Bearer ${accessToken}` } };

  const channels = await apiJson<YtChannelResponse>(
    `${DATA_API}/channels?${new URLSearchParams({
      part: "contentDetails",
      mine: "true",
    })}`,
    auth
  );
  const uploads = channels.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return [];

  const playlist = await apiJson<{
    items?: Array<{ contentDetails?: { videoId?: string } }>;
  }>(
    `${DATA_API}/playlistItems?${new URLSearchParams({
      part: "contentDetails",
      playlistId: uploads,
      maxResults: "10",
    })}`,
    auth
  );

  const videoIds = (playlist.items ?? [])
    .map((i) => i.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id));
  if (videoIds.length === 0) return [];

  const videos = await apiJson<{
    items?: Array<{
      id: string;
      snippet?: { title?: string; publishedAt?: string };
      statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
    }>;
  }>(
    `${DATA_API}/videos?${new URLSearchParams({
      part: "snippet,statistics",
      id: videoIds.join(","),
    })}`,
    auth
  );

  return (videos.items ?? []).map((v) => ({
    externalPostId: v.id,
    externalUrl: `https://www.youtube.com/watch?v=${v.id}`,
    title: v.snippet?.title ?? null,
    publishedAt: v.snippet?.publishedAt ? new Date(v.snippet.publishedAt) : null,
    metrics: {
      views: v.statistics?.viewCount ? Number(v.statistics.viewCount) : null,
      likes: v.statistics?.likeCount ? Number(v.statistics.likeCount) : null,
      comments: v.statistics?.commentCount ? Number(v.statistics.commentCount) : null,
    },
  }));
}
