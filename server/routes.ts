import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, insertSwipeSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Simple password hashing
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "tether-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, username, password } = req.body;
      
      if (!name || !username || !password) {
        return res.status(400).json({ message: "Name, username and password are required" });
      }
      
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser({
        name,
        username,
        passwordHash: hashPassword(password),
        headline: null,
        bio: null,
        skills: [],
        lookingFor: [],
        avatarUrl: null,
      });
      
      req.session.userId = user.id;
      
      res.json({ id: user.id, name: user.name, username: user.username });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.session.userId = user.id;
      
      res.json({ id: user.id, name: user.name, username: user.username });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out" });
    });
  });

  // Current user
  app.get("/api/users/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/me", requireAuth, async (req, res) => {
    try {
      // Whitelist only safe profile fields - never allow passwordHash, id, or username updates
      const { name, headline, bio, skills, lookingFor, avatarUrl } = req.body;
      
      const safeUpdates: Record<string, any> = {};
      if (name !== undefined) safeUpdates.name = name;
      if (headline !== undefined) safeUpdates.headline = headline;
      if (bio !== undefined) safeUpdates.bio = bio;
      if (skills !== undefined) safeUpdates.skills = skills;
      if (lookingFor !== undefined) safeUpdates.lookingFor = lookingFor;
      if (avatarUrl !== undefined) safeUpdates.avatarUrl = avatarUrl;
      
      if (Object.keys(safeUpdates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const user = await storage.updateUser(req.session.userId!, safeUpdates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Profiles for swiping
  app.get("/api/profiles", requireAuth, async (req, res) => {
    try {
      const profiles = await storage.getProfiles(req.session.userId!);
      const safeProfiles = profiles.map(({ passwordHash, ...p }) => p);
      res.json(safeProfiles);
    } catch (error) {
      console.error("Get profiles error:", error);
      res.status(500).json({ message: "Failed to get profiles" });
    }
  });

  // Swipes
  app.post("/api/swipes", requireAuth, async (req, res) => {
    try {
      const { swipeeId, direction } = req.body;
      
      if (!swipeeId || !direction) {
        return res.status(400).json({ message: "swipeeId and direction are required" });
      }
      
      if (direction !== "left" && direction !== "right") {
        return res.status(400).json({ message: "direction must be 'left' or 'right'" });
      }
      
      const swiperId = req.session.userId!;
      
      // Check if already swiped
      const existing = await storage.getSwipe(swiperId, swipeeId);
      if (existing) {
        return res.status(400).json({ message: "Already swiped on this user" });
      }
      
      // Create swipe
      const swipe = await storage.createSwipe({
        swiperId,
        swipeeId,
        direction,
      });
      
      let match = null;
      
      // Check for mutual match if swiped right
      if (direction === "right") {
        const isMutual = await storage.checkMutualSwipe(swiperId, swipeeId);
        
        if (isMutual) {
          // Check if match doesn't already exist
          const existingMatch = await storage.getMatchBetweenUsers(swiperId, swipeeId);
          
          if (!existingMatch) {
            match = await storage.createMatch({
              user1Id: swipeeId, // The person who swiped first
              user2Id: swiperId, // Current user who completed the match
            });
          }
        }
      }
      
      res.json({ swipe, match: match ? true : false });
    } catch (error) {
      console.error("Swipe error:", error);
      res.status(500).json({ message: "Failed to record swipe" });
    }
  });

  // Matches
  app.get("/api/matches", requireAuth, async (req, res) => {
    try {
      const matches = await storage.getMatches(req.session.userId!);
      
      // Remove password hashes from user data
      const safeMatches = matches.map(m => ({
        ...m,
        user1: { ...m.user1, passwordHash: undefined },
        user2: { ...m.user2, passwordHash: undefined },
      }));
      
      res.json(safeMatches);
    } catch (error) {
      console.error("Get matches error:", error);
      res.status(500).json({ message: "Failed to get matches" });
    }
  });

  app.get("/api/matches/:matchId", requireAuth, async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify user is part of this match
      if (match.user1Id !== req.session.userId && match.user2Id !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      res.json({
        ...match,
        user1: { ...match.user1, passwordHash: undefined },
        user2: { ...match.user2, passwordHash: undefined },
      });
    } catch (error) {
      console.error("Get match error:", error);
      res.status(500).json({ message: "Failed to get match" });
    }
  });

  // Messages
  app.get("/api/messages/:matchId", requireAuth, async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify user is part of this match
      if (match.user1Id !== req.session.userId && match.user2Id !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const messages = await storage.getMessages(req.params.matchId);
      
      const safeMessages = messages.map(m => ({
        ...m,
        sender: { ...m.sender, passwordHash: undefined },
      }));
      
      res.json(safeMessages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const { matchId, content } = req.body;
      
      if (!matchId || !content) {
        return res.status(400).json({ message: "matchId and content are required" });
      }
      
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify user is part of this match
      if (match.user1Id !== req.session.userId && match.user2Id !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const message = await storage.createMessage({
        matchId,
        senderId: req.session.userId!,
        content,
      });
      
      res.json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  return httpServer;
}

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}
