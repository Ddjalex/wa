import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff,
  Palette,
  Moon,
  Sun,
  X,
  Save
} from "lucide-react";
import { useState } from "react";

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  isSoundEnabled: boolean;
  onSoundToggle: () => void;
}

export function SettingsModal({ 
  isVisible, 
  onClose, 
  isSoundEnabled, 
  onSoundToggle 
}: SettingsModalProps) {
  const [soundVolume, setSoundVolume] = useState([30]);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [animation, setAnimation] = useState(true);

  if (!isVisible) return null;

  const handleSave = () => {
    console.log('Settings saved:', {
      sound: isSoundEnabled,
      volume: soundVolume[0],
      notifications,
      autoPlay,
      darkMode,
      animation
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[var(--keno-bg-secondary)] rounded-2xl border border-[var(--keno-border)] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--keno-border)]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--keno-accent-blue)] to-blue-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--keno-text-primary)]">Settings</h2>
                <p className="text-sm text-[var(--keno-text-secondary)]">Customize your game experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[var(--keno-text-secondary)] hover:text-[var(--keno-text-primary)]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Audio Settings */}
            <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[var(--keno-text-primary)]">
                  <Volume2 className="w-5 h-5 text-[var(--keno-accent-gold)]" />
                  <span>Audio Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--keno-text-primary)]">Enable Sound Effects</Label>
                  <Switch
                    checked={isSoundEnabled}
                    onCheckedChange={onSoundToggle}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[var(--keno-text-primary)]">Volume Level</Label>
                  <div className="flex items-center space-x-3">
                    <VolumeX className="w-4 h-4 text-[var(--keno-text-muted)]" />
                    <Slider
                      value={soundVolume}
                      onValueChange={setSoundVolume}
                      max={100}
                      step={1}
                      className="flex-1"
                      disabled={!isSoundEnabled}
                    />
                    <Volume2 className="w-4 h-4 text-[var(--keno-text-muted)]" />
                    <span className="text-sm text-[var(--keno-text-secondary)] w-8">{soundVolume[0]}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Settings */}
            <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[var(--keno-text-primary)]">
                  <Settings className="w-5 h-5 text-[var(--keno-accent-green)]" />
                  <span>Game Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[var(--keno-text-primary)]">Auto Play Next Round</Label>
                    <p className="text-sm text-[var(--keno-text-muted)]">Automatically continue with same numbers</p>
                  </div>
                  <Switch
                    checked={autoPlay}
                    onCheckedChange={setAutoPlay}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[var(--keno-text-primary)]">Draw Notifications</Label>
                    <p className="text-sm text-[var(--keno-text-muted)]">Get notified when draws start</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[var(--keno-text-primary)]">Smooth Animations</Label>
                    <p className="text-sm text-[var(--keno-text-muted)]">Enable drawing animations</p>
                  </div>
                  <Switch
                    checked={animation}
                    onCheckedChange={setAnimation}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[var(--keno-text-primary)]">
                  <Palette className="w-5 h-5 text-[var(--keno-accent-gold)]" />
                  <span>Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label className="text-[var(--keno-text-primary)]">Dark Mode</Label>
                    {darkMode ? (
                      <Moon className="w-4 h-4 text-[var(--keno-text-muted)]" />
                    ) : (
                      <Sun className="w-4 h-4 text-[var(--keno-text-muted)]" />
                    )}
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator className="bg-[var(--keno-border)]" />

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[var(--keno-border)] text-[var(--keno-text-secondary)] hover:bg-[var(--keno-bg-tertiary)]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-[var(--keno-accent-green)] hover:bg-green-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}