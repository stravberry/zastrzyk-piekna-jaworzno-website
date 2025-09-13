import React, { useState, useMemo } from "react";

interface VideoLiteProps {
  videoId: string;
  title?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Lightweight YouTube embed: shows a thumbnail with play button, loads iframe on click
 */
const VideoLite: React.FC<VideoLiteProps> = ({ videoId, title = "YouTube video", className = "", priority = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = useMemo(() => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, [videoId]);
  const iframeSrc = useMemo(
    () => `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    [videoId]
  );

  if (isPlaying) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={iframeSrc}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      className={`group relative w-full h-full overflow-hidden ${className}`}
      aria-label={`Odtwórz wideo: ${title}`}
    >
      {/* Thumbnail */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        width="480"
        height="360"
      />

      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" aria-hidden="true" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="inline-flex items-center justify-center rounded-full border border-pink-100 bg-white/90 text-pink-600 shadow-md w-16 h-16 transition-transform duration-200 group-hover:scale-105">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Decorative ring / focus */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-pink-200/60" aria-hidden="true" />
    </button>
  );
};

export default React.memo(VideoLite);
