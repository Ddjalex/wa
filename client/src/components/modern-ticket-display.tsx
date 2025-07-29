import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Ticket,
  Clock,
  Coins,
  X,
  Star,
  Trophy
} from "lucide-react";

interface Bet {
  id: string;
  gameNumber: number;
  selectedNumbers: number[];
  betAmount: number;
  potentialWin: number;
  status: 'active' | 'won' | 'lost';
  winAmount?: number;
  matchedNumbers?: number[];
}

interface ModernTicketDisplayProps {
  activeBets: Bet[];
  isVisible: boolean;
  onClose: () => void;
}

export function ModernTicketDisplay({ 
  activeBets, 
  isVisible, 
  onClose 
}: ModernTicketDisplayProps) {
  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ETB`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[var(--keno-bg-secondary)] rounded-2xl border border-[var(--keno-border)] shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--keno-border)]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-[var(--keno-bg-primary)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--keno-text-primary)]">My Tickets</h2>
                <p className="text-sm text-[var(--keno-text-secondary)]">{activeBets.length} active bets</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[var(--keno-text-secondary)] hover:text-[var(--keno-text-primary)]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tickets List */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeBets.length > 0 ? (
              <div className="space-y-4">
                {activeBets.map((bet) => (
                  <motion.div
                    key={bet.id}
                    className="bg-[var(--keno-bg-tertiary)] rounded-xl border border-[var(--keno-border)] p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[var(--keno-accent-blue)] to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{bet.gameNumber}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--keno-text-primary)]">Game #{bet.gameNumber}</h3>
                          <p className="text-sm text-[var(--keno-text-secondary)]">
                            {bet.selectedNumbers.length} numbers selected
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={bet.status === 'active' ? 'default' : bet.status === 'won' ? 'destructive' : 'secondary'}
                        className={cn(
                          bet.status === 'active' && "bg-[var(--keno-accent-blue)] text-white",
                          bet.status === 'won' && "bg-[var(--keno-accent-green)] text-white",
                          bet.status === 'lost' && "bg-[var(--keno-bg-tertiary)] text-[var(--keno-text-secondary)]"
                        )}
                      >
                        {bet.status === 'active' && (
                          <><Clock className="w-3 h-3 mr-1" />ACTIVE</>
                        )}
                        {bet.status === 'won' && (
                          <><Trophy className="w-3 h-3 mr-1" />WON</>
                        )}
                        {bet.status === 'lost' && (
                          <>LOST</>
                        )}
                      </Badge>
                    </div>

                    {/* Selected Numbers */}
                    <div className="mb-4">
                      <p className="text-sm text-[var(--keno-text-secondary)] mb-2">Your Numbers:</p>
                      <div className="flex flex-wrap gap-2">
                        {bet.selectedNumbers.map((number) => (
                          <div
                            key={number}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm border-2",
                              bet.matchedNumbers?.includes(number)
                                ? "bg-gradient-to-br from-[var(--keno-accent-green)] to-green-600 border-green-400"
                                : "bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 border-yellow-400"
                            )}
                          >
                            {number}
                            {bet.matchedNumbers?.includes(number) && (
                              <Star className="absolute w-3 h-3 text-yellow-300 fill-current -top-1 -right-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Bet Details */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-[var(--keno-text-secondary)]">
                          <Coins className="w-4 h-4" />
                          <span>Bet: {formatCurrency(bet.betAmount)}</span>
                        </div>
                        {bet.status === 'won' && bet.winAmount && (
                          <div className="flex items-center space-x-1 text-[var(--keno-accent-green)]">
                            <Trophy className="w-4 h-4" />
                            <span>Won: {formatCurrency(bet.winAmount)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--keno-text-muted)]">Potential Win</p>
                        <p className="font-bold text-[var(--keno-accent-gold)]">
                          {formatCurrency(bet.potentialWin)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-[var(--keno-text-muted)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--keno-text-primary)] mb-2">
                  No Active Tickets
                </h3>
                <p className="text-[var(--keno-text-secondary)] max-w-md mx-auto">
                  Place a bet to see your tickets here. Select your numbers and choose your bet amount to get started.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}