"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { mockFirebaseAuth } from "./firebase-mock"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing user on mount
  useEffect(() => {
    const currentUser = mockFirebaseAuth.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user, error } = await mockFirebaseAuth.signIn(email, password)
    if (user) {
      setUser(user)
      return {}
    }
    return { error: error || "Failed to sign in" }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user, error } = await mockFirebaseAuth.signUp(email, password, displayName)
    if (user) {
      setUser(user)
      return {}
    }
    return { error: error || "Failed to sign up" }
  }

  const signOut = async () => {
    await mockFirebaseAuth.signOut()
    setUser(null)
  }

  const updateUser = async (updates: Partial<User>) => {
    const { user: updatedUser } = await mockFirebaseAuth.updateProfile(updates)
    if (updatedUser) {
      setUser(updatedUser)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
