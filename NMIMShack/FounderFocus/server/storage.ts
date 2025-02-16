import session from "express-session";
import connectPg from "connect-pg-simple";
import { users, type User, type InsertUser, chatHistory, type ChatHistory, type InsertChat } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getChatHistory(userId: number): Promise<ChatHistory[]>;
  createChatHistory(userId: number, chat: InsertChat & { response: string }): Promise<ChatHistory>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session',
      pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getChatHistory(userId: number): Promise<ChatHistory[]> {
    try {
      return await db
        .select()
        .from(chatHistory)
        .where(eq(chatHistory.userId, userId))
        .orderBy(chatHistory.createdAt);
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async createChatHistory(
    userId: number,
    chat: InsertChat & { response: string },
  ): Promise<ChatHistory> {
    try {
      const [entry] = await db
        .insert(chatHistory)
        .values({
          userId,
          message: chat.message,
          response: chat.response,
        })
        .returning();
      return entry;
    } catch (error) {
      console.error('Error creating chat history:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();