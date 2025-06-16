import { useState, useEffect } from "react";
import { AnimationPreview } from "@/components/animation-preview";
import { KenoBoard } from "@/components/keno-board";
import { PlayerDashboard } from "@/components/player-dashboard";
import { useKenoGame } from "@/hooks/use-keno-game";
import { useWebSocket } from "@/hooks/use-websocket";

export default function KenoGame() {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
  const [currentBet, setCurrentBet] = useState(25);
  const [showPreview, setShowPreview] = useState(true);
  
  const {
    gameState,
    user,
    drawnNumbers,
    winningNumbers,
    isDrawing,
    currentDrawNumber,
    nextDrawTime,
    placeBet,
    isPlacingBet
  } = useKenoGame();

  const { isConnected } = useWebSocket();

  const handleNumberSelect = (number: number) => {
    if (drawnNumbers.has(number) || isDrawing) return;
    
    const newSelection = new Set(selectedNumbers);
    if (newSelection.has(number)) {
      newSelection.delete(number);
    } else if (newSelection.size < 10) {
      newSelection.add(number);
    }
    setSelectedNumbers(newSelection);
  };

  const handlePlaceBet = async () => {
    if (selectedNumbers.size === 0) return;
    
    try {
      await placeBet({
        userId: 1, // Default user
        selectedNumbers: Array.from(selectedNumbers),
        betAmount: currentBet * 100, // Convert to cents
      });
      
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
    <div className="min-h-screen bg-gradient-to-br from-game-navy to-gray-800">
      {showPreview && (
        <AnimationPreview
          currentSequence={Array.from(drawnNumbers).slice(-5)}
          currentDrawNumber={currentDrawNumber}
          totalDraws={20}
          nextDrawTime={nextDrawTime}
          onToggle={() => setShowPreview(false)}
        />
      )}
      
      <div className={`container mx-auto px-4 py-6 ${showPreview ? 'pt-12' : 'pt-6'}`}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <KenoBoard
              selectedNumbers={selectedNumbers}
              drawnNumbers={drawnNumbers}
              winningNumbers={winningNumbers}
              isDrawing={isDrawing}
              gameNumber={gameState?.currentGame?.gameNumber || 0}
              drawCount={currentDrawNumber}
              totalDraws={20}
              onNumberSelect={handleNumberSelect}
            />
          </div>
          
          <div className="xl:col-span-1">
            <PlayerDashboard
              user={user}
              selectedNumbers={selectedNumbers}
              currentBet={currentBet}
              onBetChange={setCurrentBet}
              potentialWin={calculatePotentialWin()}
              drawnNumbers={Array.from(drawnNumbers)}
              onPlaceBet={handlePlaceBet}
              onClearSelections={handleClearSelections}
              isPlacingBet={isPlacingBet}
              canPlaceBet={selectedNumbers.size > 0 && !isDrawing}
              nextDrawTime={nextDrawTime}
              isConnected={isConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
