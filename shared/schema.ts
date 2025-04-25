import { pgTable, text, serial, integer, boolean, date, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

// Wedding Settings Schema
export const weddingSettings = pgTable("wedding_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  partner1Name: text("partner_1_name"),
  partner2Name: text("partner_2_name"),
  weddingDate: date("wedding_date"),
  venueName: text("venue_name"),
  venueAddress: text("venue_address"),
  theme: text("theme"),
  notes: text("notes"),
});

export const insertWeddingSettingsSchema = createInsertSchema(weddingSettings).omit({
  id: true,
});

// Task Priority Enum
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

// Task Schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  dueDate: date("due_date"),
  priority: taskPriorityEnum("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Budget Category Schema
export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  estimatedCost: integer("estimated_cost").default(0),
  actualCost: integer("actual_cost").default(0),
  notes: text("notes"),
});

export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({
  id: true,
});

// Vendor Schema
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  notes: text("notes"),
  contractLink: text("contract_link"),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
});

// RSVP Status Enum
export const rsvpStatusEnum = pgEnum("rsvp_status", ["pending", "confirmed", "declined"]);

// Guest Schema
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  rsvpStatus: rsvpStatusEnum("rsvp_status").default("pending"),
  mealPreference: text("meal_preference"),
  plusOne: boolean("plus_one").default(false),
  plusOneName: text("plus_one_name"),
  notes: text("notes"),
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
});

// Timeline Event Schema
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date"),
  completed: boolean("completed").default(false),
  monthsBefore: integer("months_before"),
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
});

// Help Message Schema
export const helpMessages = pgTable("help_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHelpMessageSchema = createInsertSchema(helpMessages).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWeddingSettings = z.infer<typeof insertWeddingSettingsSchema>;
export type WeddingSettings = typeof weddingSettings.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type BudgetCategory = typeof budgetCategories.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guests.$inferSelect;

export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;

export type InsertHelpMessage = z.infer<typeof insertHelpMessageSchema>;
export type HelpMessage = typeof helpMessages.$inferSelect;
