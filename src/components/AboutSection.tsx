"use client";

import React from "react";
import Image from "next/image";
import { useI18n } from "@/context/I18nContext";
import { ShieldCheck, Compass, Target, ArrowLeft, ArrowRight } from "lucide-react";
import { IconCodeShowcase } from "./IconCodeShowcase";
import { DEFAULT_RAKAIZ_GALLERY, ShowcaseSettings, hasVisibleShowcase } from "@/lib/iconcode-showcase";
import { SiteMedia } from "@/lib/site-content";

interface AboutSectionProps {
  /** Editable gallery (settings key: about_gallery) */
  galleryData?: ShowcaseSettings | null;
  media?: Partial<SiteMedia> | null;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ galleryData, media }) => {
  const { t, isRtl } = useI18n();

  return (
    <section id="about" className="py-24 relative bg-ink border-t border-line-soft overflow-hidden">
      {/* Background Architectural Accent Lines */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Large 01 Pill */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">01</span>
            <div className="title-pill">
              <span>{t("من نحن؟", "About Us")}</span>
            </div>
          </div>
          <div className="text-xs sm:text-sm font-mono text-fg-4">
            {t("ملف الشركة الرسمي", "Official Company Profile")}
          </div>
        </div>

        {/* Two-column Heroic Architectural Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          {/* Glass Architectural Facade Image Card (Profile motif: angular black-and-white glass facade with gold accents) */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-3xl overflow-hidden border border-gold/30 shadow-2xl bg-card">
              <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full overflow-hidden">
                <Image
                  src={media?.aboutImage || "/images/about-facade-geometric.jpg"}
                  alt="Rakaiz Architectural Facade"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
              </div>

              {/* Gold floating badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-card/90 backdrop-blur-md border border-gold/40 flex items-center justify-between">
                <div>
                  <div className="text-xs text-fg-3">{t(media?.aboutImageLabel || "الاسم الرسمي", media?.aboutImageLabelEn || "Official Title")}</div>
                  <div className="text-sm font-bold text-fg">{t(media?.aboutImageTitle || "ركائز للتجارة والمقاولات", media?.aboutImageTitleEn || "Rakaiz Trading & Contracting")}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold flex items-center justify-center text-gold-text">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Architectural decorative gold corner block */}
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-gradient-to-br from-gold-hi to-gold-lo shadow-lg -z-0" />
          </div>

          {/* About Text Content (Verbatim from Section 5 [02]) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-fg tracking-tight">
                {t("ركائز للتجارة والمقاولات", "Rakaiz Trading & Contracting")}
              </h2>
              <p className="text-lg sm:text-xl font-bold text-gold-text">
                {t("شركة متخصصة في تقديم حلول هندسية شاملة.", "A company specialized in delivering comprehensive engineering solutions.")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-fg/10 text-fg-2 leading-relaxed text-base sm:text-lg shadow-xl">
              <p className="indent-2">
                {t(
                  "في عالم الهندسة والبناء المتطور باستمرار، تبرز شركة ركائز كرمز للابتكار والخبرة. تأسست الشركة لتلبية الطلب المتزايد في هذا القطاع، وتتفوق في تقديم خدمات هندسية شاملة تغطي العديد من المجالات، بما في ذلك المقاولات، وتطوير العقارات، والبنية التحتية، والحلول البيئية.",
                  "In the ever-evolving realm of engineering and construction, Rakaiz stands out as a hallmark of innovation and mastery. Established to meet rising sector demand, the company excels in providing comprehensive engineering services spanning contracting, real estate development, civil infrastructure, and environmental solutions."
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card-2 border border-gold/40 text-gold-text hover:bg-gold hover:text-on-gold font-bold transition-all"
              >
                <span>{t("استكشف مجالات عملنا", "Explore Our Fields")}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </a>

              <a
                href="/documents/rakaiz-company-profile.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-fg/5 border border-fg/15 text-fg hover:border-fg/40 font-semibold transition-all"
              >
                <span>{t("تحميل بروفايل الشركة (PDF)", "Download Company Profile (PDF)")}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Section 02 - Vision & Mission (Verbatim from Section 5 [03]) */}
        <div className="mt-20 pt-16 border-t border-line-soft">
          <div className="flex items-center gap-3 mb-10">
            <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">02</span>
            <div className="title-pill">
              <span>{t("الرؤية والرسالة", "Vision & Mission")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <div data-accent="gold" className="relative p-8 rounded-3xl bg-card border border-accent/25 hover:border-accent/60 transition-all shadow-xl group">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent-text mb-6 group-hover:scale-110 transition-transform">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-fg mb-4 flex items-center gap-2">
                <span>{t("الرؤية", "Our Vision")}</span>
                <span className="w-2 h-2 rounded-full bg-accent" />
              </h3>
              <p className="text-fg-2 text-base sm:text-lg leading-relaxed">
                {t(
                  "نسعى أن نكون شركة رائدة في قطاع الإنشاءات، لتقديم حلول مبتكرة ومستدامة وعالية الجودة، تحدث تحولاً في المجتمعات وتحسن حياة الأفراد. نهدف إلى وضع معايير للتميز والسلامة ورضا العملاء في صناعة الإنشاءات.",
                  "We aspire to be an industry pioneer in the construction sector, delivering forward-thinking, sustainable, top-tier engineering solutions that transform urban communities and enrich lives, setting gold benchmarks for safety, excellence, and client satisfaction."
                )}
              </p>
            </div>

            {/* Mission Card */}
            <div data-accent="orange" className="relative p-8 rounded-3xl bg-card border border-accent/25 hover:border-accent/60 transition-all shadow-xl group">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent-text mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-fg mb-4 flex items-center gap-2">
                <span>{t("الرسالة", "Our Mission")}</span>
                <span className="w-2 h-2 rounded-full bg-accent" />
              </h3>
              <p className="text-fg-2 text-base sm:text-lg leading-relaxed">
                {t(
                  "نوظف مواردنا وقدراتنا لتقديم مشاريع متميزة. رسالتنا هي المساهمة في تنمية وطننا الحبيب وتقديم قيمة مضافة لعملائنا.",
                  "We channel our resources and engineering capabilities to deliver distinguished projects. Our overarching mission is to drive the sustainable development of our beloved homeland and deliver genuine value-added excellence to our clients."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Section 03 - Three Glass Columns (Values / Goals / Comprehensive Services) Verbatim from Section 5 [04] */}
        <div className="mt-20 pt-16 border-t border-line-soft">
          <div className="flex items-center gap-3 mb-10">
            <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">03</span>
            <div className="title-pill">
              <span>{t("ركائزنا المؤسسية", "Corporate Pillars")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 - القيم والالتزام */}
            <div data-accent="red" className="p-7 rounded-3xl bg-card border border-accent/20 flex flex-col justify-between hover:border-accent/50 transition-all shadow-lg">
              <div>
                <div className="text-xs font-mono text-accent-text mb-2 uppercase">PILLAR 01</div>
                <h4 className="text-xl font-black text-fg mb-4">{t("القيم والالتزام", "Values & Commitment")}</h4>
                <p className="text-sm sm:text-base text-fg-2 leading-relaxed">
                  {t(
                    "نلتزم بتقديم جودة استثنائية باستمرار تتجاوز توقعات عملائنا. ونلتزم بأعلى المعايير. نسعى جاهدين لبناء شراكات طويلة الأمد والحفاظ على الثقة من خلال كسب علاقات مهنية متينة. كما نهدف إلى ضمان نمو مستدام ومستمر من خلال مواءمة أساليب إدارتنا مع متطلبات السوق الحديثة.",
                    "We are dedicated to delivering exceptional quality that consistently surpasses client expectations under the highest standards. We build enduring partnerships and trust through robust professional relationships, securing sustainable growth aligned with modern market demands."
                  )}
                </p>
              </div>
            </div>

            {/* Column 2 - الأهداف الرئيسية */}
            <div data-accent="green" className="p-7 rounded-3xl bg-card border border-accent/20 flex flex-col justify-between hover:border-accent/50 transition-all shadow-lg">
              <div>
                <div className="text-xs font-mono text-accent-text mb-2 uppercase">PILLAR 02</div>
                <h4 className="text-xl font-black text-fg mb-4">{t("الأهداف الرئيسية", "Core Objectives")}</h4>
                <ul className="space-y-4 text-sm sm:text-base text-fg-2 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span>{t("حلول شاملة لصيانة وتشغيل المرافق المختلفة.", "Comprehensive solutions for the maintenance and operation of various facilities.")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span>{t("تقديم خدمات التشطيبات عالية الجودة.", "Delivering bespoke, high-end architectural finishing services.")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3 - الخدمات الشاملة */}
            <div data-accent="blue" className="p-7 rounded-3xl bg-card border border-accent/20 flex flex-col justify-between hover:border-accent/50 transition-all shadow-lg">
              <div>
                <div className="text-xs font-mono text-accent-text mb-2 uppercase">PILLAR 03</div>
                <h4 className="text-xl font-black text-fg mb-4">{t("الخدمات الشاملة", "Comprehensive Services")}</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-fg-2 leading-relaxed">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{t("الخدمات المتخصصة في الإنشاءات العامة", "Specialized services in general construction")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{t("تنفيذ كافة مشاريع البنية التحتية من مياه وصرف صحي واتصالات كهربائية ومعامل التربة وإدارة النفايات", "Infrastructure: water, sewage, telecom, electrical & soil labs")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{t("تطوير البنية التحتية", "Infrastructure development & site grading")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{t("المباني السكنية وغير السكنية (مثل المدارس والمستشفيات والمجمعات التجارية)", "Residential & non-residential buildings (schools, hospitals, malls)")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{t("المباني الحكومية والمؤسسات العامة", "Government buildings & public institutions")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{t("مواقع ترميم المباني وبناء المباني الجاهزة", "Building restoration & prefabricated building sites")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 04 - Editable gallery of images / videos (managed from the admin settings) */}
        {hasVisibleShowcase(galleryData, DEFAULT_RAKAIZ_GALLERY) && (
          <div className="mt-20 pt-16 border-t border-line-soft">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">04</span>
              <div className="title-pill">
                <span>{t("لمحات من أعمال ركائز", "Rakaiz at Work")}</span>
              </div>
            </div>

            <IconCodeShowcase
              data={galleryData}
              fallback={DEFAULT_RAKAIZ_GALLERY}
              columns={3}
              className="relative space-y-12"
            />
          </div>
        )}
      </div>
    </section>
  );
};
