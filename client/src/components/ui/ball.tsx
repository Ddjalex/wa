import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BallProps {
  number: number;
  isSelected: boolean;
  isDrawn: boolean;
  isWinner: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function Ball({
  number,
  isSelected,
  isDrawn,
  isWinner,
  onClick,
  disabled
}: BallProps) {
  const getVariant = () => {
    if (isWinner) return "winner";
    if (isDrawn) return "drawn";
    if (isSelected) return "selected";
    return "default";
  };

  const variants = {
    default: {
      backgroundColor: "rgb(55, 65, 81)", // gray-700
      borderColor: "transparent",
      scale: 1,
    },
    selected: {
      backgroundColor: "rgb(55, 65, 81)",
      borderColor: "rgb(251, 191, 36)", // game-gold
      scale: 1,
    },
    drawn: {
      backgroundColor: "rgb(99, 102, 241)", // game-purple
      borderColor: "rgb(147, 197, 253)", // blue-300
      scale: 1,
    },
    winner: {
      backgroundColor: "rgb(16, 185, 129)", // game-green
      borderColor: "rgb(251, 191, 36)", // game-gold
      scale: 1,
    },
  };

  const ballVariant = getVariant();

  return (
    <motion.button
      className={cn(
        "ball-animation w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 transition-all duration-300 relative overflow-hidden",
        disabled && !isDrawn ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105"
      )}
      onClick={disabled ? undefined : onClick}
      animate={variants[ballVariant]}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      layout
    >
      {isDrawn && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            opacity: [0, 0.8, 0]
          }}
          transition={{ duration: 2 }}
        />
      )}
      
      {isWinner && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(16, 185, 129, 0.7)",
              "0 0 0 20px rgba(16, 185, 129, 0)",
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
        animate={ballVariant === "drawn" ? {
          scale: [1, 1.2, 1],
          opacity: [0, 1, 1],
        } : {}}
        transition={{ duration: 0.8 }}
      >
        {number}
      </motion.span>
    </motion.button>
  );
}
