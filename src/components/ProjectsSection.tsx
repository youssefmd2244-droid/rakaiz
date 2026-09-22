"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/context/I18nContext";
import { accentAt, CATEGORY_ACCENT } from "@/lib/accents";
import {
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface ProjectItem {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  categoryKey: string;
  shortDescAr: string;
  shortDescEn: string;
  fullDescAr: string;
  fullDescEn: string;
  locationAr: string;
  locationEn: string;
  clientAr: string;
  clientEn: string;
  scopeAr: string;
  scopeEn: string;
  area: string;
  year: string;
  statusAr: string;
  statusEn: string;
  heroImage: string;
  gallery: string[];
  keyFacts?: Array<{ labelAr: string; labelEn: string; value: string }>;
}

export const ProjectsSection: React.FC = () => {
  const { t, isRtl } = useI18n();
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  useEffect(() => {
    fetch("/api/cms?table=projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setProjectsList(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const filterTabs = [
    { key: "all", labelAr: "الكل", labelEn: "All Projects" },
    { key: "residential", labelAr: "مشاريع سكنية", labelEn: "Residential" },
    { key: "commercial", labelAr: "مشاريع تجارية", labelEn: "Commercial" },
    { key: "infrastructure", labelAr: "بنية تحتية", labelEn: "Infrastructure" },
    { key: "hospitality", labelAr: "ضيافة ومنتجعات", labelEn: "Hospitality" },
  ];

  const filteredProjects =
    activeFilter === "all"
      ? projectsList
      : projectsList.filter((p) => p.categoryKey === activeFilter);

  return (
    <section id="projects" className="py-24 relative bg-ink-2 border-t border-line-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Pill Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">06</span>
              <div className="title-pill">
                <span>{t("مشاريعنا المختارة", "Selected Projects")}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-fg">
              {t("معالم معمارية تم إنجازها بإتقان", "Landmarks Crafted with Architectural Mastery")}
            </h2>
            <div className="spectrum-bar w-24 mt-4" />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeFilter === tab.key
                    ? "bg-gold text-on-gold shadow-lg shadow-gold/20"
                    : "bg-card text-fg-2 hover:text-fg border border-fg/5 hover:border-fg/20"
                }`}
              >
                {t(tab.labelAr, tab.labelEn)}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid / Swipeable Carousel on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              data-accent={CATEGORY_ACCENT[project.categoryKey] || accentAt(project.id)}
              onClick={() => {
                setSelectedProject(project);
                setActiveGalleryIndex(0);
              }}
              className="accent-edge group relative rounded-3xl bg-card border border-fg/10 hover:border-accent/60 transition-all duration-500 overflow-hidden shadow-2xl cursor-pointer flex flex-col justify-between"
            >
              {/* Image Thumbnail Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-2">
                <Image
                  src={project.heroImage}
                  alt={project.titleAr}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-90" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-3.5 py-1 rounded-full bg-ink/80 backdrop-blur-md text-[11px] font-bold text-accent-text border border-accent/30">
                    {t(project.categoryAr, project.categoryEn)}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-ink/80 backdrop-blur-md text-[11px] font-mono text-fg-2 border border-fg/10">
                    {project.year}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-fg mb-2 group-hover:text-accent-text transition-colors">
                    {t(project.titleAr, project.titleEn)}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-fg-4 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-accent-text" />
                      <span>{t(project.locationAr, project.locationEn)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-accent-text" />
                      <span>{project.area}</span>
                    </span>
                  </div>

                  <p className="text-sm text-fg-2 leading-relaxed line-clamp-3 mb-6">
                    {t(project.shortDescAr, project.shortDescEn)}
                  </p>
                </div>

                {/* Action CTA & Key Facts pill */}
                <div className="pt-4 border-t border-fg/10 flex items-center justify-between text-xs font-bold text-accent-text">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t("عرض دراسة الحالة والصور", "View Case Study & Gallery")}</span>
                  </span>
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent-text group-hover:bg-accent group-hover:text-on-accent transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Case Study & Gallery Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200 overflow-y-auto">
          <div data-accent={CATEGORY_ACCENT[selectedProject.categoryKey] || accentAt(selectedProject.id)} className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-card border border-accent/40 shadow-2xl overflow-y-auto p-6 sm:p-10 text-fg">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-full bg-fg/10 hover:bg-fg/20 text-fg transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header info */}
            <div className="mb-6 pr-10 rtl:pr-0 rtl:pl-10">
              <div className="inline-block px-3.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs font-bold text-accent-text mb-2">
                {t(selectedProject.categoryAr, selectedProject.categoryEn)}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-fg mb-2">
                {t(selectedProject.titleAr, selectedProject.titleEn)}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-fg-3">
                <span>{t("الجهة:", "Client:")} {t(selectedProject.clientAr, selectedProject.clientEn)}</span>
                <span>•</span>
                <span>{t("الموقع:", "Location:")} {t(selectedProject.locationAr, selectedProject.locationEn)}</span>
                <span>•</span>
                <span>{t("المساحة:", "Area:")} {selectedProject.area}</span>
              </div>
            </div>

            {/* Interactive Image Slideshow & Lightbox */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-fg/10 mb-4 bg-black">
              {selectedProject.gallery && selectedProject.gallery.length > 0 ? (
                <Image
                  src={selectedProject.gallery[activeGalleryIndex] || selectedProject.heroImage}
                  alt={selectedProject.titleAr}
                  fill
                  className="object-cover transition-opacity duration-300"
                />
              ) : (
                <Image
                  src={selectedProject.heroImage}
                  alt={selectedProject.titleAr}
                  fill
                  className="object-cover"
                />
              )}

              {/* Gallery Arrow Controls */}
              {selectedProject.gallery && selectedProject.gallery.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveGalleryIndex((prev) =>
                        prev === 0 ? selectedProject.gallery.length - 1 : prev - 1
                      );
                    }}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-fg pointer-events-auto transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveGalleryIndex((prev) =>
                        prev === selectedProject.gallery.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-fg pointer-events-auto transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {selectedProject.gallery && selectedProject.gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6">
                {selectedProject.gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveGalleryIndex(i)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeGalleryIndex === i ? "border-accent scale-105" : "border-fg/10 opacity-60"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Key Facts Counters */}
            {selectedProject.keyFacts && selectedProject.keyFacts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-card border border-fg/5">
                {selectedProject.keyFacts.map((fact, idx) => (
                  <div key={idx} className="text-center p-2">
                    <div className="text-xl sm:text-2xl font-black text-accent-text font-mono">
                      {fact.value}
                    </div>
                    <div className="text-xs text-fg-3 mt-0.5">
                      {t(fact.labelAr, fact.labelEn)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Full Official Description verbatim */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent-text">
                {t("بيانات ونطاق المشروع الفعلي", "Official Project Scope & Facts")}
              </h3>
              <div className="p-6 rounded-2xl bg-card border border-fg/5 text-fg-2 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {t(selectedProject.fullDescAr, selectedProject.fullDescEn)}
              </div>
            </div>

            <div className="pt-4 border-t border-fg/10 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-6 py-2.5 rounded-full bg-accent text-on-accent font-bold text-sm hover:opacity-90 transition-colors"
              >
                {t("إغلاق النافذة", "Close Window")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
