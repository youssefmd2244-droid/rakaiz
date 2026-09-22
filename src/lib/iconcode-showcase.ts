/**
 * Icon Code showcase: editable sections that contain images / videos, each with optional text.
 * Stored in site_settings under the key "iconcode_showcase".
 * Plain TypeScript so it can be shared by the server (sanitizing) and the client.
 */

/** "text" = a card with words only (no image / video). */
export type MediaType = "image" | "video" | "text";

/**
 * Where a section is shown on the website.
 *  - "about"  : inside the About Us section (stored in `about_gallery`)
 *  - "footer" : bottom of the site, Icon Code area (stored in `iconcode_showcase`)
 *  - "after:<section>" : a full-width section placed after a built-in section (stored in `site_blocks`)
 */
export const ZONE_PATTERN = /^(about|footer|after:(hero|about|services|achievements|projects|partners|certificates|contracts|contact))$/;

export interface ShowcaseItem {
  id: string;
  type: MediaType;
  /** Image / video URL. Uploaded files look like /api/media/12 */
  url: string;
  /** Optional poster image for videos */
  poster: string;
  title: string;
  titleEn: string;
  text: string;
  textEn: string;
  enabled: boolean;
}

export interface ShowcaseSection {
  id: string;
  title: string;
  titleEn: string;
  text: string;
  textEn: string;
  enabled: boolean;
  /** Placement on the site (see ZONE_PATTERN). Optional for the two legacy settings. */
  zone?: string;
  /** Cards per row on large screens: 0 = automatic */
  columns?: number;
  items: ShowcaseItem[];
}

export interface ShowcaseSettings {
  sections: ShowcaseSection[];
}

export const newShowcaseId = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

export const emptyItem = (type: MediaType): ShowcaseItem => ({
  id: newShowcaseId("i"),
  type,
  url: "",
  poster: "",
  title: "",
  titleEn: "",
  text: "",
  textEn: "",
  enabled: true,
});

export const emptySection = (zone = "after:about"): ShowcaseSection => ({
  id: newShowcaseId("s"),
  title: "قسم جديد",
  titleEn: "New section",
  text: "",
  textEn: "",
  enabled: true,
  zone,
  columns: 0,
  items: [],
});

/** Shown until the admin saves their own content. */
export const DEFAULT_SHOWCASE: ShowcaseSettings = {
  sections: [
    {
      id: "s_main",
      title: "أبرز ما نصنعه",
      titleEn: "What we create",
      text: "أفكار تتحوّل إلى مواقع وهويات وحملات وحلول ذكية تنمّي أعمال عملائنا.",
      textEn: "Ideas turned into websites, identities, campaigns and smart solutions that grow our clients' business.",
      enabled: true,
      items: [
        {
          id: "i_web",
          type: "image",
          url: "/images/iconcode-web.jpg",
          poster: "",
          title: "برمجة وتصميم المواقع",
          titleEn: "Web design & development",
          text: "مواقع ومتاجر إلكترونية وأنظمة كاشير سريعة وآمنة.",
          textEn: "Fast, secure websites, online stores and POS systems.",
          enabled: true,
        },
        {
          id: "i_brand",
          type: "image",
          url: "/images/iconcode-brand.jpg",
          poster: "",
          title: "هوية بصرية وشعارات",
          titleEn: "Brand identity & logos",
          text: "شعارات وبنرات تعكس شخصية علامتك وتترك أثرًا لا يُنسى.",
          textEn: "Logos and banners that reflect your brand and leave a lasting impression.",
          enabled: true,
        },
        {
          id: "i_promo",
          type: "image",
          url: "/images/iconcode-promo.jpg",
          poster: "",
          title: "ترويج ومونتاج",
          titleEn: "Promotion & video montage",
          text: "حملات ترويجية وفيديوهات احترافية تصل لجمهورك.",
          textEn: "Promotion campaigns and professional videos that reach your audience.",
          enabled: true,
        },
        {
          id: "i_ai",
          type: "image",
          url: "/images/iconcode-ai.jpg",
          poster: "",
          title: "الذكاء الاصطناعي وتصميم المباني",
          titleEn: "AI & building design",
          text: "حلول AI وتصميم أشكال GRC والواجهات بروح عصرية.",
          textEn: "AI solutions and GRC / facade design with a modern spirit.",
          enabled: true,
        },
      ],
    },
  ],
};

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Only http(s) links and site-relative paths are allowed (blocks javascript: etc.). */
const safeUrl = (v: unknown): string => {
  const url = str(v, 800);
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return "";
};

