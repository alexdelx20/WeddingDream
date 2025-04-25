import { 
  users, type User, type InsertUser,
  weddingSettings, type WeddingSettings, type InsertWeddingSettings,
  tasks, type Task, type InsertTask,
  budgetCategories, type BudgetCategory, type InsertBudgetCategory,
  vendors, type Vendor, type InsertVendor,
  guests, type Guest, type InsertGuest,
  timelineEvents, type TimelineEvent, type InsertTimelineEvent,
  helpMessages, type HelpMessage, type InsertHelpMessage
} from "@shared/schema";
import * as session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import type { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Wedding Settings methods
  async getWeddingSettings(userId: number): Promise<WeddingSettings | undefined> {
    const result = await db.select().from(weddingSettings).where(eq(weddingSettings.userId, userId));
    return result[0];
  }

  async createWeddingSettings(settings: InsertWeddingSettings): Promise<WeddingSettings> {
    const result = await db.insert(weddingSettings).values(settings).returning();
    return result[0];
  }

  async updateWeddingSettings(id: number, settings: Partial<InsertWeddingSettings>): Promise<WeddingSettings | undefined> {
    const result = await db.update(weddingSettings)
      .set(settings)
      .where(eq(weddingSettings.id, id))
      .returning();
    return result[0];
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const taskToInsert = { 
      ...task, 
      createdAt: new Date() 
    };
    const result = await db.insert(tasks).values(taskToInsert).returning();
    return result[0];
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db.update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // Budget Category methods
  async getBudgetCategories(userId: number): Promise<BudgetCategory[]> {
    return db.select().from(budgetCategories).where(eq(budgetCategories.userId, userId));
  }

  async getBudgetCategory(id: number): Promise<BudgetCategory | undefined> {
    const result = await db.select().from(budgetCategories).where(eq(budgetCategories.id, id));
    return result[0];
  }

  async createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory> {
    const result = await db.insert(budgetCategories).values(category).returning();
    return result[0];
  }

  async updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined> {
    const result = await db.update(budgetCategories)
      .set(category)
      .where(eq(budgetCategories.id, id))
      .returning();
    return result[0];
  }

  async deleteBudgetCategory(id: number): Promise<boolean> {
    const result = await db.delete(budgetCategories).where(eq(budgetCategories.id, id)).returning();
    return result.length > 0;
  }

  // Vendor methods
  async getVendors(userId: number): Promise<Vendor[]> {
    return db.select().from(vendors).where(eq(vendors.userId, userId));
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.id, id));
    return result[0];
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const result = await db.update(vendors)
      .set(vendor)
      .where(eq(vendors.id, id))
      .returning();
    return result[0];
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id)).returning();
    return result.length > 0;
  }

  // Guest methods
  async getGuests(userId: number): Promise<Guest[]> {
    return db.select().from(guests).where(eq(guests.userId, userId));
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    const result = await db.select().from(guests).where(eq(guests.id, id));
    return result[0];
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const result = await db.insert(guests).values(guest).returning();
    return result[0];
  }

  async updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined> {
    const result = await db.update(guests)
      .set(guest)
      .where(eq(guests.id, id))
      .returning();
    return result[0];
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id)).returning();
    return result.length > 0;
  }

  // Timeline Event methods
  async getTimelineEvents(userId: number): Promise<TimelineEvent[]> {
    return db.select().from(timelineEvents).where(eq(timelineEvents.userId, userId));
  }

  async getTimelineEvent(id: number): Promise<TimelineEvent | undefined> {
    const result = await db.select().from(timelineEvents).where(eq(timelineEvents.id, id));
    return result[0];
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const result = await db.insert(timelineEvents).values(event).returning();
    return result[0];
  }

  async updateTimelineEvent(id: number, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const result = await db.update(timelineEvents)
      .set(event)
      .where(eq(timelineEvents.id, id))
      .returning();
    return result[0];
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    const result = await db.delete(timelineEvents).where(eq(timelineEvents.id, id)).returning();
    return result.length > 0;
  }

  // Help Message methods
  async createHelpMessage(message: InsertHelpMessage): Promise<HelpMessage> {
    const messageToInsert = {
      ...message,
      createdAt: new Date()
    };
    const result = await db.insert(helpMessages).values(messageToInsert).returning();
    return result[0];
  }
}