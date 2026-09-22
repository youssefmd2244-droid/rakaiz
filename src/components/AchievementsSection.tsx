"use client";

import React, { useEffect, useState } from "react";
import { useI18n } from "@/context/I18nContext";
import { accentAt } from "@/lib/accents";
import { Trophy, Calendar, CheckCircle2 } from "lucide-react";

interface AchievementItem {
  id: number;
  year: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  highlightAr?: string;
  highlightEn?: string;
}

export const AchievementsSection: React.FC = () => {
  const { t, isRtl } = useI18n();
  const [achievementsList, setAchievementsList] = useState<AchievementItem[]>([]);

  useEffect(() => {
    fetch("/api/cms?table=achievements")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setAchievementsList(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section id="achievements" className="py-24 relative bg-ink border-t border-line-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">05</span>
              <div className="title-pill">
                <span>{t("الإنجازات الرئيسية", "Key Achievements")}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-fg">
              {t("مسيرة حافلة بالمشاريع الاستراتيجية", "A Legacy of Strategic Milestones")}
            </h2>
            <div className="spectrum-bar w-24 mt-4" />
          </div>

          <div className="text-sm text-fg-3 max-w-sm">
            {t("محطات بارزة في مسيرتنا العمرانية والإنشائية بالمملكة.", "Key milestones throughout our civil engineering journey in KSA.")}
          </div>
        </div>

        {/* Vertical Architectural Timeline */}
        <div className="relative border-r rtl:border-r ltr:border-l border-gold/30 mr-4 rtl:mr-4 ltr:mr-0 ltr:ml-4 sm:mx-auto max-w-4xl space-y-12">
          {achievementsList.map((item, idx) => (
            <div key={item.id || idx} data-accent={accentAt(idx + 1)} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute top-1 -right-[17px] rtl:-right-[17px] ltr:right-auto ltr:-left-[17px] w-8 h-8 rounded-full bg-card-2 border-2 border-accent flex items-center justify-center text-accent-text shadow-[0_0_15px_rgba(240,179,35,0.4)] group-hover:scale-125 transition-transform duration-300">
                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              </div>

              {/* Content card */}
              <div className="mr-8 rtl:mr-8 ltr:mr-0 ltr:ml-8 p-6 sm:p-8 rounded-3xl bg-card hover:bg-card-2 border border-fg/5 hover:border-accent/40 transition-all shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-text font-mono font-bold text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.year}</span>
                  </div>

                  {item.highlightAr && (
                    <div className="text-xs font-semibold text-fg-4 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-text" />
                      <span>{t(item.highlightAr, item.highlightEn || item.highlightAr)}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-fg mb-3">
                  {t(item.titleAr, item.titleEn)}
                </h3>

                <p className="text-sm sm:text-base text-fg-2 leading-relaxed">
                  {t(item.descAr, item.descEn)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Official Closing Line verbatim from profile */}
        <div className="mt-16 text-center max-w-2xl mx-auto p-5 rounded-2xl bg-card border border-gold/25 shadow-lg">
          <p className="text-sm sm:text-base font-semibold text-gold-text leading-relaxed">
            {t(
              "«إن جهودنا المستمرة والتزامنا بالتميز تنعكس في مساهماتنا في التطورات العامة.»",
              "“Our relentless efforts and enduring commitment to excellence are reflected in our impactful contributions to public developments.”"
            )}
          </p>
        </div>
      </div>
    </section>
  );
};
