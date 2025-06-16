import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(0),
});

export const kenoGames = pgTable("keno_games", {
  id: serial("id").primaryKey(),
  gameNumber: integer("game_number").notNull().unique(),
  drawnNumbers: jsonb("drawn_numbers").$type<number[]>().notNull(),
  status: text("status").notNull().default("waiting"), // waiting, drawing, completed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const kenoBets = pgTable("keno_bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameId: integer("game_id").references(() => kenoGames.id),
  selectedNumbers: jsonb("selected_numbers").$type<number[]>().notNull(),
  betAmount: integer("bet_amount").notNull(),
  winAmount: integer("win_amount").default(0),
  matchedNumbers: integer("matched_numbers").default(0),
  status: text("status").notNull().default("active"), // active, won, lost
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertKenoGameSchema = createInsertSchema(kenoGames).pick({
  gameNumber: true,
  drawnNumbers: true,
  status: true,
});

export const insertKenoBetSchema = createInsertSchema(kenoBets).pick({
  userId: true,
  gameId: true,
  selectedNumbers: true,
  betAmount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertKenoGame = z.infer<typeof insertKenoGameSchema>;
export type KenoGame = typeof kenoGames.$inferSelect;
export type InsertKenoBet = z.infer<typeof insertKenoBetSchema>;
export type KenoBet = typeof kenoBets.$inferSelect;
