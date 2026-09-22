"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Save, ArrowUp, ArrowDown, Upload, Copy, Move, RotateCcw } from "lucide-react";
import {
  DEFAULT_SHOWCASE,
  DEFAULT_RAKAIZ_GALLERY,
  MediaType,
  ShowcaseItem,
  ShowcaseSection,
  ShowcaseSettings,
  emptyItem,
  emptySection,
  newShowcaseId,
  sanitizeShowcase,
  videoEmbedUrl,
} from "@/lib/iconcode-showcase";
import { ZONES } from "@/lib/site-content";
import { IMAGE_ACCEPT, VIDEO_ACCEPT, uploadFile } from "@/lib/media-upload";

type StoreKey = "about_gallery" | "iconcode_showcase" | "site_blocks";

const STORE_LABELS: Record<StoreKey, string> = {
  about_gallery: "قسم «من نحن» (04)",
  iconcode_showcase: "أسفل الموقع – Icon Code",
  site_blocks: "قسم مخصص جديد (اختر مكانه)",
};

interface Section extends ShowcaseSection {
  _store: StoreKey;
}

interface ContentManagerProps {
  aboutGallery?: ShowcaseSettings | null;
  iconcodeShowcase?: ShowcaseSettings | null;
  siteBlocks?: ShowcaseSettings | null;
  onSave: (payload: { about_gallery: ShowcaseSettings; iconcode_showcase: ShowcaseSettings; site_blocks: ShowcaseSettings }) => void;
}

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-ink border border-line text-sm text-fg placeholder:text-fg-5 focus:outline-none focus:border-gold";

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

function buildInitial(aboutGallery?: ShowcaseSettings | null, iconcodeShowcase?: ShowcaseSettings | null, siteBlocks?: ShowcaseSettings | null): Section[] {
  const a = sanitizeShowcase(aboutGallery || DEFAULT_RAKAIZ_GALLERY).sections.map((s) => ({ ...s, _store: "about_gallery" as StoreKey }));
  const b = sanitizeShowcase(iconcodeShowcase || DEFAULT_SHOWCASE).sections.map((s) => ({ ...s, _store: "iconcode_showcase" as StoreKey }));
  const c = sanitizeShowcase(siteBlocks || { sections: [] }).sections.map((s) => ({ ...s, _store: "site_blocks" as StoreKey, zone: s.zone || "after:about" }));
  return [...a, ...b, ...c];
}

