import "server-only";

/** Identity of the external account, fetched right after OAuth. */
export interface PlatformIdentity {
  externalAccountId: string;
  accountName: string | null;
}

/** Tokens returned by an OAuth exchange or refresh. Plaintext — encrypt before storing. */
export interface TokenSet {
  accessToken: string;
  refreshToken?: string | null;
  /** Absolute expiry, when the platform reports one. */
  expiresAt?: Date | null;
}

/** One post fetched from a platform, with whatever metrics that API returns. */
export interface FetchedPost {
  externalPostId: string;
  externalUrl: string | null;
  title: string | null;
  publishedAt: Date | null;
  metrics: {
    views?: number | null;
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
    saves?: number | null;
    reach?: number | null;
  };
}

/** Small helper for platform API calls: throws with a readable message on non-2xx. */
export async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    // Never include tokens in error messages — only status + endpoint host.
    const host = new URL(url).host;
    throw new Error(`Platform API error ${res.status} from ${host}`);
  }
  return (await res.json()) as T;
}
