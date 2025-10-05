// User types
export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  ecoTokens: number
  totalImpact: {
    cleanups: number
    trees: number
    wasteCollected: number // in kg
  }
  joinedAt: string
  level: number
  hederaAccountId?: string
  evmAddress?: string
  did?: string
}

// Event types
export interface Event {
  id: string
  userId: string
  userName: string
  userPhoto?: string
  type: "cleanup" | "reforestation"
  title: string
  description: string
  location: string
  date: string
  images: string[]
  status: "pending" | "verified" | "rejected"
  impact: {
    trees?: number
    wasteCollected?: number // in kg
    areaCleared?: number // in sq meters
  }
  tokensEarned?: number
  verifiedAt?: string
  createdAt: string
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userPhoto?: string
  ecoTokens: number
  totalEvents: number
  level: number
}

// Stats types
export interface CommunityStats {
  totalUsers: number
  totalEvents: number
  totalTrees: number
  totalWasteCollected: number
  totalTokensDistributed: number
}

// Activity types
export interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar: string
  type: "cleanup" | "tree"
  description: string
  location: string
  wasteCollected?: number
  treesPlanted?: number
  tokensEarned: number
  imageUrl: string
  timestamp: string
  verified: boolean
  likes: number
  comments: number
}
