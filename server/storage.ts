import {
  users,
  swipes,
  matches,
  messages,
  type User,
  type InsertUser,
  type Swipe,
  type Match,
  type Message,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ne, notInArray, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  getSwipe(swiperId: string, swipeeId: string): Promise<Swipe | undefined>;
  createSwipe(
    swiperId: string,
    swipeeId: string,
    direction: string,
  ): Promise<Swipe>;
  getMatches(userId: string): Promise<Match[]>;
  getMatch(matchId: string): Promise<Match | undefined>;
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getUnswipedUsers(userId: string): Promise<User[]>;
  getMatchedUsers(userId: string): Promise<User[]>;
  getMessages(matchId: string): Promise<Message[]>;
  createMessage(
    matchId: string,
    senderId: string,
    content: string,
  ): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: string,
    data: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getSwipe(
    swiperId: string,
    swipeeId: string,
  ): Promise<Swipe | undefined> {
    const [swipe] = await db
      .select()
      .from(swipes)
      .where(and(eq(swipes.swiperId, swiperId), eq(swipes.swipeeId, swipeeId)));
    return swipe || undefined;
  }

  async createSwipe(
    swiperId: string,
    swipeeId: string,
    direction: string,
  ): Promise<Swipe> {
    const [swipe] = await db
      .insert(swipes)
      .values({ swiperId, swipeeId, direction })
      .returning();
    return swipe;
  }

  async getMatches(userId: string): Promise<Match[]> {
    return db
      .select()
      .from(matches)
      .where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)));
  }

  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();
    return match;
  }

  async getUnswipedUsers(userId: string): Promise<User[]> {
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

  async getMatchedUsers(userId: string): Promise<User[]> {
    const userMatches = await this.getMatches(userId);
    const matchedUserIds = userMatches.map((m) =>
      m.user1Id === userId ? m.user2Id : m.user1Id,
    );

    if (matchedUserIds.length === 0) {
      return [];
    }

    const matchedUsers: User[] = [];
    for (const id of matchedUserIds) {
      const user = await this.getUser(id);
      if (user) matchedUsers.push(user);
    }
    return matchedUsers;
  }

  async getMatch(matchId: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));
    return match || undefined;
  }

  async getMessages(matchId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
  }

  async createMessage(
    matchId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({ matchId, senderId, content })
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
