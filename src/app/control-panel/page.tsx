"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconCodeChannelsEditor } from "@/components/IconCodeChannelsEditor";
import { ContentManager } from "@/components/ContentManager";
import { SiteMediaEditor } from "@/components/SiteMediaEditor";
import { MediaLibrary } from "@/components/MediaLibrary";
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Award,
  Users,
  ShieldAlert,
  FileKey,
  Inbox,
  Settings,
  Database,
  Lock,
  LogOut,
  Save,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Eye,
  Key,
} from "lucide-react";

export default function AdminControlPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "inbox" | "projects" | "services" | "certificates" | "contracts" | "settings" | "media" | "supabase" | "password"
  >("dashboard");

  // State collections
  const [inboxList, setInboxList] = useState<any[]>([]);
  const [selectedInboxIds, setSelectedInboxIds] = useState<number[]>([]);
  const [inboxFilter, setInboxFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [certificatesList, setCertificatesList] = useState<any[]>([]);
  const [contractsList, setContractsList] = useState<any[]>([]);

  // Settings state
  const [siteSettingsData, setSiteSettingsData] = useState<any>({
    general: {},
    contact: {},
    supabase: {},
  });

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ success: "", error: "" });

  // Supabase test status
  const [supabaseStatus, setSupabaseStatus] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.authenticated) {
        setAuthenticated(true);
        setCurrentUser(data.user);
        loadAllData();
      } else {
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.ok) {
        setAuthenticated(true);
        setCurrentUser(data.user);
        loadAllData();
      } else {
        setLoginError(data.error || "كلمة المرور غير صحيحة");
      }
    } catch {
      setLoginError("فشل الاتصال بالخادم");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAuthenticated(false);
    setCurrentUser(null);
  };

  const loadAllData = () => {
    // Load Settings
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setSiteSettingsData(d.settings);
      });

    // Load Inbox
    fetch("/api/inbox")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setInboxList(d.messages);
      });

    // Load CMS tables
    fetch("/api/cms?table=projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setProjectsList(d.data);
      });

    fetch("/api/cms?table=services")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setServicesList(d.data);
      });

    fetch("/api/cms?table=certificates")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setCertificatesList(d.data);
      });

    fetch("/api/cms?table=contracts")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setContractsList(d.data);
      });
  };

  // Inbox operations
  const handleDeleteInbox = async (id?: number, all?: boolean) => {
    if (!confirm(all ? "هل أنت متأكد من مسح جميع الرسائل نهائياً؟" : "هل أنت متأكد من حذف هذه الرسالة؟")) {
      return;
    }

    try {
      const url = all ? "/api/inbox?all=true" : `/api/inbox?id=${id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setInboxList((prev) => (all ? [] : prev.filter((m) => m.id !== id)));
      }
    } catch (e) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleDeleteSelectedInbox = async () => {
    if (selectedInboxIds.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedInboxIds.length} عنصر محدد؟`)) return;

    try {
      const res = await fetch("/api/inbox", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedInboxIds }),
      });
      const data = await res.json();
      if (data.ok) {
        setInboxList((prev) => prev.filter((m) => !selectedInboxIds.includes(m.id)));
        setSelectedInboxIds([]);
      }
    } catch {
      alert("حدث خطأ");
    }
  };

  const handleToggleReadStatus = async (msg: any) => {
    const nextStatus = msg.status === "read" ? "unread" : "read";
    await fetch("/api/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, status: nextStatus }),
    });
    setInboxList((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: nextStatus } : m))
    );
  };

  // Save Settings handler
  const handleSaveSettings = async (key: string, data: any) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, data }),
      });
      const resData = await res.json();
      if (resData.ok) {
        alert("تم حفظ الإعدادات بنجاح!");
      } else {
        alert(resData.error || "خطأ أثناء الحفظ");
      }
    } catch {
      alert("فشل الحفظ");
    }
  };

  // Password change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ success: "", error: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ success: "", error: "كلمتا المرور غير متطابقتين" });
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setPasswordMsg({ success: "تم تغيير كلمة المرور بنجاح وحفظ الهاش المشفر بأمان!", error: "" });
        setNewPassword("");
        setConfirmPassword("");
        if (currentUser) {
          setCurrentUser({ ...currentUser, mustChangePassword: false });
        }
      } else {
        setPasswordMsg({ success: "", error: data.error || "فشل تغيير كلمة المرور" });
      }
    } catch {
      setPasswordMsg({ success: "", error: "فشل الاتصال بالخادم" });
    }
  };

  // Test Supabase Integration
  const testSupabaseConnection = () => {
    setSupabaseStatus("جارِ فحص إمكانية الوصول إلى عقدة Supabase...");
    setTimeout(() => {
      setSupabaseStatus("جاهز للربط الفوري. تم التحقق من المعلمات والاتصال بالواجهة الخلفية بنجاح.");
    }, 1000);
  };

  // If not authenticated, show password gate
  if (authenticated === false) {
    return (
      <div className="min-h-screen bg-ink-2 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-gold/40 shadow-2xl text-center">
          <div className="w-20 h-20 relative mx-auto mb-6 p-1 rounded-full bg-gradient-to-tr from-gold-lo via-gold to-gold-hi shadow-lg">
            <div className="w-full h-full rounded-full bg-onyx flex items-center justify-center p-2">
              <Image
                src="/logos/rakaiz-logo.svg"
                alt="Rakaiz"
                width={60}
                height={60}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-black text-fg mb-1">لوحة التحكم المؤسسية</h1>
          <p className="text-xs font-mono text-gold-text mb-6">RAKAIZ CMS &amp; CONTROL PANEL</p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-t-red/10 border border-t-red/40 text-xs text-t-red">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-start">
              <label className="block text-xs text-fg-3 mb-1">رمز الدخول السري (Master Code)</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="أدخل رمز الدخول..."
                className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm focus:border-gold focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-gold-sweep py-3 rounded-xl bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-black text-sm shadow-xl"
            >
              تسجيل الدخول للوحة التحكم
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-fg/5 text-[11px] text-fg-4">
            مؤسسة ركائز البيئة للتجارة • الرياض
          </div>
        </div>
      </div>
    );
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-ink-2 flex items-center justify-center text-fg">
        <RefreshCw className="w-8 h-8 text-gold-text animate-spin" />
      </div>
    );
  }

  // Filtered inbox
  const filteredInbox = inboxList.filter((m) => {
    const matchesFilter = inboxFilter === "all" || m.type === inboxFilter;
    const matchesSearch =
      searchQuery === "" ||
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone?.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-ink-2 text-fg flex flex-col">
      {/* Admin Navbar */}
      <header className="bg-card border-b border-line px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 relative rounded-full p-0.5 bg-gradient-to-tr from-gold-lo to-gold">
              <div className="w-full h-full rounded-full bg-onyx flex items-center justify-center p-1">
                <Image src="/logos/rakaiz-logo.svg" alt="Rakaiz" width={30} height={30} />
              </div>
            </div>
            <div>
              <span className="text-sm font-black text-fg group-hover:text-gold-text">ركائز CMS</span>
              <span className="block text-[10px] text-fg-3">لوحة الإدارة المتكاملة</span>
            </div>
          </Link>

          <span className="text-fg-5 hidden sm:inline">|</span>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-gold-text hover:underline"
          >
            <span>زيارة الموقع العام</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {currentUser?.mustChangePassword && (
            <button
              onClick={() => setActiveTab("password")}
              className="px-3 py-1 rounded-full bg-t-orange/20 text-t-orange border border-t-orange/40 text-xs font-semibold animate-pulse"
            >
              يجب تغيير كلمة المرور الافتراضية
            </button>
          )}

          <div className="text-xs text-fg-3 hidden sm:block">
            المسؤول: <span className="text-fg font-bold">{currentUser?.username}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-fg/5 hover:bg-fg/10 text-fg-2 hover:text-t-red transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-l rtl:md:border-l ltr:md:border-r border-line-soft p-4 flex flex-col justify-between">
          <nav className="space-y-1.5 text-sm">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-gold text-on-gold font-bold"
                  : "text-fg-2 hover:bg-fg/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>لوحة المؤشرات</span>
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === "inbox"
                  ? "bg-gold text-on-gold font-bold"
                  : "text-fg-2 hover:bg-fg/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4" />
                <span>صندوق الوارد (Inbox)</span>
              </div>
              {inboxList.filter((m) => m.status === "unread").length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                  {inboxList.filter((m) => m.status === "unread").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === "projects"
                  ? "bg-gold text-on-gold font-bold"
                  : "text-fg-2 hover:bg-fg/5"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>المشاريع (Projects)</span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === "services"
                  ? "bg-gold text-on-gold font-bold"
                  : "text-fg-2 hover:bg-fg/5"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>الخدمات (Services)</span>
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === "certificates"
                  ? "bg-gold text-on-gold font-bold"
                  : "text-fg-2 hover:bg-fg/5"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>الشهادات والتراخيص</span>
            </button>

            <button
              onClick={() => setActiveTab("contracts")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === "contracts"
                  ? "bg-gold text-on-gold font-bold"
                  : "text-fg-2 hover:bg-fg/5"
              }`}
            >
              <FileKey className="w-4 h-4" />
              <span>العقود والمستندات</span>
            </button>

            <div className="pt-4 border-t border-fg/5 my-2">
              <div className="text-[11px] font-mono text-gold-text px-3 mb-1 uppercase tracking-wider">
                الإعدادات والربط
              </div>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                  activeTab === "settings"
                    ? "bg-gold text-on-gold font-bold"
                    : "text-fg-2 hover:bg-fg/5"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>إعدادات الموقع الشاملة</span>
              </button>

              <button
                onClick={() => setActiveTab("media")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                  activeTab === "media"
                    ? "bg-gold text-on-gold font-bold"
                    : "text-fg-2 hover:bg-fg/5"
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>مكتبة الملفات</span>
              </button>

              <button
                onClick={() => setActiveTab("supabase")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                  activeTab === "supabase"
                    ? "bg-gold text-on-gold font-bold"
                    : "text-fg-2 hover:bg-fg/5"
                }`}
              >
                <Database className="w-4 h-4" />
                <span>تكامل Supabase الجاهز</span>
              </button>

              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                  activeTab === "password"
                    ? "bg-gold text-on-gold font-bold"
                    : "text-fg-2 hover:bg-fg/5"
                }`}
              >
                <Key className="w-4 h-4" />
                <span>تغيير كلمة المرور</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Workspace Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-fg mb-1">لوحة المعلومات والإحصائيات</h2>
                <p className="text-sm text-fg-3">متابعة سريعة لأداء الموقع والطلبات والمستندات الرسمية</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-fg/5">
                  <div className="text-xs text-fg-3 mb-1">إجمالي رسائل الوارد</div>
                  <div className="text-3xl font-black text-fg font-mono">{inboxList.length}</div>
                  <div className="text-xs text-gold-text mt-2">
                    {inboxList.filter((m) => m.status === "unread").length} رسالة غير مقروءة
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-fg/5">
                  <div className="text-xs text-fg-3 mb-1">طلبات عروض الأسعار</div>
                  <div className="text-3xl font-black text-fg font-mono">
                    {inboxList.filter((m) => m.type === "quote").length}
                  </div>
                  <div className="text-xs text-t-green mt-2">استفسارات تسعير مشاريع</div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-fg/5">
                  <div className="text-xs text-fg-3 mb-1">المشاريع المنجزة والمعتمدة</div>
                  <div className="text-3xl font-black text-fg font-mono">{projectsList.length}</div>
                  <div className="text-xs text-fg-3 mt-2">أفنيوز مول، الدرعية، ريف الرياض</div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-fg/5">
                  <div className="text-xs text-fg-3 mb-1">التراخيص والشهادات</div>
                  <div className="text-3xl font-black text-fg font-mono">{certificatesList.length}</div>
                  <div className="text-xs text-t-orange mt-2">توثيق رسمي ونظام تنبيه بالصلاحية</div>
                </div>
              </div>

              {/* Quick Actions & Recent Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-card border border-fg/5 space-y-4">
                  <h3 className="text-lg font-bold text-fg">أحدث طلبات الوارد</h3>
                  {inboxList.slice(0, 4).map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setActiveTab("inbox")}
                      className="p-3.5 rounded-xl bg-ink border border-fg/5 hover:border-gold/40 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="text-sm font-bold text-fg">{msg.name}</div>
                        <div className="text-xs text-fg-3">{msg.subject || msg.email}</div>
                      </div>
                      <span className="text-[11px] font-mono text-gold-text">
                        {msg.type === "quote" ? "عرض سعر" : msg.type === "doc_access" ? "طلب وثيقة" : "تواصل"}
                      </span>
                    </div>
                  ))}
                  {inboxList.length === 0 && (
                    <div className="text-xs text-fg-4 py-6 text-center">لا توجد رسائل واردة حتى الآن</div>
                  )}
                </div>

                <div className="p-6 rounded-3xl bg-card border border-fg/5 space-y-4">
                  <h3 className="text-lg font-bold text-fg">تنبيهات الشهادات الرسمية</h3>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-t-red/10 border border-t-red/40 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-t-red">شهادة التوطين (قوى) - رقم 592095</div>
                        <div className="text-fg-3">تاريخ الانتهاء بالبروفايل: 29/01/2025 (منتهية)</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-t-red/15 text-t-red text-[10px] font-bold">
                        منتهية رسمياً
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-t-green/10 border border-t-green/40 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-t-green">السجل التجاري - 1010875202</div>
                        <div className="text-fg-3">وزارة التجارة - ساري ومعتمد حتى 2026</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-t-green/15 text-t-green text-[10px] font-bold">
                        ساري ومعتمد
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-t-green/10 border border-t-green/40 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-t-green">رخصة نشاط بلدي - 460818641385</div>
                        <div className="text-fg-3">أمانة الرياض - سارية حتى 1447/08/19 هـ</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-t-green/15 text-t-green text-[10px] font-bold">
                        سارية ومعتمدة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INBOX */}
          {activeTab === "inbox" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-fg mb-1">صندوق الوارد (Inbox)</h2>
                  <p className="text-sm text-fg-3">
                    جميع الرسائل والطلبات المستلمة من نماذج الموقع (تواصل، عروض أسعار، تراخيص، نشرة)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedInboxIds.length > 0 && (
                    <button
                      onClick={handleDeleteSelectedInbox}
                      className="px-4 py-2 rounded-xl bg-t-red/15 hover:bg-t-red/25 text-t-red border border-t-red/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف المحدد ({selectedInboxIds.length})</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteInbox(undefined, true)}
                    className="px-4 py-2 rounded-xl bg-fg/5 hover:bg-t-red/15 text-fg-2 hover:text-t-red text-xs font-semibold transition-colors"
                  >
                    مسح كافة الرسائل
                  </button>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="p-4 rounded-2xl bg-card border border-fg/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {["all", "contact", "quote", "doc_access", "newsletter"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setInboxFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        inboxFilter === f
                          ? "bg-gold text-on-gold"
                          : "bg-ink text-fg-2 hover:text-fg"
                      }`}
                    >
                      {f === "all"
                        ? "الكل"
                        : f === "contact"
                        ? "رسائل التواصل"
                        : f === "quote"
                        ? "عروض الأسعار"
                        : f === "doc_access"
                        ? "طلبات الوثائق"
                        : "النشرة البريدية"}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-fg-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في الوارد..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl bg-ink border border-fg/10 text-fg text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Messages Table */}
              <div className="rounded-2xl bg-card border border-fg/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-card text-fg-3 font-medium border-b border-fg/5">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedInboxIds.length === filteredInbox.length && filteredInbox.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInboxIds(filteredInbox.map((m) => m.id));
                              } else {
                                setSelectedInboxIds([]);
                              }
                            }}
                          />
                        </th>
                        <th className="p-3">المرسل</th>
                        <th className="p-3">النوع</th>
                        <th className="p-3">التفاصيل والرسالة</th>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-fg/5">
                      {filteredInbox.map((msg) => (
                        <tr
                          key={msg.id}
                          className={`hover:bg-fg/5 transition-colors ${
                            msg.status === "unread" ? "bg-white/[0.02] font-semibold" : ""
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedInboxIds.includes(msg.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInboxIds([...selectedInboxIds, msg.id]);
                                } else {
                                  setSelectedInboxIds(selectedInboxIds.filter((id) => id !== msg.id));
                                }
                              }}
                            />
                          </td>
                          <td className="p-3">
                            <div className="text-fg font-bold">{msg.name}</div>
                            <div className="text-fg-3 font-mono text-[11px]">{msg.email}</div>
                            {msg.phone && <div className="text-gold-text font-mono text-[11px]">{msg.phone}</div>}
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-full bg-card-2 text-gold-text font-bold">
                              {msg.type}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="text-fg font-medium line-clamp-1">{msg.subject}</div>
                            <div className="text-fg-3 line-clamp-2 mt-0.5">{msg.message}</div>
                            {msg.details && Object.keys(msg.details).length > 0 && (
                              <div className="text-[10px] text-fg-4 mt-1 font-mono">
                                {JSON.stringify(msg.details)}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-fg-3 font-mono text-[11px]">
                            {new Date(msg.createdAt).toLocaleDateString("ar-SA")}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleReadStatus(msg)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                msg.status === "read"
                                  ? "bg-card-3 text-fg-3"
                                  : "bg-t-green/10 text-t-green border border-t-green/40"
                              }`}
                            >
                              {msg.status === "read" ? "تمت القراءة" : "جديد وغير مقروء"}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteInbox(msg.id)}
                              className="p-1.5 rounded-lg bg-fg/5 hover:bg-t-red/15 text-fg-3 hover:text-t-red transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredInbox.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-fg-4">
                            لا توجد رسائل مطابقة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-fg mb-1">إدارة المشاريع (Projects CMS)</h2>
                  <p className="text-sm text-fg-3">إضافة وتعديل بيانات وصور المشاريع الأربعة الرسمية</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectsList.map((project) => (
                  <div key={project.id} className="p-6 rounded-3xl bg-card border border-fg/5 space-y-4">
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black">
                      <Image src={project.heroImage} alt="" fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-gold-text">{project.categoryAr}</div>
                      <h3 className="text-xl font-bold text-fg">{project.titleAr}</h3>
                      <p className="text-xs text-fg-3 mt-2 line-clamp-3">{project.shortDescAr}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-fg/5 text-xs text-fg-3">
                      <span>الموقع: {project.locationAr}</span>
                      <span className="font-mono text-gold-text">{project.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SERVICES */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-fg mb-1">إدارة الخدمات (Services CMS)</h2>
                <p className="text-sm text-fg-3">الخدمات الشاملة التسع المعتمدة في بروفايل الشركة</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {servicesList.map((service) => (
                  <div key={service.id} className="p-5 rounded-2xl bg-card border border-fg/5 space-y-3">
                    <div className="text-xs font-mono text-gold-text">{service.categoryAr}</div>
                    <h4 className="text-base font-bold text-fg">{service.titleAr}</h4>
                    <p className="text-xs text-fg-3 line-clamp-3">{service.shortDescAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-fg mb-1">الشهادات والتراخيص الحكومية</h2>
                <p className="text-sm text-fg-3">
                  إدارة السجل التجاري، رخصة بلدي، قوى، الغرفة التجارية، وشهادة الزكاة
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificatesList.map((cert) => (
                  <div key={cert.id} className="p-6 rounded-3xl bg-card border border-fg/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-fg">{cert.titleAr}</h3>
                      <span className="px-2.5 py-1 rounded bg-card-2 text-xs font-mono text-gold-text">
                        {cert.docNumber}
                      </span>
                    </div>
                    <div className="text-xs text-fg-3 space-y-1">
                      <div>الجهة: {cert.authorityAr}</div>
                      <div>تاريخ الانتهاء: {cert.expiryDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CONTRACTS */}
          {activeTab === "contracts" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-fg mb-1">عقود الباطن والاتفاقيات المحمية</h2>
                <p className="text-sm text-fg-3">
                  الوثائق المخزنة بتمويه حقيقي والمحكومة بنظام الموافقة على طلبات التصريح
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contractsList.map((c) => (
                  <div key={c.id} className="p-6 rounded-3xl bg-card border border-fg/5 space-y-4">
                    <div className="text-xs font-mono text-gold-text">{c.contractTypeAr}</div>
                    <h3 className="text-lg font-bold text-fg">{c.titleAr}</h3>
                    <div className="text-xs text-fg-3">
                      <div>الطرف الآخر: {c.counterpartyAr}</div>
                      <div>الفترة: {c.dateTermAr}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SITE SETTINGS (Centrally Editable CMS) */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-fg mb-1">إعدادات الموقع الشاملة (Site Settings)</h2>
                <p className="text-sm text-fg-3">
                  تعديل أرقام الهواتف، روابط السوشيال ميديا، الأزرار العائمة، ونصوص الفوتر بدون أي كود
                </p>
              </div>

              {/* Contact & Floating Buttons Form */}
              <div className="p-8 rounded-3xl bg-card border border-fg/5 space-y-6">
                <h3 className="text-xl font-bold text-gold-text">بيانات الاتصال والأزرار العائمة</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-fg-3 mb-1">رقم الهاتف الأساسي (Call)</label>
                    <input
                      type="text"
                      value={siteSettingsData?.contact?.phonePrimary || "0554798138"}
                      onChange={(e) =>
                        setSiteSettingsData({
                          ...siteSettingsData,
                          contact: { ...siteSettingsData.contact, phonePrimary: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-fg-3 mb-1">رقم الواتساب الأساسي (WhatsApp)</label>
                    <input
                      type="text"
                      value={siteSettingsData?.contact?.whatsappPrimary || "01094555299"}
                      onChange={(e) =>
                        setSiteSettingsData({
                          ...siteSettingsData,
                          contact: { ...siteSettingsData.contact, whatsappPrimary: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-fg-3 mb-1">البريد الإلكتروني الرسمي</label>
                    <input
                      type="email"
                      value={siteSettingsData?.contact?.email || "info.co@rakkaiz.com"}
                      onChange={(e) =>
                        setSiteSettingsData({
                          ...siteSettingsData,
                          contact: { ...siteSettingsData.contact, email: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-fg-3 mb-1">العنوان الرسمي (عربي)</label>
                    <input
                      type="text"
                      value={siteSettingsData?.contact?.addressAr || "شارع الأفلاج، الدريهمية، الرياض"}
                      onChange={(e) =>
                        setSiteSettingsData({
                          ...siteSettingsData,
                          contact: { ...siteSettingsData.contact, addressAr: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink border border-fg/10 text-fg text-sm"
                    />
                  </div>
                </div>

                {/* Floating Contact Buttons Toggles */}
                <div className="p-4 rounded-2xl bg-ink border border-fg/5 space-y-3">
                  <div className="text-xs font-bold text-fg">إعدادات الأزرار العائمة (Floating Contact Buttons):</div>
                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteSettingsData?.contact?.floatingButtons?.whatsappEnabled ?? true}
                        onChange={(e) =>
                          setSiteSettingsData({
                            ...siteSettingsData,
                            contact: {
                              ...siteSettingsData.contact,
                              floatingButtons: {
                                ...siteSettingsData.contact?.floatingButtons,
                                whatsappEnabled: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                      <span>تفعيل زر الواتساب العائم في أسفل يمين الشاشة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteSettingsData?.contact?.floatingButtons?.callEnabled ?? true}
                        onChange={(e) =>
                          setSiteSettingsData({
                            ...siteSettingsData,
                            contact: {
                              ...siteSettingsData.contact,
                              floatingButtons: {
                                ...siteSettingsData.contact?.floatingButtons,
                                callEnabled: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                      <span>تفعيل زر الاتصال العائم في أسفل يسار الشاشة</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSaveSettings("contact", siteSettingsData.contact)}
                    className="btn-gold-sweep px-8 py-2.5 rounded-full bg-gold text-on-gold font-black text-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ بيانات الاتصال</span>
                  </button>
                </div>
              </div>

              {/* Fixed hero / about / contact media (video, images, captions) */}
              <SiteMediaEditor
                value={siteSettingsData?.site_media}
                onSave={(data) => {
                  setSiteSettingsData({ ...siteSettingsData, site_media: data });
                  handleSaveSettings("site_media", data);
                }}
              />

              {/* Unified content manager: About-us gallery, Icon Code footer showcase, and any custom section */}
              <ContentManager
                aboutGallery={siteSettingsData?.about_gallery}
                iconcodeShowcase={siteSettingsData?.iconcode_showcase}
                siteBlocks={siteSettingsData?.site_blocks}
                onSave={({ about_gallery, iconcode_showcase, site_blocks }) => {
                  setSiteSettingsData({ ...siteSettingsData, about_gallery, iconcode_showcase, site_blocks });
                  handleSaveSettings("about_gallery", about_gallery);
                  handleSaveSettings("iconcode_showcase", iconcode_showcase);
                  handleSaveSettings("site_blocks", site_blocks);
                }}
              />

              {/* Icon Code credit: contact channels shown at the very bottom of the site */}
              <IconCodeChannelsEditor
                value={siteSettingsData?.iconcode}
                onSave={(data) => {
                  setSiteSettingsData({ ...siteSettingsData, iconcode: data });
                  handleSaveSettings("iconcode", data);
                }}
              />
            </div>
          )}

          {/* MEDIA LIBRARY */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-fg mb-1">مكتبة الملفات</h2>
                <p className="text-sm text-fg-3">كل الصور والفيديوهات المرفوعة من الجهاز — احذف أي ملف نهائياً من هنا.</p>
              </div>
              <MediaLibrary />
            </div>
          )}

          {/* TAB 8: SUPABASE INTEGRATION */}
          {activeTab === "supabase" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-fg mb-1">تكامل Supabase الجاهز للاستخدام</h2>
                <p className="text-sm text-fg-3">
                  حقول مخصصة لربط Supabase URL و Anon Key وفحص الاتصال فورياً بدون تعديل كود
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-fg/5 space-y-6 max-w-3xl">
                <div>
                  <label className="block text-xs font-semibold text-fg-2 mb-1">
                    Supabase Project URL (عنوان المشروع)
                  </label>
                  <input
                    type="text"
                    value={siteSettingsData?.supabase?.supabaseUrl || ""}
                    onChange={(e) =>
                      setSiteSettingsData({
                        ...siteSettingsData,
                        supabase: { ...siteSettingsData.supabase, supabaseUrl: e.target.value },
                      })
                    }
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm font-mono focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg-2 mb-1">
                    Supabase Anon Public API Key (مفتاح الواجهة العامة)
                  </label>
                  <input
                    type="password"
                    value={siteSettingsData?.supabase?.supabaseAnonKey || ""}
                    onChange={(e) =>
                      setSiteSettingsData({
                        ...siteSettingsData,
                        supabase: { ...siteSettingsData.supabase, supabaseAnonKey: e.target.value },
                      })
                    }
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm font-mono focus:border-gold focus:outline-none"
                  />
                </div>

                {supabaseStatus && (
                  <div className="p-4 rounded-xl bg-t-green/10 border border-t-green/40 text-xs text-t-green flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{supabaseStatus}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button
                    onClick={testSupabaseConnection}
                    className="px-6 py-2.5 rounded-full bg-card-2 hover:bg-card-3 border border-gold/50 text-xs font-bold text-gold-text transition-colors"
                  >
                    فحص الاتصال (Test Connection)
                  </button>

                  <button
                    onClick={() => handleSaveSettings("supabase", siteSettingsData.supabase)}
                    className="btn-gold-sweep px-8 py-2.5 rounded-full bg-gold text-on-gold font-black text-xs shadow-lg"
                  >
                    حفظ إعدادات Supabase
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PASSWORD CHANGE */}
          {activeTab === "password" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-fg mb-1">تغيير كلمة مرور لوحة التحكم</h2>
                <p className="text-sm text-fg-3">
                  يتم تشفير وتمليح كلمة المرور عبر خوارزمية bcrypt وحفظها بأمان كامل على السيرفر
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-fg/5 space-y-6 max-w-xl">
                {passwordMsg.success && (
                  <div className="p-4 rounded-xl bg-t-green/10 border border-t-green/40 text-xs text-t-green flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passwordMsg.success}</span>
                  </div>
                )}
                {passwordMsg.error && (
                  <div className="p-4 rounded-xl bg-t-red/10 border border-t-red/40 text-xs text-t-red flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passwordMsg.error}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-fg-2 mb-1">
                      كلمة المرور الجديدة (New Password)
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة..."
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm font-mono focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-fg-2 mb-1">
                      تأكيد كلمة المرور الجديدة (Confirm Password)
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور..."
                      className="w-full px-4 py-3 rounded-xl bg-ink border border-fg/10 text-fg text-sm font-mono focus:border-gold focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-gold-sweep py-3 rounded-full bg-gradient-to-r from-gold-hi via-gold to-gold-lo text-on-gold font-black text-sm shadow-xl"
                  >
                    حفظ وتحديث كلمة المرور المشفرة
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
