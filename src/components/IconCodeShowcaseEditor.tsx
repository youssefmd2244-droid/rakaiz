"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Save, ArrowUp, ArrowDown, Upload } from "lucide-react";
import {
  DEFAULT_SHOWCASE,
  MediaType,
  ShowcaseItem,
  ShowcaseSection,
  ShowcaseSettings,
  emptyItem,
  emptySection,
  sanitizeShowcase,
  videoEmbedUrl,
} from "@/lib/iconcode-showcase";

interface EditorProps {
  value?: ShowcaseSettings | null;
  onSave: (data: ShowcaseSettings) => void;
  heading?: string;
  /** Content used for the first render and for "restore defaults" */
  defaults?: ShowcaseSettings;
}

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-ink border border-line text-sm text-fg placeholder:text-fg-5 focus:outline-none focus:border-gold";

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/** Shrinks big photos in the browser before upload (max 1600px, JPEG) so they load fast. */
async function prepareFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  if (file.type === "image/png" && file.size <= 1.2 * 1024 * 1024) return file; // keep transparency for small PNGs

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], "image.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function uploadFile(original: File): Promise<string> {
  const file = await prepareFile(original);
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("حجم الملف أكبر من 4 ميجا. للفيديوهات الكبيرة استخدم رابط (يوتيوب أو رابط مباشر).");
  }
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch("/api/media", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || "فشل رفع الملف");
  return data.url as string;
}

