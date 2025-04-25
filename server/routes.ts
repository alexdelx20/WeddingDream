import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import multer from "multer";
import {
  insertWeddingSettingsSchema,
  insertTaskSchema,
  insertBudgetCategorySchema,
  insertVendorSchema,
  insertGuestSchema,
  insertTimelineEventSchema,
  insertHelpMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  
  // Handle WebSocket connections
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Process messages
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });
    
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
  
  // Broadcast to all clients
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Check authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Wedding Settings Routes
  app.get("/api/wedding-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const settings = await storage.getWeddingSettings(userId);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Error fetching wedding settings" });
    }
  });

  app.post("/api/wedding-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsed = insertWeddingSettingsSchema.parse({ ...req.body, userId });
      
      // Check if user already has settings
      const existingSettings = await storage.getWeddingSettings(userId);
      
      if (existingSettings) {
        const updated = await storage.updateWeddingSettings(existingSettings.id, parsed);
        return res.json(updated);
      }
      
      const settings = await storage.createWeddingSettings(parsed);
      res.status(201).json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid wedding settings data" });
    }
  });

  // Tasks Routes
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsed = insertTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(parsed);
      
      // Broadcast task creation
      broadcast({ type: "TASK_CREATED", payload: task });
      
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if task exists and belongs to user
      const task = await storage.getTask(taskId);
      if (!task || task.userId !== userId) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updated = await storage.updateTask(taskId, req.body);
      
      // Broadcast task update
      broadcast({ type: "TASK_UPDATED", payload: updated });
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Error updating task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if task exists and belongs to user
      const task = await storage.getTask(taskId);
      if (!task || task.userId !== userId) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      await storage.deleteTask(taskId);
      
      // Broadcast task deletion
      broadcast({ type: "TASK_DELETED", payload: { id: taskId } });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  // Budget Categories Routes
  app.get("/api/budget", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const categories = await storage.getBudgetCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching budget categories" });
    }
  });

  app.post("/api/budget", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsed = insertBudgetCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createBudgetCategory(parsed);
      
      // Broadcast budget category creation
      broadcast({ type: "BUDGET_CREATED", payload: category });
      
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget category data" });
    }
  });

  app.patch("/api/budget/:id", isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if category exists and belongs to user
      const category = await storage.getBudgetCategory(categoryId);
      if (!category || category.userId !== userId) {
        return res.status(404).json({ message: "Budget category not found" });
      }
      
      const updated = await storage.updateBudgetCategory(categoryId, req.body);
      
      // Broadcast budget category update
      broadcast({ type: "BUDGET_UPDATED", payload: updated });
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Error updating budget category" });
    }
  });

  app.delete("/api/budget/:id", isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if category exists and belongs to user
      const category = await storage.getBudgetCategory(categoryId);
      if (!category || category.userId !== userId) {
        return res.status(404).json({ message: "Budget category not found" });
      }
      
      await storage.deleteBudgetCategory(categoryId);
      
      // Broadcast budget category deletion
      broadcast({ type: "BUDGET_DELETED", payload: { id: categoryId } });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting budget category" });
    }
  });

  // Vendors Routes
  app.get("/api/vendors", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const vendors = await storage.getVendors(userId);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vendors" });
    }
  });

  app.post("/api/vendors", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsed = insertVendorSchema.parse({ ...req.body, userId });
      const vendor = await storage.createVendor(parsed);
      
      // Broadcast vendor creation
      broadcast({ type: "VENDOR_CREATED", payload: vendor });
      
      res.status(201).json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Invalid vendor data" });
    }
  });

  app.patch("/api/vendors/:id", isAuthenticated, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if vendor exists and belongs to user
      const vendor = await storage.getVendor(vendorId);
      if (!vendor || vendor.userId !== userId) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      const updated = await storage.updateVendor(vendorId, req.body);
      
      // Broadcast vendor update
      broadcast({ type: "VENDOR_UPDATED", payload: updated });
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Error updating vendor" });
    }
  });

  app.delete("/api/vendors/:id", isAuthenticated, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if vendor exists and belongs to user
      const vendor = await storage.getVendor(vendorId);
      if (!vendor || vendor.userId !== userId) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      await storage.deleteVendor(vendorId);
      
      // Broadcast vendor deletion
      broadcast({ type: "VENDOR_DELETED", payload: { id: vendorId } });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting vendor" });
    }
  });

  // Guests Routes
  app.get("/api/guests", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const guests = await storage.getGuests(userId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching guests" });
    }
  });

  app.post("/api/guests", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsed = insertGuestSchema.parse({ ...req.body, userId });
      const guest = await storage.createGuest(parsed);
      
      // Broadcast guest creation
      broadcast({ type: "GUEST_CREATED", payload: guest });
      
      res.status(201).json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest data" });
    }
  });

  app.patch("/api/guests/:id", isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if guest exists and belongs to user
      const guest = await storage.getGuest(guestId);
      if (!guest || guest.userId !== userId) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      const updated = await storage.updateGuest(guestId, req.body);
      
      // Broadcast guest update
      broadcast({ type: "GUEST_UPDATED", payload: updated });
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Error updating guest" });
    }
  });

  app.delete("/api/guests/:id", isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if guest exists and belongs to user
      const guest = await storage.getGuest(guestId);
      if (!guest || guest.userId !== userId) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      await storage.deleteGuest(guestId);
      
      // Broadcast guest deletion
      broadcast({ type: "GUEST_DELETED", payload: { id: guestId } });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting guest" });
    }
  });

  // Timeline Routes
  app.get("/api/timeline", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const events = await storage.getTimelineEvents(userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching timeline events" });
    }
  });

  app.post("/api/timeline", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsed = insertTimelineEventSchema.parse({ ...req.body, userId });
      const event = await storage.createTimelineEvent(parsed);
      
      // Broadcast timeline event creation
      broadcast({ type: "TIMELINE_CREATED", payload: event });
      
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid timeline event data" });
    }
  });

  app.patch("/api/timeline/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if event exists and belongs to user
      const event = await storage.getTimelineEvent(eventId);
      if (!event || event.userId !== userId) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      const updated = await storage.updateTimelineEvent(eventId, req.body);
      
      // Broadcast timeline event update
      broadcast({ type: "TIMELINE_UPDATED", payload: updated });
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Error updating timeline event" });
    }
  });

  app.delete("/api/timeline/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if event exists and belongs to user
      const event = await storage.getTimelineEvent(eventId);
      if (!event || event.userId !== userId) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      await storage.deleteTimelineEvent(eventId);
      
      // Broadcast timeline event deletion
      broadcast({ type: "TIMELINE_DELETED", payload: { id: eventId } });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting timeline event" });
    }
  });

  // Help Center Route
  app.post("/api/help", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsed = insertHelpMessageSchema.parse({ ...req.body, userId });
      const message = await storage.createHelpMessage(parsed);
      
      // Import here to avoid circular dependencies
      const { sendEmail } = await import('./email');
      
      // Send email notification
      const emailSent = await sendEmail({
        to: 'info@myweddingdream.co', // Change this to the recipient email
        from: 'notifications@myweddingdream.co', // This should be a verified sender in SendGrid
        subject: `Help Center: ${parsed.subject}`,
        html: `
          <h2>New Message from Wedding Dream Help Center</h2>
          <p><strong>From:</strong> ${parsed.name} (${parsed.email})</p>
          <p><strong>Subject:</strong> ${parsed.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${parsed.message.replace(/\n/g, '<br>')}</p>
        `,
        text: `
          New Message from Wedding Dream Help Center
          
          From: ${parsed.name} (${parsed.email})
          Subject: ${parsed.subject}
          
          Message:
          ${parsed.message}
        `
      });
      
      res.status(201).json({ 
        success: true, 
        message: "Message sent successfully", 
        emailSent
      });
    } catch (error) {
      console.error("Help Center Error:", error);
      res.status(400).json({ message: "Error sending help message" });
    }
  });

  return httpServer;
}
