import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Zap, Star } from "lucide-react";

interface ModernKenoGridProps {
  selectedNumbers: Set<number>;
  drawnNumbers: Set<number>;
  winningNumbers: Set<number>;
  isDrawing: boolean;
  onNumberSelect: (number: number) => void;
  drawingSequence?: number[];
  currentDrawIndex?: number;
}

export function ModernKenoGrid({
  selectedNumbers,
  drawnNumbers,
  winningNumbers,
  isDrawing,
  onNumberSelect,
  drawingSequence = [],
  currentDrawIndex = 0
}: ModernKenoGridProps) {
  const currentlyBeingDrawn = drawingSequence[currentDrawIndex];

  const getNumberState = (number: number) => {
    if (winningNumbers.has(number)) return 'winner';
    if (drawnNumbers.has(number)) return 'drawn';
    if (selectedNumbers.has(number)) return 'selected';
    if (number === currentlyBeingDrawn && isDrawing) return 'drawing';
    return 'default';
  };

  const getNumberClassName = (state: string) => {
    const baseClasses = "relative w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm border-2 transition-all duration-300 cursor-pointer overflow-hidden";
    
    switch (state) {
      case 'winner':
        return cn(baseClasses, "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-110");
      case 'drawn':
        return cn(baseClasses, "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-lg shadow-blue-500/20");
      case 'selected':
        return cn(baseClasses, "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 shadow-lg shadow-amber-500/30");
      case 'drawing':
        return cn(baseClasses, "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400 animate-pulse shadow-lg shadow-purple-500/40");
      default:
        return cn(baseClasses, "bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)] hover:border-[var(--keno-accent-gold)] hover:bg-[var(--keno-bg-secondary)] hover:shadow-lg hover:shadow-[var(--keno-accent-gold)]/10");
    }
  };

  return (
    <div className="bg-[var(--keno-bg-secondary)]/80 backdrop-blur-sm rounded-2xl border border-[var(--keno-border)] p-8 shadow-2xl">
      {/* Grid Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-[var(--keno-bg-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--keno-text-primary)]">Select Your Numbers</h2>
            <p className="text-sm text-[var(--keno-text-secondary)]">Choose up to 10 numbers (1-80)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--keno-text-muted)]">Selected</p>
          <p className="text-xl font-bold text-[var(--keno-accent-gold)]">{selectedNumbers.size}/10</p>
        </div>
      </div>

      {/* Number Grid - 10x8 layout */}
      <div className="grid grid-cols-10 gap-4">
        {Array.from({ length: 80 }, (_, i) => i + 1).map((number) => {
          const state = getNumberState(number);
          const canSelect = !isDrawing && !drawnNumbers.has(number);
          
          return (
            <motion.button
              key={number}
              className={getNumberClassName(state)}
              onClick={() => canSelect && onNumberSelect(number)}
              disabled={!canSelect}
              whileHover={canSelect ? { scale: 1.1 } : {}}
              whileTap={canSelect ? { scale: 0.95 } : {}}
              layout
            >
              {/* Background Effects */}
              <AnimatePresence>
                {state === 'winner' && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(16, 185, 129, 0.8)",
                        "0 0 0 20px rgba(16, 185, 129, 0)",
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Winner Star Icon */}
              {state === 'winner' && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Star className="w-4 h-4 text-yellow-300 fill-current" />
                </motion.div>
              )}

              {/* Drawing Animation */}
              {state === 'drawing' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Number Text */}
              <motion.span
                className="relative z-10 font-mono"
                animate={
                  state === 'drawing' ? {
                    scale: [1, 1.2, 1],
                    textShadow: [
                      "0 0 0px rgba(255, 255, 255, 0)",
                      "0 0 10px rgba(255, 255, 255, 0.8)",
                      "0 0 0px rgba(255, 255, 255, 0)"
                    ]
                  } : state === 'winner' ? {
                    scale: [1, 1.1, 1]
                  } : {}
                }
                transition={{ duration: 0.6, repeat: state === 'drawing' ? Infinity : 0 }}
              >
                {number}
              </motion.span>

              {/* Selection Indicator */}
              {state === 'selected' && (
                <motion.div
                  className="absolute inset-0 border-2 border-dashed border-white/30 rounded-xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Grid Legend */}
      <div className="flex items-center justify-center space-x-8 mt-6 pt-4 border-t border-[var(--keno-border)]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded border border-amber-400"></div>
          <span className="text-sm text-[var(--keno-text-secondary)]">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded border border-blue-400"></div>
          <span className="text-sm text-[var(--keno-text-secondary)]">Drawn</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded border border-emerald-400"></div>
          <span className="text-sm text-[var(--keno-text-secondary)]">Winner</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded border border-purple-400 animate-pulse"></div>
          <span className="text-sm text-[var(--keno-text-secondary)]">Drawing</span>
        </div>
      </div>
    </div>
  );
}