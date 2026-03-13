import { SeriesCard } from "./SeriesCard";
import type { Series, User } from "@prisma/client";

type SeriesWithAuthor = Series & {
  author: User;
  _count: { likes: number; episodes: number };
};

export function SeriesGrid({ series }: { series: SeriesWithAuthor[] }) {
  if (series.length === 0) {
    return (
      <div className="text-center py-16 text-[#6b7280]">
        <p>作品が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {series.map((s) => (
        <SeriesCard key={s.id} series={s} />
      ))}
    </div>
  );
}
