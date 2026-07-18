import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getStripe, getPriceId } from "@/lib/stripe";

const bodySchema = z.object({
  plan: z.enum(["creator", "pro", "agency"]),
});

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const priceId = getPriceId(parsed.data.plan);
  if (!priceId) {
    return NextResponse.json(
      { error: "This plan is not available for purchase yet." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();

    // Guard: a user with a live subscription must change plans through the
    // billing portal — a second checkout would create a second subscription
    // and double-charge them. "Live" means any state Stripe can still bill or
    // resume; terminal states (canceled, incomplete, incomplete_expired) fall
    // through to a normal fresh checkout.
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ["active", "trialing", "past_due", "unpaid", "paused"] },
      },
    });
    if (existingSub) {
      // The subscription row always carries its customer id — fall back to it
      // so the guard can never be bypassed by a missing user.stripeCustomerId.
      const portalCustomerId = user.stripeCustomerId ?? existingSub.stripeCustomerId;
      const portal = await stripe.billingPortal.sessions.create({
        customer: portalCustomerId,
        return_url: `${appUrl()}/settings`,
      });
      return NextResponse.json({
        url: portal.url,
        portal: true,
        message: "You already have a subscription — manage it in the billing portal.",
      });
    }

    // Ensure the user has a Stripe customer.
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl()}/dashboard?checkout=success`,
      cancel_url: `${appUrl()}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: user.id, plan: parsed.data.plan },
      },
      metadata: { userId: user.id, plan: parsed.data.plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
