"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatRelativeTime } from "@/lib/mock-data"

interface Transaction {
  id: string
  type: "earned" | "spent"
  amount: number
  description: string
  timestamp: string
  status: "completed" | "pending"
}

export default function WalletPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    // Generate mock transaction history based on user's events
    const events = JSON.parse(localStorage.getItem("shebagreen_events") || "[]")
    const userEvents = events.filter((e: any) => e.userId === user?.id)

    const txs: Transaction[] = userEvents.map((event: any) => ({
      id: `tx_${event.id}`,
      type: "earned" as const,
      amount: event.tokensEarned || 0,
      description: `Earned from: ${event.title}`,
      timestamp: event.createdAt,
      status: "completed" as const,
    }))

    // Add some mock spending transactions
    if (txs.length > 0) {
      txs.push({
        id: "tx_mock_1",
        type: "spent",
        amount: 100,
        description: "Redeemed: Eco-friendly water bottle",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
      })
    }

    setTransactions(txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
  }, [user])

  const totalEarned = transactions.filter((t) => t.type === "earned").reduce((sum, t) => sum + t.amount, 0)
  const totalSpent = transactions.filter((t) => t.type === "spent").reduce((sum, t) => sum + t.amount, 0)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-heading mb-2">My Wallet</h1>
              <p className="text-muted-foreground">Manage your eco-tokens and view transaction history</p>
            </div>

            {/* Balance Card */}
            <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl">🪙</span>
                      <p className="text-4xl font-bold text-primary">{user?.ecoTokens.toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Eco Tokens</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-4">
                    <Wallet className="h-12 w-12 text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{totalEarned.toLocaleString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowDownRight className="h-4 w-4 text-orange-500" />
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="rounded-full bg-muted p-6 w-fit mx-auto mb-4">
                      <TrendingUp className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start uploading events to earn eco-tokens and see your transaction history here.
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="earned">Earned</TabsTrigger>
                      <TabsTrigger value="spent">Spent</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-3">
                      {transactions.map((tx) => (
                        <TransactionItem key={tx.id} transaction={tx} />
                      ))}
                    </TabsContent>

                    <TabsContent value="earned" className="space-y-3">
                      {transactions
                        .filter((t) => t.type === "earned")
                        .map((tx) => (
                          <TransactionItem key={tx.id} transaction={tx} />
                        ))}
                    </TabsContent>

                    <TabsContent value="spent" className="space-y-3">
                      {transactions
                        .filter((t) => t.type === "spent")
                        .map((tx) => (
                          <TransactionItem key={tx.id} transaction={tx} />
                        ))}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className={`rounded-full p-3 ${transaction.type === "earned" ? "bg-green-500/10" : "bg-orange-500/10"}`}>
        {transaction.type === "earned" ? (
          <ArrowUpRight className="h-5 w-5 text-green-500" />
        ) : (
          <ArrowDownRight className="h-5 w-5 text-orange-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold truncate">{transaction.description}</p>
          {transaction.status === "completed" && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatRelativeTime(transaction.timestamp)}</span>
          <Badge variant="secondary" className="text-xs">
            {transaction.status}
          </Badge>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`text-lg font-bold ${transaction.type === "earned" ? "text-green-600" : "text-orange-600"}`}>
          {transaction.type === "earned" ? "+" : "-"}
          {transaction.amount.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">tokens</p>
      </div>
    </div>
  )
}
