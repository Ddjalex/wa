import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Trophy, 
  Coins, 
  User, 
  Settings, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Play,
  Pause,
  Ticket
} from "lucide-react";

interface ModernKenoLayoutProps {
  children: React.ReactNode;
  gameNumber: number;
  nextDrawTime: Date | null;
  isDrawing: boolean;
  timeUntilNext: number;
  userBalance: number;
  totalWinnings: number;
  onSoundToggle: () => void;
  isSoundEnabled: boolean;
  onBalanceClick?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  onTicketsClick?: () => void;
}

export function ModernKenoLayout({
  children,
  gameNumber,
  nextDrawTime,
  isDrawing,
  timeUntilNext,
  userBalance,
  totalWinnings,
  onSoundToggle,
  isSoundEnabled,
  onBalanceClick,
  onSettingsClick,
  onProfileClick,
  onTicketsClick,
}: ModernKenoLayoutProps) {
  const formatBalance = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ETB`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--keno-bg-primary)] via-[var(--keno-bg-secondary)] to-[var(--keno-bg-tertiary)]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-[var(--keno-bg-primary)]/90 backdrop-blur-md border-b border-[var(--keno-border)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Logo & Game Info */}
            <div className="flex items-center space-x-6">
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-[var(--keno-bg-primary)]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[var(--keno-text-primary)]">KENO</h1>
                  <p className="text-sm text-[var(--keno-text-secondary)]">Game #{gameNumber}</p>
                </div>
              </motion.div>

              {/* Game Status */}
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={isDrawing ? "default" : "secondary"}
                  className={cn(
                    "px-3 py-1 text-sm font-medium",
                    isDrawing 
                      ? "bg-[var(--keno-accent-green)] text-white animate-pulse" 
                      : "bg-[var(--keno-bg-tertiary)] text-[var(--keno-text-secondary)]"
                  )}
                >
                  {isDrawing ? (
                    <><Play className="w-3 h-3 mr-1" />DRAWING</>
                  ) : (
                    <><Clock className="w-3 h-3 mr-1" />WAITING</>
                  )}
                </Badge>

                <div className="flex items-center space-x-2 text-[var(--keno-text-secondary)]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-mono">
                    Next: {formatTime(timeUntilNext)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - User Info & Controls */}
            <div className="flex items-center space-x-4">
              {/* Balance Display - Clickable */}
              <Card 
                className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)] cursor-pointer hover:bg-[var(--keno-bg-secondary)] transition-colors"
                onClick={onBalanceClick}
              >
                <CardContent className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <Coins className="w-5 h-5 text-[var(--keno-accent-gold)]" />
                    <div>
                      <p className="text-xs text-[var(--keno-text-muted)]">Balance</p>
                      <p className="text-sm font-bold text-[var(--keno-text-primary)]">
                        {formatBalance(userBalance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Winnings Display */}
              <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)]">
                <CardContent className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-[var(--keno-accent-green)]" />
                    <div>
                      <p className="text-xs text-[var(--keno-text-muted)]">Today's Wins</p>
                      <p className="text-sm font-bold text-[var(--keno-accent-green)]">
                        {formatBalance(totalWinnings)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator orientation="vertical" className="h-8 bg-[var(--keno-border)]" />

              {/* Control Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSoundToggle}
                  className="text-[var(--keno-text-secondary)] hover:text-[var(--keno-text-primary)] hover:bg-[var(--keno-bg-tertiary)]"
                >
                  {isSoundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettingsClick}
                  className="text-[var(--keno-text-secondary)] hover:text-[var(--keno-text-primary)] hover:bg-[var(--keno-bg-tertiary)]"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onProfileClick}
                  className="text-[var(--keno-text-secondary)] hover:text-[var(--keno-text-primary)] hover:bg-[var(--keno-bg-tertiary)]"
                >
                  <User className="w-4 h-4" />
                </Button>

                {/* Tickets Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTicketsClick}
                  className="text-[var(--keno-text-secondary)] hover:text-[var(--keno-text-primary)] hover:bg-[var(--keno-bg-tertiary)]"
                >
                  <Ticket className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}