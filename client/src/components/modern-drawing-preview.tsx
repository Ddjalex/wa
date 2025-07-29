import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
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
  const displayNumbers = drawnNumbers.slice(0, currentDrawIndex + 1);
  const currentNumber = drawnNumbers[currentDrawIndex];

  return (
    <Card className="bg-gradient-to-br from-[var(--keno-bg-secondary)] to-[var(--keno-bg-tertiary)] border-[var(--keno-border)] shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-[var(--keno-text-primary)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[var(--keno-bg-primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Live Drawing</h2>
              <p className="text-sm text-[var(--keno-text-secondary)]">Game #{gameNumber}</p>
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
              <><Play className="w-4 h-4 mr-2" />LIVE</>
            ) : (
              <><Pause className="w-4 h-4 mr-2" />WAITING</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Drawing Number - Large Display */}
        {isDrawing && currentNumber && (
          <div className="text-center mb-6">
            <p className="text-sm text-[var(--keno-text-muted)] mb-2">Now Drawing</p>
            <motion.div
              key={currentNumber}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 rounded-2xl flex items-center justify-center text-[var(--keno-bg-primary)] text-3xl font-bold border-4 border-yellow-400 shadow-2xl"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: [180, 0, 0],
                opacity: [0, 1, 1]
              }}
              transition={{ 
                duration: 1.2,
                type: "spring",
                stiffness: 100
              }}
            >
              {currentNumber}
            </motion.div>
            <p className="text-xs text-[var(--keno-text-muted)] mt-2">
              Ball {currentDrawIndex + 1} of 20
            </p>
          </div>
        )}

        {/* Drawing Progress Bar */}
        {isDrawing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-[var(--keno-text-secondary)] mb-2">
              <span>Drawing Progress</span>
              <span>{displayNumbers.length}/20</span>
            </div>
            <div className="w-full bg-[var(--keno-bg-tertiary)] rounded-full h-3 border border-[var(--keno-border)]">
              <motion.div 
                className="bg-gradient-to-r from-[var(--keno-accent-gold)] to-yellow-600 h-3 rounded-full flex items-center justify-center"
                initial={{ width: 0 }}
                animate={{ width: `${(displayNumbers.length / 20) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* Recently Drawn Numbers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--keno-text-primary)]">
              {isDrawing ? 'Recently Drawn' : 'Waiting for Draw'}
            </h3>
            <span className="text-xs text-[var(--keno-text-muted)]">
              {displayNumbers.length} numbers
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[80px] p-4 bg-[var(--keno-bg-tertiary)] rounded-xl border border-[var(--keno-border)]">
            <AnimatePresence mode="popLayout">
              {displayNumbers.map((number, index) => (
                <motion.div
                  key={`${number}-${index}`}  
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm border-2 shadow-lg",
                    index === displayNumbers.length - 1 && isDrawing
                      ? "bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 border-yellow-400 animate-pulse"
                      : "bg-gradient-to-br from-[var(--keno-accent-blue)] to-blue-600 border-blue-400"
                  )}
                  initial={{ 
                    scale: 0, 
                    opacity: 0, 
                    y: -20,
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
                    transition: { duration: 0.2 }
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 120
                  }}
                  layout
                >
                  {number}
                </motion.div>
              ))}
            </AnimatePresence>

            {!isDrawing && displayNumbers.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center py-4">
                <Clock className="w-8 h-8 text-[var(--keno-text-muted)] mb-2" />
                <p className="text-sm text-[var(--keno-text-muted)]">
                  Waiting for next draw to begin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next Ball Indicator */}
        {isDrawing && currentDrawIndex < 19 && (
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-[var(--keno-text-muted)]">
              Next ball in a few seconds...
            </p>
            <motion.div
              className="w-2 h-2 bg-[var(--keno-accent-gold)] rounded-full mx-auto mt-1"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}