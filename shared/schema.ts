import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;

// Talents table
export const talents = pgTable("talents", {
  id: serial("id").primaryKey(),
  talentId: varchar("talent_id").notNull().unique(),
  talentUrl: varchar("talent_url"),
  fullName: varchar("full_name").notNull(),
  nationality: varchar("nationality"),
  location: varchar("location"),
  externalLinks: jsonb("external_links").$type<Array<{ name: string; url: string }>>().default([]),
  email: varchar("email"),
  note: text("note"),
  important: boolean("important").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTalentSchema = createInsertSchema(talents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTalentSchema = insertTalentSchema.partial();

export type InsertTalent = z.infer<typeof insertTalentSchema>;
export type UpdateTalent = z.infer<typeof updateTalentSchema>;
export type Talent = typeof talents.$inferSelect;

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  smtpHost: varchar("smtp_host"),
  smtpPort: varchar("smtp_port"),
  smtpUsername: varchar("smtp_username"),
  smtpPassword: varchar("smtp_password"),
  smtpSecure: boolean("smtp_secure").default(false),
  emailSubject: text("email_subject"),
  emailTemplate: text("email_template"),
  fromName: varchar("from_name"),
  fromEmail: varchar("from_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
