import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: true });

  const { episodeId, progress } = await request.json();

  await prisma.watchHistory.upsert({
    where: { userId_episodeId: { userId: session.user.id, episodeId } },
    update: { progress, completed: progress > 0.9, watchedAt: new Date() },
    create: {
      userId: session.user.id,
      episodeId,
      progress,
      completed: progress > 0.9,
    },
  });

  if (progress < 0.01) {
    await prisma.episode.update({
      where: { id: episodeId },
      data: { viewCount: { increment: 1 } },
    });
  }

  return NextResponse.json({ ok: true });
}
