"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useI18n } from "@/context/I18nContext";

export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { t } = useI18n();
  const [fading, setFading] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let done: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => {
      setFading(true);
      done = setTimeout(() => onCompleteRef.current(), 400);
    }, 700);

    return () => {
      clearTimeout(timer);
      clearTimeout(done);
    };
  }, []);

  return (
    <div
      className={`force-dark fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Drawing Ring */}
        <div className="w-28 h-28 relative rounded-full p-1 bg-gradient-to-tr from-gold-lo via-gold to-gold-hi animate-pulse shadow-[0_0_50px_rgba(240,179,35,0.4)]">
          <div className="w-full h-full rounded-full bg-onyx flex items-center justify-center p-3 overflow-hidden">
            <Image
              src="/logos/rakaiz-logo.svg"
              alt="Rakaiz"
              width={80}
              height={80}
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(240,179,35,0.6)]"
              priority
            />
          </div>
        </div>

        <div className="mt-6 text-center space-y-1">
          <h2 className="text-xl font-black text-fg tracking-widest">
            {t("ركائز", "RAKAIZ")}
          </h2>
          <p className="text-xs font-mono text-gold-text tracking-wider">
            {t("للبناء والمقاولات", "BUILDING & CONTRACTING")}
          </p>
        </div>

        <div className="mt-6 w-32 h-0.5 bg-card-3 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gold animate-[marquee_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
