import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import type { Plan, SocialPlatform, ConnectedAccount } from "@prisma/client";
import type { FetchedPost, PlatformIdentity, TokenSet } from "@/lib/platforms/types";
import {
  isInstagramConfigured,
  instagramAuthUrl,
  instagramExchangeCode,
  instagramRefreshToken,
  instagramFetchIdentity,
  instagramFetchRecentPosts,
} from "@/lib/platforms/instagram";
import {
  isYoutubeConfigured,
  youtubeAuthUrl,
  youtubeExchangeCode,
  youtubeRefreshToken,
  youtubeFetchIdentity,
  youtubeFetchRecentPosts,
} from "@/lib/platforms/youtube";
import {
  isTiktokConfigured,
  tiktokAuthUrl,
  tiktokExchangeCode,
  tiktokRefreshToken,
  tiktokFetchIdentity,
  tiktokFetchRecentPosts,
} from "@/lib/platforms/tiktok";

export const SOCIAL_PLATFORMS = ["instagram", "youtube", "tiktok"] as const;

export function isSocialPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(value);
}

export function isPlatformConfigured(platform: SocialPlatform): boolean {
  switch (platform) {
    case "instagram":
      return isInstagramConfigured();
    case "youtube":
      return isYoutubeConfigured();
    case "tiktok":
      return isTiktokConfigured();
  }
}

/** Simple plan rule for MVP: integrations are a paid feature. */
export function canUseIntegrations(plan: Plan): boolean {
  return plan !== "free";
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function redirectUriFor(platform: SocialPlatform): string {
  return `${appUrl()}/api/integrations/${platform}/callback`;
}

// ─── OAuth state (CSRF protection) ──────────────────────────────────────────

function stateSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for OAuth state signing.");
  return new TextEncoder().encode(secret);
}

