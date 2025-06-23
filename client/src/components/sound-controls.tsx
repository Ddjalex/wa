import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { SoundManager } from "@/lib/sound-manager";

export function SoundControls() {
  const [soundManager] = useState(() => SoundManager.getInstance());
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    soundManager.setEnabled(isEnabled);
  }, [isEnabled, soundManager]);

  const toggleSound = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    soundManager.setEnabled(newState);
    
    // Play test sound when enabling
    if (newState) {
      soundManager.resumeAudioContext();
      soundManager.playBallBounce();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleSound}
      className="bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700 hover:text-white backdrop-blur-sm"
      title={isEnabled ? "Disable sound effects" : "Enable sound effects"}
    >
      {isEnabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </Button>
  );
}