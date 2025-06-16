import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DrawHistoryProps {
  gameHistory: Array<{
    id: number;
    gameNumber: number;
    drawnNumbers: number[];
    completedAt: Date | null;
  }>;
  userSelectedNumbers?: Set<number>;
}

export function DrawHistory({ gameHistory, userSelectedNumbers = new Set() }: DrawHistoryProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(date));
  };

  const isWinningNumber = (number: number) => userSelectedNumbers.has(number);

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-white">Draw History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] px-6">
          <div className="space-y-4">
            {gameHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No draw history available
              </div>
            ) : (
              gameHistory.map((game) => (
                <div
                  key={game.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-white font-semibold">
                        Game #{game.gameNumber}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatTime(game.completedAt)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                      {game.drawnNumbers.length} numbers
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-10 gap-1">
                    {game.drawnNumbers.map((number, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                          isWinningNumber(number)
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                            : "bg-blue-600 text-white"
                        )}
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}