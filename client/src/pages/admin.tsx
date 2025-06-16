import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface AdminSettings {
  profitMargin: number;
  minBet: number;
  maxBet: number;
  maxPlayers: number;
  revenue: number;
  profit: number;
  payouts: number;
}

export default function AdminDashboard() {
  const [profitMargin, setProfitMargin] = useState([15]);
  const [minBet, setMinBet] = useState(5);
  const [maxBet, setMaxBet] = useState(1000);
  const [maxPlayers, setMaxPlayers] = useState(100);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current admin settings
  const { data: settings, isLoading, refetch } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
    refetchInterval: 5000, // Refresh every 5 seconds
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Assuming cents
  };

  const getPayoutMultiplier = (matches: number, selected: number, margin: number) => {
    const baseMultipliers: { [key: number]: { [key: number]: number } } = {
      1: { 1: 3.6 },
      2: { 1: 1.0, 2: 12.0 },
      3: { 1: 1.0, 2: 2.0, 3: 42.0 },
      4: { 1: 0.5, 2: 1.0, 3: 4.0, 4: 120.0 },
      5: { 1: 0.5, 2: 0.5, 3: 2.0, 4: 20.0, 5: 600.0 },
      6: { 2: 0.5, 3: 1.0, 4: 7.0, 5: 50.0, 6: 1500.0 },
      7: { 3: 0.5, 4: 2.0, 5: 20.0, 6: 100.0, 7: 5000.0 },
      8: { 4: 1.0, 5: 12.0, 6: 50.0, 7: 1000.0, 8: 10000.0 },
      9: { 5: 4.0, 6: 25.0, 7: 200.0, 8: 2000.0, 9: 15000.0 },
      10: { 5: 2.0, 6: 20.0, 7: 80.0, 8: 500.0, 9: 2500.0, 10: 25000.0 }
    };
    
    const baseMultiplier = baseMultipliers[selected]?.[matches] || 0;
    const adjustmentFactor = 1 + (margin / 100);
    return baseMultiplier / adjustmentFactor;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-white border-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Keno Game Management System</p>
            </div>
          </div>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            className="text-white border-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="settings" className="text-white">Game Settings</TabsTrigger>
            <TabsTrigger value="payouts" className="text-white">Payout Tables</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Total Revenue</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(settings?.revenue || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Today</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Net Profit</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(settings?.profit || 0)}
                  </div>
                  <div className="text-sm text-gray-400">{profitMargin[0]}% margin</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-medium">Total Payouts</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(settings?.payouts || 0)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {settings?.revenue ? Math.round((settings.payouts / settings.revenue) * 100) : 0}% of revenue
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Active Players</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {Math.floor(Math.random() * 50) + 10}
                  </div>
                  <div className="text-sm text-gray-400">Currently playing</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white">Profit Margin: {profitMargin[0]}%</Label>
                    <Slider
                      value={profitMargin}
                      onValueChange={setProfitMargin}
                      min={-10}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleUpdateSettings}
                      disabled={updateSettingsMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updateSettingsMutation.isPending ? "Updating..." : "Apply Changes"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Game Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profit Margin Control */}
                <div className="space-y-4">
                  <Label className="text-white font-medium">
                    Profit Margin: {profitMargin[0]}%
                    <Badge variant={profitMargin[0] < 0 ? "destructive" : profitMargin[0] > 50 ? "secondary" : "default"} className="ml-2">
                      {profitMargin[0] < 0 ? "Loss Mode" : profitMargin[0] > 50 ? "High Profit" : "Balanced"}
                    </Badge>
                  </Label>
                  <Slider
                    value={profitMargin}
                    onValueChange={setProfitMargin}
                    min={-10}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>-10% (Favor Players)</span>
                    <span>0% (Break Even)</span>
                    <span>100% (Maximum Profit)</span>
                  </div>
                </div>

                {/* Betting Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white">Minimum Bet ($)</Label>
                    <Input
                      type="number"
                      value={minBet}
                      onChange={(e) => setMinBet(Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      min={1}
                      max={maxBet - 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Maximum Bet ($)</Label>
                    <Input
                      type="number"
                      value={maxBet}
                      onChange={(e) => setMaxBet(Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      min={minBet + 1}
                      max={10000}
                    />
                  </div>
                </div>

                {/* Player Limits */}
                <div className="space-y-2">
                  <Label className="text-white">Maximum Players per Game</Label>
                  <Input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                    min={1}
                    max={500}
                  />
                </div>

                <Button 
                  onClick={handleUpdateSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {updateSettingsMutation.isPending ? "Updating Settings..." : "Save All Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout Tables Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Current Payout Multipliers
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {profitMargin[0]}% Margin Applied
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((spots) => (
                    <div key={spots} className="space-y-2">
                      <h4 className="text-white font-medium">{spots} Spot{spots > 1 ? 's' : ''} Selected</h4>
                      <div className="space-y-1">
                        {Object.entries({
                          1: spots >= 1 ? getPayoutMultiplier(1, spots, profitMargin[0]) : 0,
                          2: spots >= 2 ? getPayoutMultiplier(2, spots, profitMargin[0]) : 0,
                          3: spots >= 3 ? getPayoutMultiplier(3, spots, profitMargin[0]) : 0,
                          4: spots >= 4 ? getPayoutMultiplier(4, spots, profitMargin[0]) : 0,
                          5: spots >= 5 ? getPayoutMultiplier(5, spots, profitMargin[0]) : 0,
                          6: spots >= 6 ? getPayoutMultiplier(6, spots, profitMargin[0]) : 0,
                          7: spots >= 7 ? getPayoutMultiplier(7, spots, profitMargin[0]) : 0,
                          8: spots >= 8 ? getPayoutMultiplier(8, spots, profitMargin[0]) : 0,
                          9: spots >= 9 ? getPayoutMultiplier(9, spots, profitMargin[0]) : 0,
                          10: spots >= 10 ? getPayoutMultiplier(10, spots, profitMargin[0]) : 0,
                        }).map(([matches, multiplier]) => {
                          if (multiplier === 0) return null;
                          return (
                            <div key={matches} className="flex justify-between bg-gray-700/50 p-2 rounded">
                              <span className="text-white">{matches} matches</span>
                              <span className="text-green-400 font-bold">{multiplier.toFixed(1)}x</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Bets</span>
                      <span className="text-white">{formatCurrency(settings?.revenue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Player Winnings</span>
                      <span className="text-red-400">{formatCurrency(settings?.payouts || 0)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-white">House Profit</span>
                        <span className="text-green-400">{formatCurrency(settings?.profit || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">House Edge</span>
                      <span className="text-white">{profitMargin[0]}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Return to Player</span>
                      <span className="text-white">{100 - profitMargin[0]}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Bet Size</span>
                      <span className="text-white">${Math.floor((minBet + maxBet) / 2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}