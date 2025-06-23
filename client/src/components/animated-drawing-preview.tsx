import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";

interface AnimatedDrawingPreviewProps {
  drawnNumbers: number[];
  currentDrawIndex: number;
  isDrawing: boolean;
  gameNumber: number;
  onToggle?: () => void;
}

interface AnimatedBall {
  number: number;
  index: number;
  isNew: boolean;
}

export function AnimatedDrawingPreview({
  drawnNumbers,
  currentDrawIndex,
  isDrawing,
  gameNumber,
  onToggle
}: AnimatedDrawingPreviewProps) {
  const [displayedBalls, setDisplayedBalls] = useState<AnimatedBall[]>([]);
  const [lastDrawnNumber, setLastDrawnNumber] = useState<number | null>(null);

  useEffect(() => {
    if (drawnNumbers.length === 0) {
      setDisplayedBalls([]);
      setLastDrawnNumber(null);
      return;
    }

    // Update displayed balls when new numbers are drawn
    const newBalls: AnimatedBall[] = drawnNumbers.slice(0, currentDrawIndex + 1).map((number, index) => ({
      number,
      index,
      isNew: index === currentDrawIndex && number !== lastDrawnNumber
    }));

    setDisplayedBalls(newBalls);
    
    if (currentDrawIndex >= 0 && drawnNumbers[currentDrawIndex]) {
      setLastDrawnNumber(drawnNumbers[currentDrawIndex]);
    }

    // Reset "new" status after animation
    const timer = setTimeout(() => {
      setDisplayedBalls(prev => prev.map(ball => ({ ...ball, isNew: false })));
    }, 1000);

    return () => clearTimeout(timer);
  }, [drawnNumbers, currentDrawIndex]);

  const getBallColor = (index: number) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500", 
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500"
    ];
    return colors[index % colors.length];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const ballVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      y: -50,
      rotate: -180
    },
    visible: { 
      scale: 1,
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
        duration: 0.8
      }
    },
    new: {
      scale: [1, 1.3, 1],
      boxShadow: [
        "0 0 0px rgba(255, 255, 255, 0)",
        "0 0 30px rgba(255, 255, 255, 0.8)",
        "0 0 15px rgba(255, 255, 255, 0.4)"
      ],
      transition: {
        duration: 1,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <Card className="bg-black/20 border-gray-700 w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <motion.div
              animate={isDrawing ? "animate" : ""}
              variants={pulseVariants}
              className="w-3 h-3 bg-green-400 rounded-full"
            />
            Live Draw #{gameNumber}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isDrawing ? "default" : "secondary"} className="bg-green-500">
              {isDrawing ? "LIVE" : "COMPLETE"}
            </Badge>
            <Badge variant="outline" className="text-white border-gray-600">
              {displayedBalls.length}/20
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Drawing Status */}
          <div className="text-center">
            {isDrawing ? (
              <div className="space-y-2">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-yellow-400 font-semibold"
                >
                  Drawing numbers... {currentDrawIndex + 1}/20
                </motion.div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentDrawIndex + 1) / 20) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-green-400 font-semibold">
                Drawing Complete - All 20 numbers drawn
              </div>
            )}
          </div>

          {/* Recently Drawn Numbers */}
          {lastDrawnNumber && isDrawing && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-gray-400 text-sm mb-2">Latest Number</div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0px rgba(34, 197, 94, 0)",
                    "0 0 40px rgba(34, 197, 94, 0.8)",
                    "0 0 20px rgba(34, 197, 94, 0.4)"
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white font-bold text-xl rounded-full"
              >
                {lastDrawnNumber}
              </motion.div>
            </motion.div>
          )}

          {/* Drawn Numbers Grid */}
          <div className="space-y-3">
            <div className="text-gray-400 text-sm font-medium">
              Drawn Numbers ({displayedBalls.length})
            </div>
            <motion.div
              className="grid grid-cols-5 gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {displayedBalls.map((ball) => (
                  <motion.div
                    key={`${ball.number}-${ball.index}`}
                    layout
                    variants={ballVariants}
                    initial="hidden"
                    animate={ball.isNew ? "new" : "visible"}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-sm
                      ${getBallColor(ball.index)} shadow-lg
                    `}
                  >
                    {ball.number}
                    {ball.isNew && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 0] }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 rounded-full border-2 border-white opacity-50"
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Next Numbers Placeholder */}
          {isDrawing && displayedBalls.length < 20 && (
            <div className="space-y-3">
              <div className="text-gray-500 text-sm font-medium">
                Upcoming ({20 - displayedBalls.length} remaining)
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: Math.min(10, 20 - displayedBalls.length) }).map((_, index) => (
                  <motion.div
                    key={`placeholder-${index}`}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.95, 1, 0.95]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.1
                    }}
                    className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-gray-600 text-gray-500 text-xs"
                  >
                    ?
                  </motion.div>
                ))}
                {20 - displayedBalls.length > 10 && (
                  <div className="col-span-5 text-center text-gray-500 text-xs">
                    +{20 - displayedBalls.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Animation Controls */}
          {onToggle && (
            <div className="flex justify-center pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isDrawing ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Animation
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume Animation
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}