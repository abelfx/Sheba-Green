"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award, Leaf, Trash2, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getMockLeaderboard } from "@/lib/mock-data"
import type { User } from "@/lib/types"

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth()
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [sortBy, setSortBy] = useState<"tokens" | "trees" | "waste">("tokens")

  useEffect(() => {
    // Get mock leaderboard and add current user if they exist
    const users = getMockLeaderboard()

    // Add current user to leaderboard if they're logged in
    if (currentUser && !users.find((u) => u.id === currentUser.id)) {
      users.push(currentUser)
    }

    // Sort based on selected criteria
    const sorted = [...users].sort((a, b) => {
      switch (sortBy) {
        case "tokens":
          return b.ecoTokens - a.ecoTokens
        case "trees":
          return b.totalImpact.trees - a.totalImpact.trees
        case "waste":
          return b.totalImpact.wasteCollected - a.totalImpact.wasteCollected
        default:
          return b.ecoTokens - a.ecoTokens
      }
    })

    setLeaderboard(sorted)
  }, [currentUser, sortBy])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Trophy className="mr-1 h-3 w-3" />
            1st Place
          </Badge>
        )
      case 2:
        return (
          <Badge className="bg-gray-400/10 text-gray-600 border-gray-400/20">
            <Medal className="mr-1 h-3 w-3" />
            2nd Place
          </Badge>
        )
      case 3:
        return (
          <Badge className="bg-amber-600/10 text-amber-700 border-amber-600/20">
            <Medal className="mr-1 h-3 w-3" />
            3rd Place
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold font-heading mb-2">Leaderboard</h1>
              <p className="text-muted-foreground">See how you rank among environmental champions</p>
            </div>

            {/* Sort Tabs */}
            <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tokens">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Tokens
                </TabsTrigger>
                <TabsTrigger value="trees">
                  <Leaf className="mr-2 h-4 w-4" />
                  Trees
                </TabsTrigger>
                <TabsTrigger value="waste">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Waste
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {leaderboard.slice(0, 3).map((user, index) => {
                const rank = index + 1
                const isCurrentUser = user.id === currentUser?.id

                return (
                  <Card
                    key={user.id}
                    className={`${
                      rank === 1 ? "order-2 scale-105" : rank === 2 ? "order-1" : "order-3"
                    } ${isCurrentUser ? "border-2 border-primary" : ""}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">{getRankIcon(rank)}</div>
                      <Avatar className="h-16 w-16 mx-auto mb-3 border-2">
                        <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-sm mb-1 truncate">{user.displayName}</h3>
                      {isCurrentUser && (
                        <Badge variant="secondary" className="mb-2 text-xs">
                          You
                        </Badge>
                      )}
                      <div className="space-y-1 text-xs">
                        {sortBy === "tokens" && (
                          <p className="font-bold text-primary">{user.ecoTokens.toLocaleString()} tokens</p>
                        )}
                        {sortBy === "trees" && <p className="font-bold text-primary">{user.totalImpact.trees} trees</p>}
                        {sortBy === "waste" && (
                          <p className="font-bold text-primary">{user.totalImpact.wasteCollected.toFixed(1)}kg</p>
                        )}
                        <p className="text-muted-foreground">Level {user.level}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Full Leaderboard */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {leaderboard.map((user, index) => {
                    const rank = index + 1
                    const isCurrentUser = user.id === currentUser?.id

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                          isCurrentUser ? "bg-primary/5 border-l-4 border-l-primary" : ""
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-12 flex-shrink-0 flex justify-center">{getRankIcon(rank)}</div>

                        {/* Avatar */}
                        <Avatar className="h-12 w-12 border-2">
                          <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.displayName} />
                          <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{user.displayName}</h3>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                            {getRankBadge(rank)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              <span>Level {user.level}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Leaf className="h-3 w-3" />
                              <span>{user.totalImpact.trees} trees</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Trash2 className="h-3 w-3" />
                              <span>{user.totalImpact.wasteCollected.toFixed(1)}kg</span>
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                          {sortBy === "tokens" && (
                            <div>
                              <p className="font-bold text-lg text-primary">{user.ecoTokens.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">tokens</p>
                            </div>
                          )}
                          {sortBy === "trees" && (
                            <div>
                              <p className="font-bold text-lg text-primary">{user.totalImpact.trees}</p>
                              <p className="text-xs text-muted-foreground">trees</p>
                            </div>
                          )}
                          {sortBy === "waste" && (
                            <div>
                              <p className="font-bold text-lg text-primary">
                                {user.totalImpact.wasteCollected.toFixed(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">kg waste</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Current User Rank Summary */}
            {currentUser && (
              <Card className="mt-6 border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Your Ranking</h3>
                      <p className="text-sm text-muted-foreground">
                        You're ranked #{leaderboard.findIndex((u) => u.id === currentUser.id) + 1} out of{" "}
                        {leaderboard.length} users
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{currentUser.ecoTokens.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Eco Tokens</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
