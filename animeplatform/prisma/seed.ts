import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seriesData = [
  {
    title: "虚無の果てで君を待つ",
    titleEn: "Waiting for You at the Edge of Nothingness",
    description:
      "記憶を失った少女が、廃墟となった未来都市を旅する短編アニメ。5話完結の実験的な構成で、従来の12話フォーマットに縛られない新しい物語体験を追求。",
    genre: "SF",
    tags: JSON.stringify(["短編", "実験的", "SF", "記憶喪失", "近未来"]),
    coverImage: "https://picsum.photos/seed/anime1/400/600",
    bannerImage: "https://picsum.photos/seed/anime1banner/1200/400",
    status: "completed",
    viewCount: 15420,
    episodeCount: 5,
  },
  {
    title: "夏の終わりに咲く花",
    titleEn: "Flowers Blooming at Summer's End",
    description:
      "田舎の祖父母の家で過ごす最後の夏休み。3話構成の繊細な青春アニメ。制作者の実体験を元に、短い時間に凝縮された感情の物語。",
    genre: "スライス・オブ・ライフ",
    tags: JSON.stringify(["短編", "青春", "夏", "家族", "感動"]),
    coverImage: "https://picsum.photos/seed/anime2/400/600",
    bannerImage: "https://picsum.photos/seed/anime2banner/1200/400",
    status: "completed",
    viewCount: 28750,
    episodeCount: 3,
  },
  {
    title: "NEON UNDERGROUND",
    titleEn: "NEON UNDERGROUND",
    description:
      "地下都市で生きるサイバーパンクな少年少女たちの反乱。話数制限なしの連続配信形式。視聴者のフィードバックで物語の分岐が変化するインタラクティブアニメ実験作。",
    genre: "SF",
    tags: JSON.stringify(["サイバーパンク", "インタラクティブ", "反乱", "地下都市"]),
    coverImage: "https://picsum.photos/seed/anime3/400/600",
    bannerImage: "https://picsum.photos/seed/anime3banner/1200/400",
    status: "ongoing",
    viewCount: 42100,
    episodeCount: 8,
  },
  {
    title: "おばあちゃんの魔法レシピ",
    titleEn: "Grandma's Magic Recipe",
    description:
      "料理上手な魔女のおばあちゃんが一品の料理を作るたびに繰り広げる短編アンソロジー。1話完結×無制限配信。",
    genre: "ファンタジー",
    tags: JSON.stringify(["料理", "魔女", "アンソロジー", "ほのぼの", "家族向け"]),
    coverImage: "https://picsum.photos/seed/anime4/400/600",
    bannerImage: "https://picsum.photos/seed/anime4banner/1200/400",
    status: "ongoing",
    viewCount: 67890,
    episodeCount: 12,
  },
  {
    title: "深海のモノローグ",
    titleEn: "Monologue of the Deep Sea",
    description:
      "深海調査員の孤独な独白アニメ。7話構成。セリフなし・BGMなしで映像と音響のみで語る実験的作品。",
    genre: "ドラマ",
    tags: JSON.stringify(["実験的", "深海", "孤独", "無音", "アート"]),
    coverImage: "https://picsum.photos/seed/anime5/400/600",
    bannerImage: "https://picsum.photos/seed/anime5banner/1200/400",
    status: "completed",
    viewCount: 9340,
    episodeCount: 7,
  },
  {
    title: "魔王の引退生活",
    titleEn: "Demon Lord's Retirement Life",
    description:
      "世界征服を諦めた魔王が田舎で農業を始めるゆるいコメディ。話数無制限・不定期更新。SNSで人気を集めた4コマ漫画が原作。",
    genre: "コメディ",
    tags: JSON.stringify(["魔王", "農業", "コメディ", "ゆるい", "SNS発"]),
    coverImage: "https://picsum.photos/seed/anime6/400/600",
    bannerImage: "https://picsum.photos/seed/anime6banner/1200/400",
    status: "ongoing",
    viewCount: 89200,
    episodeCount: 6,
  },
];

async function main() {
  const creator = await prisma.user.upsert({
    where: { email: "creator@elementary.jp" },
    update: {},
    create: {
      email: "creator@elementary.jp",
      name: "Elementary編集部",
      isCreator: true,
      creatorName: "Elementary Studio",
      bio: "12話の縛りを超えて、自由なアニメ表現を追求するスタジオです。",
    },
  });

  const creator2 = await prisma.user.upsert({
    where: { email: "indie@elementary.jp" },
    update: {},
    create: {
      email: "indie@elementary.jp",
      name: "田中アキラ",
      isCreator: true,
      creatorName: "Akira Animation",
      bio: "独立アニメーター。自分のペースで物語を語る。",
    },
  });

  const creators = [creator, creator2, creator, creator2, creator, creator2];

  for (let i = 0; i < seriesData.length; i++) {
    const { episodeCount, ...data } = seriesData[i];
    const author = creators[i];

    const series = await prisma.series.upsert({
      where: { id: `seed-series-${i + 1}` },
      update: {},
      create: {
        id: `seed-series-${i + 1}`,
        ...data,
        isPublished: true,
        authorId: author.id,
      },
    });

    for (let ep = 1; ep <= episodeCount; ep++) {
      await prisma.episode.upsert({
        where: { id: `seed-ep-${i + 1}-${ep}` },
        update: {},
        create: {
          id: `seed-ep-${i + 1}-${ep}`,
          title: `第${ep}話`,
          description: `${data.title} — 第${ep}話`,
          episodeNumber: ep,
          duration: Math.floor(Math.random() * 1200) + 300,
          thumbnailUrl: `https://picsum.photos/seed/${series.id}ep${ep}/640/360`,
          isPublished: true,
          isFree: ep === 1,
          viewCount: Math.floor(Math.random() * 10000),
          seriesId: series.id,
          authorId: author.id,
        },
      });
    }
  }

  console.log("✅ シードデータ投入完了");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
