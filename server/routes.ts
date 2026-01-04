import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { loginSchema, registerSchema, swipeSchema, messageSchema } from "@shared/schema";
import { z } from "zod";

const sessions = new Map<string, string>();

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16) + password.length.toString(16);
}

function getAuthToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

async function getUserFromToken(req: Request) {
  const token = getAuthToken(req);
  if (!token) return null;

  const userId = sessions.get(token);
  if (!userId) return null;

  return await storage.getUser(userId);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = hashPassword(data.password);
      const user = await storage.createUser({
        username: data.username,
        password: hashedPassword,
        name: data.name,
      });

      const token = randomUUID();
      sessions.set(token, user.id);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          headline: user.headline,
          bio: user.bio,
          skills: user.skills,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Internal server error", details: process.env.NODE_ENV === "development" ? errorMessage : undefined });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const hashedPassword = hashPassword(data.password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = randomUUID();
      sessions.set(token, user.id);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          headline: user.headline,
          bio: user.bio,
          skills: user.skills,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Internal server error", details: process.env.NODE_ENV === "development" ? errorMessage : undefined });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const token = getAuthToken(req);
    if (token) {
      sessions.delete(token);
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      headline: user.headline,
      bio: user.bio,
      skills: user.skills,
      avatarUrl: user.avatarUrl,
    });
  });

  app.put("/api/users/me", async (req: Request, res: Response) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, headline, bio, skills, avatarUrl } = req.body;

    const updatedUser = await storage.updateUser(user.id, {
      name: name || user.name,
      headline,
      bio,
      skills,
      avatarUrl,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      headline: updatedUser.headline,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      avatarUrl: updatedUser.avatarUrl,
    });
  });

  app.get("/api/deck", async (req: Request, res: Response) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const users = await storage.getUnswipedUsers(user.id);

    res.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        headline: u.headline,
        bio: u.bio,
        skills: u.skills,
        avatarUrl: u.avatarUrl,
      }))
    );
  });

  app.post("/api/swipe", async (req: Request, res: Response) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const data = swipeSchema.parse(req.body);

      const existingSwipe = await storage.getSwipe(user.id, data.swipeeId);
      if (existingSwipe) {
        return res.status(400).json({ message: "Already swiped on this user" });
      }

      await storage.createSwipe(user.id, data.swipeeId, data.direction);

      let isMatch = false;

      if (data.direction === "right") {
        const reverseSwipe = await storage.getSwipe(data.swipeeId, user.id);
        if (reverseSwipe && reverseSwipe.direction === "right") {
          await storage.createMatch(user.id, data.swipeeId);
          isMatch = true;
        }
      }

      const matchedUser = isMatch ? await storage.getUser(data.swipeeId) : null;

      res.json({
        success: true,
        isMatch,
        matchedUser: matchedUser
          ? {
              id: matchedUser.id,
              name: matchedUser.name,
              headline: matchedUser.headline,
              avatarUrl: matchedUser.avatarUrl,
            }
          : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/matches", async (req: Request, res: Response) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userMatches = await storage.getMatches(user.id);
    const matchesWithUsers = await Promise.all(
      userMatches.map(async (match) => {
        const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id;
        const otherUser = await storage.getUser(otherUserId);
        const msgs = await storage.getMessages(match.id);
        const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        return {
          matchId: match.id,
          user: otherUser ? {
            id: otherUser.id,
            username: otherUser.username,
            name: otherUser.name,
            headline: otherUser.headline,
            bio: otherUser.bio,
            skills: otherUser.skills,
            avatarUrl: otherUser.avatarUrl,
          } : null,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
          } : null,
          createdAt: match.createdAt,
        };
      })
    );

    res.json(matchesWithUsers.filter(m => m.user !== null));
  });

  app.get("/api/matches/:matchId/messages", async (req: Request, res: Response) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { matchId } = req.params;
    const match = await storage.getMatch(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.user1Id !== user.id && match.user2Id !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const msgs = await storage.getMessages(matchId);
    res.json(msgs.map(m => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt,
    })));
  });

  app.post("/api/matches/:matchId/messages", async (req: Request, res: Response) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { matchId } = req.params;
      const data = messageSchema.parse({ ...req.body, matchId });

      const match = await storage.getMatch(matchId);

      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      if (match.user1Id !== user.id && match.user2Id !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const message = await storage.createMessage(matchId, user.id, data.content);

      res.json({
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
