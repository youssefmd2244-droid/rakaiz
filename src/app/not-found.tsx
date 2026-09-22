"use client";

import Link from "next/link";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink text-fg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold text-gold-text flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="text-6xl sm:text-8xl font-black text-gold-text font-mono mb-2">404</div>
      <h1 className="text-2xl sm:text-4xl font-extrabold text-fg mb-3">الصفحة المطلوبة غير موجودة</h1>
      <p className="text-sm text-fg-3 max-w-md mx-auto mb-8">
        عذراً، الرابط الذي تحاول الوصول إليه غير متاح أو تم نقله في منظومة ركائز المعمارية.
      </p>

      <Link
        href="/"
        className="btn-gold-sweep px-8 py-3 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-black text-sm flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>العودة إلى الصفحة الرئيسية</span>
      </Link>
    </div>
  );
}
