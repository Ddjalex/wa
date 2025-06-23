import { useState, useEffect } from "react";
import { KenoGameBoard } from "@/components/keno-game-board";
import { LotteryBallDisplay } from "@/components/lottery-ball-display";
import { AnimatedDrawingPreview } from "@/components/animated-drawing-preview";
import { EnhancedKenoBoard } from "@/components/enhanced-keno-board";
import { BettingTicket } from "@/components/betting-ticket";
import { DrawHistory } from "@/components/draw-history";
import { Button } from "@/components/ui/button";
import { Settings, Wallet } from "lucide-react";
import { useKenoGame } from "@/hooks/use-keno-game";
import { useWebSocket } from "@/hooks/use-websocket";
import { Link } from "wouter";

export default function KenoGame() {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
  const [currentBet, setCurrentBet] = useState(25);
  
  const {
    gameState,
    user,
    drawnNumbers,
    winningNumbers,
    isDrawing,
    currentDrawNumber,
    nextDrawTime,
    placeBet,
    isPlacingBet,
    gameHistory
  } = useKenoGame();

  const { isConnected } = useWebSocket();

  const handleNumberSelect = (number: number) => {
    if (drawnNumbers.has(number) || isDrawing) return;
    
    const newSelection = new Set(selectedNumbers);
    if (newSelection.has(number)) {
      newSelection.delete(number);
      console.log(`Deselected number ${number}, current selection:`, Array.from(newSelection));
    } else if (newSelection.size < 10) {
      newSelection.add(number);
      console.log(`Selected number ${number}, current selection:`, Array.from(newSelection));
    } else {
      console.log('Maximum 10 numbers can be selected');
    }
    setSelectedNumbers(newSelection);
  };

  const handlePlaceBet = async () => {
    if (selectedNumbers.size === 0) {
      console.log('No numbers selected');
      return;
    }
    
    console.log('Placing bet with numbers:', Array.from(selectedNumbers));
    
    try {
      await placeBet({
        userId: 1, // Default user
        selectedNumbers: Array.from(selectedNumbers),
        betAmount: currentBet * 100, // Convert to cents
      });
      
      console.log('Bet placed successfully');
      // Clear selections after successful bet
      setSelectedNumbers(new Set());
    } catch (error) {
      console.error('Failed to place bet:', error);
    }
  };

  const handleClearSelections = () => {
    setSelectedNumbers(new Set());
  };

  const calculatePotentialWin = () => {
    const matches = selectedNumbers.size;
    const payoutTable: { [key: number]: number } = {
      3: 3, 4: 5, 5: 10, 6: 25, 7: 50, 8: 100, 9: 250, 10: 500,
    };
    const multiplier = payoutTable[matches] || 0;
    return currentBet * multiplier;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Navigation Buttons */}
      <div className="fixed top-4 right-4 z-40">
        <Link href="/wallet">
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700 hover:text-white backdrop-blur-sm"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-screen">
          {/* Left Side - Betting Ticket */}
          <div className="col-span-3">
            <BettingTicket
              user={user || null}
              selectedNumbers={selectedNumbers}
              currentBet={currentBet}
              onBetChange={setCurrentBet}
              potentialWin={calculatePotentialWin()}
              onPlaceBet={handlePlaceBet}
              onClearSelections={handleClearSelections}
              isPlacingBet={isPlacingBet}
              canPlaceBet={selectedNumbers.size > 0 && !isDrawing}
              drawnNumbers={drawnNumbers}
            />
          </div>

          {/* Center - Main Game Area */}
          <div className="col-span-6 flex flex-col space-y-6">
            {/* Top Center - Animated Drawing Preview */}
            <div className="flex justify-center">
              <AnimatedDrawingPreview
                drawnNumbers={gameState?.drawingSequence || []}
                currentDrawIndex={gameState?.currentDrawIndex || 0}
                isDrawing={isDrawing}
                gameNumber={gameState?.currentGame?.gameNumber || 1}
              />
            </div>

            {/* Center - 10x8 Number Grid */}
            <div className="flex-1">
              <EnhancedKenoBoard
                selectedNumbers={selectedNumbers}
                drawnNumbers={drawnNumbers}
                winningNumbers={winningNumbers}
                isDrawing={isDrawing}
                gameNumber={gameState?.currentGame?.gameNumber || 1}
                onNumberSelect={handleNumberSelect}
                drawingSequence={gameState?.drawingSequence || []}
                currentDrawIndex={gameState?.currentDrawIndex || 0}
              />
            </div>
          </div>

          {/* Right Side - Draw History */}
          <div className="col-span-3">
            <DrawHistory
              gameHistory={gameHistory || []}
              userSelectedNumbers={selectedNumbers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
