"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/context/I18nContext";
import { accentAt } from "@/lib/accents";
import {
  Building2,
  Hammer,
  TrendingUp,
  Sparkles,
  Home,
  Wrench,
  Landmark,
  Network,
  Waypoints,
  ArrowUpRight,
  X,
  CheckCircle,
} from "lucide-react";

export interface ServiceItem {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  shortDescAr: string;
  shortDescEn: string;
  fullDescAr: string;
  fullDescEn: string;
  featuresAr?: string[];
  featuresEn?: string[];
  icon: string;
  image: string;
}

export const ServicesSection: React.FC = () => {
  const { t, isRtl } = useI18n();
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    fetch("/api/cms?table=services")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setServicesList(data.data);
        }
      })
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Network": return <Network className="w-6 h-6" />;
      case "Waypoints": return <Waypoints className="w-6 h-6" />;
      case "Building2": return <Building2 className="w-6 h-6" />;
      case "Landmark": return <Landmark className="w-6 h-6" />;
      case "Hammer": return <Hammer className="w-6 h-6" />;
      case "Wrench": return <Wrench className="w-6 h-6" />;
      case "Sparkles": return <Sparkles className="w-6 h-6" />;
      case "Home": return <Home className="w-6 h-6" />;
      case "TrendingUp": return <TrendingUp className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  return (
    <section id="services" className="py-24 relative bg-ink-2 border-t border-line-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">04</span>
              <div className="title-pill">
                <span>{t("خدماتنا الشاملة", "Our Services")}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-fg">
              {t("المقاولات العامة والعقارات والإستثمارات", "General Contracting, Real Estate & Investments")}
            </h2>
            <div className="spectrum-bar w-24 mt-4" />
          </div>

          <div className="max-w-md text-sm text-fg-3 leading-relaxed">
            {t(
              "حلول متكاملة في مجال البناء والمقاولات، وصيانة المرافق، والاستثمار العقاري المصممة لتلبية تطلعات شركائنا بأعلى معايير الإتقان.",
              "Integrated solutions spanning building contracting, facility management, and real estate investments executed with master craftsmanship."
            )}
          </div>
        </div>

        {/* Highlight Banner (Verbatim from Section 5 [05]) */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card via-card-2 to-card border border-gold/30 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
              <p className="text-fg-2">
                {t("خدمات الاستثمار لمساعدة العملاء على النمو وتأمين مستقبلهم.", "Investment services to assist clients in growing capital and securing their future.")}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
              <p className="text-fg-2">
                {t("تقديم الخدمات المتعلقة باستثمار الأراضي والمباني السكنية حسب متطلبات العملاء.", "Specialized services for land and residential property investment aligned with client goals.")}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
              <p className="text-fg-2">
                {t("المقاولات العامة للمنازل والمباني الخاصة شاملة الصيانة والتشطيب والبناء.", "General contracting for private estates and homes encompassing maintenance, finishing & construction.")}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
              <p className="text-fg-2">
                {t("تقديم خدمات التشطيب عالية الجودة والمصممة خصيصاً لتلبية الاحتياجات الفريدة لكل عميل.", "Delivering bespoke, high-grade finishing tailored to each client's unique aesthetic expectations.")}
              </p>
            </div>
          </div>
        </div>

        {/* 3D Animated Grid of the 9 Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((service, index) => (
            <div
              key={service.id || index}
              data-accent={accentAt(index)}
              onClick={() => setSelectedService(service)}
              className="accent-edge group relative p-7 rounded-3xl bg-card hover:bg-card-2 border border-fg/5 hover:border-accent/50 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top Row: Icon + Arrow */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent-text group-hover:scale-110 group-hover:bg-accent group-hover:text-on-accent transition-all duration-300">
                    {getIconComponent(service.icon)}
                  </div>
                  <div className="w-8 h-8 rounded-full border border-fg/10 flex items-center justify-center text-fg-4 group-hover:text-accent-text group-hover:border-accent/40 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-xs font-mono text-accent-text/80 mb-2">
                  {t(service.categoryAr, service.categoryEn)}
                </div>

                <h3 className="text-xl font-bold text-fg mb-3 group-hover:text-accent-text transition-colors leading-snug">
                  {t(service.titleAr, service.titleEn)}
                </h3>

                <p className="text-sm text-fg-3 leading-relaxed line-clamp-3 mb-6">
                  {t(service.shortDescAr, service.shortDescEn)}
                </p>
              </div>

              {/* Bottom Details link */}
              <div className="pt-4 border-t border-fg/5 flex items-center justify-between text-xs font-bold text-accent-text">
                <span>{t("عرض التفاصيل الفنية", "View Technical Details")}</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div data-accent={accentAt(servicesList.findIndex((sv) => sv.id === selectedService.id))} className="relative w-full max-w-2xl rounded-3xl bg-card border border-accent/40 shadow-2xl p-6 sm:p-8 overflow-hidden text-fg">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-full bg-fg/5 hover:bg-fg/10 text-fg-3 hover:text-fg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent-text">
                {getIconComponent(selectedService.icon)}
              </div>
              <div>
                <span className="text-xs font-mono text-accent-text">
                  {t(selectedService.categoryAr, selectedService.categoryEn)}
                </span>
                <h3 className="text-2xl font-black text-fg">
                  {t(selectedService.titleAr, selectedService.titleEn)}
                </h3>
              </div>
            </div>

            <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-6 border border-fg/10">
              <Image
                src={selectedService.image || "/images/about-facade-geometric.jpg"}
                alt={selectedService.titleAr}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-80" />
            </div>

            <p className="text-base text-fg-2 leading-relaxed mb-6">
              {t(selectedService.fullDescAr, selectedService.fullDescEn)}
            </p>

            {selectedService.featuresAr && selectedService.featuresAr.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent-text">
                  {t("نطاق العمل والمميزات الرئيسية", "Key Scope & Deliverables")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-fg-2">
                  {(isRtl ? selectedService.featuresAr : (selectedService.featuresEn || selectedService.featuresAr)).map(
                    (feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent-text flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-fg/10 flex justify-end">
              <button
                onClick={() => setSelectedService(null)}
                className="px-6 py-2.5 rounded-full bg-accent text-on-accent font-bold text-sm hover:opacity-90 transition-colors"
              >
                {t("إغلاق", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
