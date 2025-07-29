import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target,
  TrendingUp,
  Edit,
  X,
  Save,
  Camera
} from "lucide-react";
import { useState } from "react";

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  user: any; // TODO: Type this properly
}

export function ProfileModal({ isVisible, onClose, user }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "player1");
  const [email, setEmail] = useState(user?.email || "player@example.com");

  if (!isVisible) return null;

  const handleSave = () => {
    console.log('Profile updated:', { username, email });
    setIsEditing(false);
    // TODO: Implement actual profile update logic
  };

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ETB`;
  };

  const mockStats = {
    gamesPlayed: 247,
    totalWon: 15000,
    biggestWin: 2500,
    winRate: 23.8,
    joinDate: "June 2025"
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
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--keno-text-primary)]">Profile</h2>
                <p className="text-sm text-[var(--keno-text-secondary)]">Manage your account</p>
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
            {/* Profile Info */}
            <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)]">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 text-white text-xl font-bold">
                        {username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0 border-[var(--keno-border)]"
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="username" className="text-[var(--keno-text-primary)]">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 bg-[var(--keno-bg-secondary)] border-[var(--keno-border)] text-[var(--keno-text-primary)]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-[var(--keno-text-primary)]">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 bg-[var(--keno-bg-secondary)] border-[var(--keno-border)] text-[var(--keno-text-primary)]"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-2xl font-bold text-[var(--keno-text-primary)]">{username}</h3>
                          <p className="text-[var(--keno-text-secondary)]">{email}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-[var(--keno-text-muted)]">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {mockStats.joinDate}</span>
                          </div>
                          <Badge className="bg-[var(--keno-accent-gold)] text-white">
                            VIP Player
                          </Badge>
                        </div>
                      </>
                    )}

                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            className="bg-[var(--keno-accent-green)] hover:bg-green-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="border-[var(--keno-border)] text-[var(--keno-text-secondary)]"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="border-[var(--keno-border)] text-[var(--keno-text-secondary)] hover:bg-[var(--keno-bg-secondary)]"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Statistics */}
            <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[var(--keno-text-primary)]">
                  <Trophy className="w-5 h-5 text-[var(--keno-accent-gold)]" />
                  <span>Game Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-[var(--keno-bg-secondary)] rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="w-5 h-5 text-[var(--keno-accent-blue)] mr-2" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--keno-text-primary)]">{mockStats.gamesPlayed}</p>
                    <p className="text-sm text-[var(--keno-text-muted)]">Games Played</p>
                  </div>

                  <div className="text-center p-4 bg-[var(--keno-bg-secondary)] rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-5 h-5 text-[var(--keno-accent-green)] mr-2" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--keno-accent-green)]">{mockStats.winRate}%</p>
                    <p className="text-sm text-[var(--keno-text-muted)]">Win Rate</p>
                  </div>

                  <div className="text-center p-4 bg-[var(--keno-bg-secondary)] rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-[var(--keno-accent-gold)] mr-2" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--keno-text-primary)]">
                      {formatCurrency(mockStats.totalWon)}
                    </p>
                    <p className="text-sm text-[var(--keno-text-muted)]">Total Won</p>
                  </div>

                  <div className="text-center p-4 bg-[var(--keno-bg-secondary)] rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-[var(--keno-accent-gold)] mr-2" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--keno-accent-gold)]">
                      {formatCurrency(mockStats.biggestWin)}
                    </p>
                    <p className="text-sm text-[var(--keno-text-muted)]">Biggest Win</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--keno-text-primary)]">Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[var(--keno-border)] text-[var(--keno-text-secondary)] hover:bg-[var(--keno-bg-secondary)]"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[var(--keno-border)] text-[var(--keno-text-secondary)] hover:bg-[var(--keno-bg-secondary)]"
                >
                  Enable Two-Factor Authentication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[var(--keno-border)] text-[var(--keno-text-secondary)] hover:bg-[var(--keno-bg-secondary)]"
                >
                  Download Account Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}