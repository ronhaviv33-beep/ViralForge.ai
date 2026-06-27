import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import type { Plan } from "@prisma/client";

// Stripe needs the raw, unparsed request body to verify the signature.
export const runtime = "nodejs";

function planFromSubscription(sub: Stripe.Subscription): Plan {
  const priceId = sub.items.data[0]?.price?.id;
  const fromPrice = priceId ? planFromPriceId(priceId) : null;
  const fromMeta = sub.metadata?.plan as Plan | undefined;
  return (fromPrice ?? fromMeta ?? "free") as Plan;
}

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!user) {
    console.warn("[webhook] no user for customer", customerId);
    return;
  }

  const plan = planFromSubscription(sub);
  const isActive = sub.status === "active" || sub.status === "trialing";
  const effectivePlan: Plan = isActive ? plan : "free";
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: sub.id,
        stripeCustomerId: customerId,
        status: sub.status,
        plan,
        currentPeriodEnd: periodEnd,
      },
      update: {
        status: sub.status,
        plan,
        currentPeriodEnd: periodEnd,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { plan: effectivePlan },
    }),
  ]);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
