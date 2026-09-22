"use client";

import React, { useEffect, useRef, useState } from "react";
import { Save, Upload, RotateCcw } from "lucide-react";
import { EMPTY_SITE_MEDIA, SiteMedia, sanitizeSiteMedia } from "@/lib/site-content";
import { IMAGE_ACCEPT, VIDEO_ACCEPT, uploadFile } from "@/lib/media-upload";

interface Props {
  value?: Partial<SiteMedia> | null;
  onSave: (data: SiteMedia) => void;
}

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-ink border border-line text-sm text-fg placeholder:text-fg-5 focus:outline-none focus:border-gold";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-fg-3">{label}</label>
    {children}
  </div>
);

/**
 * Replace the fixed images / hero video / captions of the site (hero, about, contact)
 * without editing code. Leave a field empty to keep the built-in default.
 */
export const SiteMediaEditor: React.FC<Props> = ({ value, onSave }) => {
  const [data, setData] = useState<SiteMedia>(() => sanitizeSiteMedia(value));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const target = useRef<keyof SiteMedia | null>(null);

  useEffect(() => {
    if (value) setData(sanitizeSiteMedia(value));
  }, [value]);

  const set = (key: keyof SiteMedia, v: string) => setData((prev) => ({ ...prev, [key]: v }));

  const pick = (key: keyof SiteMedia, accept: string) => {
    target.current = key;
    if (fileInput.current) {
      fileInput.current.accept = accept;
      fileInput.current.value = "";
      fileInput.current.click();
    }
  };

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = target.current;
    if (!file || !key) return;
    setError("");
    setBusy(key);
    try {
      const url = await uploadFile(file);
      set(key, url);
    } catch (err: any) {
      setError(err.message || "فشل رفع الملف");
    } finally {
      setBusy(null);
    }
  };

  const UploadBtn: React.FC<{ k: keyof SiteMedia; accept: string; label: string }> = ({ k, accept, label }) => (
    <button type="button" disabled={busy === k} onClick={() => pick(k, accept)} className="px-3 py-2 rounded-xl bg-card-3 hover:bg-gold hover:text-on-gold text-xs font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-50">
      <Upload className="w-3.5 h-3.5" />
      {busy === k ? "جاري الرفع..." : label}
    </button>
  );

  return (
    <div className="p-8 rounded-3xl bg-card border border-fg/5 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gold-text">صور وفيديو ونصوص الواجهة الرئيسية والأقسام الثابتة</h3>
        <p className="text-sm text-fg-3 mt-1 leading-relaxed">
          استبدال فيديو وصور الهيرو، وصورة قسم «من نحن»، وصورة قسم التواصل، والعناوين المكتوبة عليها. اترك أي حقل فاضي
          عشان يفضل الافتراضي.
        </p>
      </div>

      <input type="file" ref={fileInput} onChange={onFileChosen} className="hidden" />
      {error && <div className="p-3 rounded-xl bg-t-red/10 border border-t-red/40 text-sm text-t-red">{error}</div>}

      {/* Hero */}
      <div className="rounded-2xl border border-line p-5 space-y-4">
        <h4 className="text-sm font-black text-gold-text">الواجهة الرئيسية (الهيرو)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="فيديو الهيرو (كمبيوتر / شاشات عريضة)">
            <div className="flex gap-2">
              <input value={data.heroWideVideo} onChange={(e) => set("heroWideVideo", e.target.value)} placeholder="رابط فيديو مباشر (mp4) — أو ارفع" className={`${inputClass} text-xs font-mono`} dir="ltr" />
              <UploadBtn k="heroWideVideo" accept={VIDEO_ACCEPT} label="رفع" />
            </div>
          </Field>
          <Field label="فيديو الهيرو (موبايل / وضع طولي)">
            <div className="flex gap-2">
              <input value={data.heroPortraitVideo} onChange={(e) => set("heroPortraitVideo", e.target.value)} placeholder="رابط فيديو مباشر (mp4) — أو ارفع" className={`${inputClass} text-xs font-mono`} dir="ltr" />
              <UploadBtn k="heroPortraitVideo" accept={VIDEO_ACCEPT} label="رفع" />
            </div>
          </Field>
          <Field label="صورة غلاف الفيديو (كمبيوتر)">
            <div className="flex gap-2">
              <input value={data.heroWidePoster} onChange={(e) => set("heroWidePoster", e.target.value)} placeholder="رابط صورة" className={`${inputClass} text-xs font-mono`} dir="ltr" />
              <UploadBtn k="heroWidePoster" accept={IMAGE_ACCEPT} label="رفع" />
            </div>
          </Field>
          <Field label="صورة غلاف الفيديو (موبايل)">
            <div className="flex gap-2">
              <input value={data.heroPortraitPoster} onChange={(e) => set("heroPortraitPoster", e.target.value)} placeholder="رابط صورة" className={`${inputClass} text-xs font-mono`} dir="ltr" />
              <UploadBtn k="heroPortraitPoster" accept={IMAGE_ACCEPT} label="رفع" />
            </div>
          </Field>
          <Field label="عنوان الهيرو (عربي)"><input value={data.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} className={inputClass} /></Field>
          <Field label="Hero title (English)"><input value={data.heroTitleEn} onChange={(e) => set("heroTitleEn", e.target.value)} className={inputClass} dir="ltr" /></Field>
          <Field label="نص الهيرو الفرعي (عربي)"><textarea value={data.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} rows={2} className={inputClass} /></Field>
          <Field label="Hero subtitle (English)"><textarea value={data.heroSubtitleEn} onChange={(e) => set("heroSubtitleEn", e.target.value)} rows={2} className={inputClass} dir="ltr" /></Field>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-line p-5 space-y-4">
        <h4 className="text-sm font-black text-gold-text">قسم «من نحن»</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="صورة القسم">
            <div className="flex gap-2">
              <input value={data.aboutImage} onChange={(e) => set("aboutImage", e.target.value)} placeholder="رابط صورة" className={`${inputClass} text-xs font-mono`} dir="ltr" />
              <UploadBtn k="aboutImage" accept={IMAGE_ACCEPT} label="رفع" />
            </div>
          </Field>
          <div />
          <Field label="التسمية الصغيرة فوق العنوان (عربي)"><input value={data.aboutImageLabel} onChange={(e) => set("aboutImageLabel", e.target.value)} className={inputClass} /></Field>
          <Field label="Small label (English)"><input value={data.aboutImageLabelEn} onChange={(e) => set("aboutImageLabelEn", e.target.value)} className={inputClass} dir="ltr" /></Field>
          <Field label="العنوان على الصورة (عربي)"><input value={data.aboutImageTitle} onChange={(e) => set("aboutImageTitle", e.target.value)} className={inputClass} /></Field>
          <Field label="Title on image (English)"><input value={data.aboutImageTitleEn} onChange={(e) => set("aboutImageTitleEn", e.target.value)} className={inputClass} dir="ltr" /></Field>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-line p-5 space-y-4">
        <h4 className="text-sm font-black text-gold-text">قسم التواصل</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="صورة القسم">
            <div className="flex gap-2">
              <input value={data.contactImage} onChange={(e) => set("contactImage", e.target.value)} placeholder="رابط صورة" className={`${inputClass} text-xs font-mono`} dir="ltr" />
              <UploadBtn k="contactImage" accept={IMAGE_ACCEPT} label="رفع" />
            </div>
          </Field>
          <div />
          <Field label="الكلام المكتوب على الصورة (عربي)"><input value={data.contactImageCaption} onChange={(e) => set("contactImageCaption", e.target.value)} className={inputClass} /></Field>
          <Field label="Caption on image (English)"><input value={data.contactImageCaptionEn} onChange={(e) => set("contactImageCaptionEn", e.target.value)} className={inputClass} dir="ltr" /></Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between pt-2 border-t border-fg/5">
        <button type="button" onClick={() => confirm("استرجاع كل الحقول للوضع الافتراضي؟") && setData(EMPTY_SITE_MEDIA)} className="px-5 py-2 rounded-full border border-line-2 text-fg-3 hover:text-fg text-sm font-bold transition-colors flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> استرجاع الافتراضي
        </button>
        <button type="button" onClick={() => onSave(sanitizeSiteMedia(data))} className="btn-gold-sweep px-8 py-2.5 rounded-full bg-gold text-on-gold font-black text-sm flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>حفظ</span>
        </button>
      </div>
    </div>
  );
};
