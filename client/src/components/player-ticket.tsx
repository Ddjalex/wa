import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Ticket, Clock, Trophy, XCircle } from "lucide-react";

interface Bet {
  id: number;
  userId: number;
  gameId: number;
  selectedNumbers: number[];
  betAmount: number;
  status: string;
  winAmount: number | null;
  matchedNumbers: number | null;
  createdAt: string;
}

interface PlayerTicketProps {
  userId: number;
}

export function PlayerTicket({ userId }: PlayerTicketProps) {
  const { data: bets = [], isLoading } = useQuery({
    queryKey: ['/api/user', userId, 'bets'],
    queryFn: async () => {
      const response = await fetch(`/api/user/${userId}/bets`);
      return response.json();
    }
  });

  const activeBets = bets.filter((bet: Bet) => bet.status === 'pending');
  const completedBets = bets.filter((bet: Bet) => bet.status === 'completed');

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          My Tickets
        </CardTitle>
        <CardDescription>Your betting history and active tickets</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="active" className="text-white">
              Active ({activeBets.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white">
              History ({completedBets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {activeBets.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-gray-400">No active bets</div>
                <div className="text-sm text-gray-500">Place a bet to see it here</div>
              </div>
            ) : (
              activeBets.map((bet: Bet) => (
                <BetTicket key={bet.id} bet={bet} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            {completedBets.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-gray-400">No bet history</div>
                <div className="text-sm text-gray-500">Your completed bets will appear here</div>
              </div>
            ) : (
              completedBets.slice(0, 10).map((bet: Bet) => (
                <BetTicket key={bet.id} bet={bet} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function BetTicket({ bet }: { bet: Bet }) {
  const isWinner = bet.winAmount && bet.winAmount > 0;
  const isActive = bet.status === 'pending';

  return (
    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : isWinner ? "secondary" : "outline"}>
            {isActive ? "ACTIVE" : isWinner ? "WON" : "LOST"}
          </Badge>
          <span className="text-sm text-gray-400">
            Game #{bet.gameId}
          </span>
        </div>
        <div className="text-right">
          <div className="text-white font-medium">
            {formatCurrency(bet.betAmount / 100)}
          </div>
          {isWinner && (
            <div className="text-green-400 text-sm font-medium">
              Won {formatCurrency(bet.winAmount! / 100)}
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-400 mb-2">Selected Numbers:</div>
        <div className="flex flex-wrap gap-1">
          {bet.selectedNumbers.map((number) => (
            <div
              key={number}
              className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center"
            >
              {number}
            </div>
          ))}
        </div>
      </div>

      {bet.matchedNumbers !== null && (
        <div className="text-sm text-gray-400">
          Matched: {bet.matchedNumbers} number{bet.matchedNumbers !== 1 ? 's' : ''}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        {new Date(bet.createdAt).toLocaleString()}
      </div>
    </div>
  );
}