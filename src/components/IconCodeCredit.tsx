"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Code,
  Store,
  Receipt,
  LayoutDashboard,
  Palette,
  Sparkles,
  Flag,
  Megaphone,
  Clapperboard,
  Bot,
  Brush,
  Shapes,
  Building2,
  Shirt,
} from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import { accentAt } from "@/lib/accents";
import { activeChannels, IconCodeSettings } from "@/lib/iconcode";
import { ChannelIcon } from "./ChannelIcon";
import { IconCodeShowcase } from "./IconCodeShowcase";
import { ShowcaseSettings } from "@/lib/iconcode-showcase";

const SERVICES: Array<{ icon: React.ElementType; ar: string; en: string }> = [
  { icon: Code, ar: "تصميم وبرمجة المواقع الإلكترونية", en: "Website design & development" },
  { icon: Store, ar: "المتاجر الإلكترونية", en: "E-commerce stores" },
  { icon: Receipt, ar: "أنظمة الكاشير ونقاط البيع (POS)", en: "Cashier & POS systems" },
  { icon: LayoutDashboard, ar: "لوحات التحكم وأنظمة الإدارة", en: "Dashboards & management systems" },
  { icon: Palette, ar: "جرافيك ديزاين", en: "Graphic design" },
  { icon: Sparkles, ar: "الشعارات والهويات البصرية", en: "Logos & brand identity" },
  { icon: Flag, ar: "تصميم البنرات والإعلانات", en: "Banners & ad design" },
  { icon: Megaphone, ar: "الترويج والتسويق الرقمي", en: "Promotion & digital marketing" },
  { icon: Clapperboard, ar: "المونتاج وإنتاج الفيديو", en: "Video montage & production" },
  { icon: Bot, ar: "حلول الذكاء الاصطناعي AI", en: "AI solutions" },
  { icon: Brush, ar: "فوتوشوب ومعالجة الصور", en: "Photoshop & image retouching" },
  { icon: Shapes, ar: "تصميم أشكال GRC", en: "GRC shapes design" },
  { icon: Building2, ar: "تصميم أشكال المباني والواجهات", en: "Building & facade design" },
  { icon: Shirt, ar: "تصميم الملابس", en: "Clothing design" },
];

const COUNTRIES: Array<{ code: string; ar: string; en: string }> = [
  { code: "EG", ar: "مصر", en: "Egypt" },
  { code: "SA", ar: "السعودية", en: "Saudi Arabia" },
  { code: "QA", ar: "قطر", en: "Qatar" },
  { code: "AE", ar: "الإمارات", en: "UAE" },
  { code: "BH", ar: "البحرين", en: "Bahrain" },
  { code: "KW", ar: "الكويت", en: "Kuwait" },
  { code: "OM", ar: "عمان", en: "Oman" },
  { code: "YE", ar: "اليمن", en: "Yemen" },
  { code: "LY", ar: "ليبيا", en: "Libya" },
  { code: "GR", ar: "اليونان", en: "Greece" },
  { code: "IT", ar: "إيطاليا", en: "Italy" },
  { code: "FR", ar: "فرنسا", en: "France" },
  { code: "CH", ar: "سويسرا", en: "Switzerland" },
  { code: "PL", ar: "بولندا", en: "Poland" },
  { code: "US", ar: "أمريكا", en: "USA" },
];

