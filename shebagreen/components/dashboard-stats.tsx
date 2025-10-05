import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Trash2, TrendingUp, Award } from "lucide-react"
import type { User } from "@/lib/types"

interface DashboardStatsProps {
  user: User
}

export function DashboardStats({ user }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Eco Tokens */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🪙</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{user.ecoTokens.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Eco Tokens</p>
        </CardContent>
      </Card>

      {/* Level */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-accent" />
          </div>
          <p className="text-2xl font-bold">Level {user.level}</p>
          <p className="text-xs text-muted-foreground mt-1">Current Level</p>
        </CardContent>
      </Card>

      {/* Trees Planted */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{user.totalImpact.trees}</p>
          <p className="text-xs text-muted-foreground mt-1">Trees Planted</p>
        </CardContent>
      </Card>

      {/* Waste Collected */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Trash2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{user.totalImpact.wasteCollected.toFixed(1)}kg</p>
          <p className="text-xs text-muted-foreground mt-1">Waste Collected</p>
        </CardContent>
      </Card>
    </div>
  )
}
