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
import createMemoryStore from "memorystore";
import session from "express-session";

// MemoryStore for sessions
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Wedding Settings methods
  getWeddingSettings(userId: number): Promise<WeddingSettings | undefined>;
  createWeddingSettings(settings: InsertWeddingSettings): Promise<WeddingSettings>;
  updateWeddingSettings(id: number, settings: Partial<InsertWeddingSettings>): Promise<WeddingSettings | undefined>;

  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Budget Category methods
  getBudgetCategories(userId: number): Promise<BudgetCategory[]>;
  getBudgetCategory(id: number): Promise<BudgetCategory | undefined>;
  createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory>;
  updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined>;
  deleteBudgetCategory(id: number): Promise<boolean>;

  // Vendor methods
  getVendors(userId: number): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;

  // Guest methods
  getGuests(userId: number): Promise<Guest[]>;
  getGuest(id: number): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined>;
  deleteGuest(id: number): Promise<boolean>;

  // Timeline Event methods
  getTimelineEvents(userId: number): Promise<TimelineEvent[]>;
  getTimelineEvent(id: number): Promise<TimelineEvent | undefined>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: number, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: number): Promise<boolean>;

  // Help Message methods
  createHelpMessage(message: InsertHelpMessage): Promise<HelpMessage>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private weddingSettings: Map<number, WeddingSettings>;
  private tasks: Map<number, Task>;
  private budgetCategories: Map<number, BudgetCategory>;
  private vendors: Map<number, Vendor>;
  private guests: Map<number, Guest>;
  private timelineEvents: Map<number, TimelineEvent>;
  private helpMessages: Map<number, HelpMessage>;
  sessionStore: session.SessionStore;

  private userIdCounter: number;
  private weddingSettingsIdCounter: number;
  private taskIdCounter: number;
  private budgetCategoryIdCounter: number;
  private vendorIdCounter: number;
  private guestIdCounter: number;
  private timelineEventIdCounter: number;
  private helpMessageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.weddingSettings = new Map();
    this.tasks = new Map();
    this.budgetCategories = new Map();
    this.vendors = new Map();
    this.guests = new Map();
    this.timelineEvents = new Map();
    this.helpMessages = new Map();

    this.userIdCounter = 1;
    this.weddingSettingsIdCounter = 1;
    this.taskIdCounter = 1;
    this.budgetCategoryIdCounter = 1;
    this.vendorIdCounter = 1;
    this.guestIdCounter = 1;
    this.timelineEventIdCounter = 1;
    this.helpMessageIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours in ms
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Wedding Settings methods
  async getWeddingSettings(userId: number): Promise<WeddingSettings | undefined> {
    return Array.from(this.weddingSettings.values()).find(
      (settings) => settings.userId === userId
    );
  }

  async createWeddingSettings(settings: InsertWeddingSettings): Promise<WeddingSettings> {
    const id = this.weddingSettingsIdCounter++;
    const newSettings: WeddingSettings = { ...settings, id };
    this.weddingSettings.set(id, newSettings);
    return newSettings;
  }

  async updateWeddingSettings(id: number, settings: Partial<InsertWeddingSettings>): Promise<WeddingSettings | undefined> {
    const existing = this.weddingSettings.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...settings };
    this.weddingSettings.set(id, updated);
    return updated;
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const newTask: Task = { ...task, id, createdAt: now };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...task };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Budget Category methods
  async getBudgetCategories(userId: number): Promise<BudgetCategory[]> {
    return Array.from(this.budgetCategories.values()).filter(
      (category) => category.userId === userId
    );
  }

  async getBudgetCategory(id: number): Promise<BudgetCategory | undefined> {
    return this.budgetCategories.get(id);
  }

  async createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory> {
    const id = this.budgetCategoryIdCounter++;
    const newCategory: BudgetCategory = { ...category, id };
    this.budgetCategories.set(id, newCategory);
    return newCategory;
  }

  async updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined> {
    const existing = this.budgetCategories.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...category };
    this.budgetCategories.set(id, updated);
    return updated;
  }

  async deleteBudgetCategory(id: number): Promise<boolean> {
    return this.budgetCategories.delete(id);
  }

  // Vendor methods
  async getVendors(userId: number): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(
      (vendor) => vendor.userId === userId
    );
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.vendorIdCounter++;
    const newVendor: Vendor = { ...vendor, id };
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const existing = this.vendors.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...vendor };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }

  // Guest methods
  async getGuests(userId: number): Promise<Guest[]> {
    return Array.from(this.guests.values()).filter(
      (guest) => guest.userId === userId
    );
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const id = this.guestIdCounter++;
    const newGuest: Guest = { ...guest, id };
    this.guests.set(id, newGuest);
    return newGuest;
  }

  async updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined> {
    const existing = this.guests.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...guest };
    this.guests.set(id, updated);
    return updated;
  }

  async deleteGuest(id: number): Promise<boolean> {
    return this.guests.delete(id);
  }

  // Timeline Event methods
  async getTimelineEvents(userId: number): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values()).filter(
      (event) => event.userId === userId
    );
  }

  async getTimelineEvent(id: number): Promise<TimelineEvent | undefined> {
    return this.timelineEvents.get(id);
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = this.timelineEventIdCounter++;
    const newEvent: TimelineEvent = { ...event, id };
    this.timelineEvents.set(id, newEvent);
    return newEvent;
  }

  async updateTimelineEvent(id: number, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const existing = this.timelineEvents.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...event };
    this.timelineEvents.set(id, updated);
    return updated;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    return this.timelineEvents.delete(id);
  }

  // Help Message methods
  async createHelpMessage(message: InsertHelpMessage): Promise<HelpMessage> {
    const id = this.helpMessageIdCounter++;
    const now = new Date();
    const newMessage: HelpMessage = { ...message, id, createdAt: now };
    this.helpMessages.set(id, newMessage);
    return newMessage;
  }
}

export const storage = new MemStorage();
