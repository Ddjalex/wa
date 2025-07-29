import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Play, 
  Pause,
  Clock
} from "lucide-react";

interface ModernDrawingPreviewProps {
  drawnNumbers: number[];
  currentDrawIndex: number;
  isDrawing: boolean;
  gameNumber: number;
}

export function ModernDrawingPreview({
  drawnNumbers,
  currentDrawIndex,
  isDrawing,
  gameNumber
}: ModernDrawingPreviewProps) {
  // Show numbers up to current index during drawing, all numbers when complete
  const displayNumbers = isDrawing 
    ? drawnNumbers.slice(0, Math.max(0, currentDrawIndex))
    : drawnNumbers.slice(0, -1); // All except the last one (which shows in center)
  
  const currentNumber = isDrawing ? drawnNumbers[currentDrawIndex] : null;
  const lastDrawnNumber = drawnNumbers[drawnNumbers.length - 1];
  const centerNumber = isDrawing ? currentNumber : lastDrawnNumber;

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-white">
          <h2 className="text-2xl font-bold">FAST KENO</h2>
          <p className="text-slate-400 text-sm">Game #{gameNumber}</p>
        </div>
        <div className="text-right text-slate-300">
          <div className="text-sm">
            {isDrawing 
              ? `${Math.min(currentDrawIndex + 1, drawnNumbers.length)} / 20` 
              : `${drawnNumbers.length} / 20`
            }
          </div>
        </div>
      </div>

      {/* Current Drawing Ball - Large Center Display (matches image style) */}
      <div className="text-center mb-8">
        {centerNumber ? (
          <motion.div
            key={centerNumber}
            className={cn(
              "w-32 h-32 mx-auto rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 shadow-2xl relative",
              isDrawing 
                ? "bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500" 
                : "bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500"
            )}
            initial={isDrawing ? { scale: 0, rotate: -180, opacity: 0 } : { scale: 1, opacity: 1 }}
            animate={isDrawing ? { 
              scale: [0, 1.1, 1],
              rotate: [180, 0, 0],
              opacity: [0, 1, 1]
            } : { scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1.2,
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Glowing effect for current ball */}
            {isDrawing && (
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              />
            )}
            {centerNumber}
          </motion.div>
        ) : (
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-slate-400 text-xl font-bold border-4 border-slate-600">
            <Clock className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Previously Drawn Numbers - Small balls in grid (matches image style) */}
      <div className="grid grid-cols-4 gap-3 justify-items-center min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {displayNumbers.map((number, index) => (
            <motion.div
              key={`drawn-${number}-${index}`}
              className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-green-500 shadow-lg"
              initial={{ 
                scale: 0, 
                opacity: 0, 
                y: -30,
                rotateY: -180 
              }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                rotateY: 0 
              }}
              exit={{ 
                scale: 0, 
                opacity: 0,
                y: 30,
                transition: { duration: 0.3 }
              }}
              transition={{ 
                duration: 1, 
                delay: isDrawing ? 0.5 : index * 0.1, // Delay when drawing to show sequence
                type: "spring",
                stiffness: 150,
                damping: 12
              }}
              layout
            >
              {number}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty slots for remaining numbers */}
        {displayNumbers.length === 0 && !isDrawing && (
          <div className="col-span-4 flex items-center justify-center text-slate-500 py-8">
            <Clock className="w-8 h-8 mr-2" />
            <span>Waiting for first draw</span>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center mt-6">
        {isDrawing ? (
          <div className="text-green-400 text-sm font-medium flex items-center justify-center space-x-2">
            <Play className="w-4 h-4 animate-pulse" />
            <span>DRAWING IN PROGRESS</span>
          </div>
        ) : (
          <div className="text-slate-400 text-sm font-medium flex items-center justify-center space-x-2">
            <Pause className="w-4 h-4" />
            <span>WAITING FOR NEXT DRAW</span>
          </div>
        )}
      </div>
    </div>
  );
}