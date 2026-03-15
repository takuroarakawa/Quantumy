"use client";

import Link from "next/link";
import { GENRES } from "@/lib/utils";

const genreColors = [
  "from-red-500/20 to-red-600/20 border-red-500/30 text-red-300",
  "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300",
  "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300",
  "from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-300",
  "from-green-500/20 to-green-600/20 border-green-500/30 text-green-300",
  "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-300",
  "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 text-indigo-300",
  "from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-300",
];

export function GenreFilter() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">
        <span className="text-green-400">#</span> ジャンルから探す
      </h2>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre, i) => (
          <Link
            key={genre}
            href={`/series?genre=${encodeURIComponent(genre)}`}
            className={`px-4 py-2 rounded-full text-sm font-medium border bg-gradient-to-r ${genreColors[i % genreColors.length]} hover:opacity-90 transition-all hover:scale-105`}
          >
            {genre}
          </Link>
        ))}
      </div>
    </section>
  );
}
