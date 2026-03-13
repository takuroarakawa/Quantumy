import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "20");

  const series = await prisma.series.findMany({
    where: {
      isPublished: true,
      ...(genre ? { genre } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      author: true,
      _count: { select: { likes: true, episodes: true } },
    },
    orderBy: { viewCount: "desc" },
    take: limit,
  });

  return NextResponse.json(series);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { title, titleEn, description, genre, tags, coverImage, status, episodes } = body;

  if (!title || !description) {
    return NextResponse.json({ error: "タイトルとあらすじは必須です" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { isCreator: true },
  });

  const series = await prisma.series.create({
    data: {
      title,
      titleEn: titleEn || null,
      description,
      genre: genre || "その他",
      tags: JSON.stringify(tags || []),
      coverImage: coverImage || null,
      status: status || "ongoing",
      isPublished: true,
      authorId: session.user.id,
    },
  });

  if (episodes && Array.isArray(episodes)) {
    await prisma.episode.createMany({
      data: episodes.map(
        (ep: {
          title: string;
          description?: string;
          episodeNumber: number;
          videoUrl?: string;
          isFree?: boolean;
        }) => ({
          title: ep.title,
          description: ep.description || null,
          episodeNumber: ep.episodeNumber,
          videoUrl: ep.videoUrl || null,
          isPublished: true,
          isFree: ep.isFree ?? true,
          seriesId: series.id,
          authorId: session.user!.id!,
        })
      ),
    });
  }

  return NextResponse.json(series, { status: 201 });
}
