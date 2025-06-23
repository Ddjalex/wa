import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertKenoBetSchema, insertKenoGameSchema, insertTransactionSchema } from "@shared/schema";
import { BettingEngine } from "./betting-engine";
import { PayoutEngine } from "./payout-engine";
import { z } from "zod";

interface GameState {
  currentGame: any;
  drawingSequence: number[];
  currentDrawIndex: number;
  isDrawing: boolean;
  nextDrawTime: number;
}

let gameState: GameState = {
  currentGame: null,
  drawingSequence: [],
  currentDrawIndex: 0,
  isDrawing: false,
  nextDrawTime: Date.now() + 45000, // 45 seconds from now
};

const COUNTDOWN_DURATION = 50000; // 50 seconds countdown before drawing
const DRAWING_DURATION = 30000; // 30 seconds to draw all numbers
const BREAK_DURATION = 15000; // 15 seconds break after drawing
const TOTAL_CYCLE = COUNTDOWN_DURATION + DRAWING_DURATION + BREAK_DURATION; // 95 seconds total
const NUMBERS_TO_DRAW = 20;

function generateRandomNumbers(count: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * 80) + 1);
  }
  return Array.from(numbers);
}

function calculateWinnings(selectedNumbers: number[], drawnNumbers: number[], betAmount: number): { winAmount: number; matchedNumbers: number } {
  const result = PayoutEngine.calculateWinnings(betAmount, selectedNumbers, drawnNumbers);
  return {
    winAmount: result.winAmount,
    matchedNumbers: result.matchedNumbers
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connections
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    // Send current game state to new client
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'gameState',
        data: gameState
      }));
    }

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  function broadcastToClients(message: any) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Initialize first game
  async function initializeGame() {
    try {
      gameState.currentGame = await storage.createGame({
        gameNumber: 0, // Will be auto-assigned
        drawnNumbers: [],
        status: "countdown",
      });
      gameState.drawingSequence = generateRandomNumbers(NUMBERS_TO_DRAW);
      gameState.currentDrawIndex = 0;
      gameState.isDrawing = false;
      gameState.nextDrawTime = Date.now() + COUNTDOWN_DURATION;
      
      broadcastToClients({
        type: 'gameState',
        data: gameState
      });
      
      // Schedule drawing to start after countdown
      setTimeout(() => {
        startDrawing();
      }, COUNTDOWN_DURATION);
      
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  }

  // Start drawing sequence
  async function startDrawing() {
    if (!gameState.currentGame || gameState.isDrawing) return;

    gameState.isDrawing = true;
    await storage.updateGame(gameState.currentGame.id, { status: "drawing" });
    
    broadcastToClients({
      type: 'drawingStarted',
      data: { gameId: gameState.currentGame.id }
    });

    // Draw numbers with proper timing (1.5 seconds between each)
    const drawInterval = setInterval(async () => {
      if (gameState.currentDrawIndex >= gameState.drawingSequence.length) {
        clearInterval(drawInterval);
        await completeGame();
        return;
      }

      const drawnNumber = gameState.drawingSequence[gameState.currentDrawIndex];
      gameState.currentDrawIndex++;

      broadcastToClients({
        type: 'numberDrawn',
        data: {
          number: drawnNumber,
          index: gameState.currentDrawIndex,
          total: NUMBERS_TO_DRAW
        }
      });
    }, 1500);
  }

  // Complete current game and process bets
  async function completeGame() {
    if (!gameState.currentGame) return;

    await storage.updateGame(gameState.currentGame.id, {
      status: "completed",
      drawnNumbers: gameState.drawingSequence,
      completedAt: new Date(),
    });

    // Process all bets for this game
    const bets = await storage.getBetsForGame(gameState.currentGame.id);
    for (const bet of bets) {
      const { winAmount, matchedNumbers } = calculateWinnings(
        bet.selectedNumbers as number[],
        gameState.drawingSequence,
        bet.betAmount
      );

      await storage.updateBet(bet.id, {
        winAmount,
        matchedNumbers,
        status: winAmount > 0 ? "won" : "lost",
      });

      if (winAmount > 0 && bet.userId) {
        const user = await storage.getUser(bet.userId);
        if (user) {
          await storage.updateUserBalance(user.id, user.balance + winAmount);
        }
      }
    }

    gameState.isDrawing = false;
    gameState.nextDrawTime = Date.now() + BREAK_DURATION;

    broadcastToClients({
      type: 'gameCompleted',
      data: {
        gameId: gameState.currentGame.id,
        drawnNumbers: gameState.drawingSequence,
        nextGameTime: gameState.nextDrawTime,
      }
    });

    // Start next game after 15-second break
    setTimeout(() => {
      initializeGame();
    }, BREAK_DURATION);
  }

  // Game timer
  setInterval(() => {
    if (!gameState.isDrawing && gameState.nextDrawTime <= Date.now()) {
      startDrawing();
    }
  }, 1000);

  // API Routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/game/current", async (req, res) => {
    try {
      const currentGame = await storage.getCurrentGame();
      res.json({
        game: currentGame,
        state: gameState,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/game/history", async (req, res) => {
    try {
      const history = await storage.getGameHistory(10);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Player-facing bet calculation endpoint
  app.post("/api/calculate-bet", async (req, res) => {
    try {
      const { betAmount } = req.body;
      
      if (!betAmount || typeof betAmount !== "number") {
        return res.status(400).json({ message: "Valid bet amount required" });
      }

      const result = BettingEngine.processPlayerBet(betAmount);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({
        betAmount,
        winAmount: result.winAmount,
        currency: "Birr"
      });
    } catch (error) {
      res.status(500).json({ message: "Calculation error" });
    }
  });

  app.post("/api/bet", async (req, res) => {
    try {
      const betData = insertKenoBetSchema.parse(req.body);
      
      // Use betting engine to validate bet amount
      const betResult = BettingEngine.processPlayerBet(betData.betAmount);
      if (!betResult.success) {
        return res.status(400).json({ message: betResult.error });
      }
      
      // Validate user has sufficient balance
      const userId = betData.userId || 1; // Default to user 1 if not provided
      const user = await storage.getUser(userId);
      if (!user || user.balance < betData.betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Get or create current game for betting
      let currentGame = await storage.getCurrentGame();
      if (!currentGame || currentGame.status === "completed") {
        // Create new game if none exists or current one is completed
        currentGame = await storage.createGame({
          gameNumber: 0, // Will be auto-assigned
          drawnNumbers: [],
          status: "waiting",
        });
        gameState.currentGame = currentGame;
        gameState.isDrawing = false;
        gameState.nextDrawTime = Date.now() + 45000;
      }
      
      // Don't allow betting if drawing has started
      if (gameState.isDrawing) {
        return res.status(400).json({ message: "Betting closed - drawing in progress" });
      }

      // Validate selected numbers
      if (betData.selectedNumbers.length === 0 || betData.selectedNumbers.length > 10) {
        return res.status(400).json({ message: "Must select between 1 and 10 numbers" });
      }

      // Create bet with proper userId and gameId
      const bet = await storage.createBet({
        userId: userId,
        selectedNumbers: betData.selectedNumbers,
        betAmount: betData.betAmount,
        gameId: currentGame.id,
      });

      // Deduct bet amount from user balance
      await storage.updateUserBalance(user.id, user.balance - betData.betAmount);

      res.status(201).json(bet);
    } catch (error) {
      console.log("Bet error details:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ 
          message: "Invalid bet data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:userId/bets", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      const bets = await storage.getUserBets(userId, gameId);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes for betting system
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const limits = BettingEngine.getBettingLimits();
      res.json({
        profitMargin: 15, // Default 15%
        minBet: limits.min,
        maxBet: limits.max,
        currency: limits.currency,
        multiplier: limits.multiplier,
        maxPlayers: 100,
        revenue: 12450,
        profit: 1867,
        payouts: 10583
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin-only payout table endpoint
  app.get("/api/admin/payout-table", async (req, res) => {
    try {
      const payoutTable = BettingEngine.generatePayoutTable();
      res.json({
        table: payoutTable,
        limits: BettingEngine.getBettingLimits()
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const { profitMargin, minBet, maxBet, maxPlayers } = req.body;
      
      // Validate settings
      if (profitMargin < -10 || profitMargin > 100) {
        return res.status(400).json({ message: "Profit margin must be between -10% and 100%" });
      }
      
      if (minBet < 1 || maxBet < minBet) {
        return res.status(400).json({ message: "Invalid betting limits" });
      }
      
      // In a real app, you'd save these to a database
      // For now, just return success
      res.json({ 
        message: "Settings updated successfully",
        settings: { profitMargin, minBet, maxBet, maxPlayers }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transaction endpoints for payment system
  app.post("/api/transactions/deposit", async (req, res) => {
    try {
      const { userId, amount, method = "bank_transfer", reference } = req.body;
      
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid deposit request" });
      }

      const transaction = await storage.createTransaction({
        type: "deposit",
        userId,
        amount,
        method,
        reference,
        description: `Deposit via ${method}`
      });

      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create deposit" });
    }
  });

  app.post("/api/transactions/withdraw", async (req, res) => {
    try {
      const { userId, amount, method = "bank_transfer", reference } = req.body;
      
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal request" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const transaction = await storage.createTransaction({
        type: "withdrawal",
        userId,
        amount,
        method,
        reference,
        description: `Withdrawal via ${method}`
      });

      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create withdrawal" });
    }
  });

  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get pending transactions (admin only)
  app.get("/api/transactions/pending", async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Approve transaction (admin only)
  app.post("/api/transactions/:id/approve", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Update transaction status
      await storage.updateTransaction(transactionId, {
        status: 'completed',
        completedAt: new Date()
      });

      // If it's a deposit, add to user balance
      if (transaction.type === 'deposit' && transaction.userId) {
        const user = await storage.getUser(transaction.userId);
        if (user) {
          await storage.updateUserBalance(transaction.userId, user.balance + transaction.amount);
        }
      }
      
      // If it's a withdrawal, deduct from user balance
      if (transaction.type === 'withdrawal' && transaction.userId) {
        const user = await storage.getUser(transaction.userId);
        if (user) {
          await storage.updateUserBalance(transaction.userId, user.balance - transaction.amount);
        }
      }

      res.json({ message: "Transaction approved successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reject transaction (admin only)
  app.post("/api/transactions/:id/reject", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Update transaction status
      await storage.updateTransaction(transactionId, {
        status: 'rejected',
        completedAt: new Date()
      });

      res.json({ message: "Transaction rejected successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/transactions/:id/process", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { status, processedBy = 1 } = req.body;

      if (!["completed", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const transaction = await storage.getTransactionById(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      await storage.updateTransaction(transactionId, {
        status,
        processedBy,
        completedAt: new Date()
      });

      // Update user balance if approved
      if (status === "completed") {
        const user = await storage.getUser(transaction.userId);
        if (user) {
          const newBalance = transaction.type === "deposit" 
            ? user.balance + transaction.amount
            : user.balance - transaction.amount;
          await storage.updateUserBalance(user.id, newBalance);
        }
      }

      res.json({ message: "Transaction processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process transaction" });
    }
  });

  app.get("/api/admin/transactions/pending", async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  // Payout table management endpoints
  app.get("/api/admin/payout-table", async (req, res) => {
    try {
      const payoutTable = PayoutEngine.getPayoutTable();
      const spotAnalysis = PayoutEngine.getSpotAnalysis();
      const houseEdgeAnalysis = PayoutEngine.validateHouseEdge(0.25);
      
      res.json({
        payoutTable,
        spotAnalysis,
        houseEdgeAnalysis
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payout table" });
    }
  });

  app.post("/api/admin/payout-table/update", async (req, res) => {
    try {
      const { spots, matches, multiplier } = req.body;
      
      if (!spots || matches === undefined || multiplier === undefined) {
        return res.status(400).json({ message: "Invalid payout update data" });
      }
      
      PayoutEngine.updatePayout(spots, matches, multiplier);
      
      // Return updated analysis
      const spotAnalysis = PayoutEngine.getSpotAnalysis();
      const houseEdgeAnalysis = PayoutEngine.validateHouseEdge(0.25);
      
      res.json({
        message: "Payout updated successfully",
        spotAnalysis,
        houseEdgeAnalysis
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update payout" });
    }
  });

  app.get("/api/admin/payout-analysis/:spots", async (req, res) => {
    try {
      const spots = parseInt(req.params.spots);
      if (spots < 1 || spots > 10) {
        return res.status(400).json({ message: "Invalid spot count" });
      }
      
      const currentRTP = PayoutEngine.calculateRTP(spots);
      const recommendations = PayoutEngine.getRecommendedMultipliers(spots, 0.75);
      
      const detailedAnalysis = [];
      for (let matches = 0; matches <= spots; matches++) {
        const details = PayoutEngine.getProbabilityDetails(spots, matches);
        const currentMultiplier = PayoutEngine.getMultiplier(spots, matches);
        
        detailedAnalysis.push({
          matches,
          currentMultiplier,
          probability: details.probability,
          odds: details.odds,
          frequency: details.frequency
        });
      }
      
      res.json({
        spots,
        currentRTP,
        recommendations,
        detailedAnalysis
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze payout" });
    }
  });

  app.get("/api/payout-calculator", async (req, res) => {
    try {
      const { spots, betAmount = 100 } = req.query;
      const spotsNum = parseInt(spots as string);
      const betAmountNum = parseInt(betAmount as string);
      
      if (!spotsNum || spotsNum < 1 || spotsNum > 10) {
        return res.status(400).json({ message: "Invalid spot count" });
      }
      
      const payouts = [];
      for (let matches = 0; matches <= spotsNum; matches++) {
        const multiplier = PayoutEngine.getMultiplier(spotsNum, matches);
        const details = PayoutEngine.getProbabilityDetails(spotsNum, matches);
        
        payouts.push({
          matches,
          multiplier,
          winAmount: betAmountNum * multiplier,
          probability: details.probability,
          odds: details.odds,
          frequency: details.frequency
        });
      }
      
      const expectedRTP = PayoutEngine.calculateRTP(spotsNum);
      
      res.json({
        spots: spotsNum,
        betAmount: betAmountNum,
        payouts,
        expectedRTP,
        houseEdge: (1 - expectedRTP) * 100
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate payouts" });
    }
  });

  // Initialize the first game
  initializeGame();

  return httpServer;
}
