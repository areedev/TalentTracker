import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTalentSchema, updateTalentSchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";
import User from "./db/users";
import Talent from "./db/talents";
import Setting from "./db/settings";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password || '');
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Set user session
      req.session.userId = user.id;

      res.json({ user, message: 'Login successful' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        fullName: `${firstName || ''} ${lastName || ''}`,
      });
      await user.save();
      // Set user session
      req.session.userId = user.id;

      res.status(201).json({ user, message: 'Registration successful' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Talent routes
  app.get('/api/talents', isAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const keyword = req.query.keyword || '';
      const emailOnly = req.query.emailOnly === "true";

      const filter: any = {};

      if (keyword) {
        filter.$or = [
          { fullName: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
          { note: { $regex: keyword, $options: 'i' } },
          {
            externalLinks: {
              $elemMatch: {
                url: { $regex: keyword, $options: 'i' }
              }
            }
          }
        ];
      }

      if (emailOnly) {
        filter.email = { $exists: true, $ne: "" };
      }

      console.log(filter)
      const total = await Talent.countDocuments(filter);
      const talents = await Talent.find(filter).skip((page - 1) * limit).limit(limit);

      res.json({ talents, total });
    } catch (error) {
      console.error("Error fetching talents:", error);
      res.status(500).json({ message: "Failed to fetch talents" });
    }
  });

  app.get('/api/talents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const talent = await storage.getTalent(id);
      if (!talent) {
        return res.status(404).json({ message: "Talent not found" });
      }
      res.json(talent);
    } catch (error) {
      console.error("Error fetching talent:", error);
      res.status(500).json({ message: "Failed to fetch talent" });
    }
  });

  app.get('/api/talents/by-talent-id/:talentId', async (req, res) => {
    try {
      const talentId = req.params.talentId;
      const talent = await Talent.findOne({ talentId });
      if (!talent) {
        return res.status(404).json({ message: "Talent not found" });
      }
      res.json(talent);
    } catch (error) {
      console.error("Error fetching talent:", error);
      res.status(500).json({ message: "Failed to fetch talent" });
    }
  });

  app.get('/api/talents/:id/navigation', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [previous, next] = await Promise.all([
        storage.getPreviousTalent(id),
        storage.getNextTalent(id)
      ]);
      res.json({ previous, next });
    } catch (error) {
      console.error("Error fetching talent navigation:", error);
      res.status(500).json({ message: "Failed to fetch talent navigation" });
    }
  });

  app.post('/api/talents', isAuthenticated, async (req, res) => {
    try {
      const talentData = insertTalentSchema.parse(req.body);
      const talent = await storage.createTalent(talentData);
      res.status(201).json(talent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid talent data", errors: error.errors });
      }
      console.error("Error creating talent:", error);
      res.status(500).json({ message: "Failed to create talent" });
    }
  });

  app.patch('/api/talents/:id', isAuthenticated, async (req, res) => {
    try {
      const talentId = parseInt(req.params.id);
      const { email, important, note } = req.body;
      console.log(email)
      const updated = await Talent.updateOne({ talentId }, { email, important, note });

      res.json({ success: true, updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid talent data", errors: error.errors });
      }
      console.error("Error updating talent:", error);
      res.status(500).json({ message: "Failed to update talent" });
    }
  });

  app.delete('/api/talents/:id', isAuthenticated, async (req, res) => {
    try {
      const talentId = parseInt(req.params.id);
      const success = await Talent.deleteOne({ talentId });
      if (!success) {
        return res.status(404).json({ message: "Talent not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting talent:", error);
      res.status(500).json({ message: "Failed to delete talent" });
    }
  });

  // Email sending route
  app.post('/api/talents/:talentId/send-email', isAuthenticated, async (req, res) => {
    try {
      const talentId = req.params.talentId;
      const talent = await Talent.findOne({ talentId });
      if (!talent) {
        return res.status(404).json({ message: "Talent not found" });
      }

      if (!talent.email) {
        return res.status(400).json({ message: "Talent has no email address" });
      }

      const smtp = await Setting.findOne({ name: 'smtp' });
      const template = await Setting.findOne({ name: 'template' });

      if (!smtp?.value || !smtp.value.smtpHost || !smtp.value.smtpUsername || !smtp.value.smtpPassword) {
        return res.status(400).json({ message: "SMTP settings not configured" });
      }

      // Create nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: smtp.value.smtpSecure || false,
        auth: {
          user: smtp.value.smtpUsername,
          pass: smtp.value.smtpPassword,
        },
      });

      // Replace template variables
      const subject = (template?.value.emailSubject || "Hello {{name}}").replace(/\{\{name\}\}/g, talent.fullName);
      const text = (template?.value.emailTemplate || "Dear {{name}},\n\nBest regards").replace(/\{\{name\}\}/g, talent.fullName);

      // Send email
      await transporter.sendMail({
        from: `${template?.value.fromName || "Talent Management"} <${template?.value.fromEmail || smtp?.value.smtpUsername}>`,
        to: 'tech.zohan.khan@gmail.com',
        subject,
        text,
      });

      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Settings routes
  app.get('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const smtp = await Setting.findOne({ name: 'smtp' });
      const template = await Setting.findOne({ name: 'template' });
      res.json({ ...smtp?.value, ...template?.value });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const { emailSubject, emailTemplate, fromEmail, fromName, smtpHost, smtpPassword, smtpPort, smtpSecure, smtpUsername } = req.body;
      const smtp = await Setting.findOne({ name: 'smtp' });
      const template = await Setting.findOne({ name: 'template' });

      if (!smtp) {
        await Setting.create({ name: 'smtp', value: {} });
      }

      if (!template) {
        await Setting.create({ name: 'template', value: {} });
      }

      const smtpModel = await Setting.findOneAndUpdate({ name: 'smtp' }, {
        name: 'smtp', value: { smtpHost, smtpPassword, smtpPort, smtpSecure, smtpUsername }
      });

      const templateModel = await Setting.findOneAndUpdate({ name: 'template' }, { name: 'template', value: { emailSubject, emailTemplate, fromEmail, fromName } });

      res.json({ smtpModel, templateModel });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