const Preview: React.FC<{ item: ShowcaseItem }> = ({ item }) => {
  const box = "w-24 h-16 shrink-0 rounded-xl overflow-hidden bg-card-3 border border-line flex items-center justify-center text-[10px] text-fg-5 text-center px-1";
  if (item.type === "text") return <div className={box}>كلام بدون صورة</div>;
  if (!item.url) return <div className={box}>بدون ملف</div>;
  if (item.type === "video") {
    if (videoEmbedUrl(item.url)) return <div className={box}>فيديو (رابط)</div>;
    return (
      <div className={box}>
        <video src={item.url} poster={item.poster || undefined} muted playsInline preload="metadata" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt="" className="w-full h-full object-cover" />
    </div>
  );
};

/**
 * Unified content manager: every editable "sections of images/videos/text" area of the site
 * (About-us gallery, Icon Code footer showcase, and any custom section the admin adds) in one place.
 * Supports: add/edit/disable/delete sections and items, upload from device or paste a link,
 * items with or without text (or text-only cards with no media), reordering, and moving or
 * duplicating any item between sections (even across different areas of the site).
 */
export const ContentManager: React.FC<ContentManagerProps> = ({ aboutGallery, iconcodeShowcase, siteBlocks, onSave }) => {
  const [sections, setSections] = useState<Section[]>(() => buildInitial(aboutGallery, iconcodeShowcase, siteBlocks));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [moveTarget, setMoveTarget] = useState<Record<string, string>>({}); // itemKey -> targetSectionId
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<{ sectionId: string; itemId: string; field: "url" | "poster" } | null>(null);

  useEffect(() => {
    setSections(buildInitial(aboutGallery, iconcodeShowcase, siteBlocks));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSection = (id: string, patch: Partial<Section>) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const updateItem = (sectionId: string, itemId: string, patch: Partial<ShowcaseItem>) =>
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) } : s))
    );

  const removeSection = (id: string) => {
    if (!confirm("حذف القسم بالكامل مع كل ما بداخله نهائياً؟")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    if (!confirm("حذف هذا العنصر نهائياً؟")) return;
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s)));
  };

  const addItem = (sectionId: string, type: MediaType) =>
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, emptyItem(type)] } : s)));

  const moveItemUpDown = (sectionId: string, index: number, direction: -1 | 1) =>
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, items: move(s.items, index, direction) } : s)));

  const addSection = (store: StoreKey) =>
    setSections((prev) => [...prev, { ...emptySection(store === "site_blocks" ? "after:about" : undefined), _store: store }]);

  const pickFile = (sectionId: string, itemId: string, field: "url" | "poster", accept: string) => {
    uploadTarget.current = { sectionId, itemId, field };
    if (fileInput.current) {
      fileInput.current.accept = accept;
      fileInput.current.value = "";
      fileInput.current.click();
    }
  };

  const onFileChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const target = uploadTarget.current;
    if (!file || !target) return;
    setError("");
    setBusy(target.itemId);
    try {
      const url = await uploadFile(file);
      updateItem(target.sectionId, target.itemId, { [target.field]: url } as Partial<ShowcaseItem>);
    } catch (e: any) {
      setError(e.message || "فشل رفع الملف");
    } finally {
      setBusy(null);
    }
  };

  /** Moves (cut) or copies (duplicate) one item into another section, even in a different area of the site. */
  const transferItem = (fromSectionId: string, item: ShowcaseItem, toSectionId: string, mode: "move" | "duplicate") => {
    if (!toSectionId || toSectionId === fromSectionId) return;
    setSections((prev) => {
      let moved: ShowcaseItem | null = null;
      const withoutSource =
        mode === "move"
          ? prev.map((s) => {
              if (s.id !== fromSectionId) return s;
              const found = s.items.find((i) => i.id === item.id);
              if (found) moved = found;
              return { ...s, items: s.items.filter((i) => i.id !== item.id) };
            })
          : prev;
      const itemToInsert = mode === "duplicate" ? { ...item, id: newShowcaseId("i") } : moved || item;
      return withoutSource.map((s) => (s.id === toSectionId ? { ...s, items: [...s.items, itemToInsert] } : s));
    });
  };

  const handleSave = () => {
    const byStore = (store: StoreKey): ShowcaseSettings => ({
      sections: sections.filter((s) => s._store === store).map(({ _store, ...rest }) => rest),
    });
    onSave({
      about_gallery: sanitizeShowcase(byStore("about_gallery")),
      iconcode_showcase: sanitizeShowcase(byStore("iconcode_showcase")),
      site_blocks: sanitizeShowcase(byStore("site_blocks")),
    });
  };

  const resetDefaults = () => {
    if (!confirm("استرجاع الأقسام الافتراضية؟ (الأقسام المخصصة الجديدة تفضل كما هي، ولن يُحفظ إلا بعد الضغط على حفظ)")) return;
    setSections((prev) => [
      ...sanitizeShowcase(DEFAULT_RAKAIZ_GALLERY).sections.map((s) => ({ ...s, _store: "about_gallery" as StoreKey })),
      ...sanitizeShowcase(DEFAULT_SHOWCASE).sections.map((s) => ({ ...s, _store: "iconcode_showcase" as StoreKey })),
      ...prev.filter((s) => s._store === "site_blocks"),
    ]);
  };

  return (
    <div className="p-8 rounded-3xl bg-card border border-fg/5 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gold-text">إدارة محتوى الصور والفيديوهات والأقسام</h3>
        <p className="text-sm text-fg-3 mt-1 leading-relaxed">
          أضف قسم جديد في أي مكان في الموقع، وحط فيه صور أو فيديوهات أو كلام بدون صورة. عدّل أو أوقف أو احذف أو رتب أي
          قسم أو عنصر. ارفع الصور من جهازك (بتتصغّر تلقائياً، حد أقصى 4 ميجا) أو الصق رابط. للفيديوهات الكبيرة الصق
          رابط يوتيوب / Vimeo / رابط مباشر بدل الرفع. تقدر كمان تنقل أو تكرر أي صورة أو فيديو من قسم لقسم تاني (حتى لو
          في مكان مختلف في الموقع).
        </p>
      </div>

      <input type="file" ref={fileInput} onChange={onFileChosen} className="hidden" />
      {error && <div className="p-3 rounded-xl bg-t-red/10 border border-t-red/40 text-sm text-t-red">{error}</div>}

      <div className="space-y-6">
        {sections.length === 0 && <p className="text-sm text-fg-4 text-center py-6">لا توجد أقسام. أضف قسم جديد من الأسفل.</p>}

        {sections.map((section, sectionIndex) => {
          const otherSections = sections.filter((s) => s.id !== section.id);
          return (
            <div key={section.id} className={`rounded-2xl border p-5 space-y-5 bg-ink transition-opacity ${section.enabled ? "border-gold/30" : "border-line opacity-60"}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-text text-xs font-black">
                  قسم {sectionIndex + 1}
                </span>

                <select
                  value={section._store}
                  onChange={(e) => updateSection(section.id, { _store: e.target.value as StoreKey })}
                  className={`${inputClass} w-auto text-xs`}
                  title="مكان القسم في الموقع"
                >
                  {(Object.keys(STORE_LABELS) as StoreKey[]).map((k) => (
                    <option key={k} value={k}>
                      {STORE_LABELS[k]}
                    </option>
                  ))}
                </select>

                {section._store === "site_blocks" && (
                  <select
                    value={section.zone || "after:about"}
                    onChange={(e) => updateSection(section.id, { zone: e.target.value })}
                    className={`${inputClass} w-auto text-xs`}
                    title="مكان القسم بالتحديد"
                  >
                    {ZONES.filter((z) => z.store === "site_blocks").map((z) => (
                      <option key={z.key} value={z.key}>
                        {z.label}
                      </option>
                    ))}
                  </select>
                )}

                <label className="flex items-center gap-2 text-xs text-fg-2 cursor-pointer select-none">
                  <input type="checkbox" checked={section.enabled} onChange={(e) => updateSection(section.id, { enabled: e.target.checked })} className="w-4 h-4 accent-[#F0B323]" />
                  {section.enabled ? "ظاهر" : "موقوف"}
                </label>

                <div className="ms-auto flex items-center gap-1">
                  <button type="button" title="لأعلى" onClick={() => setSections((p) => move(p, sectionIndex, -1))} className="p-2 rounded-full hover:bg-card-3 text-fg-3">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" title="لأسفل" onClick={() => setSections((p) => move(p, sectionIndex, 1))} className="p-2 rounded-full hover:bg-card-3 text-fg-3">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button type="button" title="حذف القسم نهائياً" onClick={() => removeSection(section.id)} className="p-2 rounded-full text-t-red hover:bg-t-red/15">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} placeholder="عنوان القسم (عربي) – اختياري" className={inputClass} />
                <input value={section.titleEn} onChange={(e) => updateSection(section.id, { titleEn: e.target.value })} placeholder="Section title (English) – optional" className={inputClass} dir="ltr" />
                <textarea value={section.text} onChange={(e) => updateSection(section.id, { text: e.target.value })} placeholder="نص القسم (عربي) – اختياري" rows={2} className={inputClass} />
                <textarea value={section.textEn} onChange={(e) => updateSection(section.id, { textEn: e.target.value })} placeholder="Section text (English) – optional" rows={2} className={inputClass} dir="ltr" />
              </div>

              <div className="space-y-4">
                {section.items.map((item, index) => {
                  const itemKey = `${section.id}:${item.id}`;
                  return (
                    <div key={item.id} className={`rounded-2xl border p-4 space-y-3 bg-card ${item.enabled ? "border-line" : "border-line opacity-60"}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        <Preview item={item} />
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <select value={item.type} onChange={(e) => updateItem(section.id, item.id, { type: e.target.value as MediaType })} className={`${inputClass} w-auto`}>
                              <option value="image">صورة</option>
                              <option value="video">فيديو</option>
                              <option value="text">كلام فقط (بدون صورة)</option>
                            </select>

                            {item.type !== "text" && (
                              <button
                                type="button"
                                disabled={busy === item.id}
                                onClick={() => pickFile(section.id, item.id, "url", item.type === "video" ? VIDEO_ACCEPT : IMAGE_ACCEPT)}
                                className="px-4 py-2 rounded-full bg-gold text-on-gold text-xs font-black flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                {busy === item.id ? "جاري الرفع..." : item.type === "video" ? "رفع فيديو من الجهاز" : "رفع صورة من الجهاز"}
                              </button>
                            )}

                            <label className="flex items-center gap-1.5 text-xs text-fg-3 cursor-pointer select-none">
                              <input type="checkbox" checked={item.enabled} onChange={(e) => updateItem(section.id, item.id, { enabled: e.target.checked })} className="w-4 h-4 accent-[#F0B323]" />
                              {item.enabled ? "ظاهر" : "موقوف"}
                            </label>

                            <div className="ms-auto flex items-center gap-1">
                              <button type="button" title="لأعلى" onClick={() => moveItemUpDown(section.id, index, -1)} className="p-1.5 rounded-full hover:bg-card-3 text-fg-3">
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" title="لأسفل" onClick={() => moveItemUpDown(section.id, index, 1)} className="p-1.5 rounded-full hover:bg-card-3 text-fg-3">
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" title="حذف نهائياً" onClick={() => removeItem(section.id, item.id)} className="p-1.5 rounded-full text-t-red hover:bg-t-red/15">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {item.type !== "text" && (
                            <input
                              value={item.url}
                              onChange={(e) => updateItem(section.id, item.id, { url: e.target.value })}
                              placeholder={item.type === "video" ? "أو الصق رابط الفيديو (يوتيوب / Vimeo / mp4)" : "أو الصق رابط الصورة"}
                              className={`${inputClass} text-xs font-mono`}
                              dir="ltr"
                            />
                          )}
                          {item.type === "video" && (
                            <div className="flex gap-2">
                              <input value={item.poster} onChange={(e) => updateItem(section.id, item.id, { poster: e.target.value })} placeholder="(اختياري) صورة الغلاف للفيديو المباشر" className={`${inputClass} text-xs font-mono`} dir="ltr" />
                              <button type="button" onClick={() => pickFile(section.id, item.id, "poster", IMAGE_ACCEPT)} className="px-3 rounded-xl bg-card-3 text-xs font-bold text-fg-2 hover:bg-gold hover:text-on-gold transition-colors shrink-0">
                                رفع
                              </button>
                            </div>
                          )}

                          {/* Move / duplicate this item to another section */}
                          {otherSections.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <select
                                value={moveTarget[itemKey] || ""}
                                onChange={(e) => setMoveTarget((p) => ({ ...p, [itemKey]: e.target.value }))}
                                className={`${inputClass} w-auto text-xs`}
                              >
                                <option value="">نقل / تكرار إلى قسم آخر...</option>
                                {otherSections.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {STORE_LABELS[s._store]} — {s.title || s.titleEn || `قسم ${sections.indexOf(s) + 1}`}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                disabled={!moveTarget[itemKey]}
                                onClick={() => transferItem(section.id, item, moveTarget[itemKey], "move")}
                                className="px-3 py-1.5 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-[11px] font-bold flex items-center gap-1 disabled:opacity-40"
                              >
                                <Move className="w-3.5 h-3.5" /> نقل
                              </button>
                              <button
                                type="button"
                                disabled={!moveTarget[itemKey]}
                                onClick={() => transferItem(section.id, item, moveTarget[itemKey], "duplicate")}
                                className="px-3 py-1.5 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-[11px] font-bold flex items-center gap-1 disabled:opacity-40"
                              >
                                <Copy className="w-3.5 h-3.5" /> تكرار
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={item.title} onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })} placeholder={item.type === "text" ? "العنوان (عربي)" : "العنوان (عربي) – اتركه فاضي لو عايز بدون كلام"} className={inputClass} />
                        <input value={item.titleEn} onChange={(e) => updateItem(section.id, item.id, { titleEn: e.target.value })} placeholder="Title (English)" className={inputClass} dir="ltr" />
                        <textarea value={item.text} onChange={(e) => updateItem(section.id, item.id, { text: e.target.value })} placeholder={item.type === "text" ? "النص (عربي)" : "الكلام المكتوب على الصورة (عربي)"} rows={2} className={inputClass} />
                        <textarea value={item.textEn} onChange={(e) => updateItem(section.id, item.id, { textEn: e.target.value })} placeholder="Text on the image (English)" rows={2} className={inputClass} dir="ltr" />
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => addItem(section.id, "image")} className="px-4 py-2 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> إضافة صورة
                  </button>
                  <button type="button" onClick={() => addItem(section.id, "video")} className="px-4 py-2 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> إضافة فيديو
                  </button>
                  <button type="button" onClick={() => addItem(section.id, "text")} className="px-4 py-2 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> إضافة كلام بدون صورة
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between pt-2 border-t border-fg/5">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => addSection("site_blocks")} className="px-5 py-2 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> إضافة قسم جديد
          </button>
          <button type="button" onClick={resetDefaults} className="px-5 py-2 rounded-full border border-line-2 text-fg-3 hover:text-fg text-sm font-bold transition-colors flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> استرجاع الافتراضي
          </button>
        </div>

        <button type="button" onClick={handleSave} className="btn-gold-sweep px-8 py-2.5 rounded-full bg-gold text-on-gold font-black text-sm flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>حفظ كل الأقسام</span>
        </button>
      </div>
    </div>
  );
};
