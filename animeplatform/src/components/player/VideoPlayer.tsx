"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, Settings, Subtitles,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  subtitleUrl?: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  subtitleUrl,
  title,
  onProgress,
  onEnded,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isHLS = videoUrl.includes(".m3u8");

    if (isHLS && typeof window !== "undefined") {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          return () => hls.destroy();
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
        }
      });
    } else {
      video.src = videoUrl;
    }
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
      onProgress?.(video.currentTime / video.duration);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (autoPlay) video.play().catch(() => {});
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [autoPlay, onProgress, onEnded]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setVolume(v);
      setIsMuted(v === 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !videoRef.current) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * duration;
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000) as ReturnType<typeof setTimeout>;
  };

  const setRate = (rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden aspect-video group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={thumbnailUrl}
        playsInline
        onClick={togglePlay}
      >
        {subtitleUrl && subtitlesOn && (
          <track kind="subtitles" src={subtitleUrl} default label="日本語" srcLang="ja" />
        )}
      </video>

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Center play/pause flash */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          showControls && !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        </div>
      </div>

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Top bar */}
        {title && (
          <div className="relative px-4 pt-4 pb-2">
            <p className="text-white text-sm font-medium truncate">{title}</p>
          </div>
        )}

        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative mx-4 mb-2 h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-3 transition-all"
          onClick={handleSeek}
        >
          <div
            className="absolute left-0 top-0 h-full bg-white/30 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute left-0 top-0 h-full bg-[#7c3aed] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Controls */}
        <div className="relative flex items-center gap-2 px-4 pb-4">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-[#a78bfa] transition-colors p-1">
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>

          {/* Skip */}
          <button onClick={() => skip(-10)} className="text-white hover:text-[#a78bfa] transition-colors p-1">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={() => skip(10)} className="text-white hover:text-[#a78bfa] transition-colors p-1">
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Volume */}
          <button onClick={toggleMute} className="text-white hover:text-[#a78bfa] transition-colors p-1">
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-[#7c3aed]"
          />

          {/* Time */}
          <span className="text-white text-xs ml-1">
            {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
          </span>

          <div className="flex-1" />

          {/* Subtitle toggle */}
          {subtitleUrl && (
            <button
              onClick={() => setSubtitlesOn(!subtitlesOn)}
              className={`p-1 transition-colors ${subtitlesOn ? "text-[#a78bfa]" : "text-white/50"}`}
            >
              <Subtitles className="w-5 h-5" />
            </button>
          )}

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-[#a78bfa] transition-colors p-1"
            >
              <Settings className="w-5 h-5" />
            </button>
            {showSettings && (
              <div className="absolute bottom-10 right-0 bg-[#1a1a26] border border-[#2a2a3e] rounded-xl p-3 min-w-[140px] shadow-xl">
                <p className="text-xs text-[#6b7280] mb-2">再生速度</p>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setRate(rate)}
                    className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-[#2a2a3e] transition-colors ${
                      playbackRate === rate ? "text-[#a78bfa]" : "text-[#e8e8f0]"
                    }`}
                  >
                    {rate === 1 ? "標準" : `${rate}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white hover:text-[#a78bfa] transition-colors p-1">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
