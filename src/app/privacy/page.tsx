import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ink text-fg">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-card border border-gold/30 shadow-2xl space-y-6">
          <div className="text-xs font-mono text-gold-text">سياسة الخصوصية وحماية البيانات</div>
          <h1 className="text-3xl sm:text-4xl font-black text-fg">
            سياسة الخصوصية لمؤسسة ركائز البيئة للتجارة
          </h1>

          <div className="space-y-4 text-sm text-fg-2 leading-relaxed">
            <p>
              تلتزم مؤسسة ركائز البيئة للتجارة (المشار إليها بـ &ldquo;ركائز&rdquo;) بأعلى معايير الأمان والسرية
              في حماية البيانات الشخصية والتعاقدية لعملائنا وشركائنا بما يتوافق مع الأنظمة واللوائح المعتمدة
              في المملكة العربية السعودية ونظام حماية البيانات الشخصية.
            </p>

            <h3 className="text-lg font-bold text-fg pt-2">١. جمع البيانات</h3>
            <p>
              نقوم بجمع البيانات التي تقدمها طواعية عبر نماذج التواصل، طلبات عروض الأسعار، وتصاريح الاطلاع
              على العقود، وتشمل الاسم والبريد الإلكتروني ورقم الهاتف وبيانات المشروع.
            </p>

            <h3 className="text-lg font-bold text-fg pt-2">٢. استخدام البيانات</h3>
            <p>
              تُستخدم المعلومات لتقديم العروض الفنية، والتواصل الهندسي، والتحقق من أهلية الاطلاع على الوثائق المحمية،
              ولا يتم بيع أو مشاركة أي بيانات لأطراف خارجية غير مصرح لها.
            </p>

            <h3 className="text-lg font-bold text-fg pt-2">٣. أمن المستندات والعقود</h3>
            <p>
              تُحفظ كافة الوثائق الرسمية والعقود في خوادم مشفرة ويتم تقييد الوصول إليها عبر روابط مشفرة مؤقتة
              بعد موافقة مسؤولي الإدارة حصراً.
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
