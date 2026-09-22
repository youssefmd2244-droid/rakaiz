"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useI18n } from "@/context/I18nContext";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { SiteMedia } from "@/lib/site-content";

interface ContactSectionProps {
  media?: Partial<SiteMedia> | null;
  contactData?: {
    phonePrimary?: string;
    phoneSecondary?: string;
    whatsappPrimary?: string;
    email?: string;
    addressAr?: string;
    addressEn?: string;
    businessHoursAr?: string;
    businessHoursEn?: string;
    googleMapsEmbed?: string;
  };
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contactData, media }) => {
  const { t, isRtl } = useI18n();

  const phone = contactData?.phonePrimary || "0554798138";
  const whatsapp = contactData?.whatsappPrimary || "01094555299";
  const email = contactData?.email || "info.co@rakkaiz.com";
  const addressAr = contactData?.addressAr || "شارع الأفلاج، الدريهمية، الرياض";
  const addressEn = contactData?.addressEn || "Al-Aflaj Street, Al-Duraihimiyah, Riyadh";
  const hoursAr = contactData?.businessHoursAr || "السبت - الخميس: ٨:٠٠ ص - ٥:٠٠ م";
  const hoursEn = contactData?.businessHoursEn || "Saturday - Thursday: 8:00 AM - 5:00 PM";

  const [name, setName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [serviceType, setServiceType] = useState("المقاولات العامة");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name,
          phone: senderPhone,
          email: senderEmail,
          subject: `استفسار عام - ${serviceType}`,
          message,
          details: { serviceType },
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
        setName("");
        setSenderPhone("");
        setSenderEmail("");
        setMessage("");
      } else {
        setErrorMsg(data.error || "حدث خطأ أثناء الإرسال");
      }
    } catch {
      setErrorMsg("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative bg-ink-2 border-t border-line-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">10</span>
              <div className="title-pill">
                <span>{t("تواصل معنا", "Contact Us")}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-fg">
              {t("يسعدنا دائماً استقبال استفساراتكم", "We Welcome Your Inquiries & Partnerships")}
            </h2>
            <div className="spectrum-bar w-24 mt-4" />
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t("واتساب مباشر", "Direct WhatsApp")}</span>
            </a>

            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card-2 border border-gold/40 text-gold-text hover:bg-gold hover:text-on-gold font-bold text-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{t("اتصال هاتفي", "Call Us")}</span>
            </a>
          </div>
        </div>

        {/* Verbatim quote from profile Section 5 [20] */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-card border border-gold/25 shadow-xl text-center max-w-4xl mx-auto">
          <p className="text-sm sm:text-lg text-fg-2 leading-relaxed font-medium">
            {t(
              "«نفخر بكوننا جزءاً من الفريق المسؤول عن إنجاز هذا المشروع المرموق في المملكة العربية السعودية. تعكس هذه المشاركة الثقة التي اكتسبناها في السوق وسعينا الدؤوب نحو الابتكار.»",
              "“We take pride in being part of the team delivering prestigious landmarks across the Kingdom of Saudi Arabia, reflecting market trust and our relentless pursuit of innovation.”"
            )}
          </p>
        </div>

        {/* Two-Column Contact System + Organic Masked Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Architectural Photo with organic mask + Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Organic flower-shaped photo mask (profile motif) */}
            <div className="relative aspect-[16/10] w-full overflow-hidden organic-arch-mask border-2 border-gold/50 shadow-[0_0_35px_rgba(240,179,35,0.2)] bg-card">
              <Image
                src={media?.contactImage || "/images/riyadh-skyline-organic.jpg"}
                alt="Riyadh Architectural Skyline"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="px-4 py-1 rounded-full bg-ink/90 backdrop-blur-md text-xs font-bold text-gold-text border border-gold/40">
                  {t(media?.contactImageCaption || "مقرنا الرئيسي في الرياض", media?.contactImageCaptionEn || "Our Riyadh Headquarters")}
                </span>
              </div>
            </div>

            {/* Information Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-accent="red" className="p-5 rounded-2xl bg-card border border-fg/5 hover:border-accent/50 transition-colors space-y-2">
                <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent-text flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs text-fg-3">{t("العنوان", "Address")}</div>
                <div className="text-sm font-bold text-fg leading-snug">
                  {t(addressAr, addressEn)}
                </div>
              </div>

              <div data-accent="blue" className="p-5 rounded-2xl bg-card border border-fg/5 hover:border-accent/50 transition-colors space-y-2">
                <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent-text flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-xs text-fg-3">{t("الهاتف الموحد", "Primary Phone")}</div>
                <div className="text-sm font-bold text-fg font-mono dir-ltr">
                  <a href={`tel:${phone}`} className="hover:text-accent-text transition-colors">
                    {phone}
                  </a>
                </div>
                <div className="text-xs text-fg-3 font-mono">
                  واتساب: {whatsapp}
                </div>
              </div>

              <div data-accent="green" className="p-5 rounded-2xl bg-card border border-fg/5 hover:border-accent/50 transition-colors space-y-2">
                <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent-text flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-xs text-fg-3">{t("البريد الإلكتروني", "Email Address")}</div>
                <div className="text-sm font-bold text-accent-text font-mono break-all">
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                </div>
              </div>

              <div data-accent="orange" className="p-5 rounded-2xl bg-card border border-fg/5 hover:border-accent/50 transition-colors space-y-2">
                <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent-text flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs text-fg-3">{t("ساعات العمل", "Working Hours")}</div>
                <div className="text-sm font-bold text-fg leading-snug">
                  {t(hoursAr, hoursEn)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Inquiry Form */}
          <div className="lg:col-span-7 p-7 sm:p-10 rounded-3xl bg-card border border-gold/30 shadow-2xl relative">
            <h3 className="text-2xl font-black text-fg mb-2">
              {t("نموذج التواصل السريع", "Quick Inquiry Form")}
            </h3>
            <p className="text-xs text-fg-3 mb-6">
              {t(
                "يرجى ملء النموذج أدناه وسيقوم ممثل ركائز بالتواصل معكم في غضون ٢٤ ساعة.",
                "Fill in your details below and a Rakaiz consultant will reach out within 24 hours."
              )}
            </p>

            {success ? (
              <div className="p-8 rounded-2xl bg-ink border border-t-green/40 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-t-green/10 border border-t-green text-t-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-fg">
                  {t("تم إرسال رسالتكم بنجاح", "Message Sent Successfully")}
                </h4>
                <p className="text-xs text-fg-2 max-w-sm mx-auto">
                  {t(
                    "شكراً لتواصلكم مع مؤسسة ركائز. تم تحويل الرسالة إلى صندوق الوارد وسنتصل بكم قريباً.",
                    "Thank you for contacting Rakaiz. Your message has been routed to our team."
                  )}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 rounded-full bg-gold text-on-gold font-bold text-xs"
                >
                  {t("إرسال رسالة أخرى", "Send Another Message")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-t-red/10 border border-t-red/40 text-xs text-t-red flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-fg-2 mb-1">
                      {t("الاسم الكريم *", "Your Name *")}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("الاسم الثلاثي", "Full name")}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-fg-2 mb-1">
                      {t("رقم الجوال *", "Mobile Phone *")}
                    </label>
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-fg-2 mb-1">
                      {t("البريد الإلكتروني *", "Email Address *")}
                    </label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-fg-2 mb-1">
                      {t("نوع الخدمة المطلوبة", "Service Required")}
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                    >
                      <option value="المقاولات العامة">{t("المقاولات العامة", "General Contracting")}</option>
                      <option value="البنية التحتية">{t("البنية التحتية والرصف", "Infrastructure & Paving")}</option>
                      <option value="التشطيبات الفاخرة">{t("التشطيبات الفاخرة", "High-End Finishing")}</option>
                      <option value="صيانة وتشغيل المرافق">{t("صيانة وتشغيل المرافق", "Facility Management")}</option>
                      <option value="الاستثمار العقاري">{t("الاستثمار العقاري والأراضي", "Real Estate Investment")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg-2 mb-1">
                    {t("نص الرسالة أو الاستفسار *", "Message Details *")}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("اكتب تفاصيل مشروعك واستفسارك هنا...", "Describe your project or inquiry details...")}
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold-sweep py-3.5 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-black text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? t("جارِ الإرسال...", "Sending...") : t("إرسال الرسالة الآن", "Send Message Now")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
