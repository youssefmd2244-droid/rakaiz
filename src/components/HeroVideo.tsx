"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Full-bleed looping background video for the hero section.
 *  - Two optimized files: a wide crop for desktop/tablet and a portrait one for phones
 *    (only ONE of them is downloaded by each visitor).
 *  - A poster image is shown instantly while the video loads, so the hero never looks empty.
 *  - Skipped for visitors with "reduced motion" or "data saver" enabled.
 */
interface HeroVideoProps {
  wideVideo?: string;
  widePoster?: string;
  portraitVideo?: string;
  portraitPoster?: string;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({ wideVideo, widePoster, portraitVideo, portraitPoster }) => {
  const wideSrc = wideVideo || "/videos/hero-wide.mp4";
  const portraitSrc = portraitVideo || "/videos/hero-portrait.mp4";
  const widePosterSrc = widePoster || "/videos/hero-wide-poster.jpg";
  const portraitPosterSrc = portraitPoster || "/videos/hero-portrait-poster.jpg";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduceMotion || saveData) return;

    const portrait = window.matchMedia("(max-width: 767px), (orientation: portrait)").matches;
    setSrc(portrait ? portraitSrc : wideSrc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wideSrc, portraitSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    // React does not reliably set the `muted` attribute, and browsers only autoplay muted videos.
    video.muted = true;
    video.play().catch(() => {
      /* autoplay blocked: the poster image stays visible */
    });
  }, [src]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-onyx" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px), (orientation: portrait)" srcSet={portraitPosterSrc} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={widePosterSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      </picture>

      {src && (
        <video
          key={src}
          ref={videoRef}
          src={src}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
        />
      )}

      {/* Dark overlay keeps the white text readable on the bright video */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-transparent to-transparent" />
    </div>
  );
};
