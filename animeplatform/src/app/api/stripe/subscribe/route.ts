import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe, SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { planId, creatorId } = await request.json();

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ error: "無効なプランです" }, { status: 400 });
  }

  const creator = await prisma.user.findUnique({ where: { id: creatorId } });
  if (!creator) {
    return NextResponse.json({ error: "クリエイターが見つかりません" }, { status: 404 });
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: `${creator.name} — ${plan.name}プラン`,
            description: plan.description,
          },
          unit_amount: plan.amount,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/creator/${creatorId}?subscribed=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/creator/${creatorId}`,
    metadata: {
      subscriberId: session.user.id,
      creatorId,
      planId,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
