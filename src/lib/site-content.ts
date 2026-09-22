/**
 * Shared (server + client) definitions for the content manager:
 *  - ZONES: every place where an editable section can appear on the website
 *  - SiteMedia: replacements for the fixed images / videos / texts of the site (hero, about, contact)
 * Stored in site_settings under the keys "site_blocks" and "site_media".
 */

export interface ZoneDef {
  key: string;
  label: string;
  /** Which settings key stores the sections of this zone */
  store: "about_gallery" | "iconcode_showcase" | "site_blocks";
}

export const ZONES: ZoneDef[] = [
  { key: "after:hero", label: "بعد الواجهة الرئيسية (الهيرو)", store: "site_blocks" },
  { key: "about", label: "داخل قسم «من نحن»", store: "about_gallery" },
  { key: "after:about", label: "بعد قسم «من نحن»", store: "site_blocks" },
  { key: "after:services", label: "بعد قسم الخدمات", store: "site_blocks" },
  { key: "after:achievements", label: "بعد قسم الإنجازات", store: "site_blocks" },
  { key: "after:projects", label: "بعد قسم المشاريع", store: "site_blocks" },
  { key: "after:partners", label: "بعد قسم الشركاء", store: "site_blocks" },
  { key: "after:certificates", label: "بعد قسم الشهادات", store: "site_blocks" },
  { key: "after:contracts", label: "بعد قسم العقود", store: "site_blocks" },
  { key: "after:contact", label: "بعد قسم التواصل", store: "site_blocks" },
  { key: "footer", label: "أسفل الموقع (منطقة Icon Code)", store: "iconcode_showcase" },
];

export const zoneLabel = (key: string | undefined): string =>
  ZONES.find((z) => z.key === key)?.label || "بعد قسم «من نحن»";

export const zoneStore = (key: string | undefined): ZoneDef["store"] =>
  ZONES.find((z) => z.key === key)?.store || "site_blocks";

/* ------------------------------ fixed site media ------------------------------ */

export interface SiteMedia {
  // Hero background (leave empty = built-in files)
  heroWideVideo: string;
  heroWidePoster: string;
  heroPortraitVideo: string;
  heroPortraitPoster: string;
  // Hero words
  heroTitle: string;
  heroTitleEn: string;
  heroSubtitle: string;
  heroSubtitleEn: string;
  // About Us image + the label written on it
  aboutImage: string;
  aboutImageLabel: string;
  aboutImageLabelEn: string;
  aboutImageTitle: string;
  aboutImageTitleEn: string;
  // Contact image + the caption written on it
  contactImage: string;
  contactImageCaption: string;
  contactImageCaptionEn: string;
}

export const EMPTY_SITE_MEDIA: SiteMedia = {
  heroWideVideo: "",
  heroWidePoster: "",
  heroPortraitVideo: "",
  heroPortraitPoster: "",
  heroTitle: "",
  heroTitleEn: "",
  heroSubtitle: "",
  heroSubtitleEn: "",
  aboutImage: "",
  aboutImageLabel: "",
  aboutImageLabelEn: "",
  aboutImageTitle: "",
  aboutImageTitleEn: "",
  contactImage: "",
  contactImageCaption: "",
  contactImageCaptionEn: "",
};

const URL_KEYS: Array<keyof SiteMedia> = [
  "heroWideVideo",
  "heroWidePoster",
  "heroPortraitVideo",
  "heroPortraitPoster",
  "aboutImage",
  "contactImage",
];

const safeUrl = (v: unknown): string => {
  const url = typeof v === "string" ? v.trim().slice(0, 800) : "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return "";
};

/** Server + client safe normalizer for the "site_media" setting. */
export function sanitizeSiteMedia(input: unknown): SiteMedia {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: SiteMedia = { ...EMPTY_SITE_MEDIA };
  (Object.keys(EMPTY_SITE_MEDIA) as Array<keyof SiteMedia>).forEach((key) => {
    out[key] = URL_KEYS.includes(key)
      ? safeUrl(raw[key])
      : typeof raw[key] === "string"
        ? (raw[key] as string).trim().slice(0, 600)
        : "";
  });
  return out;
}

/** `/api/media/12` → 12 (uploaded file id), otherwise null. */
export function mediaIdFromUrl(url: string | undefined | null): number | null {
  const m = /^\/api\/media\/(\d+)$/.exec(url || "");
  return m ? Number(m[1]) : null;
}