/** Server + client safe normalizer. */
export function sanitizeShowcase(input: unknown): ShowcaseSettings {
  const raw = (input && typeof input === "object" ? input : {}) as { sections?: unknown };
  const sections = Array.isArray(raw.sections) ? raw.sections.slice(0, 60) : [];

  return {
    sections: sections.map((s: any, si: number): ShowcaseSection => {
      const items = Array.isArray(s?.items) ? s.items.slice(0, 100) : [];
      const zone = typeof s?.zone === "string" && ZONE_PATTERN.test(s.zone) ? s.zone : undefined;
      const columns = [2, 3, 4].includes(Number(s?.columns)) ? Number(s.columns) : 0;
      return {
        id: str(s?.id, 60) || `s_${si}`,
        title: str(s?.title, 200),
        titleEn: str(s?.titleEn, 200),
        text: str(s?.text, 1500),
        textEn: str(s?.textEn, 1500),
        enabled: s?.enabled !== false,
        ...(zone ? { zone } : {}),
        columns,
        items: items.map(
          (it: any, ii: number): ShowcaseItem => ({
            id: str(it?.id, 60) || `i_${si}_${ii}`,
            type: it?.type === "video" ? "video" : it?.type === "text" ? "text" : "image",
            url: it?.type === "text" ? "" : safeUrl(it?.url),
            poster: it?.type === "video" ? safeUrl(it?.poster) : "",
            title: str(it?.title, 200),
            titleEn: str(it?.titleEn, 200),
            text: str(it?.text, 1500),
            textEn: str(it?.textEn, 1500),
            enabled: it?.enabled !== false,
          })
        ),
      };
    }),
  };
}

/** Converts YouTube / Vimeo links to an embeddable URL; returns null for direct video files. */
export function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** Pick the language variant with a fallback to the other language. */
export const pick = (isArabic: boolean, ar: string, en: string): string =>
  isArabic ? ar || en : en || ar;

const rakaizItem = (
  id: string,
  file: string,
  title: string,
  titleEn: string,
  text: string,
  textEn: string
): ShowcaseItem => ({ id, type: "image", url: `/images/${file}`, poster: "", title, titleEn, text, textEn, enabled: true });

/** Default gallery of the "About Us" section (Rakaiz contracting works). */
export const DEFAULT_RAKAIZ_GALLERY: ShowcaseSettings = {
  sections: [
    {
      id: "s_rakaiz_main",
      title: "",
      titleEn: "",
      text: "نماذج من مجالات عملنا في المقاولات والبنية التحتية والمباني.",
      textEn: "Samples of our fields of work in contracting, infrastructure and buildings.",
      enabled: true,
      items: [
        rakaizItem("r_construction", "rakaiz-construction.jpg", "المشاريع الإنشائية", "Construction projects",
          "تنفيذ متكامل للمباني بأعلى معايير الجودة والسلامة.", "Integrated building execution to the highest quality and safety standards."),
        rakaizItem("r_infra", "rakaiz-infrastructure.jpg", "البنية التحتية", "Infrastructure",
          "مياه وصرف صحي واتصالات كهربائية وإدارة النفايات.", "Water, sewage, electrical communications and waste management."),
        rakaizItem("r_towers", "rakaiz-towers.jpg", "المباني السكنية والتجارية", "Residential & commercial buildings",
          "أبراج ومجمعات ومراكز تجارية تُسلَّم في وقتها وبجودة عالية.", "Towers, complexes and malls delivered on time and to a high standard."),
        rakaizItem("r_gov", "rakaiz-government.jpg", "المباني الحكومية والمؤسسات", "Government & institutional buildings",
          "مدارس ومستشفيات ومنشآت حكومية بإتقان وموثوقية.", "Schools, hospitals and government facilities built with precision and reliability."),
        rakaizItem("r_finishing", "rakaiz-finishing.jpg", "التشطيبات عالية الجودة", "High-quality finishing",
          "تشطيبات داخلية وخارجية بتفاصيل دقيقة ولمسة معمارية راقية.", "Interior and exterior finishing with fine details and an elegant architectural touch."),
        rakaizItem("r_maintenance", "rakaiz-maintenance.jpg", "الترميم وصيانة المرافق", "Restoration & facility maintenance",
          "ترميم المباني وصيانة وتشغيل المرافق لضمان استدامتها.", "Building restoration and facility maintenance and operation to keep them sustainable."),
      ],
    },
  ],
};

/** True when there is at least one visible section (used to hide empty blocks). */
export function hasVisibleShowcase(data: ShowcaseSettings | null | undefined, fallback: ShowcaseSettings): boolean {
  const source = data && Array.isArray(data.sections) ? data : fallback;
  return source.sections.some((sec) => sec.enabled && (sec.title || sec.text || sec.items.some(isItemVisible)));
}

/** An item is shown when it is enabled and has something to show (a file, or words for text cards). */
export const isItemVisible = (item: ShowcaseItem): boolean =>
  item.enabled && (item.type === "text" ? !!(item.title || item.text || item.titleEn || item.textEn) : !!item.url);
