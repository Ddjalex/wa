import { useState, useEffect } from "react";
import { ModernKenoLayout } from "@/components/modern-keno-layout";
import { ModernKenoGrid } from "@/components/modern-keno-grid";
import { ModernBettingPanel } from "@/components/modern-betting-panel";
import { ModernDrawDisplay } from "@/components/modern-draw-display";
import { ModernDrawingPreview } from "@/components/modern-drawing-preview";
import { ModernTicketDisplay } from "@/components/modern-ticket-display";
import { useKenoGame } from "@/hooks/use-keno-game";
import { useWebSocket } from "@/hooks/use-websocket";
import { SoundManager } from "@/lib/sound-manager";

export default function KenoGame() {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
  const [currentBet, setCurrentBet] = useState(50);
  const [soundManager] = useState(() => SoundManager.getInstance());
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState(60);
  const [showTickets, setShowTickets] = useState(false);
  const [activeBets, setActiveBets] = useState<any[]>([]);
  
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

  // Update timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextDrawTime) {
        const now = new Date();
        const nextTime = typeof nextDrawTime === 'number' ? new Date(nextDrawTime) : nextDrawTime;
        const diff = Math.max(0, Math.floor((nextTime.getTime() - now.getTime()) / 1000));
        setTimeUntilNext(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextDrawTime]);

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
    if (selectedNumbers.size === 0 || isPlacingBet) {
      return;
    }
    
    console.log('Placing bet with numbers:', Array.from(selectedNumbers));
    
    try {
      // Play bet placed sound
      soundManager.resumeAudioContext();
      soundManager.playBetPlaced();
      
      await placeBet({
        userId: 1,
        selectedNumbers: Array.from(selectedNumbers),
        betAmount: currentBet * 100, // Convert to cents
      });
      
      console.log('Bet placed successfully');
      // Clear selections after successful bet
      setSelectedNumbers(new Set());
    } catch (error: any) {
      console.error('Failed to place bet:', error.message);
      // Play error sound on failed bet
      soundManager.playError();
    }
  };

  const handleClearSelections = () => {
    setSelectedNumbers(new Set());
  };

  const handleSoundToggle = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (isSoundEnabled) {
      soundManager.setVolume(0);
    } else {
      soundManager.setVolume(0.3);
    }
  };

  const handleBalanceClick = () => {
    console.log('Balance clicked - show deposit/withdrawal options');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked - show game settings');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked - show user profile');
  };

  const handleTicketsClick = () => {
    setShowTickets(true);
  };

  const calculatePotentialWin = () => {
    const matches = selectedNumbers.size;
    const payoutTable: { [key: number]: number } = {
      1: 2, 2: 2, 3: 3, 4: 5, 5: 10, 6: 25, 7: 50, 8: 100, 9: 250, 10: 500,
    };
    const multiplier = payoutTable[matches] || 0;
    return currentBet * multiplier;
  };

  return (
    <ModernKenoLayout
      gameNumber={gameState?.currentGame?.gameNumber || 1}
      nextDrawTime={typeof nextDrawTime === 'number' ? new Date(nextDrawTime) : nextDrawTime}
      isDrawing={isDrawing}
      timeUntilNext={timeUntilNext}
      userBalance={user?.balance || 0}
      totalWinnings={0} // TODO: Calculate today's winnings
      onSoundToggle={handleSoundToggle}
      isSoundEnabled={isSoundEnabled}
      onBalanceClick={handleBalanceClick}
      onSettingsClick={handleSettingsClick}
      onProfileClick={handleProfileClick}
      onTicketsClick={handleTicketsClick}
    >
      <div className="space-y-8">
        {/* Top Row - Drawing Preview (matches dash.bet style) */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-6 col-start-4">
            <ModernDrawingPreview
              drawnNumbers={gameState?.drawingSequence || []}
              currentDrawIndex={gameState?.currentDrawIndex || 0}
              isDrawing={isDrawing}
              gameNumber={gameState?.currentGame?.gameNumber || 1}
            />
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel - Betting Controls */}
          <div className="col-span-3">
            <ModernBettingPanel
              user={user || null}
              selectedNumbers={selectedNumbers}
              currentBet={currentBet}
              onBetChange={setCurrentBet}
              potentialWin={calculatePotentialWin()}
              onPlaceBet={handlePlaceBet}
              onClearSelections={handleClearSelections}
              isPlacingBet={isPlacingBet}
              canPlaceBet={selectedNumbers.size > 0 && !isDrawing}
            />
          </div>

          {/* Center Panel - Number Grid */}
          <div className="col-span-6">
            <ModernKenoGrid
              selectedNumbers={selectedNumbers}
              drawnNumbers={drawnNumbers}
              winningNumbers={winningNumbers}
              isDrawing={isDrawing}
              onNumberSelect={handleNumberSelect}
              drawingSequence={gameState?.drawingSequence || []}
              currentDrawIndex={gameState?.currentDrawIndex || 0}
            />
          </div>

          {/* Right Panel - Draw Status & History */}
          <div className="col-span-3">
            <ModernDrawDisplay
              gameNumber={gameState?.currentGame?.gameNumber || 1}
              drawnNumbers={drawnNumbers}
              isDrawing={isDrawing}
              nextDrawTime={typeof nextDrawTime === 'number' ? new Date(nextDrawTime) : nextDrawTime}
              timeUntilNext={timeUntilNext}
              drawingSequence={gameState?.drawingSequence || []}
              currentDrawIndex={gameState?.currentDrawIndex || 0}
              gameHistory={Array.isArray(gameHistory) ? gameHistory : []}
            />
          </div>
        </div>
      </div>

      {/* Ticket Display Modal */}
      <ModernTicketDisplay
        activeBets={activeBets}
        isVisible={showTickets}
        onClose={() => setShowTickets(false)}
      />
    </ModernKenoLayout>
  );
}
