import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ball } from "@/components/ui/ball";
import { SoundManager } from "@/lib/sound-manager";

interface EnhancedKenoBoardProps {
  selectedNumbers: Set<number>;
  drawnNumbers: Set<number>;
  winningNumbers: Set<number>;
  isDrawing: boolean;
  gameNumber: number;
  onNumberSelect: (number: number) => void;
  drawingSequence: number[];
  currentDrawIndex: number;
}

export function EnhancedKenoBoard({
  selectedNumbers,
  drawnNumbers,
  winningNumbers,
  isDrawing,
  gameNumber,
  onNumberSelect,
  drawingSequence,
  currentDrawIndex
}: EnhancedKenoBoardProps) {
  const [recentlyDrawn, setRecentlyDrawn] = useState<number | null>(null);
  const [animatingNumbers, setAnimatingNumbers] = useState<Set<number>>(new Set());
  const [soundManager] = useState(() => SoundManager.getInstance());

  const numbers = Array.from({ length: 80 }, (_, i) => i + 1);

  // Track recently drawn numbers for animation with sound effects
  useEffect(() => {
    if (isDrawing && drawingSequence.length > 0 && currentDrawIndex >= 0) {
      const currentNumber = drawingSequence[currentDrawIndex];
      if (currentNumber && currentNumber !== recentlyDrawn) {
        // Resume audio context and play ball bounce sound
        soundManager.resumeAudioContext();
        soundManager.playBallBounce();
        
        setRecentlyDrawn(currentNumber);
        setAnimatingNumbers(prev => new Set([...prev, currentNumber]));
        
        // Check if this is a winning number and play special sound
        if (winningNumbers.has(currentNumber)) {
          setTimeout(() => {
            soundManager.playWinningNumber();
          }, 300);
        }
        
        // Remove from animating set after animation completes
        const timer = setTimeout(() => {
          setAnimatingNumbers(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentNumber);
            return newSet;
          });
          
          // If this is the last number, play completion sound
          if (currentDrawIndex === drawingSequence.length - 1) {
            setTimeout(() => {
              soundManager.playDrawingComplete();
            }, 500);
          }
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [currentDrawIndex, drawingSequence, isDrawing, recentlyDrawn, winningNumbers, soundManager]);

  // Calculate which numbers should be visible based on drawing progress
  const visibleDrawnNumbers = new Set<number>();
  if (isDrawing && drawingSequence.length > 0) {
    for (let i = 0; i <= currentDrawIndex && i < drawingSequence.length; i++) {
      visibleDrawnNumbers.add(drawingSequence[i]);
    }
  } else if (!isDrawing) {
    drawnNumbers.forEach(num => visibleDrawnNumbers.add(num));
  }

  const getBallVariants = (number: number) => {
    const isJustDrawn = animatingNumbers.has(number);
    const isDrawnNumber = visibleDrawnNumbers.has(number);
    
    return {
      initial: {
        scale: 1,
        boxShadow: "0 0 0px rgba(34, 197, 94, 0)"
      },
      animate: isJustDrawn ? {
        scale: [1, 1.4, 1.2, 1],
        boxShadow: [
          "0 0 0px rgba(34, 197, 94, 0)",
          "0 0 40px rgba(34, 197, 94, 1)",
          "0 0 25px rgba(34, 197, 94, 0.8)",
          "0 0 15px rgba(34, 197, 94, 0.5)"
        ]
      } : isDrawnNumber ? {
        boxShadow: "0 0 10px rgba(34, 197, 94, 0.6)"
      } : {},
      transition: {
        duration: isJustDrawn ? 3 : 0.3,
        ease: "easeInOut"
      }
    };
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Keno Live Draw</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-game-purple/20 px-4 py-2 rounded-lg border border-game-purple/30">
            <span className="text-game-purple text-sm font-semibold">Game #</span>
            <span className="text-white font-bold ml-1">{gameNumber}</span>
          </div>
          <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
            <span className="text-green-400 text-sm font-semibold">
              {isDrawing ? "Drawing" : "Complete"}
            </span>
            <span className="text-white font-bold ml-1">
              {isDrawing ? `${Math.min(currentDrawIndex + 1, 20)}/20` : `${visibleDrawnNumbers.size}/20`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isDrawing && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Drawing Progress</span>
            <span>{Math.min(currentDrawIndex + 1, 20)} of 20 numbers</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(Math.min(currentDrawIndex + 1, 20) / 20) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Keno Number Grid */}
      <div className="grid grid-cols-10 gap-2 mb-6">
        {numbers.map((number) => {
          const isCurrentlyDrawn = visibleDrawnNumbers.has(number);
          const variants = getBallVariants(number);
          
          return (
            <motion.div
              key={number}
              variants={variants}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <Ball
                number={number}
                isSelected={selectedNumbers.has(number)}
                isDrawn={isCurrentlyDrawn}
                isWinner={winningNumbers.has(number)}
                onClick={() => onNumberSelect(number)}
                disabled={isDrawing}
              />
              
              {/* Pulse effect for recently drawn numbers */}
              <AnimatePresence>
                {animatingNumbers.has(number) && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-2 border-green-400 pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Drawing Status */}
      <div className="text-center">
        {isDrawing ? (
          <motion.div
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="space-y-2"
          >
            <div className="text-yellow-400 font-semibold">
              Drawing in progress... Please wait
            </div>
            {recentlyDrawn && (
              <div className="text-gray-400 text-sm">
                Latest number: <span className="text-green-400 font-bold">{recentlyDrawn}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2">
            <div className="text-green-400 font-semibold">
              Ready to play - Select your numbers
            </div>
            <div className="text-gray-400 text-sm">
              Choose 1-10 numbers and place your bet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}