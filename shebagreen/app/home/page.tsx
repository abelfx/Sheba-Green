"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { DashboardStats } from "@/components/dashboard-stats"
import { ActivityCard } from "@/components/activity-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getMockActivities } from "@/lib/mock-data"
import { Upload, Trophy, Wallet } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()
  const activities = getMockActivities()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-heading mb-2">Welcome back, {user?.displayName}!</h1>
            <p className="text-muted-foreground">Track your impact and see what the community is doing.</p>
          </div>

          {/* Dashboard Stats */}
          {user && (
            <div className="mb-8">
              <DashboardStats user={user} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Event
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/leaderboard">
                <Trophy className="mr-2 h-4 w-4" />
                View Leaderboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/wallet">
                <Wallet className="mr-2 h-4 w-4" />
                My Wallet
              </Link>
            </Button>
          </div>

          {/* Activity Feed */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-heading">Community Feed</h2>
              <p className="text-sm text-muted-foreground">{activities.length} recent activities</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
