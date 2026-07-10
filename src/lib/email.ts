import "server-only";
import { Resend } from "resend";

// Lazily instantiate so the build doesn't fail without RESEND_API_KEY.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "ViralForge <noreply@viralforge.ai>";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Reset your ViralForge password",
    html: `
<p>Hi,</p>
<p>We received a request to reset the password for your ViralForge account.</p>
<p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px">Reset password</a></p>
<p>This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email — your password won't change.</p>
<p>— The ViralForge team</p>
    `.trim(),
  });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Verify your ViralForge email",
    html: `
<p>Hi,</p>
<p>Thanks for signing up for ViralForge! Please verify your email address to unlock all features.</p>
<p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px">Verify email</a></p>
<p>This link expires in <strong>24 hours</strong>. If you didn't sign up, you can ignore this email.</p>
<p>— The ViralForge team</p>
    `.trim(),
  });
}
