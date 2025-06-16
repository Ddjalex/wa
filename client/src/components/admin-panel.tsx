import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

interface AdminSettings {
  profitMargin: number;
  minBet: number;
  maxBet: number;
  maxPlayers: number;
  revenue: number;
  profit: number;
  payouts: number;
}

export function AdminPanel({ isVisible, onClose }: AdminPanelProps) {
  const [profitMargin, setProfitMargin] = useState([15]);
  const [minBet, setMinBet] = useState(5);
  const [maxBet, setMaxBet] = useState(1000);
  const [maxPlayers, setMaxPlayers] = useState(100);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current admin settings
  const { data: settings, isLoading } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
    enabled: isVisible,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<AdminSettings>) => {
      const response = await apiRequest("POST", "/api/admin/settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Admin settings have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  // Load settings when data is available
  useEffect(() => {
    if (settings) {
      setProfitMargin([settings.profitMargin]);
      setMinBet(settings.minBet);
      setMaxBet(settings.maxBet);
      setMaxPlayers(settings.maxPlayers);
    }
  }, [settings]);

  const handleUpdateSettings = async () => {
    updateSettingsMutation.mutate({
      profitMargin: profitMargin[0],
      minBet,
      maxBet,
      maxPlayers,
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Control Panel
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-gray-400">
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Game Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${settings?.revenue?.toLocaleString() || "0"}
              </div>
              <div className="text-xs text-gray-400">Today</div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Profit</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${settings?.profit?.toLocaleString() || "0"}
              </div>
              <div className="text-xs text-gray-400">{profitMargin[0]}% margin</div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Payouts</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${settings?.payouts?.toLocaleString() || "0"}
              </div>
              <div className="text-xs text-gray-400">
                {settings?.revenue ? Math.round((settings.payouts / settings.revenue) * 100) : 0}% of revenue
              </div>
            </div>
          </div>

          {/* Profit Margin Control */}
          <div className="space-y-4">
            <Label className="text-white font-medium">
              Profit Margin: {profitMargin[0]}%
            </Label>
            <div className="space-y-2">
              <Slider
                value={profitMargin}
                onValueChange={setProfitMargin}
                max={100}
                min={-10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>-10% (Player Advantage)</span>
                <span>0% (Break Even)</span>
                <span>100% (Maximum House Edge)</span>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              {profitMargin[0] < 0 && (
                <Badge variant="destructive" className="mr-2">Risk Mode</Badge>
              )}
              {profitMargin[0] >= 0 && profitMargin[0] <= 5 && (
                <Badge className="bg-yellow-600 mr-2">Low Margin</Badge>
              )}
              {profitMargin[0] > 5 && profitMargin[0] <= 20 && (
                <Badge className="bg-green-600 mr-2">Optimal</Badge>
              )}
              {profitMargin[0] > 20 && (
                <Badge className="bg-red-600 mr-2">High Risk</Badge>
              )}
              Current setting affects payout multipliers and win probability
            </div>
          </div>

          {/* Betting Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Minimum Bet ($)</Label>
              <Input
                type="number"
                value={minBet}
                onChange={(e) => setMinBet(Number(e.target.value))}
                className="bg-gray-800 border-gray-600 text-white"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Maximum Bet ($)</Label>
              <Input
                type="number"
                value={maxBet}
                onChange={(e) => setMaxBet(Number(e.target.value))}
                className="bg-gray-800 border-gray-600 text-white"
                min="1"
              />
            </div>
          </div>

          {/* Player Limits */}
          <div className="space-y-2">
            <Label className="text-white">Maximum Players Per Game</Label>
            <Input
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="bg-gray-800 border-gray-600 text-white"
              min="1"
              max="500"
            />
          </div>

          {/* Payout Table Preview */}
          <div className="space-y-2">
            <Label className="text-white">Current Payout Table</Label>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="grid grid-cols-5 gap-2 text-xs">
                {[
                  { matches: 3, multiplier: Math.max(0.1, 3 - (profitMargin[0] * 0.1)) },
                  { matches: 4, multiplier: Math.max(0.1, 5 - (profitMargin[0] * 0.15)) },
                  { matches: 5, multiplier: Math.max(0.1, 10 - (profitMargin[0] * 0.3)) },
                  { matches: 6, multiplier: Math.max(0.1, 25 - (profitMargin[0] * 0.8)) },
                  { matches: 7, multiplier: Math.max(0.1, 50 - (profitMargin[0] * 1.5)) },
                  { matches: 8, multiplier: Math.max(0.1, 100 - (profitMargin[0] * 3)) },
                  { matches: 9, multiplier: Math.max(0.1, 250 - (profitMargin[0] * 7)) },
                  { matches: 10, multiplier: Math.max(0.1, 500 - (profitMargin[0] * 15)) },
                ].map((payout) => (
                  <div key={payout.matches} className="text-center">
                    <div className="text-white font-bold">{payout.matches}</div>
                    <div className="text-green-400">{payout.multiplier.toFixed(1)}x</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdateSettings}
              disabled={updateSettingsMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {updateSettingsMutation.isPending ? "Updating..." : "Apply Settings"}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}