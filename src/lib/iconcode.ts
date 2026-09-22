/**
 * Icon Code – contact channels (shown in the site credit at the bottom of the footer).
 * Everything here is plain TypeScript so it can be used by both the server (sanitizing)
 * and the client (rendering + admin editor).
 */

export type ChannelKind = "phone" | "whatsapp" | "email" | "url";

export interface ChannelLink {
  id: string;
  /** Optional small label, e.g. "Sales" / "المبيعات" */
  label: string;
  /** Phone number, WhatsApp number, e-mail or URL depending on the channel kind */
  value: string;
  enabled: boolean;
}

export interface Channel {
  id: string;
  /** Name shown in tooltips / accessibility, e.g. "واتساب" */
  label: string;
  /** Key of ICON_OPTIONS */
  icon: string;
  /** Optional custom icon image (URL). Overrides the built-in icon. */
  imageUrl?: string;
  enabled: boolean;
  links: ChannelLink[];
}

export interface IconCodeSettings {
  channels: Channel[];
}

export interface IconOption {
  key: string;
  labelAr: string;
  labelEn: string;
  kind: ChannelKind;
  accent: "gold" | "red" | "blue" | "green" | "orange" | "brown" | "white";
  placeholderAr: string;
}

export const ICON_OPTIONS: IconOption[] = [
  { key: "phone", labelAr: "اتصال هاتفي", labelEn: "Phone call", kind: "phone", accent: "blue", placeholderAr: "+201000000000" },
  { key: "whatsapp", labelAr: "واتساب", labelEn: "WhatsApp", kind: "whatsapp", accent: "green", placeholderAr: "201000000000 (بالصيغة الدولية بدون +)" },
  { key: "email", labelAr: "بريد إلكتروني", labelEn: "Email", kind: "email", accent: "orange", placeholderAr: "info@example.com" },
  { key: "telegram", labelAr: "تيليجرام", labelEn: "Telegram", kind: "url", accent: "blue", placeholderAr: "https://t.me/username" },
  { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", kind: "url", accent: "blue", placeholderAr: "https://facebook.com/page" },
  { key: "instagram", labelAr: "إنستجرام", labelEn: "Instagram", kind: "url", accent: "red", placeholderAr: "https://instagram.com/username" },
  { key: "tiktok", labelAr: "تيك توك", labelEn: "TikTok", kind: "url", accent: "white", placeholderAr: "https://tiktok.com/@username" },
  { key: "youtube", labelAr: "يوتيوب", labelEn: "YouTube", kind: "url", accent: "red", placeholderAr: "https://youtube.com/@channel" },
  { key: "linkedin", labelAr: "لينكدإن", labelEn: "LinkedIn", kind: "url", accent: "blue", placeholderAr: "https://linkedin.com/company/name" },
  { key: "x", labelAr: "X (تويتر)", labelEn: "X (Twitter)", kind: "url", accent: "white", placeholderAr: "https://x.com/username" },
  { key: "website", labelAr: "موقع إلكتروني", labelEn: "Website", kind: "url", accent: "gold", placeholderAr: "https://example.com" },
  { key: "location", labelAr: "الموقع على الخريطة", labelEn: "Location", kind: "url", accent: "brown", placeholderAr: "https://maps.google.com/?q=..." },
  { key: "link", labelAr: "رابط آخر (أيقونة عامة)", labelEn: "Other link", kind: "url", accent: "gold", placeholderAr: "https://..." },
];

export const getIconOption = (key: string): IconOption =>
  ICON_OPTIONS.find((o) => o.key === key) || ICON_OPTIONS[ICON_OPTIONS.length - 1];

export const newId = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

export const emptyLink = (): ChannelLink => ({ id: newId("l"), label: "", value: "", enabled: true });

export const newChannel = (icon: string): Channel => ({
  id: newId("c"),
  label: getIconOption(icon).labelAr,
  icon,
  enabled: true,
  links: [emptyLink()],
});

/** Starting point: the common channels are ready, you only have to type the numbers/links. */
export const DEFAULT_ICONCODE: IconCodeSettings = {
  channels: [
    { id: "c_phone", label: "اتصال هاتفي", icon: "phone", enabled: true, links: [{ id: "l_phone1", label: "", value: "", enabled: true }] },
    { id: "c_whatsapp", label: "واتساب", icon: "whatsapp", enabled: true, links: [{ id: "l_wa1", label: "", value: "", enabled: true }] },
    { id: "c_email", label: "بريد إلكتروني", icon: "email", enabled: true, links: [{ id: "l_mail1", label: "", value: "", enabled: true }] },
    { id: "c_facebook", label: "فيسبوك", icon: "facebook", enabled: true, links: [{ id: "l_fb1", label: "", value: "", enabled: true }] },
    { id: "c_instagram", label: "إنستجرام", icon: "instagram", enabled: true, links: [{ id: "l_ig1", label: "", value: "", enabled: true }] },
  ],
};

const SAFE_SCHEME = /^(https?:|tel:|mailto:|sms:)/i;

/**
 * Turns what the admin typed into a safe, working href.
 * Returns null when the value is empty or unsafe (e.g. javascript:).
 */
export function linkHref(kind: ChannelKind, rawValue: string): string | null {
  const value = (rawValue || "").trim();
  if (!value) return null;

  let href: string;
  switch (kind) {
    case "phone": {
      if (/^tel:/i.test(value)) return value;
      const cleaned = value.replace(/[^\d+]/g, "");
      if (cleaned.replace(/\D/g, "").length < 3) return null;
      href = `tel:${cleaned}`;
      break;
    }
    case "whatsapp": {
      if (/^https?:/i.test(value)) {
        href = value;
        break;
      }
      const digits = value.replace(/\D/g, "").replace(/^00/, "");
      if (digits.length < 6) return null;
      href = `https://wa.me/${digits}`;
      break;
    }
    case "email": {
      if (/^mailto:/i.test(value)) return value;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
      href = `mailto:${value}`;
      break;
    }
    default: {
      href = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
    }
  }
  return SAFE_SCHEME.test(href) ? href : null;
}

/** Text shown for a link (label + value are shown in the UI, this is only the value part). */
export function displayValue(kind: ChannelKind, value: string): string {
  const v = (value || "").trim();
  if (kind === "phone") return v.replace(/^tel:/i, "");
  if (kind === "whatsapp") {
    if (/^https?:/i.test(v)) return "WhatsApp";
    return v.startsWith("+") ? v : `+${v.replace(/\D/g, "").replace(/^00/, "")}`;
  }
  if (kind === "email") return v.replace(/^mailto:/i, "");
  return v.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Server + client safe normalizer: guarantees the structure and limits sizes. */
export function sanitizeIconCode(input: unknown): IconCodeSettings {
  const raw = (input && typeof input === "object" ? input : {}) as { channels?: unknown };
  const channels = Array.isArray(raw.channels) ? raw.channels.slice(0, 40) : [];

  return {
    channels: channels.map((c: any, ci: number): Channel => {
      const icon = ICON_OPTIONS.some((o) => o.key === c?.icon) ? c.icon : "link";
      const links = Array.isArray(c?.links) ? c.links.slice(0, 20) : [];
      const imageUrl = str(c?.imageUrl, 500);
      return {
        id: str(c?.id, 60) || `c_${ci}`,
        label: str(c?.label, 80) || getIconOption(icon).labelAr,
        icon,
        ...(imageUrl && /^(https?:\/\/|\/)/i.test(imageUrl) ? { imageUrl } : {}),
        enabled: c?.enabled !== false,
        links: links.map(
          (l: any, li: number): ChannelLink => ({
            id: str(l?.id, 60) || `l_${ci}_${li}`,
            label: str(l?.label, 80),
            value: str(l?.value, 500),
            enabled: l?.enabled !== false,
          })
        ),
      };
    }),
  };
}

/** Channels that should really be shown on the public site (enabled + at least one valid enabled link). */
export function activeChannels(settings?: IconCodeSettings | null) {
  const data = settings && Array.isArray(settings.channels) ? settings : DEFAULT_ICONCODE;
  return data.channels
    .filter((c) => c.enabled)
    .map((c) => {
      const option = getIconOption(c.icon);
      const links = c.links
        .filter((l) => l.enabled)
        .map((l) => ({ ...l, href: linkHref(option.kind, l.value), text: displayValue(option.kind, l.value) }))
        .filter((l): l is typeof l & { href: string } => !!l.href);
      return { channel: c, option, links };
    })
    .filter((x) => x.links.length > 0);
}
