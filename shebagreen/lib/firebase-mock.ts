// Mock Firebase Auth for frontend-only demo
// In production, replace with actual Firebase SDK

interface MockUser {
  id: string
  email: string
  displayName: string
  photoURL?: string
  ecoTokens: number
  totalImpact: {
    cleanups: number
    trees: number
    wasteCollected: number
  }
  joinedAt: string
  level: number
}

interface AuthResponse {
  user: MockUser | null
  error?: string
}

const USERS_KEY = "shebagreen_users"
const CURRENT_USER_KEY = "shebagreen_current_user"

// Helper to get all users from localStorage
function getAllUsers(): Record<string, MockUser> {
  if (typeof window === "undefined") return {}
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : {}
}

// Helper to save users to localStorage
function saveUsers(users: Record<string, MockUser>) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Helper to get current user
function getCurrentUser(): MockUser | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem(CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

// Helper to save current user
function saveCurrentUser(user: MockUser | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export const mockFirebaseAuth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users = getAllUsers()

    // Check if user already exists
    if (users[email]) {
      return { user: null, error: "Email already in use" }
    }

    // Create new user
    const newUser: MockUser = {
      id: `user_${Date.now()}`,
      email,
      displayName,
      ecoTokens: 0,
      totalImpact: {
        cleanups: 0,
        trees: 0,
        wasteCollected: 0,
      },
      joinedAt: new Date().toISOString(),
      level: 1,
    }

    // Save user
    users[email] = newUser
    saveUsers(users)
    saveCurrentUser(newUser)

    return { user: newUser }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users = getAllUsers()
    const user = users[email]

    if (!user) {
      return { user: null, error: "Invalid email or password" }
    }

    saveCurrentUser(user)
    return { user }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    saveCurrentUser(null)
  },

  // Get current user
  getCurrentUser: (): MockUser | null => {
    return getCurrentUser()
  },

  // Update user profile
  updateProfile: async (updates: Partial<MockUser>): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const currentUser = getCurrentUser()
    if (!currentUser) {
      return { user: null, error: "No user logged in" }
    }

    const users = getAllUsers()
    const updatedUser = { ...currentUser, ...updates }

    users[currentUser.email] = updatedUser
    saveUsers(users)
    saveCurrentUser(updatedUser)

    return { user: updatedUser }
  },
}
