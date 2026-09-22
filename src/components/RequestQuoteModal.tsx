"use client";

import React, { useState } from "react";
import { useI18n } from "@/context/I18nContext";
import { X, CheckCircle, ChevronLeft, ChevronRight, Sparkles, Building, MapPin, DollarSign, Calendar } from "lucide-react";

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestQuoteModal: React.FC<RequestQuoteModalProps> = ({ isOpen, onClose }) => {
  const { t, isRtl } = useI18n();
  const [step, setStep] = useState(1);

  // Form Fields
  const [serviceType, setServiceType] = useState("المقاولات العامة والإنشاءات");
  const [projectType, setProjectType] = useState("مجمع سكني أو فيلا خاصة");
  const [location, setLocation] = useState("الرياض");
  const [area, setArea] = useState("");
  const [budgetRange, setBudgetRange] = useState("من 1,000,000 إلى 5,000,000 ريال");
  const [timeline, setTimeline] = useState("خلال 6 إلى 12 شهر");
  
  // Client Contact Details
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [projectNotes, setProjectNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          company: clientCompany,
          subject: `طلب عرض سعر: ${serviceType}`,
          message: projectNotes,
          details: {
            serviceType,
            projectType,
            location,
            area,
            budgetRange,
            timeline,
          },
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "حدث خطأ");
      }
    } catch {
      setErrorMsg("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-card border border-gold/50 shadow-2xl p-6 sm:p-10 text-fg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-full bg-fg/10 hover:bg-fg/20 text-fg-2 hover:text-fg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold text-gold-text flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-fg">
              {t("تم إرسال طلب عرض السعر بنجاح", "Quote Request Submitted Successfully")}
            </h3>
            <p className="text-sm text-fg-2 max-w-md mx-auto leading-relaxed">
              {t(
                "شكراً لاختياركم مؤسسة ركائز. سيقوم مهندسو التقدير والعطاءات بدراسة مواصفات مشروعكم والتواصل معكم بعرض سعر فني ومالي متكامل.",
                "Thank you for choosing Rakaiz. Our estimation engineers will analyze your project specifications and present a detailed technical & commercial proposal."
              )}
            </p>
            <button
              onClick={onClose}
              className="px-8 py-2.5 rounded-full bg-gold text-on-gold font-black text-sm"
            >
              {t("إغلاق", "Close")}
            </button>
          </div>
        ) : (
          <div>
            {/* Modal Title & Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-gold-text mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{t(`الخطوة ${step} من 2`, `Step ${step} of 2`)}</span>
              </div>
              <h3 className="text-2xl font-black text-fg">
                {step === 1
                  ? t("تحديد متطلبات ومواصفات المشروع", "Project Scope & Specifications")
                  : t("بيانات الاتصال ومقدم الطلب", "Contact & Client Information")}
              </h3>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-t-red/10 border border-t-red/40 text-xs text-t-red">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("نوع الخدمة الرئيسية", "Primary Service")}</label>
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      >
                        <option value="المقاولات العامة والإنشاءات">{t("المقاولات العامة والإنشاءات", "General Contracting")}</option>
                        <option value="مشاريع البنية التحتية والرصف">{t("مشاريع البنية التحتية والرصف", "Infrastructure & Paving")}</option>
                        <option value="التشطيبات المعمارية الفاخرة">{t("التشطيبات المعمارية الفاخرة", "High-End Architectural Finishing")}</option>
                        <option value="صيانة وتشغيل المرافق">{t("صيانة وتشغيل المرافق (FM&O)", "Facilities Maintenance & Operation")}</option>
                        <option value="تطوير واستثمار الأراضي">{t("تطوير واستثمار الأراضي", "Land & Real Estate Investment")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("تصنيف المشروع", "Project Classification")}</label>
                      <input
                        type="text"
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        placeholder={t("مثال: فيلا سكنية، مجمع تجاري، برج", "e.g. Commercial mall, Villa")}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("مدينة / موقع المشروع", "Project Location")}</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("الرياض، الدرعية، جدة...", "Riyadh, Diriyah...")}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("المساحة التقريبية (م²)", "Approximate Area (m²)")}</label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder={t("مثال: 5,000 م²", "e.g. 5,000 sqm")}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("الميزانية التقديرية", "Estimated Budget")}</label>
                      <select
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      >
                        <option value="أقل من 500,000 ريال">{t("أقل من 500,000 ريال", "< 500,000 SAR")}</option>
                        <option value="من 500,000 إلى 2,000,000 ريال">{t("من 500,000 إلى 2,000,000 ريال", "500K - 2M SAR")}</option>
                        <option value="من 2,000,000 إلى 10,000,000 ريال">{t("من 2,000,000 إلى 10,000,000 ريال", "2M - 10M SAR")}</option>
                        <option value="أكثر من 10,000,000 ريال">{t("أكثر من 10,000,000 ريال (مشاريع كبرى)", "> 10M SAR (Mega-project)")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("الجدول الزمني المستهدف", "Target Timeline")}</label>
                      <input
                        type="text"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        placeholder={t("مثال: البدء الفوري، 6 أشهر", "e.g. Immediate, 6 months")}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 rounded-full bg-gold text-on-gold font-bold text-sm flex items-center gap-1.5 hover:bg-gold-hi transition-colors"
                    >
                      <span>{t("المتابعة لبيانات الاتصال", "Next: Contact Details")}</span>
                      {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("الاسم الكريم *", "Full Name *")}</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder={t("الاسم ثلاثي", "John Doe")}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("الجهة أو الشركة", "Company / Organization")}</label>
                      <input
                        type="text"
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        placeholder={t("اسم المنشأة أو فردي", "Company Name or Individual")}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("رقم الجوال *", "Mobile Phone *")}</label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-fg-2 mb-1">{t("البريد الإلكتروني *", "Email *")}</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-fg-2 mb-1">{t("ملاحظات إضافية أو تفاصيل المخطط", "Additional Project Details")}</label>
                    <textarea
                      rows={3}
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      placeholder={t("أية مواصفات فنية إضافية...", "Specific design criteria or tender notes...")}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-full bg-fg/5 text-fg-2 hover:text-fg text-sm font-semibold transition-colors"
                    >
                      {t("الرجوع للخلف", "Back")}
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-gold-sweep px-8 py-2.5 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-black text-sm shadow-xl"
                    >
                      {loading ? t("جارِ الإرسال...", "Submitting...") : t("تأكيد وإرسال طلب عرض السعر", "Confirm & Submit Quote Request")}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
