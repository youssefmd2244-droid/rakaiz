import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

// Projects Table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  categoryAr: text("category_ar").notNull(),
  categoryEn: text("category_en").notNull(),
  categoryKey: text("category_key").notNull().default("commercial"), // all, residential, commercial, infrastructure, hospitality
  shortDescAr: text("short_desc_ar").notNull(),
  shortDescEn: text("short_desc_en").notNull(),
  fullDescAr: text("full_desc_ar").notNull(),
  fullDescEn: text("full_desc_en").notNull(),
  locationAr: text("location_ar").notNull(),
  locationEn: text("location_en").notNull(),
  clientAr: text("client_ar").notNull(),
  clientEn: text("client_en").notNull(),
  scopeAr: text("scope_ar").notNull(),
  scopeEn: text("scope_en").notNull(),
  area: text("area").notNull(),
  year: text("year").notNull(),
  statusAr: text("status_ar").notNull().default("مكتمل"),
  statusEn: text("status_en").notNull().default("Completed"),
  heroImage: text("hero_image").notNull(),
  gallery: jsonb("gallery").$type<string[]>().default([]),
  keyFacts: jsonb("key_facts").$type<{ labelAr: string; labelEn: string; value: string }[]>().default([]),
  featured: boolean("featured").default(true),
  sortOrder: integer("sort_order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Services Table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  categoryAr: text("category_ar").notNull().default("خدمات المقاولات"),
  categoryEn: text("category_en").notNull().default("Contracting Services"),
  shortDescAr: text("short_desc_ar").notNull(),
  shortDescEn: text("short_desc_en").notNull(),
  fullDescAr: text("full_desc_ar").notNull(),
  fullDescEn: text("full_desc_en").notNull(),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  icon: text("icon").notNull().default("Building2"),
  image: text("image").notNull().default("/images/about-facade-geometric.jpg"),
  sortOrder: integer("sort_order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Achievements Timeline
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  descAr: text("desc_ar").notNull(),
  descEn: text("desc_en").notNull(),
  highlightAr: text("highlight_ar"),
  highlightEn: text("highlight_en"),
  sortOrder: integer("sort_order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Partners Table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  categoryAr: text("category_ar"),
  categoryEn: text("category_en"),
  logoUrl: text("logo_url").notNull(),
  websiteUrl: text("website_url"),
  sortOrder: integer("sort_order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Certificates & Licenses Table
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // cr, balady, qiwa, chamber, zakat
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  authorityAr: text("authority_ar").notNull(),
  authorityEn: text("authority_en").notNull(),
  docNumber: text("doc_number").notNull(),
  issueDate: text("issue_date").notNull(),
  expiryDate: text("expiry_date").notNull(), // YYYY-MM-DD or Hijri representation
  isHijri: boolean("is_hijri").default(false),
  verifiedUrl: text("verified_url"),
  qrCodeUrl: text("qr_code_url"),
  detailsAr: jsonb("details_ar").$type<Record<string, string>>().default({}),
  detailsEn: jsonb("details_en").$type<Record<string, string>>().default({}),
  fileUrl: text("file_url"),
  badge: text("badge").default("رسمي ومعتمد"),
  sortOrder: integer("sort_order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contracts & Documents (Protected)
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  counterpartyAr: text("counterparty_ar").notNull(),
  counterpartyEn: text("counterparty_en").notNull(),
  contractTypeAr: text("contract_type_ar").notNull(),
  contractTypeEn: text("contract_type_en").notNull(),
  dateTermAr: text("date_term_ar").notNull(),
  dateTermEn: text("date_term_en").notNull(),
  blurredPreviewUrl: text("blurred_preview_url").notNull(),
  privateFileUrl: text("private_file_url").notNull(),
  isProtected: boolean("is_protected").default(true),
  notesAr: text("notes_ar"),
  notesEn: text("notes_en"),
  sortOrder: integer("sort_order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inbox (Submissions from all forms)
export const inboxMessages = pgTable("inbox_messages", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // contact, quote, doc_access, newsletter
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  subject: text("subject"),
  message: text("message"),
  details: jsonb("details").$type<Record<string, any>>().default({}),
  attachmentUrl: text("attachment_url"),
  status: text("status").notNull().default("unread"), // unread, read, replied, archived
  starred: boolean("starred").default(false),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin Users
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("super_admin"), // super_admin, editor
  mustChangePassword: boolean("must_change_password").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Site Settings (Centralized CMS Configuration)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // "general", "contact", "theme", "3d", "supabase"
  data: jsonb("data").$type<Record<string, any>>().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Log
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  details: text("details"),
  performedBy: text("performed_by").default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
