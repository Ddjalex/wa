import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AnimationPreviewProps {
  currentSequence: number[];
  currentDrawNumber: number;
  totalDraws: number;
  nextDrawTime: number;
  onToggle: () => void;
}

export function AnimationPreview({
  currentSequence,
  currentDrawNumber,
  totalDraws,
  nextDrawTime,
  onToggle
}: AnimationPreviewProps) {
  const timeRemaining = Math.max(0, Math.ceil((nextDrawTime - Date.now()) / 1000));
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-600">
      <div className="container mx-auto px-4 py-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-white font-medium text-xs">Live Draw</h3>
            <div className="flex items-center space-x-1.5">
              <AnimatePresence>
                {currentSequence.map((number, index) => (
                  <motion.div
                    key={`${number}-${index}`}
                    initial={{ x: -50, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 50, opacity: 0, scale: 0.8 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                    className="preview-slide"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-game-purple to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold border border-game-gold shadow-lg">
                      {number}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="text-gray-400 text-xs ml-2">
                {currentDrawNumber}/{totalDraws}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-white text-xs">
              Next: <span className="text-game-amber font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
