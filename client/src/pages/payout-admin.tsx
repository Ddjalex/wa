import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Calculator, TrendingUp, Settings, AlertTriangle, CheckCircle } from "lucide-react";

interface PayoutEntry {
  spots: number;
  matches: number;
  multiplier: number;
}

interface SpotAnalysis {
  spots: number;
  totalCombinations: number;
  expectedRTP: number;
  payoutEntries: PayoutEntry[];
}

interface HouseEdgeAnalysis {
  spot: number;
  currentRTP: number;
  targetRTP: number;
  recommendation: string;
}

interface PayoutTableData {
  payoutTable: PayoutEntry[];
  spotAnalysis: SpotAnalysis[];
  houseEdgeAnalysis: HouseEdgeAnalysis[];
}

export default function PayoutAdmin() {
  const { toast } = useToast();
  const [selectedSpots, setSelectedSpots] = useState(3);
  const [editingEntry, setEditingEntry] = useState<{spots: number, matches: number, multiplier: number} | null>(null);

  // Fetch payout table data
  const { data: payoutData, isLoading, refetch } = useQuery<PayoutTableData>({
    queryKey: ["/api/admin/payout-table"],
  });

  // Update payout mutation
  const updatePayoutMutation = useMutation({
    mutationFn: async (data: { spots: number; matches: number; multiplier: number }) => {
      const response = await apiRequest("POST", "/api/admin/payout-table/update", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payout Updated",
        description: "Payout table has been updated successfully.",
      });
      setEditingEntry(null);
      refetch();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update payout table. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdatePayout = () => {
    if (editingEntry) {
      updatePayoutMutation.mutate(editingEntry);
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    if (recommendation.includes("Balanced")) {
      return <Badge variant="default" className="bg-green-500">Balanced</Badge>;
    } else if (recommendation.includes("Reduce")) {
      return <Badge variant="destructive">Too High</Badge>;
    } else {
      return <Badge variant="secondary">Too Low</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentSpotAnalysis = payoutData?.spotAnalysis?.find(s => s.spots === selectedSpots);
  const currentHouseEdge = payoutData?.houseEdgeAnalysis?.find(h => h.spot === selectedSpots);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Payout Table Management</h1>
          <p className="text-gray-300">Control Keno odds, RTP, and house edge</p>
        </div>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="editor">Payout Editor</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    3-Spot Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-400">
                      {payoutData?.spotAnalysis?.find(s => s.spots === 3)?.expectedRTP ? 
                        (payoutData.spotAnalysis.find(s => s.spots === 3)!.expectedRTP * 100).toFixed(1) : '0'}% RTP
                    </div>
                    <div className="text-gray-400 text-sm">
                      3/3 match: 50x multiplier (1 in 72 odds)
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    House Edge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-400">
                      {payoutData?.houseEdgeAnalysis?.find(h => h.spot === 3) ? 
                        ((1 - payoutData.houseEdgeAnalysis.find(h => h.spot === 3)!.currentRTP) * 100).toFixed(1) : '0'}%
                    </div>
                    <div className="text-gray-400 text-sm">
                      Target: 25% house edge
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {payoutData?.houseEdgeAnalysis?.find(h => h.spot === 3)?.recommendation?.includes("Balanced") ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        Balanced
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertTriangle className="h-5 w-5" />
                        Needs Review
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spot Analysis Table */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">All Spots Analysis</CardTitle>
                <CardDescription className="text-gray-400">
                  RTP and house edge analysis for all spot counts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left p-2">Spots</th>
                        <th className="text-left p-2">RTP</th>
                        <th className="text-left p-2">House Edge</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutData?.houseEdgeAnalysis?.map((analysis) => (
                        <tr key={analysis.spot} className="border-b border-gray-700">
                          <td className="p-2 font-bold">{analysis.spot}</td>
                          <td className="p-2">{(analysis.currentRTP * 100).toFixed(1)}%</td>
                          <td className="p-2">{((1 - analysis.currentRTP) * 100).toFixed(1)}%</td>
                          <td className="p-2">{getRecommendationBadge(analysis.recommendation)}</td>
                          <td className="p-2 text-sm text-gray-400">{analysis.recommendation}</td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-gray-400">
                            Loading analysis data...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spot Selector */}
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Select Spot Count</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose the number of spots to edit payouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedSpots.toString()} onValueChange={(value) => setSelectedSpots(parseInt(value))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((spot) => (
                        <SelectItem key={spot} value={spot.toString()}>
                          {spot} Spot{spot > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {currentSpotAnalysis && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded">
                      <div className="text-white font-semibold">Current RTP: {(currentSpotAnalysis.expectedRTP * 100).toFixed(2)}%</div>
                      <div className="text-gray-400 text-sm">House Edge: {((1 - currentSpotAnalysis.expectedRTP) * 100).toFixed(2)}%</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payout Editor */}
              <Card className="bg-black/20 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Edit Multipliers</CardTitle>
                  <CardDescription className="text-gray-400">
                    Adjust payout multipliers for {selectedSpots} spots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editingEntry ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">
                          {editingEntry.matches}/{editingEntry.spots} Matches
                        </Label>
                        <Input
                          type="number"
                          value={editingEntry.multiplier}
                          onChange={(e) => setEditingEntry({
                            ...editingEntry,
                            multiplier: parseFloat(e.target.value) || 0
                          })}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Multiplier"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdatePayout}
                          disabled={updatePayoutMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updatePayoutMutation.isPending ? "Updating..." : "Update"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingEntry(null)}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      Select a payout entry below to edit
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payout Table */}
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{selectedSpots} Spot Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentSpotAnalysis?.payoutEntries.map((entry) => (
                    <div
                      key={`${entry.spots}-${entry.matches}`}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-700/50"
                      onClick={() => setEditingEntry(entry)}
                    >
                      <div className="text-white">
                        <span className="font-semibold">{entry.matches}/{entry.spots} matches</span>
                        <span className="text-gray-400 ml-2">
                          ({entry.matches === entry.spots && entry.spots === 3 ? '1 in 72' : 
                           entry.matches === 0 ? 'Common' : 'Variable'} odds)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{entry.multiplier}x</div>
                        <div className="text-gray-400 text-sm">
                          {formatCurrency((30 * entry.multiplier) / 100)} Birr for 30 Birr bet
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Payout Calculator</CardTitle>
                <CardDescription className="text-gray-400">
                  Calculate potential payouts and probabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-400">
                  <Calculator className="h-12 w-12 mx-auto mb-4" />
                  <p>Calculator interface coming soon...</p>
                  <p className="text-sm mt-2">
                    Use the analysis and editor tabs to manage payouts for now
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}