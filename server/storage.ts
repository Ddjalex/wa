import { users, kenoGames, kenoBets, transactions, type User, type InsertUser, type KenoGame, type InsertKenoGame, type KenoBet, type InsertKenoBet, type Transaction, type InsertTransaction } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: number): Promise<void>;
  
  getCurrentGame(): Promise<KenoGame | undefined>;
  createGame(game: InsertKenoGame): Promise<KenoGame>;
  updateGame(id: number, updates: Partial<KenoGame>): Promise<void>;
  getGameHistory(limit?: number): Promise<KenoGame[]>;
  
  createBet(bet: InsertKenoBet): Promise<KenoBet>;
  getUserBets(userId: number, gameId?: number): Promise<KenoBet[]>;
  updateBet(id: number, updates: Partial<KenoBet>): Promise<void>;
  getBetsForGame(gameId: number): Promise<KenoBet[]>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<void>;
  getPendingTransactions(): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, KenoGame>;
  private bets: Map<number, KenoBet>;
  private transactions: Map<number, Transaction>;
  private currentUserId: number = 1;
  private currentGameId: number = 1;
  private currentBetId: number = 1;
  private currentTransactionId: number = 1;
  private currentGameNumber: number = 1247;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.bets = new Map();
    this.transactions = new Map();
    
    // Create a default user
    this.users.set(1, {
      id: 1,
      username: "player1",
      password: "password",
      balance: 124550, // $1245.50 in cents
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, balance: 100000 }; // $1000 starting balance
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.balance = balance;
      this.users.set(id, user);
    }
  }

  async getCurrentGame(): Promise<KenoGame | undefined> {
    return Array.from(this.games.values()).find(
      (game) => game.status === "waiting" || game.status === "drawing"
    );
  }

  async createGame(insertGame: InsertKenoGame): Promise<KenoGame> {
    const id = this.currentGameId++;
    const game: KenoGame = {
      ...insertGame,
      id,
      gameNumber: this.currentGameNumber++,
      startedAt: new Date(),
      completedAt: null,
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, updates: Partial<KenoGame>): Promise<void> {
    const game = this.games.get(id);
    if (game) {
      Object.assign(game, updates);
      this.games.set(id, game);
    }
  }

  async getGameHistory(limit: number = 10): Promise<KenoGame[]> {
    return Array.from(this.games.values())
      .filter((game) => game.status === "completed")
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createBet(insertBet: InsertKenoBet): Promise<KenoBet> {
    const id = this.currentBetId++;
    const bet: KenoBet = {
      ...insertBet,
      id,
      status: "active",
      winAmount: 0,
      matchedNumbers: 0,
      createdAt: new Date(),
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getUserBets(userId: number, gameId?: number): Promise<KenoBet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.userId === userId && (!gameId || bet.gameId === gameId)
    );
  }

  async updateBet(id: number, updates: Partial<KenoBet>): Promise<void> {
    const bet = this.bets.get(id);
    if (bet) {
      Object.assign(bet, updates);
      this.bets.set(id, bet);
    }
  }

  async getBetsForGame(gameId: number): Promise<KenoBet[]> {
    return Array.from(this.bets.values()).filter((bet) => bet.gameId === gameId);
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      status: "pending",
      processedBy: null,
      createdAt: new Date(),
      completedAt: null,
      method: insertTransaction.method || null,
      reference: insertTransaction.reference || null,
      description: insertTransaction.description || null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: number, limit: number = 50): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      Object.assign(transaction, updates);
      if (updates.status === "completed" && !transaction.completedAt) {
        transaction.completedAt = new Date();
      }
    }
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.status === "pending")
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
}

export const storage = new MemStorage();
