import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface KenoGameBoardProps {
  selectedNumbers: Set<number>;
  drawnNumbers: Set<number>;
  winningNumbers: Set<number>;
  isDrawing: boolean;
  onNumberSelect: (number: number) => void;
}

export function KenoGameBoard({
  selectedNumbers,
  drawnNumbers,
  winningNumbers,
  isDrawing,
  onNumberSelect
}: KenoGameBoardProps) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="grid grid-cols-10 gap-3">
        {Array.from({ length: 80 }, (_, i) => i + 1).map((number) => {
          const isSelected = selectedNumbers.has(number);
          const isDrawn = drawnNumbers.has(number);
          const isWinner = winningNumbers.has(number);
          
          return (
            <motion.button
              key={number}
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm border-2 relative overflow-hidden transition-all duration-300",
                isDrawn && isWinner
                  ? "bg-green-500 border-green-400 shadow-lg shadow-green-500/50"
                  : isDrawn
                  ? "bg-blue-600 border-blue-400"
                  : isSelected
                  ? "bg-gray-700 border-yellow-400"
                  : "bg-gray-800 border-gray-600 hover:border-gray-400",
                !isDrawing && !isDrawn ? "cursor-pointer" : "cursor-not-allowed"
              )}
              onClick={() => !isDrawing && !isDrawn && onNumberSelect(number)}
              whileHover={!isDrawing && !isDrawn ? { scale: 1.05 } : {}}
              whileTap={!isDrawing && !isDrawn ? { scale: 0.95 } : {}}
            >
              {isDrawn && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1, 0.7]
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              )}
              
              {isDrawn && isWinner && (
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
              
              <motion.span
                className="relative z-10"
                animate={isDrawn ? {
                  scale: [1, 1.3, 1],
                  opacity: [0, 1, 1],
                } : {}}
                transition={{ duration: 0.6 }}
              >
                {number}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}