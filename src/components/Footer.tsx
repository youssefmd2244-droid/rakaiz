"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconCodeCredit } from "./IconCodeCredit";
import { useI18n } from "@/context/I18nContext";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Shield,
  ArrowUp,
  ExternalLink,
} from "lucide-react";

interface FooterProps {
  contactData?: any;
  iconCodeData?: any;
  iconCodeShowcase?: any;
}

export const Footer: React.FC<FooterProps> = ({ contactData, iconCodeData, iconCodeShowcase }) => {
  const { t, isRtl } = useI18n();

  const phone = contactData?.phonePrimary || "0554798138";
  const whatsapp = contactData?.whatsappPrimary || "01094555299";
  const email = contactData?.email || "info.co@rakkaiz.com";
  const addressAr = contactData?.addressAr || "شارع الأفلاج، الدريهمية، الرياض، المملكة العربية السعودية";
  const addressEn = contactData?.addressEn || "Al-Aflaj Street, Al-Duraihimiyah, Riyadh, Saudi Arabia";

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          name: "مشترك بالنشرة الإخبارية",
          email: newsletterEmail,
          subject: "اشتراك نشرة ركائز البريدية",
        }),
      });
      setSubscribed(true);
      setNewsletterEmail("");
    } catch {
      setSubscribed(true);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="force-dark bg-ink-2 border-t border-line-soft text-fg pt-16 pb-12 relative overflow-hidden">
      <div className="spectrum-bar absolute top-0 left-0 right-0" style={{ borderRadius: 0 }} aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Architectural Footer Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-line-soft">
          {/* Brand Info & Triple Click */}
          <div className="lg:col-span-4 space-y-4">
            <div
              onClick={() => {
                window.location.href = "/control-panel";
              }}
              className="flex items-center gap-3 cursor-pointer group"
              title={t("ركائز للبناء والمقاولات", "Rakaiz Contracting")}
            >
              <div className="w-12 h-12 relative rounded-full p-0.5 bg-gradient-to-tr from-gold-lo via-gold to-gold-hi shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-onyx flex items-center justify-center overflow-hidden p-1">
                  <Image
                    src="/logos/rakaiz-logo.svg"
                    alt="RAKAIZ Logo"
                    width={44}
                    height={44}
                    className="w-full h-full object-contain filter brightness-110"
                  />
                </div>
              </div>
              <div>
                <span className="block text-xl font-black text-fg group-hover:text-gold-text transition-colors">
                  {t("مؤسسة ركائز البيئة للتجارة", "Rakaiz Al-Bee'a Trading Est.")}
                </span>
                <span className="block text-xs font-mono text-gold-text">
                  {t("س.ت: 1010875202 | رقم موحد: 7033972691", "CR: 1010875202 | UN: 7033972691")}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-fg-3 leading-relaxed">
              {t(
                "شركة متخصصة في تقديم حلول هندسية شاملة تغطي مجالات المقاولات العامة، تطوير العقارات، البنية التحتية، والحلول البيئية.",
                "A specialized Saudi engineering company delivering turnkey contracting, real estate development, infrastructure, and environmental solutions."
              )}
            </p>

            {/* Download Company Profile Button */}
            <div className="pt-2">
              <a
                href="/documents/rakaiz-company-profile.pdf"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card hover:bg-card-3 border border-gold/30 text-xs font-bold text-gold-text transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>{t("تحميل بروفايل الشركة (PDF)", "Download Company Profile (PDF)")}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gold-text">
              {t("روابط سريعة", "Quick Navigation")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-fg-3">
              <li>
                <a href="#hero" className="hover:text-fg transition-colors">
                  {t("الرئيسية", "Home")}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-fg transition-colors">
                  {t("من نحن", "About Us")}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-fg transition-colors">
                  {t("خدماتنا", "Services")}
                </a>
              </li>
              <li>
                <a href="#achievements" className="hover:text-fg transition-colors">
                  {t("الإنجازات الرئيسية", "Achievements")}
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-fg transition-colors">
                  {t("مشاريعنا المختارة", "Projects")}
                </a>
              </li>
              <li>
                <a href="#certificates" className="hover:text-fg transition-colors">
                  {t("الشهادات والتراخيص", "Certificates")}
                </a>
              </li>
              <li>
                <a href="#contracts" className="hover:text-fg transition-colors">
                  {t("العقود المحمية", "Protected Contracts")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details Block (Requested in prompt: Contact Information Footer) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gold-text">
              {t("بيانات الاتصال الرسمية", "Contact Information")}
            </h4>
            <div className="space-y-2.5 text-xs text-fg-2">
              <div data-accent="red" className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent-text mt-0.5 flex-shrink-0" />
                <span>{t(addressAr, addressEn)}</span>
              </div>
              <div data-accent="blue" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent-text flex-shrink-0" />
                <a href={`tel:${phone}`} className="font-mono text-fg hover:text-gold-text">
                  {phone}
                </a>
              </div>
              <div data-accent="green" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-accent-text flex-shrink-0" />
                <span className="font-mono text-fg">واتساب: {whatsapp}</span>
              </div>
              <div data-accent="orange" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-text flex-shrink-0" />
                <a href={`mailto:${email}`} className="font-mono text-gold-text hover:underline">
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gold-text">
              {t("النشرة المعمارية", "Architectural Newsletter")}
            </h4>
            <p className="text-xs text-fg-4 leading-relaxed">
              {t(
                "اشترك للاطلاع على أحدث تطورات المشاريع والمناقصات الإنشائية.",
                "Subscribe to receive project milestone updates and engineering insights."
              )}
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-t-green/10 border border-t-green/40 text-xs text-t-green">
                {t("تم تسجيل اشتراككم بنجاح", "Successfully subscribed to updates")}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-fg/10 text-fg text-xs focus:border-gold focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gold text-on-gold font-bold text-xs hover:bg-gold-hi transition-colors"
                >
                  {t("تأكيد الاشتراك", "Subscribe Now")}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar with Website URL Pill and Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-fg-5">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              © {new Date().getFullYear()} {t("مؤسسة ركائز البيئة للتجارة. كافة الحقوق محفوظة.", "Rakaiz Al-Bee'a Trading Est. All rights reserved.")}
            </span>
            <span>•</span>
            <Link href="/privacy" className="hover:text-fg transition-colors">
              {t("سياسة الخصوصية", "Privacy Policy")}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-fg transition-colors">
              {t("الشروط والأحكام", "Terms & Conditions")}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Signature Website URL Pill */}
            <a
              href="https://rakaiz-ksa.com/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1 rounded-full bg-card border border-gold/30 text-xs font-mono text-gold-text hover:border-gold transition-colors flex items-center gap-1.5"
            >
              <span>https://rakaiz-ksa.com/</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-card-2 text-gold-text hover:bg-gold hover:text-on-gold transition-colors"
              title={t("العودة للأعلى", "Back to Top")}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Credit: who designed the website (Icon Code) */}
      <IconCodeCredit data={iconCodeData} showcaseData={iconCodeShowcase} />
    </footer>
  );
};
