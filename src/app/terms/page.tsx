import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ink text-fg">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-card border border-gold/30 shadow-2xl space-y-6">
          <div className="text-xs font-mono text-gold-text">الشروط والأحكام القانونية</div>
          <h1 className="text-3xl sm:text-4xl font-black text-fg">
            الشروط والأحكام والاعتمادات الرسمية
          </h1>

          <div className="space-y-4 text-sm text-fg-2 leading-relaxed">
            <p>
              مرحباً بكم في الموقع الإلكتروني لمؤسسة ركائز البيئة للتجارة (سجل تجاري رقم 1010875202).
              استخدامكم لهذا الموقع يعني موافقتكم الكاملة على هذه الشروط والأحكام.
            </p>

            <h3 className="text-lg font-bold text-fg pt-2">١. الملكية الفكرية والعلامة التجارية</h3>
            <p>
              كافة محتويات هذا الموقع من نصوص هندسية، صور فوتوغرافية، تصاميم، وبيانات رسمية مستمدة من البروفايل
              الرسمي المعتمد لشركة ركائز، ومحمية بموجب أنظمة حماية حقوق المؤلف والعلامات التجارية في المملكة العربية السعودية.
            </p>

            <h3 className="text-lg font-bold text-fg pt-2">٢. عروض الأسعار والتقديرات الهندسية</h3>
            <p>
              تعتبر عروض الأسعار الناتجة عن نماذج الموقع تقديرات أولية وتخضع للمعاينة الميدانية وجداول الكميات
              المعتمدة والمخططات المعمارية التنفيذية.
            </p>

            <h3 className="text-lg font-bold text-fg pt-2">٣. التحقق من التراخيص الرسمية</h3>
            <p>
              توفر المنصة رموز QR لمطابقة البيانات عبر منصة وزارة التجارة ومنصة بلدي التابعة لأمانة منطقة الرياض
              لضمان التحقق الفوري والمباشر.
            </p>
          </div>

          <div className="pt-6 border-t border-fg/5 flex justify-end">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-gold text-on-gold font-bold text-xs"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
