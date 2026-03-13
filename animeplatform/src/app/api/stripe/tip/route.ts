import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { amount, creatorId, message } = await request.json();

  if (!amount || amount < 100) {
    return NextResponse.json({ error: "最低金額は100円です" }, { status: 400 });
  }

  const creator = await prisma.user.findUnique({ where: { id: creatorId } });
  if (!creator) {
    return NextResponse.json({ error: "クリエイターが見つかりません" }, { status: 404 });
  }

  const paymentIntent = await getStripe().paymentIntents.create({
    amount,
    currency: "jpy",
    metadata: {
      tipperId: session.user.id,
      creatorId,
      message: message || "",
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
