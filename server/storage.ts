import { 
  users, swipes, matches, messages,
  type User, type InsertUser, 
  type Swipe, type InsertSwipe,
  type Match, type InsertMatch,
  type Message, type InsertMessage,
  type MatchWithUsers, type MessageWithSender
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getProfiles(excludeUserId: string): Promise<User[]>;
  
  // Swipes
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  getSwipe(swiperId: string, swipeeId: string): Promise<Swipe | undefined>;
  checkMutualSwipe(swiperId: string, swipeeId: string): Promise<boolean>;
  
  // Matches
  createMatch(match: InsertMatch): Promise<Match>;
  getMatches(userId: string): Promise<MatchWithUsers[]>;
  getMatch(matchId: string): Promise<MatchWithUsers | undefined>;
  getMatchBetweenUsers(user1Id: string, user2Id: string): Promise<Match | undefined>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(matchId: string): Promise<MessageWithSender[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getProfiles(excludeUserId: string): Promise<User[]> {
    // Get users that haven't been swiped on yet by current user
    const swipedUserIds = await db
      .select({ swipeeId: swipes.swipeeId })
      .from(swipes)
      .where(eq(swipes.swiperId, excludeUserId));
    
    const swipedIds = swipedUserIds.map(s => s.swipeeId);
    
    const allUsers = await db.select().from(users);
    
    return allUsers.filter(u => 
      u.id !== excludeUserId && !swipedIds.includes(u.id)
    );
  }

  // Swipes
  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const [newSwipe] = await db
      .insert(swipes)
      .values(swipe)
      .returning();
    return newSwipe;
  }

  async getSwipe(swiperId: string, swipeeId: string): Promise<Swipe | undefined> {
    const [swipe] = await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, swiperId),
          eq(swipes.swipeeId, swipeeId)
        )
      );
    return swipe || undefined;
  }

  async checkMutualSwipe(swiperId: string, swipeeId: string): Promise<boolean> {
    // Check if the other person has already swiped right on this user
    const [reverseSwipe] = await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, swipeeId),
          eq(swipes.swipeeId, swiperId),
          eq(swipes.direction, "right")
        )
      );
    return !!reverseSwipe;
  }

  // Matches
  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values(match)
      .returning();
    return newMatch;
  }

  async getMatches(userId: string): Promise<MatchWithUsers[]> {
    const userMatches = await db
      .select()
      .from(matches)
      .where(
        or(
          eq(matches.user1Id, userId),
          eq(matches.user2Id, userId)
        )
      )
      .orderBy(desc(matches.createdAt));
    
    const result: MatchWithUsers[] = [];
    
    for (const match of userMatches) {
      const [user1] = await db.select().from(users).where(eq(users.id, match.user1Id));
      const [user2] = await db.select().from(users).where(eq(users.id, match.user2Id));
      
      // Get last message
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.matchId, match.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      if (user1 && user2) {
        result.push({
          ...match,
          user1,
          user2,
          lastMessage: lastMessage || undefined,
        });
      }
    }
    
    return result;
  }

  async getMatch(matchId: string): Promise<MatchWithUsers | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));
    
    if (!match) return undefined;
    
    const [user1] = await db.select().from(users).where(eq(users.id, match.user1Id));
    const [user2] = await db.select().from(users).where(eq(users.id, match.user2Id));
    
    if (!user1 || !user2) return undefined;
    
    return { ...match, user1, user2 };
  }

  async getMatchBetweenUsers(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
          and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
        )
      );
    return match || undefined;
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMessages(matchId: string): Promise<MessageWithSender[]> {
    const matchMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
    
    const result: MessageWithSender[] = [];
    
    for (const message of matchMessages) {
      const [sender] = await db.select().from(users).where(eq(users.id, message.senderId));
      if (sender) {
        result.push({ ...message, sender });
      }
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();
