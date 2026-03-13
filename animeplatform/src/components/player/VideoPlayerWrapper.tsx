"use client";

import { useCallback } from "react";
import { VideoPlayer } from "./VideoPlayer";

interface VideoPlayerWrapperProps {
  videoUrl: string;
  thumbnailUrl?: string;
  subtitleUrl?: string;
  title?: string;
  episodeId: string;
}

export function VideoPlayerWrapper({
  videoUrl,
  thumbnailUrl,
  subtitleUrl,
  title,
  episodeId,
}: VideoPlayerWrapperProps) {
  const handleProgress = useCallback(async (progress: number) => {
    if (progress > 0.01 && progress < 0.99) {
      try {
        await fetch("/api/watch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episodeId, progress }),
        });
      } catch {
        // サイレントエラー
      }
    }
  }, [episodeId]);

  return (
    <VideoPlayer
      videoUrl={videoUrl}
      thumbnailUrl={thumbnailUrl}
      subtitleUrl={subtitleUrl}
      title={title}
      onProgress={handleProgress}
    />
  );
}