/** Real flag image (flagcdn.com). Falls back to the 2-letter country code if it cannot be loaded. */
const CountryFlag: React.FC<{ code: string }> = ({ code }) => {
  const [failed, setFailed] = useState(false);
  const lower = code.toLowerCase();

  if (failed) {
    return (
      <span dir="ltr" className="px-1.5 py-0.5 rounded bg-accent text-on-accent text-[10px] font-black tracking-wider">
        {code}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${lower}.png`}
      srcSet={`https://flagcdn.com/w80/${lower}.png 2x`}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-3.5 w-auto rounded-[2px] shadow-sm"
    />
  );
};

interface IconCodeCreditProps {
  data?: IconCodeSettings | null;
  showcaseData?: ShowcaseSettings | null;
}

export const IconCodeCredit: React.FC<IconCodeCreditProps> = ({ data, showcaseData }) => {
  const { t } = useI18n();
  const [openChannel, setOpenChannel] = useState<string | null>(null);

  const channels = activeChannels(data);
  // Phones & WhatsApp numbers are shown as tappable number chips, everything else as round icons.
  const numberChannels = channels.filter((c) => c.option.kind === "phone" || c.option.kind === "whatsapp");
  const iconChannels = channels.filter((c) => c.option.kind !== "phone" && c.option.kind !== "whatsapp");
  const opened = iconChannels.find((c) => c.channel.id === openChannel);

  return (
    <div className="border-t border-line-soft bg-ink-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div data-rk-group className="relative overflow-hidden rounded-3xl bg-card border border-gold/25 p-4 sm:p-6 max-w-6xl mx-auto shadow-[0_0_50px_rgba(240,179,35,0.06)]">
          <div className="spectrum-bar absolute top-0 left-0 right-0" style={{ borderRadius: 0 }} aria-hidden="true" />
          <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-gold/10 blur-[90px] pointer-events-none" />

          {/* Header: logo + credit line */}
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-start">
            <div className="shrink-0 w-16 h-16">
              <Image src="/logos/icon-code-logo.svg" alt="Icon Code" width={64} height={64} className="w-full h-full" />
            </div>
            <div className="space-y-1.5">
              <span className="title-pill !py-1 !px-3 !text-xs">
                <span dir="ltr">ICON CODE</span>
              </span>
              <h3 className="text-lg sm:text-xl font-black text-fg leading-snug">
                {t("هذا الموقع تم تصميمه من فريق ", "This website was designed by ")}
                <span className="gold-gradient-text" dir="ltr">Icon Code</span>
              </h3>
              <p className="text-xs sm:text-sm text-fg-3 max-w-3xl leading-relaxed">
                {t(
                  "فريق متخصص في تحويل الأفكار إلى منتجات رقمية وهويات بصرية تصنع فرقًا. نجمع البرمجة والتصميم والتسويق والذكاء الاصطناعي في فريق واحد، لنقدّم لعملائنا حول العالم حلولًا عملية وشكلًا احترافيًا يليق بعلامتهم التجارية.",
                  "A company that turns ideas into digital products and brand identities that make a difference. We combine programming, design, marketing and AI in one team, delivering practical solutions and a professional look to clients around the world."
                )}
              </p>
            </div>
          </div>

          {/* Editable showcase: sections of images / videos managed from the admin settings */}
          <IconCodeShowcase data={showcaseData} className="relative mt-6 space-y-8" />

          {/* What we do */}
          <div className="relative mt-6">
            <h4 className="text-sm font-bold text-gold-text mb-3">{t("ماذا نقدّم", "What we do")}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SERVICES.map((service, i) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.en}
                    data-accent={accentAt(i)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-ink border border-fg/5 hover:border-accent/50 transition-colors"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-accent/15 border border-accent/30 text-accent-text flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs sm:text-[13px] font-semibold text-fg-2 leading-snug">{t(service.ar, service.en)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Countries */}
          <div className="relative mt-6">
            <h4 className="text-base sm:text-lg font-black text-fg mb-1.5">{t("حول العالم", "Around the world")}</h4>
            <p className="text-xs sm:text-sm text-fg-3 max-w-3xl leading-relaxed mb-3">
              {t(
                "سبق أن نفّذنا أعمالنا ومشاريعنا لعملاء في هذه الدول، ونواصل التوسّع لنقدّم مستوى الجودة نفسه في أي مكان يحتاجنا.",
                "Our work has already been delivered to clients in these countries, and we keep expanding to offer the same quality wherever we are needed."
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map((country, i) => (
                <span
                  key={country.code}
                  data-accent={accentAt(i)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink border border-fg/10 hover:border-accent/50 text-[11px] font-semibold text-fg-2 transition-colors"
                >
                  <CountryFlag code={country.code} />
                  {t(country.ar, country.en)}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          {(numberChannels.length > 0 || iconChannels.length > 0) && (
            <div className="relative mt-6 pt-5 border-t border-line-soft">
              <h4 className="text-sm font-bold text-gold-text mb-3">{t("تواصل مع Icon Code", "Contact Icon Code")}</h4>

              {/* Tappable numbers: phone opens the dialer, WhatsApp opens the chat */}
              {numberChannels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {numberChannels.map(({ channel, option, links }) =>
                    links.map((link) => (
                      <a
                        key={`${channel.id}-${link.id}`}
                        href={link.href}
                        target={option.kind === "whatsapp" ? "_blank" : undefined}
                        rel="noreferrer"
                        data-accent={option.accent}
                        title={channel.label}
                        className="group inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-ink border border-accent/40 hover:bg-accent hover:text-on-accent hover:border-accent transition-all"
                      >
                        <span className="w-8 h-8 rounded-full bg-accent/15 text-accent-text group-hover:bg-black/15 group-hover:text-on-accent flex items-center justify-center transition-colors">
                          <ChannelIcon icon={channel.icon} imageUrl={channel.imageUrl} className="w-4 h-4" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          {link.label && <span className="text-[11px] opacity-70">{link.label}</span>}
                          <span dir="ltr" className="font-mono text-[13px] font-bold text-fg group-hover:text-on-accent">
                            {link.text}
                          </span>
                        </span>
                      </a>
                    ))
                  )}
                </div>
              )}

              {/* Other channels: one link opens directly, several links expand below */}
              {iconChannels.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5">
                  {iconChannels.map(({ channel, option, links }) => {
                    const multiple = links.length > 1;
                    const buttonClass =
                      "w-9 h-9 rounded-full bg-ink border border-accent/40 text-accent-text hover:bg-accent hover:text-on-accent hover:border-accent hover:-translate-y-0.5 flex items-center justify-center transition-all";

                    return multiple ? (
                      <button
                        key={channel.id}
                        type="button"
                        data-accent={option.accent}
                        title={channel.label}
                        aria-expanded={openChannel === channel.id}
                        onClick={() => setOpenChannel(openChannel === channel.id ? null : channel.id)}
                        className={`${buttonClass} ${openChannel === channel.id ? "!bg-accent !text-on-accent" : ""} relative`}
                      >
                        <ChannelIcon icon={channel.icon} imageUrl={channel.imageUrl} />
                        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gold text-on-gold text-[10px] font-black flex items-center justify-center">
                          {links.length}
                        </span>
                      </button>
                    ) : (
                      <a
                        key={channel.id}
                        href={links[0].href}
                        target={links[0].href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        data-accent={option.accent}
                        title={links[0].label ? `${channel.label} – ${links[0].label}` : channel.label}
                        className={buttonClass}
                      >
                        <ChannelIcon icon={channel.icon} imageUrl={channel.imageUrl} />
                      </a>
                    );
                  })}
                </div>
              )}

              {opened && (
                <div data-accent={opened.option.accent} className="mt-4 flex flex-wrap gap-2 animate-in fade-in">
                  {opened.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink border border-accent/40 text-xs font-semibold text-fg-2 hover:bg-accent hover:text-on-accent hover:border-accent transition-colors"
                    >
                      <ChannelIcon icon={opened.channel.icon} imageUrl={opened.channel.imageUrl} className="w-3.5 h-3.5" />
                      {link.label && <span>{link.label}</span>}
                      <span dir="ltr" className="font-mono opacity-80">
                        {link.text}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-fg-5" dir="ltr">
          © {new Date().getFullYear()} Icon Code — Design · Code · Promote
        </p>
      </div>
    </div>
  );
};
