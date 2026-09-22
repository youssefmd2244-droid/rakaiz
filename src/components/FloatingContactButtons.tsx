"use client";

import React from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

interface FloatingButtonsProps {
  whatsapp?: string;
  phone?: string;
  whatsappEnabled?: boolean;
  callEnabled?: boolean;
}

export const FloatingContactButtons: React.FC<FloatingButtonsProps> = ({
  whatsapp = "01094555299",
  phone = "01094555299",
  whatsappEnabled = true,
  callEnabled = true,
}) => {
  const { t } = useI18n();

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "");
  const cleanPhone = phone.replace(/[^0-9+]/g, "");

  return (
    <>
      {/* Floating WhatsApp Button - fixed at extreme bottom-right corner */}
      {whatsappEnabled && (
        <a
          href={`https://wa.me/${cleanWhatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 border-2 border-fg/20"
          title={t("تواصل عبر واتساب", "Chat on WhatsApp")}
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      )}

      {/* Floating Call Button - fixed at extreme bottom-left corner */}
      {callEnabled && (
        <a
          href={`tel:${cleanPhone}`}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gold hover:bg-gold-hi text-on-gold flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 border-2 border-black/20"
          title={t("اتصل بنا هاتفياً", "Call Us")}
          aria-label="Call"
        >
          <Phone className="w-6 h-6" />
        </a>
      )}
    </>
  );
};
