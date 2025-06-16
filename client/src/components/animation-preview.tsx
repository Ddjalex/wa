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
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-semibold text-sm">Live Draw</h3>
            <div className="flex items-center space-x-2">
              <AnimatePresence mode="wait">
                {currentSequence.map((number, index) => (
                  <motion.div
                    key={`${number}-${index}`}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="preview-slide"
                  >
                    <div className="w-8 h-8 bg-game-purple rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-game-gold">
                      {number}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="text-gray-400 text-xs">
                {currentDrawNumber}/{totalDraws}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              Next: <span className="text-game-amber font-semibold">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
