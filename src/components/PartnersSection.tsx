"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/context/I18nContext";

interface PartnerItem {
  id: number;
  nameAr: string;
  nameEn: string;
  categoryAr?: string;
  categoryEn?: string;
  logoUrl: string;
  websiteUrl?: string;
}

export const PartnersSection: React.FC = () => {
  const { t } = useI18n();
  const [partnersList, setPartnersList] = useState<PartnerItem[]>([]);

  useEffect(() => {
    fetch("/api/cms?table=partners")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setPartnersList(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section id="partners" className="py-20 relative bg-ink border-t border-line-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">07</span>
              <div className="title-pill">
                <span>{t("شركاء النجاح", "Success Partners")}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-fg">
              {t("شراكات وطنية واستراتيجية موثوقة", "Trusted National & Strategic Partnerships")}
            </h2>
            <div className="spectrum-bar w-24 mt-4" />
          </div>

          <p className="text-sm text-fg-3 max-w-sm">
            {t(
              "نعتز بالتعاون مع كبرى الجهات الحكومية والشركات الرائدة بالمملكة.",
              "Proudly collaborating with leading Saudi government ministries and mega corporations."
            )}
          </p>
        </div>
      </div>

      {/* Infinite Logo Marquee (Grayscale -> Color on hover) */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Gradient fades on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee gap-6">
          {[...partnersList, ...partnersList, ...partnersList].map((p, index) => (
            <div
              key={index}
              className="w-56 sm:w-64 h-24 rounded-2xl bg-card hover:bg-card-2 border border-fg/5 hover:border-gold/50 transition-all duration-300 p-4 flex items-center justify-center flex-shrink-0 group shadow-md"
            >
              <div className="w-full h-full relative flex items-center justify-center filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                <Image
                  src={p.logoUrl}
                  alt={p.nameAr}
                  width={180}
                  height={60}
                  className="max-h-16 w-auto object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
