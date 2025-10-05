// Mock data service for activities and users
import type { Activity, User } from "./types"

// Generate mock activities
export function getMockActivities(): Activity[] {
  const activities: Activity[] = [
    {
      id: "act_1",
      userId: "user_demo_1",
      userName: "Sarah Johnson",
      userAvatar: "/diverse-woman-smiling.png",
      type: "cleanup",
      description: "Beach cleanup at Marina Bay",
      location: "Marina Bay, Singapore",
      wasteCollected: 15.5,
      tokensEarned: 155,
      imageUrl: "/beach-cleanup-volunteers.png",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      verified: true,
      likes: 24,
      comments: 5,
    },
    {
      id: "act_2",
      userId: "user_demo_2",
      userName: "Michael Chen",
      userAvatar: "/asian-man-smiling.png",
      type: "tree",
      description: "Planted 10 trees in community park",
      location: "Bishan Park, Singapore",
      treesPlanted: 10,
      tokensEarned: 500,
      imageUrl: "/tree-planting-volunteers.png",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      verified: true,
      likes: 42,
      comments: 8,
    },
    {
      id: "act_3",
      userId: "user_demo_3",
      userName: "Priya Sharma",
      userAvatar: "/indian-woman-smiling.png",
      type: "cleanup",
      description: "Park cleanup with local school",
      location: "East Coast Park, Singapore",
      wasteCollected: 22.3,
      tokensEarned: 223,
      imageUrl: "/park-cleanup-students.jpg",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      verified: true,
      likes: 31,
      comments: 12,
    },
    {
      id: "act_4",
      userId: "user_demo_4",
      userName: "David Tan",
      userAvatar: "/man-glasses-smiling.jpg",
      type: "tree",
      description: "Reforestation project in nature reserve",
      location: "Bukit Timah Nature Reserve",
      treesPlanted: 25,
      tokensEarned: 1250,
      imageUrl: "/forest-reforestation-planting.jpg",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      verified: true,
      likes: 67,
      comments: 15,
    },
    {
      id: "act_5",
      userId: "user_demo_5",
      userName: "Emma Wilson",
      userAvatar: "/blonde-woman-smiling.png",
      type: "cleanup",
      description: "River cleanup initiative",
      location: "Singapore River",
      wasteCollected: 31.8,
      tokensEarned: 318,
      imageUrl: "/river-cleanup-volunteers.png",
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
      verified: true,
      likes: 45,
      comments: 9,
    },
    {
      id: "act_6",
      userId: "user_demo_6",
      userName: "Ahmad Rahman",
      userAvatar: "/malay-man-smiling.jpg",
      type: "cleanup",
      description: "Community cleanup day",
      location: "Tampines Central Park",
      wasteCollected: 18.2,
      tokensEarned: 182,
      imageUrl: "/community-park-cleanup.jpg",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      verified: true,
      likes: 28,
      comments: 6,
    },
  ]

  return activities
}

// Get mock leaderboard users
export function getMockLeaderboard(): User[] {
  return [
    {
      id: "user_demo_2",
      email: "michael@example.com",
      displayName: "Michael Chen",
      photoURL: "/asian-man-smiling.png",
      ecoTokens: 2450,
      totalImpact: {
        cleanups: 12,
        trees: 45,
        wasteCollected: 156.5,
      },
      joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      level: 8,
    },
    {
      id: "user_demo_1",
      email: "sarah@example.com",
      displayName: "Sarah Johnson",
      photoURL: "/diverse-woman-smiling.png",
      ecoTokens: 2180,
      totalImpact: {
        cleanups: 28,
        trees: 15,
        wasteCollected: 234.8,
      },
      joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      level: 7,
    },
    {
      id: "user_demo_4",
      email: "david@example.com",
      displayName: "David Tan",
      photoURL: "/man-glasses-smiling.jpg",
      ecoTokens: 1890,
      totalImpact: {
        cleanups: 8,
        trees: 38,
        wasteCollected: 98.3,
      },
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      level: 6,
    },
    {
      id: "user_demo_5",
      email: "emma@example.com",
      displayName: "Emma Wilson",
      photoURL: "/blonde-woman-smiling.png",
      ecoTokens: 1650,
      totalImpact: {
        cleanups: 22,
        trees: 12,
        wasteCollected: 187.4,
      },
      joinedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
      level: 6,
    },
    {
      id: "user_demo_3",
      email: "priya@example.com",
      displayName: "Priya Sharma",
      photoURL: "/indian-woman-smiling.png",
      ecoTokens: 1420,
      totalImpact: {
        cleanups: 18,
        trees: 8,
        wasteCollected: 145.2,
      },
      joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      level: 5,
    },
  ]
}

// Format timestamp to relative time
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}
