import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import type { User } from "@shared/schema";

interface PlayerDashboardProps {
  user: User | null;
  selectedNumbers: Set<number>;
  currentBet: number;
  onBetChange: (amount: number) => void;
  potentialWin: number;
  drawnNumbers: number[];
  onPlaceBet: () => void;
  onClearSelections: () => void;
  isPlacingBet: boolean;
  canPlaceBet: boolean;
  nextDrawTime: number;
  isConnected: boolean;
}

export function PlayerDashboard({
  user,
  selectedNumbers,
  currentBet,
  onBetChange,
  potentialWin,
  drawnNumbers,
  onPlaceBet,
  onClearSelections,
  isPlacingBet,
  canPlaceBet,
  nextDrawTime,
  isConnected
}: PlayerDashboardProps) {
  const timeRemaining = Math.max(0, Math.ceil((nextDrawTime - Date.now()) / 1000));
  
  const formatBalance = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const betAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-center space-x-2 text-sm">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400">Disconnected</span>
          </>
        )}
      </div>

      {/* Player Stats */}
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Your Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Balance</span>
            <span className="text-white font-bold">
              {user ? formatBalance(user.balance) : "$0.00"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Current Bet</span>
            <span className="text-game-amber font-bold">{formatBalance(currentBet * 100)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Numbers Picked</span>
            <span className="text-white font-bold">{selectedNumbers.size}/10</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Potential Win</span>
            <span className="text-game-green font-bold">{formatBalance(potentialWin * 100)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Betting Controls */}
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Quick Bet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {betAmounts.map((amount) => (
              <Button
                key={amount}
                variant={currentBet === amount ? "default" : "secondary"}
                size="sm"
                onClick={() => onBetChange(amount)}
                className={currentBet === amount ? "bg-game-amber text-black" : ""}
              >
                ${amount}
              </Button>
            ))}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBetChange(Math.min(500, Math.floor((user?.balance || 0) / 100)))}
            >
              MAX
            </Button>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-game-green hover:bg-green-600"
              onClick={onPlaceBet}
              disabled={!canPlaceBet || isPlacingBet}
            >
              {isPlacingBet ? "Placing Bet..." : "Place Bet"}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={onClearSelections}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drawn Numbers History */}
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Drawn Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {drawnNumbers.slice(0, 15).map((number, index) => (
              <div
                key={index}
                className="w-8 h-8 bg-game-purple rounded-full flex items-center justify-center text-white text-xs font-bold border border-blue-300"
              >
                {number}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 15 - drawnNumbers.length) }, (_, i) => (
              <div
                key={`empty-${i}`}
                className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-xs"
              >
                ?
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-400">
            Next draw in: <span className="text-white font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Results */}
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold">Game #1246</div>
                <div className="text-sm text-gray-400">2 min ago</div>
              </div>
              <div className="text-right">
                <div className="text-game-green font-bold">+$45</div>
                <div className="text-xs text-gray-400">3 matches</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold">Game #1245</div>
                <div className="text-sm text-gray-400">5 min ago</div>
              </div>
              <div className="text-right">
                <div className="text-red-400 font-bold">-$25</div>
                <div className="text-xs text-gray-400">1 match</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
