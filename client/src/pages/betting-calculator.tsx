import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, ArrowLeft, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface PayoutTableEntry {
  bet: number;
  win: number;
}

interface BettingLimits {
  min: number;
  max: number;
  currency: string;
  multiplier: number;
}

export default function BettingCalculator() {
  const [customBet, setCustomBet] = useState<number>(350);
  const { toast } = useToast();

  // Fetch payout table from admin endpoint
  const { data: payoutData, isLoading, refetch } = useQuery<{
    table: PayoutTableEntry[];
    limits: BettingLimits;
  }>({
    queryKey: ["/api/admin/payout-table"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate custom bet mutation
  const calculateBetMutation = useMutation({
    mutationFn: async (betAmount: number) => {
      const response = await apiRequest("POST", "/api/calculate-bet", { betAmount });
      return response.json();
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate bet.",
        variant: "destructive",
      });
    },
  });

  const handleCalculateCustomBet = () => {
    if (customBet) {
      calculateBetMutation.mutate(customBet);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} Birr`;
  };

  const generateBetSteps = () => {
    if (!payoutData?.limits) return [];
    const steps = [];
    for (let bet = payoutData.limits.min; bet <= payoutData.limits.max; bet += 10) {
      steps.push(bet);
    }
    return steps.slice(0, 20); // Show first 20 steps for readability
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading betting calculator...</div>
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
              <h1 className="text-3xl font-bold text-white">Betting Calculator</h1>
              <p className="text-gray-400">Ethiopian Birr Payout System</p>
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

        {/* Betting Limits Info */}
        {payoutData?.limits && (
          <Card className="bg-gray-800/50 border-gray-700 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(payoutData.limits.min)}
                  </div>
                  <div className="text-sm text-gray-400">Minimum Bet</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {formatCurrency(payoutData.limits.max)}
                  </div>
                  <div className="text-sm text-gray-400">Maximum Bet</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {payoutData.limits.multiplier}x
                  </div>
                  <div className="text-sm text-gray-400">Win Multiplier</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {payoutData.limits.currency}
                  </div>
                  <div className="text-sm text-gray-400">Currency</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="calculator" className="text-white">Bet Calculator</TabsTrigger>
            <TabsTrigger value="table" className="text-white">Payout Table</TabsTrigger>
          </TabsList>

          {/* Custom Bet Calculator */}
          <TabsContent value="calculator" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Custom Bet Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Enter Bet Amount (Birr)</Label>
                      <Input
                        type="number"
                        value={customBet}
                        onChange={(e) => setCustomBet(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white text-lg"
                        min={payoutData?.limits.min || 20}
                        max={payoutData?.limits.max || 5000}
                        placeholder="Enter amount..."
                      />
                    </div>
                    <Button 
                      onClick={handleCalculateCustomBet}
                      disabled={calculateBetMutation.isPending || !customBet}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {calculateBetMutation.isPending ? "Calculating..." : "Calculate Win Amount"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {calculateBetMutation.data && (
                      <div className="bg-gray-700/50 p-6 rounded-lg">
                        <h3 className="text-white font-bold mb-4">Calculation Result</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Bet Amount:</span>
                            <span className="text-white font-bold">
                              {formatCurrency(calculateBetMutation.data.betAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Win Amount:</span>
                            <span className="text-green-400 font-bold text-xl">
                              {formatCurrency(calculateBetMutation.data.winAmount)}
                            </span>
                          </div>
                          <div className="border-t border-gray-600 pt-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Profit:</span>
                              <span className="text-yellow-400 font-bold">
                                {formatCurrency(calculateBetMutation.data.winAmount - calculateBetMutation.data.betAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {calculateBetMutation.isError && (
                      <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
                        <div className="text-red-400 font-bold">Calculation Error</div>
                        <div className="text-red-300 text-sm">
                          Please enter a valid bet amount between {payoutData?.limits.min} and {payoutData?.limits.max} Birr.
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                      <div className="text-blue-400 font-bold">Quick Examples</div>
                      <div className="text-blue-300 text-sm space-y-1">
                        <div>350 Birr → {formatCurrency(350 * (payoutData?.limits.multiplier || 50))}</div>
                        <div>1,000 Birr → {formatCurrency(1000 * (payoutData?.limits.multiplier || 50))}</div>
                        <div>2,500 Birr → {formatCurrency(2500 * (payoutData?.limits.multiplier || 50))}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout Table */}
          <TabsContent value="table" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Complete Payout Table
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {payoutData?.limits.multiplier}x Multiplier
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {generateBetSteps().map((betAmount) => (
                    <div key={betAmount} className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-bold">{formatCurrency(betAmount)}</div>
                          <div className="text-gray-400 text-sm">Bet Amount</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            {formatCurrency(betAmount * (payoutData?.limits.multiplier || 50))}
                          </div>
                          <div className="text-gray-400 text-sm">Win Amount</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <div className="text-gray-400 text-sm">
                    Showing bet increments from {formatCurrency(payoutData?.limits.min || 20)} to {formatCurrency(payoutData?.limits.max || 5000)}
                  </div>
                  <div className="text-white font-bold mt-2">
                    Formula: Win = Bet × {payoutData?.limits.multiplier || 50}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}