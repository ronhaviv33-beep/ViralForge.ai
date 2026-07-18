import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * Minimal at-rest encryption for social OAuth tokens (AES-256-GCM).
 *
 * Key source: SOCIAL_TOKEN_SECRET if set, otherwise AUTH_SECRET. The key is
 * derived with SHA-256 so any sufficiently long secret works. Rotating the
 * secret invalidates stored tokens — users then simply reconnect the account.
 *
 * Stored format: base64(iv) + "." + base64(authTag) + "." + base64(ciphertext)
 */
function getKey(): Buffer {
  const secret = process.env.SOCIAL_TOKEN_SECRET || process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SOCIAL_TOKEN_SECRET (or AUTH_SECRET) must be set to store social tokens."
    );
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(stored: string): string {
  const [ivB64, tagB64, dataB64] = stored.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed encrypted secret.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