/** Signed, short-lived state binding the flow to a user + platform. */
export async function signConnectState(
  userId: string,
  platform: SocialPlatform
): Promise<string> {
  return new SignJWT({ sub: userId, platform, purpose: "social_connect" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(stateSecret());
}

export async function verifyConnectState(
  state: string
): Promise<{ userId: string; platform: SocialPlatform } | null> {
  try {
    const { payload } = await jwtVerify(state, stateSecret());
    if (payload.purpose !== "social_connect") return null;
    const userId = payload.sub;
    const platform = payload.platform;
    if (typeof userId !== "string" || typeof platform !== "string") return null;
    if (!isSocialPlatform(platform)) return null;
    return { userId, platform };
  } catch {
    return null;
  }
}

// ─── Connect flow dispatch ──────────────────────────────────────────────────

export function buildAuthUrl(platform: SocialPlatform, state: string): string {
  const redirectUri = redirectUriFor(platform);
  switch (platform) {
    case "instagram":
      return instagramAuthUrl(redirectUri, state);
    case "youtube":
      return youtubeAuthUrl(redirectUri, state);
    case "tiktok":
      return tiktokAuthUrl(redirectUri, state);
  }
}

/**
 * Exchanges the OAuth code, fetches account identity, and upserts the
 * ConnectedAccount for this user with encrypted tokens.
 */
export async function completeConnection(
  userId: string,
  platform: SocialPlatform,
  code: string
): Promise<ConnectedAccount> {
  const redirectUri = redirectUriFor(platform);

  let tokens: TokenSet;
  let identity: PlatformIdentity;

  switch (platform) {
    case "instagram": {
      tokens = await instagramExchangeCode(code, redirectUri);
      identity = await instagramFetchIdentity(tokens.accessToken);
      break;
    }
    case "youtube": {
      tokens = await youtubeExchangeCode(code, redirectUri);
      identity = await youtubeFetchIdentity(tokens.accessToken);
      break;
    }
    case "tiktok": {
      const result = await tiktokExchangeCode(code, redirectUri);
      tokens = result;
      identity = await tiktokFetchIdentity(tokens.accessToken);
      break;
    }
  }

  const data = {
    accountName: identity.accountName,
    accessToken: encryptSecret(tokens.accessToken),
    refreshToken: tokens.refreshToken ? encryptSecret(tokens.refreshToken) : null,
    tokenExpiresAt: tokens.expiresAt ?? null,
    status: "active",
  };

  return prisma.connectedAccount.upsert({
    where: {
      userId_platform_externalAccountId: {
        userId,
        platform,
        externalAccountId: identity.externalAccountId,
      },
    },
    create: {
      userId,
      platform,
      externalAccountId: identity.externalAccountId,
      ...data,
    },
    update: data,
  });
}

// ─── Sync ───────────────────────────────────────────────────────────────────

/**
 * Returns a valid plaintext access token for the account, refreshing (and
 * persisting the refreshed token) when it is expired or about to expire.
 */
async function getFreshAccessToken(account: ConnectedAccount): Promise<string> {
  const accessToken = decryptSecret(account.accessToken);
  const expiresSoon =
    account.tokenExpiresAt !== null &&
    account.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000;

  if (!expiresSoon) return accessToken;

  let refreshed: TokenSet | null = null;
  try {
    if (account.platform === "youtube" && account.refreshToken) {
      refreshed = await youtubeRefreshToken(decryptSecret(account.refreshToken));
    } else if (account.platform === "tiktok" && account.refreshToken) {
      refreshed = await tiktokRefreshToken(decryptSecret(account.refreshToken));
    } else if (account.platform === "instagram") {
      refreshed = await instagramRefreshToken(accessToken);
    }
  } catch {
    refreshed = null;
  }

  if (!refreshed) return accessToken; // Let the API call surface the failure.

  await prisma.connectedAccount.update({
    where: { id: account.id },
    data: {
      accessToken: encryptSecret(refreshed.accessToken),
      refreshToken: refreshed.refreshToken
        ? encryptSecret(refreshed.refreshToken)
        : account.refreshToken,
      tokenExpiresAt: refreshed.expiresAt ?? null,
      status: "active",
    },
  });
  return refreshed.accessToken;
}

async function fetchPostsFor(
  platform: SocialPlatform,
  accessToken: string
): Promise<FetchedPost[]> {
  switch (platform) {
    case "instagram":
      return instagramFetchRecentPosts(accessToken);
    case "youtube":
      return youtubeFetchRecentPosts(accessToken);
    case "tiktok":
      return tiktokFetchRecentPosts(accessToken);
  }
}

export interface SyncResult {
  posts: number;
  snapshots: number;
}

/**
 * Pulls recent posts + metrics for one connected account and stores them.
 * Ownership must already be verified by the caller (account.userId === user).
 */
export async function syncConnectedAccount(
  account: ConnectedAccount
): Promise<SyncResult> {
  try {
    const accessToken = await getFreshAccessToken(account);
    const posts = await fetchPostsFor(account.platform, accessToken);

    let snapshots = 0;
    for (const post of posts) {
      const externalPost = await prisma.externalPost.upsert({
        where: {
          connectedAccountId_externalPostId: {
            connectedAccountId: account.id,
            externalPostId: post.externalPostId,
          },
        },
        create: {
          userId: account.userId,
          connectedAccountId: account.id,
          platform: account.platform,
          externalPostId: post.externalPostId,
          externalUrl: post.externalUrl,
          title: post.title,
          publishedAt: post.publishedAt,
        },
        update: {
          externalUrl: post.externalUrl,
          title: post.title,
          publishedAt: post.publishedAt,
        },
      });

      const m = post.metrics;
      const hasAnyMetric = [m.views, m.likes, m.comments, m.shares, m.saves, m.reach]
        .some((v) => v != null);
      if (hasAnyMetric) {
        await prisma.postPerformanceSnapshot.create({
          data: {
            externalPostId: externalPost.id,
            views: m.views ?? null,
            likes: m.likes ?? null,
            comments: m.comments ?? null,
            shares: m.shares ?? null,
            saves: m.saves ?? null,
            reach: m.reach ?? null,
          },
        });
        snapshots++;
      }
    }

    await prisma.connectedAccount.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date(), status: "active" },
    });

    return { posts: posts.length, snapshots };
  } catch (err) {
    // Mark the account errored so the UI can suggest reconnecting. Never log tokens.
    console.error(`[integrations] sync failed for ${account.platform}`, err);
    await prisma.connectedAccount
      .update({ where: { id: account.id }, data: { status: "error" } })
      .catch(() => {});
    throw err;
  }
}
