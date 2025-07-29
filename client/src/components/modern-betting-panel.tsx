import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Coins, 
  TrendingUp, 
  Target, 
  Trash2, 
  Play,
  Calculator,
  Sparkles
} from "lucide-react";
import type { User } from "@shared/schema";

interface ModernBettingPanelProps {
  user: User | null;
  selectedNumbers: Set<number>;
  currentBet: number;
  onBetChange: (amount: number) => void;
  potentialWin: number;
  onPlaceBet: () => void;
  onClearSelections: () => void;
  isPlacingBet: boolean;
  canPlaceBet: boolean;
}

export function ModernBettingPanel({
  user,
  selectedNumbers,
  currentBet,
  onBetChange,
  potentialWin,
  onPlaceBet,
  onClearSelections,
  isPlacingBet,
  canPlaceBet
}: ModernBettingPanelProps) {
  const formatBalance = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ETB`;
  };

  const betAmounts = [20, 50, 100, 250, 500, 1000];
  const selectedArray = Array.from(selectedNumbers).sort((a, b) => a - b);

  const getMultiplier = () => {
    const matches = selectedNumbers.size;
    const payoutTable: { [key: number]: number } = {
      1: 2, 2: 2, 3: 3, 4: 5, 5: 10, 6: 25, 7: 50, 8: 100, 9: 250, 10: 500,
    };
    return payoutTable[matches] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Player Balance Card */}
      <Card className="bg-gradient-to-br from-[var(--keno-bg-secondary)] to-[var(--keno-bg-tertiary)] border-[var(--keno-border)] shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-[var(--keno-text-primary)] flex items-center space-x-2">
            <Coins className="w-5 h-5 text-[var(--keno-accent-gold)]" />
            <span>Account Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--keno-accent-gold)]">
              {user ? formatBalance(user.balance) : "0.00 ETB"}
            </p>
            <p className="text-sm text-[var(--keno-text-muted)]">Available to bet</p>
          </div>
        </CardContent>
      </Card>

      {/* Selected Numbers Card */}
      <Card className="bg-[var(--keno-bg-secondary)] border-[var(--keno-border)] shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-[var(--keno-text-primary)] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-[var(--keno-accent-blue)]" />
              <span>Your Numbers</span>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-[var(--keno-bg-tertiary)] text-[var(--keno-text-secondary)]"
            >
              {selectedNumbers.size}/10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4 min-h-[120px]">
            {selectedArray.map((number) => (
              <motion.div
                key={number}
                className="w-10 h-10 bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 rounded-lg flex items-center justify-center text-[var(--keno-bg-primary)] font-bold text-sm border border-amber-400"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {number}
              </motion.div>
            ))}
          </div>

          {selectedNumbers.size === 0 && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-[var(--keno-text-muted)] mx-auto mb-2" />
              <p className="text-[var(--keno-text-muted)]">Select numbers to start playing</p>
            </div>
          )}

          {selectedNumbers.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelections}
              className="w-full border-[var(--keno-border)] text-[var(--keno-text-secondary)] hover:bg-[var(--keno-bg-tertiary)] hover:text-[var(--keno-text-primary)]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Bet Amount Card */}
      <Card className="bg-[var(--keno-bg-secondary)] border-[var(--keno-border)] shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-[var(--keno-text-primary)] flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-[var(--keno-accent-green)]" />
            <span>Bet Amount</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Bet Display */}
          <div className="text-center p-4 bg-[var(--keno-bg-tertiary)] rounded-xl border border-[var(--keno-border)]">
            <p className="text-sm text-[var(--keno-text-muted)]">Current Bet</p>
            <p className="text-2xl font-bold text-[var(--keno-text-primary)]">
              {formatBalance(currentBet * 100)}
            </p>
          </div>

          {/* Bet Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {betAmounts.map((amount) => (
              <Button
                key={amount}
                variant={currentBet === amount ? "default" : "outline"}
                size="sm"
                onClick={() => onBetChange(amount)}
                className={cn(
                  "font-bold transition-all duration-200",
                  currentBet === amount
                    ? "bg-[var(--keno-accent-gold)] text-[var(--keno-bg-primary)] border-[var(--keno-accent-gold)]"
                    : "border-[var(--keno-border)] text-[var(--keno-text-secondary)] hover:bg-[var(--keno-bg-tertiary)] hover:text-[var(--keno-text-primary)]"
                )}
              >
                {amount} ETB
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payout Info Card */}
      <Card className="bg-gradient-to-br from-[var(--keno-bg-secondary)] to-[var(--keno-bg-tertiary)] border-[var(--keno-border)] shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-[var(--keno-text-primary)] flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[var(--keno-accent-green)]" />
            <span>Potential Payout</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--keno-accent-green)]">
              {formatBalance(potentialWin * 100)}
            </p>
            <p className="text-sm text-[var(--keno-text-muted)]">
              {getMultiplier()}x multiplier for {selectedNumbers.size} numbers
            </p>
          </div>

          <Separator className="bg-[var(--keno-border)]" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--keno-text-secondary)]">
              <span>Bet Amount:</span>
              <span>{formatBalance(currentBet * 100)}</span>
            </div>
            <div className="flex justify-between text-[var(--keno-text-secondary)]">
              <span>Numbers Selected:</span>
              <span>{selectedNumbers.size}</span>
            </div>
            <div className="flex justify-between text-[var(--keno-text-secondary)]">
              <span>Multiplier:</span>
              <span>{getMultiplier()}x</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Place Bet Button */}
      <motion.div
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={onPlaceBet}
          disabled={!canPlaceBet || isPlacingBet}
          className={cn(
            "w-full h-14 text-lg font-bold transition-all duration-300 shadow-xl",
            canPlaceBet
              ? "bg-gradient-to-r from-[var(--keno-accent-gold)] to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-[var(--keno-bg-primary)] shadow-[var(--keno-accent-gold)]/30"
              : "bg-[var(--keno-bg-tertiary)] text-[var(--keno-text-muted)] cursor-not-allowed"
          )}
        >
          {isPlacingBet ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-[var(--keno-bg-primary)] border-r-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Placing Bet...
            </>
          ) : canPlaceBet ? (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Place Bet - {formatBalance(currentBet * 100)}
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Select Numbers to Bet
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}