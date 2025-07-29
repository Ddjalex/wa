import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp,
  Calendar,
  Hash
} from "lucide-react";

interface ModernDrawDisplayProps {
  gameNumber: number;
  drawnNumbers: Set<number>;
  isDrawing: boolean;
  nextDrawTime: Date | null;
  timeUntilNext: number;
  drawingSequence: number[];
  currentDrawIndex: number;
  gameHistory: Array<{
    gameNumber: number;
    drawnNumbers: number[];
    completedAt: Date | null;
  }>;
}

export function ModernDrawDisplay({
  gameNumber,
  drawnNumbers,
  isDrawing,
  nextDrawTime,
  timeUntilNext,
  drawingSequence,
  currentDrawIndex,
  gameHistory
}: ModernDrawDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const drawnArray = Array.from(drawnNumbers).sort((a, b) => a - b);
  const recentGames = gameHistory.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Current Game Status */}
      <Card className="bg-gradient-to-br from-[var(--keno-bg-secondary)] to-[var(--keno-bg-tertiary)] border-[var(--keno-border)] shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-[var(--keno-text-primary)] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--keno-accent-blue)] to-blue-600 rounded-xl flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Game #{gameNumber}</h2>
                <p className="text-sm text-[var(--keno-text-secondary)]">Current Draw</p>
              </div>
            </div>
            <Badge 
              variant={isDrawing ? "default" : "secondary"}
              className={cn(
                "px-4 py-2 text-sm font-medium",
                isDrawing 
                  ? "bg-[var(--keno-accent-green)] text-white animate-pulse" 
                  : "bg-[var(--keno-bg-tertiary)] text-[var(--keno-text-secondary)]"
              )}
            >
              {isDrawing ? (
                <><Play className="w-4 h-4 mr-2" />DRAWING</>
              ) : (
                <><Clock className="w-4 h-4 mr-2" />WAITING</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer */}
          <div className="text-center p-4 bg-[var(--keno-bg-tertiary)] rounded-xl border border-[var(--keno-border)]">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-[var(--keno-accent-gold)]" />
              <span className="text-sm text-[var(--keno-text-secondary)]">
                {isDrawing ? "Drawing in progress" : "Next draw in"}
              </span>
            </div>
            <p className="text-3xl font-mono font-bold text-[var(--keno-accent-gold)]">
              {formatTime(timeUntilNext)}
            </p>
          </div>

          {/* Draw Progress */}
          {isDrawing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[var(--keno-text-secondary)]">
                <span>Drawing Progress</span>
                <span>{drawnNumbers.size}/20</span>
              </div>
              <div className="w-full bg-[var(--keno-bg-tertiary)] rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-[var(--keno-accent-gold)] to-yellow-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(drawnNumbers.size / 20) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawn Numbers Display */}
      <Card className="bg-[var(--keno-bg-secondary)] border-[var(--keno-border)] shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-[var(--keno-text-primary)] flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[var(--keno-accent-green)]" />
            <span>Drawn Numbers ({drawnNumbers.size}/20)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3 min-h-[160px]">
            <AnimatePresence>
              {drawnArray.map((number, index) => (
                <motion.div
                  key={number}
                  className="w-12 h-12 bg-gradient-to-br from-[var(--keno-accent-blue)] to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm border border-blue-400 shadow-lg"
                  initial={{ scale: 0, opacity: 0, rotateY: -180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {number}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {drawnNumbers.size === 0 && (
            <div className="text-center py-8">
              <Pause className="w-12 h-12 text-[var(--keno-text-muted)] mx-auto mb-2" />
              <p className="text-[var(--keno-text-muted)]">
                {isDrawing ? "Drawing will begin shortly..." : "Waiting for next draw"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Games History */}
      <Card className="bg-[var(--keno-bg-secondary)] border-[var(--keno-border)] shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-[var(--keno-text-primary)] flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[var(--keno-text-secondary)]" />
            <span>Recent Games</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentGames.length > 0 ? (
              recentGames.map((game) => (
                <motion.div
                  key={game.gameNumber}
                  className="p-3 bg-[var(--keno-bg-tertiary)] rounded-lg border border-[var(--keno-border)]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--keno-text-primary)]">
                      Game #{game.gameNumber}
                    </span>
                    <span className="text-xs text-[var(--keno-text-muted)]">
                      {game.completedAt ? new Date(game.completedAt).toLocaleTimeString() : 'In Progress'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {game.drawnNumbers.slice(0, 10).map((number) => (
                      <div
                        key={number}
                        className="w-6 h-6 bg-[var(--keno-accent-blue)] rounded text-white text-xs flex items-center justify-center font-medium"
                      >
                        {number}
                      </div>
                    ))}
                    {game.drawnNumbers.length > 10 && (
                      <div className="w-6 h-6 bg-[var(--keno-text-muted)] rounded text-white text-xs flex items-center justify-center">
                        +{game.drawnNumbers.length - 10}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6">
                <RotateCcw className="w-8 h-8 text-[var(--keno-text-muted)] mx-auto mb-2" />
                <p className="text-[var(--keno-text-muted)]">No recent games</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}