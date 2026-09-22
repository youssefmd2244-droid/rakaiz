"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/context/I18nContext";
import { ArrowDown, Sparkles, Building, Layers, Store, Home } from "lucide-react";
import { HeroVideo } from "./HeroVideo";
import { accentAt } from "@/lib/accents";
import { SiteMedia } from "@/lib/site-content";

interface HeroProps {
  onOpenQuote: () => void;
  onOpenContact: () => void;
  stats?: Array<{ value: string; unit: string; labelAr: string; labelEn: string }>;
  media?: Partial<SiteMedia> | null;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote, onOpenContact, stats, media }) => {
  const { t, isRtl } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultStats = stats || [
    { value: "1,800,000", unit: "م²", labelAr: "المساحة الإجمالية", labelEn: "Total Built Area" },
    { value: "5", unit: "أبراج", labelAr: "أبراج سكنية وتجارية", labelEn: "High-Rise Towers" },
    { value: "1300", unit: "متجر", labelAr: "متجر تجاري", labelEn: "Commercial Stores" },
    { value: "30", unit: "استراحة", labelAr: "استراحة متكاملة", labelEn: "Luxury Chalets" },
  ];

  return (
    <section id="hero" className="force-dark relative min-h-[92vh] flex flex-col justify-between overflow-hidden pt-6 pb-12 bg-ink">
      {/* Looping background video */}
      <HeroVideo
        wideVideo={media?.heroWideVideo}
        widePoster={media?.heroWidePoster}
        portraitVideo={media?.heroPortraitVideo}
        portraitPoster={media?.heroPortraitPoster}
      />

      {/* Atmospheric Ambient Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] bg-gold-hi/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center items-center text-center mt-6">
        {/* Large Golden Watermarked Architectural Crest */}
        <div className="mb-6 relative group animate-in fade-in duration-1000">
          <div className="w-28 h-28 sm:w-36 sm:h-36 relative mx-auto p-1.5 rounded-full bg-gradient-to-tr from-gold-lo via-gold to-gold-soft shadow-[0_0_50px_rgba(240,179,35,0.35)] transition-transform duration-500 group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-onyx flex items-center justify-center p-2.5">
              <Image
                src="/logos/rakaiz-logo.svg"
                alt="RAKAIZ Architectural Emblem"
                width={120}
                height={120}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(240,179,35,0.4)]"
                priority
              />
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-card-2 border border-gold/50 text-[11px] font-mono text-gold-text shadow-md">
            EST. CR 1010875202
          </div>
        </div>

        {/* Verbatim Official Title from Profile */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-fg mb-4 leading-tight">
          <span className="block">{t(media?.heroTitle || "ركائز للبناء والمقاولات", media?.heroTitleEn || "Rakaiz for Building & Contracting")}</span>
        </h1>

        {/* Cinematic Subtitle verbatim and elevated */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-fg-2 font-light mb-8 leading-relaxed">
          {t(
            media?.heroSubtitle ||
              "نبني اليوم .. ركائز لمستقبل أفضل. حلول هندسية شاملة وتطوير عمراني يواكب رؤية المملكة 2030.",
            media?.heroSubtitleEn ||
              "Building Today.. Pillars for a Greater Future. Comprehensive engineering solutions and urban development aligned with Saudi Vision 2030."
          )}
        </p>

        {/* CTA Buttons strip (Verbatim: مشاريعنا / تواصل معنا / اطلب عرض سعر) */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href="#projects"
            className="btn-gold-sweep px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-black text-base shadow-[0_0_30px_rgba(240,179,35,0.35)] hover:shadow-[0_0_45px_rgba(240,179,35,0.55)] transition-all transform hover:-translate-y-0.5"
          >
            {t("مشاريعنا", "Our Projects")}
          </a>

          <button
            onClick={onOpenContact}
            className="px-7 py-3.5 rounded-full bg-card/90 hover:bg-card-3 text-fg font-bold text-base border border-fg/15 hover:border-gold/60 transition-all backdrop-blur-md"
          >
            {t("تواصل معنا", "Contact Us")}
          </button>

          <button
            onClick={onOpenQuote}
            className="px-7 py-3.5 rounded-full bg-card/90 hover:bg-card-3 text-gold-text font-bold text-base border border-gold/40 hover:border-gold transition-all backdrop-blur-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("اطلب عرض سعر", "Request a Quote")}</span>
          </button>
        </div>
      </div>

      {/* Floating Statistics Strip - Exact architectural pill ribbon from Mockup */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 w-full">
        <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-gold/35 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl bg-gradient-to-r from-card/95 via-card-2/95 to-card/95">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-line">
            {defaultStats.map((item, idx) => (
              <div
                key={idx}
                data-accent={accentAt(idx)}
                className="flex flex-col items-center justify-center p-2 text-center group hover:scale-105 transition-transform"
              >
                <div className="flex items-baseline gap-1.5 text-2xl sm:text-3xl font-black text-fg group-hover:text-accent-text transition-colors">
                  <span className="font-mono tracking-tight">{item.value}</span>
                  <span className="text-sm sm:text-base font-bold text-accent-text">{item.unit}</span>
                </div>
                <span className="mt-1.5 block h-0.5 w-8 rounded-full bg-accent" />
                <div className="text-xs sm:text-sm text-fg-3 mt-1 font-medium">
                  {t(item.labelAr, item.labelEn)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Scroll Indicator */}
      <div className="relative z-10 text-center mt-6 text-xs text-fg-5 flex flex-col items-center gap-1 animate-bounce">
        <span>{t("اكتشف ركائز", "Scroll to Explore")}</span>
        <ArrowDown className="w-3.5 h-3.5 text-gold-text" />
      </div>
    </section>
  );
};
