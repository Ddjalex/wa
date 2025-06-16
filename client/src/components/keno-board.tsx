import { motion } from "framer-motion";
import { Ball } from "@/components/ui/ball";

interface KenoBoardProps {
  selectedNumbers: Set<number>;
  drawnNumbers: Set<number>;
  winningNumbers: Set<number>;
  isDrawing: boolean;
  gameNumber: number;
  drawCount: number;
  totalDraws: number;
  onNumberSelect: (number: number) => void;
}

export function KenoBoard({
  selectedNumbers,
  drawnNumbers,
  winningNumbers,
  isDrawing,
  gameNumber,
  drawCount,
  totalDraws,
  onNumberSelect
}: KenoBoardProps) {
  
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
            <span className="text-green-400 text-sm font-semibold">Draw</span>
            <span className="text-white font-bold ml-1">{drawCount}/{totalDraws}</span>
          </div>
        </div>
      </div>

      {/* Keno Number Grid */}
      <div className="grid grid-cols-10 gap-2 mb-6">
        {Array.from({ length: 80 }, (_, i) => i + 1).map((number) => (
          <Ball
            key={number}
            number={number}
            isSelected={selectedNumbers.has(number)}
            isDrawn={drawnNumbers.has(number)}
            isWinner={winningNumbers.has(number)}
            onClick={() => onNumberSelect(number)}
            disabled={drawnNumbers.has(number) || isDrawing}
          />
        ))}
      </div>

      {/* Draw Animation Area */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Current Draw</h3>
          <div className="text-3xl font-bold text-game-amber">
            {isDrawing ? "Drawing..." : "Waiting for next draw"}
          </div>
        </div>
        
        <div className="flex justify-center items-center h-32">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-game-purple to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-game-gold shadow-2xl"
            animate={isDrawing ? {
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            } : {}}
            transition={{
              duration: 2,
              repeat: isDrawing ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            ?
          </motion.div>
        </div>
      </div>
    </div>
  );
}
