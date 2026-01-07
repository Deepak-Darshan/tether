var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";
import { randomUUID } from "crypto";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  matches: () => matches,
  matchesRelations: () => matchesRelations,
  messageSchema: () => messageSchema,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  registerSchema: () => registerSchema,
  swipeSchema: () => swipeSchema,
  swipes: () => swipes,
  swipesRelations: () => swipesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  headline: text("headline"),
  bio: text("bio"),
  skills: text("skills"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
var swipes = pgTable("swipes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id")
    .notNull()
    .references(() => users.id),
  swipeeId: varchar("swipee_id")
    .notNull()
    .references(() => users.id),
  direction: text("direction").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
var matches = pgTable("matches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id")
    .notNull()
    .references(() => users.id),
  user2Id: varchar("user2_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
var usersRelations = relations(users, ({ many }) => ({
  swipesGiven: many(swipes, { relationName: "swipesGiven" }),
  swipesReceived: many(swipes, { relationName: "swipesReceived" }),
  matchesAsUser1: many(matches, { relationName: "matchesAsUser1" }),
  matchesAsUser2: many(matches, { relationName: "matchesAsUser2" }),
}));
var swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(users, {
    fields: [swipes.swiperId],
    references: [users.id],
    relationName: "swipesGiven",
  }),
  swipee: one(users, {
    fields: [swipes.swipeeId],
    references: [users.id],
    relationName: "swipesReceived",
  }),
}));
var matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "matchesAsUser1",
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "matchesAsUser2",
  }),
  messages: many(messages),
}));
var messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  matchId: varchar("match_id")
    .notNull()
    .references(() => matches.id),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
var messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  headline: true,
  bio: true,
  skills: true,
  avatarUrl: true,
});
var loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
var registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
});
var swipeSchema = z.object({
  swipeeId: z.string(),
  direction: z.enum(["left", "right"]),
});
var messageSchema = z.object({
  matchId: z.string(),
  content: z.string().min(1),
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, or, ne, notInArray } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, data) {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || void 0;
  }
  async getSwipe(swiperId, swipeeId) {
    const [swipe] = await db
      .select()
      .from(swipes)
      .where(and(eq(swipes.swiperId, swiperId), eq(swipes.swipeeId, swipeeId)));
    return swipe || void 0;
  }
  async createSwipe(swiperId, swipeeId, direction) {
    const [swipe] = await db
      .insert(swipes)
      .values({ swiperId, swipeeId, direction })
      .returning();
    return swipe;
  }
  async getMatches(userId) {
    return db
      .select()
      .from(matches)
      .where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)));
  }
  async createMatch(user1Id, user2Id) {
    const [match] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();
    return match;
  }
  async getUnswipedUsers(userId) {
    const userSwipes = await db
      .select({ swipeeId: swipes.swipeeId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));
    const swipedIds = userSwipes.map((s) => s.swipeeId);
    swipedIds.push(userId);
    if (swipedIds.length === 1) {
      return db.select().from(users).where(ne(users.id, userId));
    }
    return db.select().from(users).where(notInArray(users.id, swipedIds));
  }
  async getMatchedUsers(userId) {
    const userMatches = await this.getMatches(userId);
    const matchedUserIds = userMatches.map((m) =>
      m.user1Id === userId ? m.user2Id : m.user1Id,
    );
    if (matchedUserIds.length === 0) {
      return [];
    }
    const matchedUsers = [];
    for (const id of matchedUserIds) {
      const user = await this.getUser(id);
      if (user) matchedUsers.push(user);
    }
    return matchedUsers;
  }
  async getMatch(matchId) {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));
    return match || void 0;
  }
  async getMessages(matchId) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
  }
  async createMessage(matchId, senderId, content) {
    const [message] = await db
      .insert(messages)
      .values({ matchId, senderId, content })
      .returning();
    return message;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
var sessions = /* @__PURE__ */ new Map();
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16) + password.length.toString(16);
}
function getAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}
async function getUserFromToken(req) {
  const token = getAuthToken(req);
  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;
  return await storage.getUser(userId);
}
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    const token = getAuthToken(req);
    if (token) {
      sessions.delete(token);
    }
    res.json({ success: true });
  });
  app2.get("/api/auth/me", async (req, res) => {
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
  app2.put("/api/users/me", async (req, res) => {
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
  app2.get("/api/deck", async (req, res) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const users2 = await storage.getUnswipedUsers(user.id);
    res.json(
      users2.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        headline: u.headline,
        bio: u.bio,
        skills: u.skills,
        avatarUrl: u.avatarUrl,
      })),
    );
  });
  app2.post("/api/swipe", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/matches", async (req, res) => {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userMatches = await storage.getMatches(user.id);
    const matchesWithUsers = await Promise.all(
      userMatches.map(async (match) => {
        const otherUserId =
          match.user1Id === user.id ? match.user2Id : match.user1Id;
        const otherUser = await storage.getUser(otherUserId);
        const msgs = await storage.getMessages(match.id);
        const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        return {
          matchId: match.id,
          user: otherUser
            ? {
                id: otherUser.id,
                username: otherUser.username,
                name: otherUser.name,
                headline: otherUser.headline,
                bio: otherUser.bio,
                skills: otherUser.skills,
                avatarUrl: otherUser.avatarUrl,
              }
            : null,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          createdAt: match.createdAt,
        };
      }),
    );
    res.json(matchesWithUsers.filter((m) => m.user !== null));
  });
  app2.get("/api/matches/:matchId/messages", async (req, res) => {
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
    res.json(
      msgs.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt,
      })),
    );
  });
  app2.post("/api/matches/:matchId/messages", async (req, res) => {
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
      const message = await storage.createMessage(
        matchId,
        user.id,
        data.content,
      );
      res.json({
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    if (origin && origins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );
  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({ req, res, landingPageTemplate, appName }) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, _next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`express server serving on port ${port}`);
    },
  );
})();
