"use client";

import React from "react";
import { useI18n } from "@/context/I18nContext";
import { accentAt } from "@/lib/accents";
import { DEFAULT_SHOWCASE, ShowcaseItem, ShowcaseSettings, isItemVisible, pick, videoEmbedUrl } from "@/lib/iconcode-showcase";

const Media: React.FC<{ item: ShowcaseItem; title: string; hasText: boolean }> = ({ item, title, hasText }) => {
  if (item.type === "text") return null;
  if (item.type === "video") {
    const embed = videoEmbedUrl(item.url);
    return (
      <div className="relative w-full aspect-video bg-black">
        {embed ? (
          <iframe
            src={embed}
            title={title || "video"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <video
            src={item.url}
            poster={item.poster || undefined}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {hasText && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />}
    </div>
  );
};

interface ShowcaseProps {
  data?: ShowcaseSettings | null;
  /** Content shown until the admin saves their own (defaults to the Icon Code showcase) */
  fallback?: ShowcaseSettings;
  /** Cards per row on large screens */
  columns?: 3 | 4;
  className?: string;
}

/** Sections of images / videos (with or without text) managed from the admin settings. */
export const IconCodeShowcase: React.FC<ShowcaseProps> = ({ data, fallback = DEFAULT_SHOWCASE, columns = 4, className = "relative mt-10 space-y-12" }) => {
  const { isRtl } = useI18n();
  const source = data && Array.isArray(data.sections) ? data : fallback;

  const sections = source.sections
    .filter((s) => s.enabled)
    .map((s) => ({ ...s, items: s.items.filter(isItemVisible) }))
    .filter((s) => s.items.length > 0 || s.title || s.text);

  if (sections.length === 0) return null;

  return (
    <div className={className}>
      {sections.map((section) => {
        const sectionTitle = pick(isRtl, section.title, section.titleEn);
        const sectionText = pick(isRtl, section.text, section.textEn);
        const gridCols =
          section.columns === 2 ? "lg:grid-cols-2" : section.columns === 3 ? "lg:grid-cols-3" : section.columns === 4 ? "lg:grid-cols-4" : columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

        return (
          <div key={section.id}>
            {(sectionTitle || sectionText) && (
              <div className="mb-5 space-y-1.5">
                {sectionTitle && <h4 className="text-lg sm:text-xl font-black text-fg">{sectionTitle}</h4>}
                {sectionText && <p className="text-sm text-fg-3 max-w-3xl leading-relaxed">{sectionText}</p>}
              </div>
            )}

            {section.items.length > 0 && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4`}>
                {section.items.map((item, index) => {
                  const title = pick(isRtl, item.title, item.titleEn);
                  const text = pick(isRtl, item.text, item.textEn);
                  const hasText = !!(title || text);
                  const isVideo = item.type === "video";
                  const isText = item.type === "text";

                  if (isText) {
                    return (
                      <figure
                        key={item.id}
                        data-accent={accentAt(index)}
                        className="group relative m-0 rounded-2xl overflow-hidden bg-ink border border-fg/10 hover:border-accent/60 transition-colors p-5 flex flex-col justify-center min-h-[140px]"
                      >
                        <span className="block w-8 h-1 rounded-full bg-accent mb-3" />
                        {title && <span className="block text-base font-black text-fg leading-snug">{title}</span>}
                        {text && <span className="block text-xs text-fg-3 leading-relaxed mt-1">{text}</span>}
                      </figure>
                    );
                  }

                  return (
                    <figure
                      key={item.id}
                      data-accent={accentAt(index)}
                      className="group relative m-0 rounded-2xl overflow-hidden bg-ink border border-fg/10 hover:border-accent/60 transition-colors"
                    >
                      <Media item={item} title={title} hasText={hasText && !isVideo} />

                      {hasText && !isVideo && (
                        <figcaption className="absolute inset-x-0 bottom-0 p-4 space-y-1 pointer-events-none">
                          <span className="block w-8 h-1 rounded-full bg-accent mb-2" />
                          {title && <span className="block text-base font-black text-white leading-snug">{title}</span>}
                          {text && <span className="block text-xs text-white/80 leading-relaxed">{text}</span>}
                        </figcaption>
                      )}

                      {hasText && isVideo && (
                        <figcaption className="p-4 space-y-1">
                          <span className="block w-8 h-1 rounded-full bg-accent mb-2" />
                          {title && <span className="block text-base font-black text-fg leading-snug">{title}</span>}
                          {text && <span className="block text-xs text-fg-3 leading-relaxed">{text}</span>}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
