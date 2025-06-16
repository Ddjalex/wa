import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";

interface BettingTicketProps {
  user: User | null;
  selectedNumbers: Set<number>;
  currentBet: number;
  onBetChange: (amount: number) => void;
  potentialWin: number;
  onPlaceBet: () => void;
  onClearSelections: () => void;
  isPlacingBet: boolean;
  canPlaceBet: boolean;
  drawnNumbers: Set<number>;
}

export function BettingTicket({
  user,
  selectedNumbers,
  currentBet,
  onBetChange,
  potentialWin,
  onPlaceBet,
  onClearSelections,
  isPlacingBet,
  canPlaceBet,
  drawnNumbers
}: BettingTicketProps) {
  const formatBalance = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const betAmounts = [5, 10, 25, 50, 100];
  const selectedArray = Array.from(selectedNumbers);

  return (
    <div className="space-y-4">
      {/* Player Info */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">Betting Ticket</CardTitle>
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
            <span className="text-yellow-400 font-bold">{formatBalance(currentBet * 100)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Potential Win</span>
            <span className="text-green-400 font-bold">{formatBalance(potentialWin * 100)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Numbers */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">
            Selected Numbers ({selectedNumbers.size}/10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4 min-h-[80px]">
            {selectedArray.map((number) => {
              const isDrawn = drawnNumbers.has(number);
              const isMatched = isDrawn;
              
              return (
                <motion.div
                  key={number}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold border-2 relative",
                    isMatched
                      ? "bg-green-500 border-green-400 shadow-lg shadow-green-500/50"
                      : "bg-yellow-600 border-yellow-400"
                  )}
                >
                  {isMatched && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(34, 197, 94, 0.7)",
                          "0 0 0 20px rgba(34, 197, 94, 0)",
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  <span className="relative z-10">{number}</span>
                </motion.div>
              );
            })}
          </div>
          
          {selectedNumbers.size === 0 && (
            <div className="text-center text-gray-400 py-8">
              Select numbers from the board
            </div>
          )}
        </CardContent>
      </Card>

      {/* Betting Controls */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-4">
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
                className={currentBet === amount ? "bg-yellow-600 text-black hover:bg-yellow-500" : ""}
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
              className="w-full bg-green-600 hover:bg-green-700"
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
    </div>
  );
}