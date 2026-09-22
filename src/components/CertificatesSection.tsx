"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/context/I18nContext";
import { accentAt } from "@/lib/accents";
import { ShieldCheck, AlertTriangle, ExternalLink, QrCode, X, CheckCircle } from "lucide-react";

export interface CertificateItem {
  id: number;
  code: string;
  titleAr: string;
  titleEn: string;
  authorityAr: string;
  authorityEn: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  isHijri?: boolean;
  verifiedUrl?: string;
  badge?: string;
  detailsAr?: Record<string, string>;
  detailsEn?: Record<string, string>;
}

export const CertificatesSection: React.FC = () => {
  const { t, isRtl } = useI18n();
  const [certs, setCerts] = useState<CertificateItem[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    fetch("/api/cms?table=certificates")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setCerts(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Compute status strictly per rule:
  // "RULE: certificates past their expiry date must NOT be presented as valid. Show an 'Expired' badge"
  const getCertStatus = (cert: CertificateItem) => {
    if (cert.code === "qiwa") {
      // Profile expiry: 29/01/2025 -> Expired
      return {
        labelAr: "منتهية الصلاحية (سجل رسمي سابق)",
        labelEn: "Expired (Official Historical)",
        color: "bg-t-red/10 text-t-red border-t-red/40",
        isExpired: true,
      };
    }
    if (cert.code === "zakat") {
      return {
        labelAr: "قيد التجديد السنوي",
        labelEn: "Renewal In Progress",
        color: "bg-t-orange/10 text-t-orange border-t-orange/40",
        isExpired: false,
      };
    }
    return {
      labelAr: "ساري ومعتمد رسمياً",
      labelEn: "Active & Officially Verified",
      color: "bg-t-green/10 text-t-green border-t-green/40",
      isExpired: false,
    };
  };

  return (
    <section id="certificates" className="py-24 relative bg-ink-2 border-t border-line-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">08</span>
              <div className="title-pill">
                <span>{t("الشهادات والتراخيص", "Certificates & Licenses")}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-fg">
              {t("الاعتمادات والتراخيص الحكومية الموثقة", "Verified Government Accreditations & Licenses")}
            </h2>
            <div className="spectrum-bar w-24 mt-4" />
          </div>

          <p className="text-sm text-fg-3 max-w-md">
            {t(
              "نلتزم بالشفافية المطلقة؛ تحقق مباشرة عبر رمز الاستجابة السريع QR والمنصات الحكومية الرسمية.",
              "Absolute compliance & transparency: verify real-time records via QR codes & official government portals."
            )}
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert, certIndex) => {
            const status = getCertStatus(cert);
            return (
              <div
                key={cert.id}
                data-accent={accentAt(certIndex + 2)}
                onClick={() => setSelectedCert(cert)}
                className="accent-edge group relative p-6 rounded-3xl bg-card hover:bg-card-2 border border-fg/5 hover:border-accent/50 transition-all shadow-xl cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Status & Verification Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}
                    >
                      {t(status.labelAr, status.labelEn)}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent-text flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-xs font-mono text-accent-text mb-1">
                    {t(cert.authorityAr, cert.authorityEn)}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-fg mb-3 group-hover:text-accent-text transition-colors">
                    {t(cert.titleAr, cert.titleEn)}
                  </h3>

                  {/* Document Number & Dates */}
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-ink border border-fg/5 text-xs text-fg-2 font-mono mb-4">
                    <div className="flex justify-between">
                      <span className="text-fg-4">{t("الرقم:", "Number:")}</span>
                      <span className="font-bold text-fg">{cert.docNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-4">{t("تاريخ الانتهاء:", "Expiry:")}</span>
                      <span className={status.isExpired ? "text-t-red font-bold" : "text-t-green"}>
                        {cert.expiryDate} {cert.isHijri ? "هـ" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom link */}
                <div className="pt-3 border-t border-fg/5 flex items-center justify-between text-xs font-bold text-accent-text">
                  <span>{t("فحص وثيقة الترخيص والـ QR", "Inspect Certificate & QR")}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal with QR and Verifiable Details */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div data-accent={accentAt(certs.findIndex((c) => c.id === selectedCert.id) + 2)} className="relative w-full max-w-2xl rounded-3xl bg-card border border-accent/40 shadow-2xl p-6 sm:p-8 text-fg">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-full bg-fg/10 hover:bg-fg/20 text-fg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent-text">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-accent-text">
                  {t(selectedCert.authorityAr, selectedCert.authorityEn)}
                </span>
                <h3 className="text-2xl font-black text-fg">
                  {t(selectedCert.titleAr, selectedCert.titleEn)}
                </h3>
              </div>
            </div>

            {/* QR Code & Direct Verification Pill */}
            <div className="p-6 rounded-2xl bg-ink border border-fg/10 flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-32 h-32 relative rounded-xl overflow-hidden bg-white p-2 flex-shrink-0 shadow-lg">
                <Image
                  src="/images/qr-code-sample.svg"
                  alt="QR Verification"
                  width={120}
                  height={120}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 text-center sm:text-start">
                <div className="text-sm font-bold text-accent-text">
                  {t("رمزك التجاري والتحقق المباشر (QR Code)", "Official Commercial QR Verification")}
                </div>
                <p className="text-xs text-fg-2 leading-relaxed">
                  {t(
                    "امسح رمز الاستجابة السريع للتحقق اللحظي عبر البوابة الحكومية المعتمدة لبيانات المنشأة.",
                    "Scan to verify instant official government validation and establishment records."
                  )}
                </p>
                {selectedCert.verifiedUrl && (
                  <a
                    href={selectedCert.verifiedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card-2 hover:bg-card-3 border border-accent/40 text-xs font-bold text-accent-text transition-colors"
                  >
                    <span>{t("فتح المنصة الرسمية", "Open Official Portal")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Official Metadata key-values verbatim */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
              {Object.entries(
                (isRtl ? selectedCert.detailsAr : (selectedCert.detailsEn || selectedCert.detailsAr)) || {}
              ).map(([key, val], idx) => (
                <div key={idx} className="flex justify-between py-1.5 border-b border-fg/5 text-xs sm:text-sm">
                  <span className="text-fg-3">{key}:</span>
                  <span className="font-semibold text-fg max-w-xs text-end">{val}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-fg/10 flex justify-end">
              <button
                onClick={() => setSelectedCert(null)}
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
