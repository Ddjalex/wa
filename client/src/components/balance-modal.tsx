import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  Wallet, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Bitcoin,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Clock
} from "lucide-react";
import { useState } from "react";

interface BalanceModalProps {
  isVisible: boolean;
  onClose: () => void;
  userBalance: number;
}

export function BalanceModal({ isVisible, onClose, userBalance }: BalanceModalProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  if (!isVisible) return null;

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ETB`;
  };

  const handleDeposit = () => {
    console.log(`Deposit ${depositAmount} ETB`);
    // TODO: Implement actual deposit logic
  };

  const handleWithdraw = () => {
    console.log(`Withdraw ${withdrawAmount} ETB`);
    // TODO: Implement actual withdrawal logic
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
          className="bg-[var(--keno-bg-secondary)] rounded-2xl border border-[var(--keno-border)] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--keno-border)]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--keno-accent-gold)] to-yellow-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[var(--keno-bg-primary)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--keno-text-primary)]">Wallet</h2>
                <p className="text-sm text-[var(--keno-text-secondary)]">Manage your balance</p>
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

          {/* Current Balance Display */}
          <div className="p-6 border-b border-[var(--keno-border)]">
            <Card className="bg-gradient-to-r from-[var(--keno-accent-gold)]/20 to-yellow-600/20 border-[var(--keno-accent-gold)]/30">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-[var(--keno-text-muted)] mb-2">Current Balance</p>
                <p className="text-3xl font-bold text-[var(--keno-text-primary)]">
                  {formatCurrency(userBalance)}
                </p>
                <Badge className="mt-2 bg-[var(--keno-accent-green)] text-white">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Available
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Deposit/Withdraw Tabs */}
          <div className="p-6">
            <Tabs defaultValue="deposit" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-[var(--keno-bg-tertiary)]">
                <TabsTrigger 
                  value="deposit" 
                  className="data-[state=active]:bg-[var(--keno-accent-green)] data-[state=active]:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Deposit
                </TabsTrigger>
                <TabsTrigger 
                  value="withdraw"
                  className="data-[state=active]:bg-[var(--keno-accent-blue)] data-[state=active]:text-white"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Withdraw
                </TabsTrigger>
              </TabsList>

              {/* Deposit Tab */}
              <TabsContent value="deposit" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount" className="text-[var(--keno-text-primary)]">
                      Amount (ETB)
                    </Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="mt-2 bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)] text-[var(--keno-text-primary)]"
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDepositAmount(amount.toString())}
                        className="border-[var(--keno-border)] text-[var(--keno-text-secondary)] hover:bg-[var(--keno-bg-tertiary)]"
                      >
                        {amount} ETB
                      </Button>
                    ))}
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <Label className="text-[var(--keno-text-primary)]">Payment Method</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)] cursor-pointer hover:bg-[var(--keno-bg-secondary)] transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-6 h-6 text-[var(--keno-accent-blue)]" />
                            <div>
                              <p className="font-medium text-[var(--keno-text-primary)]">Bank Transfer</p>
                              <p className="text-sm text-[var(--keno-text-secondary)]">Direct bank deposit</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)] cursor-pointer hover:bg-[var(--keno-bg-secondary)] transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Bitcoin className="w-6 h-6 text-[var(--keno-accent-gold)]" />
                            <div>
                              <p className="font-medium text-[var(--keno-text-primary)]">Cryptocurrency</p>
                              <p className="text-sm text-[var(--keno-text-secondary)]">Bitcoin, Ethereum, USDT</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Button 
                    onClick={handleDeposit}
                    className="w-full bg-[var(--keno-accent-green)] hover:bg-green-600 text-white"
                    disabled={!depositAmount}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Deposit {depositAmount ? `${depositAmount} ETB` : 'Funds'}
                  </Button>
                </div>
              </TabsContent>

              {/* Withdraw Tab */}
              <TabsContent value="withdraw" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount" className="text-[var(--keno-text-primary)]">
                      Amount (ETB)
                    </Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="mt-2 bg-[var(--keno-bg-tertiary)] border-[var(--keno-border)] text-[var(--keno-text-primary)]"
                      max={userBalance / 100}
                    />
                    <p className="text-xs text-[var(--keno-text-muted)] mt-1">
                      Available: {formatCurrency(userBalance)}
                    </p>
                  </div>

                  <div className="bg-[var(--keno-bg-tertiary)] rounded-lg p-4 border border-[var(--keno-border)]">
                    <div className="flex items-center space-x-2 text-[var(--keno-text-secondary)]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Withdrawal processing time: 1-3 business days</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleWithdraw}
                    className="w-full bg-[var(--keno-accent-blue)] hover:bg-blue-600 text-white"
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) > userBalance / 100}
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Withdraw {withdrawAmount ? `${withdrawAmount} ETB` : 'Funds'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}