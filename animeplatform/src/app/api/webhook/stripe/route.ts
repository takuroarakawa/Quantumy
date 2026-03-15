import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { incrementTip } from "@/lib/metrics";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { tipperId, creatorId, message } = pi.metadata;

      if (tipperId && creatorId) {
        await prisma.tip.create({
          data: {
            amount: pi.amount,
            message: message || null,
            tipperId,
            creatorId,
            stripePaymentIntentId: pi.id,
          },
        });
        incrementTip(pi.amount);
      }
      break;
    }

    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      const { subscriberId, creatorId, planId } = cs.metadata!;
      const plan = ["fan", "supporter", "producer"].includes(planId)
        ? planId
        : "fan";
      const amounts = { fan: 500, supporter: 1000, producer: 3000 };

      if (subscriberId && creatorId) {
        await prisma.subscription.upsert({
          where: { subscriberId_creatorId: { subscriberId, creatorId } },
          update: {
            plan,
            amount: amounts[plan as keyof typeof amounts],
            stripeSubscriptionId: cs.subscription as string,
            status: "active",
          },
          create: {
            subscriberId,
            creatorId,
            plan,
            amount: amounts[plan as keyof typeof amounts],
            stripeSubscriptionId: cs.subscription as string,
            status: "active",
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "cancelled" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
