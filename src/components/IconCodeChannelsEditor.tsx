"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import {
  Channel,
  ChannelLink,
  DEFAULT_ICONCODE,
  ICON_OPTIONS,
  IconCodeSettings,
  emptyLink,
  getIconOption,
  linkHref,
  newChannel,
  sanitizeIconCode,
} from "@/lib/iconcode";
import { ChannelIcon } from "./ChannelIcon";

interface EditorProps {
  value?: IconCodeSettings | null;
  onSave: (data: IconCodeSettings) => void;
}

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-ink border border-line text-sm text-fg placeholder:text-fg-5 focus:outline-none focus:border-gold";

/** Admin editor for the Icon Code contact channels shown in the site credit. */
export const IconCodeChannelsEditor: React.FC<EditorProps> = ({ value, onSave }) => {
  const [channels, setChannels] = useState<Channel[]>(() =>
    sanitizeIconCode(value || DEFAULT_ICONCODE).channels
  );
  const [newIcon, setNewIcon] = useState("link");

  // The settings arrive asynchronously from the API
  useEffect(() => {
    if (value && Array.isArray(value.channels)) {
      setChannels(sanitizeIconCode(value).channels);
    }
  }, [value]);

  const updateChannel = (id: string, patch: Partial<Channel>) =>
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const updateLink = (channelId: string, linkId: string, patch: Partial<ChannelLink>) =>
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId ? { ...c, links: c.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)) } : c
      )
    );

  const removeChannel = (id: string) => {
    if (!confirm("حذف قناة التواصل بالكامل مع كل روابطها؟")) return;
    setChannels((prev) => prev.filter((c) => c.id !== id));
  };

  const removeLink = (channelId: string, linkId: string) =>
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, links: c.links.filter((l) => l.id !== linkId) } : c))
    );

  const addLink = (channelId: string) =>
    setChannels((prev) => prev.map((c) => (c.id === channelId ? { ...c, links: [...c.links, emptyLink()] } : c)));

  const addChannel = () => setChannels((prev) => [...prev, newChannel(newIcon)]);

  const changeIcon = (channel: Channel, icon: string) => {
    const previousDefault = getIconOption(channel.icon).labelAr;
    updateChannel(channel.id, {
      icon,
      // keep a custom name, but follow the icon name when it was still the default one
      label: channel.label === previousDefault ? getIconOption(icon).labelAr : channel.label,
    });
  };

  return (
    <div className="p-8 rounded-3xl bg-card border border-fg/5 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gold-text">قنوات التواصل – شركة Icon Code (أسفل الموقع)</h3>
        <p className="text-sm text-fg-3 mt-1 leading-relaxed">
          أضف أو عدّل أو أوقف أو احذف أيقونات التواصل. كل أيقونة ممكن يكون لها رابط واحد أو أكتر. الأرقام بتفتح لوحة
          الاتصال مباشرة، وواتساب بيفتح المحادثة. أي قناة بدون رابط مكتوب أو موقوفة مش بتظهر للزوار.
        </p>
      </div>

      <div className="space-y-4">
        {channels.length === 0 && (
          <p className="text-sm text-fg-4 text-center py-6">لا توجد قنوات. أضف قناة جديدة من الأسفل.</p>
        )}

        {channels.map((channel) => {
          const option = getIconOption(channel.icon);
          return (
            <div
              key={channel.id}
              data-accent={option.accent}
              className={`rounded-2xl border p-5 space-y-4 transition-opacity ${
                channel.enabled ? "bg-ink border-accent/30" : "bg-ink border-line opacity-60"
              }`}
            >
              {/* Channel header */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-11 h-11 shrink-0 rounded-full bg-accent/15 border border-accent/40 text-accent-text flex items-center justify-center">
                  <ChannelIcon icon={channel.icon} imageUrl={channel.imageUrl} />
                </span>

                <input
                  value={channel.label}
                  onChange={(e) => updateChannel(channel.id, { label: e.target.value })}
                  placeholder="اسم القناة"
                  className={`${inputClass} flex-1 min-w-[140px] font-bold`}
                />

                <select
                  value={channel.icon}
                  onChange={(e) => changeIcon(channel, e.target.value)}
                  className={`${inputClass} w-auto`}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.labelAr}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-xs text-fg-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={channel.enabled}
                    onChange={(e) => updateChannel(channel.id, { enabled: e.target.checked })}
                    className="w-4 h-4 accent-[#F0B323]"
                  />
                  {channel.enabled ? "مفعّلة" : "موقوفة"}
                </label>

                <button
                  type="button"
                  onClick={() => removeChannel(channel.id)}
                  className="p-2 rounded-full text-t-red hover:bg-t-red/15 transition-colors"
                  title="حذف القناة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Optional custom icon image */}
              <input
                value={channel.imageUrl || ""}
                onChange={(e) => updateChannel(channel.id, { imageUrl: e.target.value })}
                placeholder="(اختياري) رابط صورة أيقونة مخصصة بدل الأيقونة الجاهزة، مثال: /images/my-icon.png"
                className={`${inputClass} text-xs`}
                dir="ltr"
              />

              {/* Links */}
              <div className="space-y-2">
                {channel.links.map((link, index) => {
                  const href = linkHref(option.kind, link.value);
                  return (
                    <div key={link.id} className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-fg-5 w-5 text-center">{index + 1}</span>
                        <input
                          value={link.label}
                          onChange={(e) => updateLink(channel.id, link.id, { label: e.target.value })}
                          placeholder="عنوان (اختياري) مثل: المبيعات"
                          className={`${inputClass} w-40`}
                        />
                        <input
                          value={link.value}
                          onChange={(e) => updateLink(channel.id, link.id, { value: e.target.value })}
                          placeholder={option.placeholderAr}
                          className={`${inputClass} flex-1 min-w-[180px] font-mono`}
                          dir="ltr"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-fg-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={(e) => updateLink(channel.id, link.id, { enabled: e.target.checked })}
                            className="w-4 h-4 accent-[#F0B323]"
                          />
                          {link.enabled ? "مفعّل" : "موقوف"}
                        </label>
                        <button
                          type="button"
                          onClick={() => removeLink(channel.id, link.id)}
                          className="p-1.5 rounded-full text-t-red hover:bg-t-red/15 transition-colors"
                          title="حذف الرابط"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {link.value.trim() && (
                        <p className="ps-7 text-[11px] font-mono truncate" dir="ltr">
                          {href ? (
                            <span className="text-t-green">→ {href}</span>
                          ) : (
                            <span className="text-t-red">رابط أو رقم غير صالح</span>
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => addLink(channel.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-text hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة رابط آخر لنفس الأيقونة
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add a new channel */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-dashed border-line-2">
        <span className="text-sm font-bold text-fg-2">أيقونة تواصل جديدة:</span>
        <select value={newIcon} onChange={(e) => setNewIcon(e.target.value)} className={`${inputClass} w-auto`}>
          {ICON_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.labelAr}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addChannel}
          className="px-5 py-2 rounded-full bg-card-3 hover:bg-gold hover:text-on-gold text-fg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة
        </button>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onSave(sanitizeIconCode({ channels }))}
          className="btn-gold-sweep px-8 py-2.5 rounded-full bg-gold text-on-gold font-black text-sm flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>حفظ قنوات التواصل</span>
        </button>
      </div>
    </div>
  );
};
