import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/context/I18nContext";

function resolveSiteUrl(): URL {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "https://rakaiz-ksa.com").trim();
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return new URL("https://rakaiz-ksa.com");
  }
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: "ركائز للبناء والمقاولات | مؤسسة ركائز البيئة للتجارة - الرياض",
  description: "شركة متخصصة في تقديم حلول هندسية شاملة، المقاولات العامة، تطوير العقارات، البنية التحتية، والحلول البيئية في المملكة العربية السعودية.",
  keywords: ["ركائز", "مقاولات الرياض", "بناء وتشييد", "بوابة الدرعية", "أفنيوز مول", "ريف الرياض", "مؤسسة ركائز البيئة للتجارة", "السعودية 2030"],
  authors: [{ name: "مؤسسة ركائز البيئة للتجارة" }],
  openGraph: {
    title: "ركائز للبناء والمقاولات | حلول هندسية شاملة",
    description: "نبني اليوم .. ركائز لمستقبل أفضل. كبرى مشاريع البناء والمقاولات بالرياض والمملكة.",
    url: "https://rakaiz-ksa.com/",
    siteName: "ركائز للبناء والمقاولات",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="light-mode" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme/language before first paint (prevents a dark flash in light mode) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,t=localStorage.getItem("rakaiz_theme_v2"),l=localStorage.getItem("rakaiz_locale");if(t==="dark"){d.classList.remove("light-mode");d.classList.add("dark")}if(l==="en"){d.lang="en";d.dir="ltr"}}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
