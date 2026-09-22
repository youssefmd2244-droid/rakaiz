"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/context/I18nContext";
import { Menu, X, Globe, Moon, Sun, ArrowUpRight, Phone, Shield } from "lucide-react";

interface HeaderProps {
  onOpenQuote?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuote }) => {
  const { locale, setLocale, isRtl, theme, toggleTheme, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Triple click logo to open admin control panel
  const handleLogoClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        window.location.href = "/control-panel";
        return 0;
      }
      return next;
    });
    setTimeout(() => setClickCount(0), 1200);
  };

  const navLinks = [
    { href: "#hero", labelAr: "الرئيسية", labelEn: "Home" },
    { href: "#about", labelAr: "من نحن", labelEn: "About" },
    { href: "#services", labelAr: "خدماتنا", labelEn: "Services" },
    { href: "#achievements", labelAr: "الإنجازات", labelEn: "Achievements" },
    { href: "#projects", labelAr: "مشاريعنا", labelEn: "Projects" },
    { href: "#partners", labelAr: "شركاؤنا", labelEn: "Partners" },
    { href: "#certificates", labelAr: "الشهادات", labelEn: "Certificates" },
    { href: "#contracts", labelAr: "العقود", labelEn: "Contracts" },
    { href: "#contact", labelAr: "تواصل معنا", labelEn: "Contact" },
  ];

  return (
    <>
      {/* Decorative spectrum strip: gold · red · blue · green · orange · brown · white */}
      <div className="spectrum-bar" style={{ borderRadius: 0 }} aria-hidden="true" />

      {/* Top Architectural URL Pill Banner - Exact element from Mockup */}
      <div className="bg-card border-b border-line py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-fg-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
              <span className="text-gold-text font-semibold">{t("المملكة العربية السعودية", "Kingdom of Saudi Arabia")}</span>
            </span>
            <span className="hidden sm:inline text-line-2">|</span>
            <span className="hidden sm:inline">{t("الرياض – مؤسسة ركائز البيئة للتجارة", "Riyadh – Rakaiz Al-Bee'a Trading Est.")}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://rakaiz-ksa.com/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-0.5 rounded-full bg-card-2 hover:bg-card-3 text-fg-2 border border-line-2 font-mono text-[11px] transition-colors"
            >
              https://rakaiz-ksa.com/
            </a>

            <button
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-card-2 hover:text-gold-text text-fg-2 font-medium transition-colors"
              title={t("تغيير اللغة", "Switch Language")}
            >
              <Globe className="w-3.5 h-3.5 text-gold-text" />
              <span>{locale === "ar" ? "English" : "العربية"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-ink/90 backdrop-blur-md border-b border-gold/20 py-3 shadow-2xl"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title={t("ركائز للبناء والمقاولات", "Rakaiz Contracting")}
          >
            <div className="w-11 h-11 relative rounded-full p-0.5 bg-gradient-to-tr from-gold-lo via-gold to-gold-hi shadow-md group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-onyx flex items-center justify-center overflow-hidden p-1">
                <Image
                  src="/logos/rakaiz-logo.svg"
                  alt="RAKAIZ Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain filter brightness-110"
                />
              </div>
            </div>
            <div>
              <span className="block text-xl font-black tracking-wide text-fg group-hover:text-gold-text transition-colors">
                {t("ركائز", "RAKAIZ")}
              </span>
              <span className="block text-[10px] tracking-wider text-fg-3 font-medium">
                {t("للبناء والمقاولات", "BUILDING & CONTRACTING")}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-fg-2 hover:text-gold-text transition-colors relative py-1 group"
              >
                {t(link.labelAr, link.labelEn)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-fg/10 text-fg-2 hover:text-gold-text hover:border-gold/50 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenQuote}
              className="btn-gold-sweep px-5 py-2.5 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-bold text-sm shadow-lg shadow-gold/20 flex items-center gap-1.5 hover:shadow-xl transition-all"
            >
              <span>{t("اطلب عرض سعر", "Request a Quote")}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-fg/10 text-fg-2 hover:text-gold-text"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-card-2 border border-gold/30 text-gold-text focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-ink/98 backdrop-blur-2xl border-b border-gold/25 px-6 pt-4 pb-8 space-y-4 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-fg-2 hover:text-gold-text py-2 border-b border-fg/5 flex items-center justify-between"
                >
                  <span>{t(link.labelAr, link.labelEn)}</span>
                  <span className="text-gold-text text-xs">→</span>
                </a>
              ))}
            </nav>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenQuote) onOpenQuote();
                }}
                className="w-full btn-gold-sweep py-3 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-bold text-center"
              >
                {t("اطلب عرض سعر فوري", "Request an Instant Quote")}
              </button>

              <div className="flex items-center justify-between pt-2 text-sm text-fg-3">
                <span>{t("اللغة الحالية", "Current Language")}:</span>
                <button
                  onClick={() => {
                    setLocale(locale === "ar" ? "en" : "ar");
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 rounded-full bg-card-2 text-gold-text font-semibold border border-gold/40"
                >
                  {locale === "ar" ? "English" : "العربية"}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
