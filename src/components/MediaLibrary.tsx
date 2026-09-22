"use client";

import React, { useEffect, useState } from "react";
import { Trash2, RefreshCw, Copy, ImageIcon, Film } from "lucide-react";
import { formatBytes } from "@/lib/media-upload";

interface MediaFile {
  id: number;
  url: string;
  mime: string;
  size: number;
  createdAt?: string;
}

/** Admin only: shows every uploaded image / video, its size, and lets you delete it permanently. */
export const MediaLibrary: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setFiles(d.files);
        else setError(d.error || "تعذر تحميل الملفات");
      })
      .catch(() => setError("تعذر تحميل الملفات"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id: number) => {
    if (!confirm("حذف هذا الملف نهائياً؟ (لو مستخدم في قسم، هيختفي من هناك كمان)")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (d.ok) setFiles((prev) => prev.filter((f) => f.id !== id));
    else alert(d.error || "فشل الحذف");
  };

  const copy = (url: string) => {
    navigator.clipboard?.writeText(window.location.origin + url).catch(() => {});
  };

  return (
    <div className="p-8 rounded-3xl bg-card border border-fg/5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gold-text">مكتبة الملفات المرفوعة</h3>
          <p className="text-sm text-fg-3 mt-1">كل الصور والفيديوهات اللي اترفعت من لوحة التحكم لأي قسم في الموقع.</p>
        </div>
        <button onClick={load} className="p-2 rounded-full hover:bg-card-3 text-fg-3" title="تحديث">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-t-red/10 border border-t-red/40 text-sm text-t-red">{error}</div>}
      {loading && <p className="text-sm text-fg-4 text-center py-6">جاري التحميل...</p>}
      {!loading && files.length === 0 && <p className="text-sm text-fg-4 text-center py-6">لا توجد ملفات مرفوعة بعد.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {files.map((f) => (
          <div key={f.id} className="rounded-2xl border border-line overflow-hidden bg-ink">
            <div className="aspect-video bg-card-3 flex items-center justify-center overflow-hidden">
              {f.mime.startsWith("video/") ? (
                <video src={f.url} muted preload="metadata" className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-fg-3">
                {f.mime.startsWith("video/") ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                <span className="truncate">{f.mime}</span>
              </div>
              <div className="text-[11px] text-fg-4">{formatBytes(f.size)}</div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => copy(f.url)} className="flex-1 px-2 py-1 rounded-lg bg-card-3 hover:bg-gold hover:text-on-gold text-[11px] font-bold flex items-center justify-center gap-1">
                  <Copy className="w-3 h-3" /> نسخ الرابط
                </button>
                <button onClick={() => remove(f.id)} className="px-2 py-1 rounded-lg text-t-red hover:bg-t-red/15">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
