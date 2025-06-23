import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./use-websocket";
import { AnimationManager } from "@/lib/animation-manager";
import { apiRequest } from "@/lib/queryClient";
import type { User, KenoBet } from "@shared/schema";

interface GameState {
  currentGame: any;
  drawingSequence: number[];
  currentDrawIndex: number;
  isDrawing: boolean;
  nextDrawTime: number;
  animationSpeed?: number;
}

export function useKenoGame() {
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set());
  const [winningNumbers, setWinningNumbers] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawNumber, setCurrentDrawNumber] = useState(0);
  const [nextDrawTime, setNextDrawTime] = useState(Date.now() + 45000);
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  const queryClient = useQueryClient();
  const animationManager = new AnimationManager();

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/1"],
    refetchInterval: 30000, // Refresh balance every 30 seconds
  });

  // Fetch current game state
  const { data: currentGameData } = useQuery({
    queryKey: ["/api/game/current"],
    refetchInterval: 5000,
  });

  // Fetch game history
  const { data: gameHistory = [] } = useQuery({
    queryKey: ["/api/game/history"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (currentGameData) {
      setGameState(currentGameData.state);
      setNextDrawTime(currentGameData.state.nextDrawTime);
    }
  }, [currentGameData]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'gameState':
        setGameState(message.data);
        setNextDrawTime(message.data.nextDrawTime);
        break;
        
      case 'drawingStarted':
        setIsDrawing(true);
        setDrawnNumbers(new Set());
        setWinningNumbers(new Set());
        setCurrentDrawNumber(0);
        break;
        
      case 'numberDrawn':
        const { number, index } = message.data;
        setDrawnNumbers(prev => new Set([...prev, number]));
        setCurrentDrawNumber(index);
        
        // Trigger animation for the drawn number
        animationManager.drawNumber(number);
        break;
        
      case 'gameCompleted':
        setIsDrawing(false);
        setNextDrawTime(message.data.nextGameTime);
        
        // Update winning numbers based on user's bets
        // This would typically be calculated on the server
        setWinningNumbers(new Set([7, 67])); // Mock data
        
        // Refresh user data to update balance
        queryClient.invalidateQueries({ queryKey: ["/api/user/1"] });
        break;
    }
  }, [animationManager, queryClient]);

  const { isConnected } = useWebSocket(handleWebSocketMessage);

  // Place bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (betData: { userId: number; selectedNumbers: number[]; betAmount: number }) => {
      const response = await apiRequest("POST", "/api/bet", betData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Refresh user balance and tickets
      queryClient.invalidateQueries({ queryKey: ["/api/user/1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", variables.userId, "bets"] });
    },
  });

  const placeBet = async (betData: { userId: number; selectedNumbers: number[]; betAmount: number }) => {
    if (placeBetMutation.isPending) {
      throw new Error("Bet already being placed");
    }
    return placeBetMutation.mutateAsync(betData);
  };

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNextDrawTime(prev => {
        if (prev <= Date.now() && !isDrawing) {
          return prev + 60000; // Next minute
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isDrawing]);

  return {
    gameState,
    user,
    drawnNumbers,
    winningNumbers,
    isDrawing,
    currentDrawNumber,
    nextDrawTime,
    placeBet,
    isPlacingBet: placeBetMutation.isPending,
    isConnected,
    gameHistory,
  };
}
