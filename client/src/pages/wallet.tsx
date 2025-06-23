import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Plus, Minus, CreditCard, Building2, Smartphone } from "lucide-react";

interface Transaction {
  id: number;
  type: string;
  status: string;
  amount: number;
  method: string;
  reference?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

interface User {
  id: number;
  username: string;
  balance: number;
}

export default function WalletPage() {
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("bank_transfer");
  const [withdrawMethod, setWithdrawMethod] = useState("bank_transfer");
  const [depositReference, setDepositReference] = useState("");
  const [withdrawReference, setWithdrawReference] = useState("");

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/1"],
  });

  // Fetch transaction history
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/user/1"],
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string; reference: string }) => {
      const response = await apiRequest("POST", "/api/transactions/deposit", {
        userId: 1,
        ...data,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Request Submitted",
        description: "Your deposit request has been submitted for processing.",
      });
      setDepositAmount("");
      setDepositReference("");
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/user/1"] });
    },
    onError: () => {
      toast({
        title: "Deposit Failed",
        description: "Failed to submit deposit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string; reference: string }) => {
      const response = await apiRequest("POST", "/api/transactions/withdraw", {
        userId: 1,
        ...data,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted for processing.",
      });
      setWithdrawAmount("");
      setWithdrawReference("");
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/user/1"] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      amount: Math.round(amount * 100), // Convert to cents
      method: depositMethod,
      reference: depositReference,
    });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (user && amount * 100 > user.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      amount: Math.round(amount * 100), // Convert to cents
      method: withdrawMethod,
      reference: withdrawReference,
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <Building2 className="h-4 w-4" />;
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />;
      case "credit_card":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-gray-300">Manage your deposits and withdrawals</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-black/20 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {user ? formatCurrency(user.balance / 100) : "0.00"} Birr
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit Form */}
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Deposit Funds
              </CardTitle>
              <CardDescription className="text-gray-400">
                Add money to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <Label htmlFor="deposit-amount" className="text-white">Amount (Birr)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deposit-method" className="text-white">Payment Method</Label>
                  <Select value={depositMethod} onValueChange={setDepositMethod}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deposit-reference" className="text-white">Reference (Optional)</Label>
                  <Input
                    id="deposit-reference"
                    type="text"
                    value={depositReference}
                    onChange={(e) => setDepositReference(e.target.value)}
                    placeholder="Transaction reference"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={depositMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {depositMutation.isPending ? "Processing..." : "Submit Deposit"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Minus className="h-5 w-5" />
                Withdraw Funds
              </CardTitle>
              <CardDescription className="text-gray-400">
                Withdraw money from your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-amount" className="text-white">Amount (Birr)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    step="0.01"
                    min="1"
                    max={user ? user.balance / 100 : 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="withdraw-method" className="text-white">Payment Method</Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="withdraw-reference" className="text-white">Reference (Optional)</Label>
                  <Input
                    id="withdraw-reference"
                    type="text"
                    value={withdrawReference}
                    onChange={(e) => setWithdrawReference(e.target.value)}
                    placeholder="Account details"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={withdrawMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {withdrawMutation.isPending ? "Processing..." : "Submit Withdrawal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="bg-black/20 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
            <CardDescription className="text-gray-400">
              Your recent deposits and withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getMethodIcon(transaction.method)}
                      <div>
                        <div className="text-white font-medium">
                          {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`font-bold ${
                          transaction.type === "deposit" ? "text-green-400" : "text-red-400"
                        }`}>
                          {transaction.type === "deposit" ? "+" : "-"}
                          {formatCurrency(transaction.amount / 100)} Birr
                        </div>
                        <div className="text-gray-400 text-sm capitalize">
                          {transaction.method.replace("_", " ")}
                        </div>
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}