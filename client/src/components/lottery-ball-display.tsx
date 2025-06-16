import { motion, AnimatePresence } from "framer-motion";

interface LotteryBallDisplayProps {
  drawnNumbers: number[];
  currentDrawNumber: number;
  totalDraws: number;
}

export function LotteryBallDisplay({
  drawnNumbers,
  currentDrawNumber,
  totalDraws
}: LotteryBallDisplayProps) {
  const recentNumbers = drawnNumbers.slice(-5); // Show last 5 numbers
  const latestNumber = recentNumbers[recentNumbers.length - 1];

  return (
    <div className="flex flex-col items-center space-y-4 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold text-lg mb-2">Live Draw</h3>
        <div className="text-gray-400 text-sm">
          {currentDrawNumber} / {totalDraws}
        </div>
      </div>

      {/* Main lottery ball */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {latestNumber && (
            <motion.div
              key={latestNumber}
              initial={{ y: -100, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: 0, 
                opacity: 1, 
                scale: 1,
                rotateX: [0, 360],
              }}
              exit={{ y: 100, opacity: 0, scale: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 1.5,
              }}
              className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-400 shadow-2xl relative overflow-hidden"
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                initial={{ x: -100 }}
                animate={{ x: 100 }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
              
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.7)",
                    "0 0 0 30px rgba(59, 130, 246, 0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <span className="relative z-10">{latestNumber}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Previous numbers */}
      <div className="flex items-center space-x-2">
        <AnimatePresence>
          {recentNumbers.slice(0, -1).map((number, index) => (
            <motion.div
              key={`${number}-${index}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-gray-500"
            >
              {number}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}