const Preview: React.FC<{ item: ShowcaseItem }> = ({ item }) => {
  const box = "w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-card-3 border border-line flex items-center justify-center text-[11px] text-fg-5";
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

/** Admin editor: sections that contain images / videos, each with optional text. */
export const IconCodeShowcaseEditor: React.FC<EditorProps> = ({
  value,
  onSave,
  heading = "أقسام الصور والفيديو – شركة Icon Code (أسفل الموقع)",
  defaults = DEFAULT_SHOWCASE,
}) => {
  const [sections, setSections] = useState<ShowcaseSection[]>(() =>
    sanitizeShowcase(value || defaults).sections
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<{ sectionId: string; itemId: string; field: "url" | "poster" } | null>(null);

  // The settings arrive asynchronously from the API
  useEffect(() => {
    if (value && Array.isArray(value.sections)) {
      setSections(sanitizeShowcase(value).sections);
    }
  }, [value]);

  const updateSection = (id: string, patch: Partial<ShowcaseSection>) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const updateItem = (sectionId: string, itemId: string, patch: Partial<ShowcaseItem>) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) } : s
      )
    );

  const removeSection = (id: string) => {
    if (!confirm("حذف القسم بالكامل مع كل ما بداخله؟")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    if (!confirm("حذف هذا العنصر؟")) return;
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s))
    );
  };

  const addItem = (sectionId: string, type: MediaType) =>
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, emptyItem(type)] } : s))
    );

  const moveItem = (sectionId: string, index: number, direction: -1 | 1) =>
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, items: move(s.items, index, direction) } : s)));

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

  return (
    <div className="p-8 rounded-3xl bg-card border border-fg/5 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gold-text">{heading}</h3>
        <p className="text-sm text-fg-3 mt-1 leading-relaxed">
          أضف قسم جديد، وحط فيه صور أو فيديوهات، مع كلام أو بدون كلام. تقدر تعدّل أو توقف أو تحذف أو ترتب أي قسم أو عنصر.
          الصور بتترفع من جهازك (بتتصغّر تلقائياً). الفيديو: ارفع ملف صغير (حتى 4 ميجا) أو الصق رابط يوتيوب / Vimeo /
          رابط فيديو مباشر.
        </p>
      </div>

      <input type="file" ref={fileInput} onChange={onFileChosen} className="hidden" />

      {error && <div className="p-3 rounded-xl bg-t-red/10 border border-t-red/40 text-sm text-t-red">{error}</div>}

      <div className="space-y-6">
        {sections.length === 0 && (
          <p className="text-sm text-fg-4 text-center py-6">لا توجد أقسام. أضف قسم جديد من الأسفل.</p>
        )}

        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className={`rounded-2xl border p-5 space-y-5 bg-ink transition-opacity ${
              section.enabled ? "border-gold/30" : "border-line opacity-60"
            }`}
          >
            {/* Section header */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-text text-xs font-black">
                قسم {sectionIndex + 1}
              </span>
              <label className="flex items-center gap-2 text-xs text-fg-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(e) => updateSection(section.id, { enabled: e.target.checked })}
                  className="w-4 h-4 accent-[#F0B323]"
                />
                {section.enabled ? "ظاهر" : "موقوف"}
              </label>
              <div className="ms-auto flex items-center gap-1">
                <button type="button" title="لأعلى" onClick={() => setSections((p) => move(p, sectionIndex, -1))} className="p-2 rounded-full hover:bg-card-3 text-fg-3">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" title="لأسفل" onClick={() => setSections((p) => move(p, sectionIndex, 1))} className="p-2 rounded-full hover:bg-card-3 text-fg-3">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button type="button" title="حذف القسم" onClick={() => removeSection(section.id)} className="p-2 rounded-full text-t-red hover:bg-t-red/15">
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

            {/* Items */}
            <div className="space-y-4">
              {section.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 space-y-3 bg-card ${item.enabled ? "border-line" : "border-line opacity-60"}`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Preview item={item} />
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(section.id, item.id, { type: e.target.value as MediaType })}
                          className={`${inputClass} w-auto`}
                        >
                          <option value="image">صورة</option>
                          <option value="video">فيديو</option>
                        </select>
                        <button
                          type="button"
                          disabled={busy === item.id}
                          onClick={() =>
                            pickFile(
                              section.id,
                              item.id,
                              "url",
                              item.type === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/gif"
                            )
                          }
                          className="px-4 py-2 rounded-full bg-gold text-on-gold text-xs font-black flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {busy === item.id ? "جاري الرفع..." : item.type === "video" ? "رفع فيديو" : "رفع صورة"}
                        </button>
                        <label className="flex items-center gap-1.5 text-xs text-fg-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => updateItem(section.id, item.id, { enabled: e.target.checked })}
                            className="w-4 h-4 accent-[#F0B323]"
                          />
                          {item.enabled ? "ظاهر" : "موقوف"}
                        </label>
                        <div className="ms-auto flex items-center gap-1">
                          <button type="button" title="لأعلى" onClick={() => moveItem(section.id, index, -1)} className="p-1.5 rounded-full hover:bg-card-3 text-fg-3">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="لأسفل" onClick={() => moveItem(section.id, index, 1)} className="p-1.5 rounded-full hover:bg-card-3 text-fg-3">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="حذف" onClick={() => removeItem(section.id, item.id)} className="p-1.5 rounded-full text-t-red hover:bg-t-red/15">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        value={item.url}
                        onChange={(e) => updateItem(section.id, item.id, { url: e.target.value })}
                        placeholder={item.type === "video" ? "أو الصق رابط الفيديو (يوتيوب / Vimeo / mp4)" : "أو الصق رابط الصورة"}
                        className={`${inputClass} text-xs font-mono`}
                        dir="ltr"
                      />
                      {item.type === "video" && (
                        <div className="flex gap-2">
                          <input
                            value={item.poster}
                            onChange={(e) => updateItem(section.id, item.id, { poster: e.target.value })}
                            placeholder="(اختياري) صورة الغلاف للفيديو المباشر"
                            className={`${inputClass} text-xs font-mono`}
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={() => pickFile(section.id, item.id, "poster", "image/jpeg,image/png,image/webp")}
                            className="px-3 rounded-xl bg-card-3 text-xs font-bold text-fg-2 hover:bg-gold hover:text-on-gold transition-colors shrink-0"
                          >
                            رفع
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={item.title} onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })} placeholder="العنوان (عربي) – اتركه فاضي لو عايز بدون كلام" className={inputClass} />
                    <input value={item.titleEn} onChange={(e) => updateItem(section.id, item.id, { titleEn: e.target.value })} placeholder="Title (English)" className={inputClass} dir="ltr" />
                    <textarea value={item.text} onChange={(e) => updateItem(section.id, item.id, { text: e.target.value })} placeholder="الكلام المكتوب على الصورة (عربي)" rows={2} className={inputClass} />
                    <textarea value={item.textEn} onChange={(e) => updateItem(section.id, item.id, { textEn: e.target.value })} placeholder="Text on the image (English)" rows={2} className={inputClass} dir="ltr" />
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => addItem(section.id, "image")} className="px-4 py-2 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-xs font-bold flex items-center gap-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  إضافة صورة
                </button>
                <button type="button" onClick={() => addItem(section.id, "video")} className="px-4 py-2 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-xs font-bold flex items-center gap-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  إضافة فيديو
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between pt-2">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSections((p) => [...p, emptySection()])}
            className="px-5 py-2 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة قسم جديد
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("استرجاع الأقسام والصور الافتراضية؟ (لن يُحفظ إلا بعد الضغط على حفظ)")) {
                setSections(sanitizeShowcase(defaults).sections);
              }
            }}
            className="px-5 py-2 rounded-full border border-line-2 text-fg-3 hover:text-fg text-sm font-bold transition-colors"
          >
            استرجاع الافتراضي
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSave(sanitizeShowcase({ sections }))}
          className="btn-gold-sweep px-8 py-2.5 rounded-full bg-gold text-on-gold font-black text-sm flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>حفظ الأقسام</span>
        </button>
      </div>
    </div>
  );
};
