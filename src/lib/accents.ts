/**
 * Decorative accent palette.
 * Base colors of the site are Black / White / Gold. These accents are used only
 * for decoration (icons, borders, badges, bars) through the `data-accent` attribute.
 * The actual color values live in `globals.css`.
 */
export const ACCENTS = ["gold", "red", "blue", "green", "orange", "brown", "white"] as const;

export type Accent = (typeof ACCENTS)[number];

export const accentAt = (index: number): Accent =>
  ACCENTS[((index % ACCENTS.length) + ACCENTS.length) % ACCENTS.length];

export const CATEGORY_ACCENT: Record<string, Accent> = {
  residential: "green",
  commercial: "blue",
  infrastructure: "orange",
  hospitality: "red",
};
