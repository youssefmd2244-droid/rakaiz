"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/context/I18nContext";
import { Lock, FileText, Send, CheckCircle2, AlertCircle } from "lucide-react";

export interface ContractItem {
  id: number;
  titleAr: string;
  titleEn: string;
  counterpartyAr: string;
  counterpartyEn: string;
  contractTypeAr: string;
  contractTypeEn: string;
  dateTermAr: string;
  dateTermEn: string;
  blurredPreviewUrl: string;
  isProtected: boolean;
  notesAr?: string;
  notesEn?: string;
}

export const ContractsSection: React.FC = () => {
  const { t } = useI18n();
  const [contractsList, setContractsList] = useState<ContractItem[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/cms?table=contracts")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          setContractsList(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "doc_access",
          name,
          company,
          phone,
          email,
          subject: `طلب تصريح وثيقة: ${selectedContract ? selectedContract.titleAr : "عقود ركائز"}`,
          message: reason,
          details: {
            contractId: selectedContract?.id,
            contractTitle: selectedContract?.titleAr,
            counterparty: selectedContract?.counterpartyAr,
          },
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "حدث خطأ أثناء الإرسال");
      }
    } catch {
      setErrorMsg("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contracts" className="py-24 relative bg-ink border-t border-line-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl sm:text-5xl font-black text-gold-text font-mono opacity-80">09</span>
              <div className="title-pill">
                <span>{t("عقود رسمية", "Contracts & Agreements")}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-fg">
              {t("عقود ومشتريات موثقة (قسم محمي)", "Official Subcontracts & Agreements (Protected)")}
            </h2>
            <div className="spectrum-bar w-24 mt-4" />
          </div>

          <div className="p-4 rounded-2xl bg-card border border-t-orange/40 flex items-center gap-3 max-w-md text-xs text-t-orange">
            <Lock className="w-5 h-5 text-gold-text flex-shrink-0" />
            <span>
              {t(
                "الوثائق والأصول تظهر بنماذج مموهة التزاماً بالسرية المهنية، ويمكن للجهات المعتمدة طلب تصريح الاطلاع المباشر.",
                "Original documents are kept in secure private storage. Blurred previews shown; request vetted authorized access."
              )}
            </span>
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contractsList.map((contract) => (
            <div
              key={contract.id}
              data-accent="brown"
              className="accent-edge p-6 rounded-3xl bg-card border border-fg/10 hover:border-accent/60 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Blurred Thumbnail Server-generated preview */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-5 border border-fg/5 bg-card-2">
                  <Image
                    src={contract.blurredPreviewUrl || "/images/contract-blurred-1.svg"}
                    alt={contract.titleAr}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="px-4 py-2 rounded-full bg-ink/90 border border-gold/50 flex items-center gap-2 text-xs font-bold text-gold-text shadow-lg">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t("معاينة مموهة ومحمية", "Protected Blurred Preview")}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-gold-text mb-1">
                  {t(contract.contractTypeAr, contract.contractTypeEn)}
                </div>

                <h3 className="text-lg font-bold text-fg mb-2 leading-snug">
                  {t(contract.titleAr, contract.titleEn)}
                </h3>

                <div className="space-y-1.5 p-3 rounded-xl bg-ink text-xs text-fg-3 mb-4">
                  <div>
                    <span className="text-fg-4">{t("الطرف المتعاقد:", "Counterparty:")}</span>{" "}
                    <span className="text-fg font-medium">
                      {t(contract.counterpartyAr, contract.counterpartyEn)}
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-4">{t("الفترة / التاريخ:", "Term / Date:")}</span>{" "}
                    <span className="text-gold-text font-mono">{t(contract.dateTermAr, contract.dateTermEn)}</span>
                  </div>
                </div>
              </div>

              {/* Request Access Button */}
              <button
                onClick={() => {
                  setSelectedContract(contract);
                  setIsRequestModalOpen(true);
                  setSubmitted(false);
                }}
                className="w-full btn-gold-sweep py-2.5 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t("طلب تصريح الاطلاع (Request Access)", "Request Access")}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Access Request Form Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-gold/50 shadow-2xl p-6 sm:p-8 text-fg">
            <button
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-full bg-fg/10 text-fg-3 hover:text-fg"
            >
              ✕
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold text-gold-text flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-fg">
                  {t("تم استلام طلبكم بنجاح", "Request Received Successfully")}
                </h3>
                <p className="text-sm text-fg-2 leading-relaxed max-w-sm mx-auto">
                  {t(
                    "سيقوم فريق الإدارة القانونية والعقود في مؤسسة ركائز بمراجعة طلبكم وإرسال رابط الوصول المشفر عبر البريد الإلكتروني.",
                    "Our contracts department will review your credentials and issue a time-limited signed URL to your email."
                  )}
                </p>
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-gold text-on-gold font-bold text-sm"
                >
                  {t("حسناً", "Done")}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold-text flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-fg">
                      {t("طلب تصريح وصول لوثيقة", "Request Document Authorization")}
                    </h3>
                    <p className="text-xs text-fg-3">
                      {selectedContract ? t(selectedContract.titleAr, selectedContract.titleEn) : ""}
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-t-red/10 border border-t-red/40 text-xs text-t-red flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAccessRequest} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-fg-3 mb-1">{t("الاسم الكامل *", "Full Name *")}</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("مثال: م. خالد التميمي", "e.g. John Doe")}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-fg-3 mb-1">{t("الجهة / الشركة *", "Company / Entity *")}</label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={t("اسم شركتكم", "Company name")}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-fg-3 mb-1">{t("رقم الجوال *", "Phone *")}</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-fg-3 mb-1">{t("البريد الإلكتروني *", "Email *")}</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-fg-3 mb-1">{t("الغرض من الاطلاع *", "Reason for Request *")}</label>
                    <textarea
                      required
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t("أسباب الاستعراض والشراكة المحتملة...", "Specify business reason & potential collaboration...")}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-gold-sweep py-3 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-black text-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? t("جارِ الإرسال...", "Sending...") : t("إرسال طلب التصريح", "Submit Authorization Request")}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
