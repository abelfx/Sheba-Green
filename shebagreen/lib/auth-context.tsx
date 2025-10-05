"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { signUpUser, loginUser, logoutUser, getUserProfile, onAuthStateChange } from "./auth"
import { auth } from "./firebase"
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
    if (!auth) {
      console.warn('Firebase Auth not available, using mock auth')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid)
          if (profile) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: profile.username || firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              ecoTokens: 0, // Default value, can be updated from Firestore
              totalImpact: {
                cleanups: 0,
                trees: 0,
                wasteCollected: 0
              },
              joinedAt: profile.createdAt || new Date().toISOString(),
              level: 1
            })
          }
        } catch (error) {
          console.error('Failed to load user profile:', error)
          // Still set user even if profile fetch fails
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || '',
            ecoTokens: 0,
            totalImpact: { cleanups: 0, trees: 0, wasteCollected: 0 },
            joinedAt: new Date().toISOString(),
            level: 1
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      console.warn('Firebase Auth unavailable, using demo mode')
      // Simulate successful login for demo purposes
      setUser({
        id: 'demo-user',
        email: email,
        displayName: 'Demo User',
        photoURL: '',
        ecoTokens: 100,
        totalImpact: { cleanups: 5, trees: 10, wasteCollected: 25 },
        joinedAt: new Date().toISOString(),
        level: 2
      })
      return {}
    }

    try {
      await loginUser(email, password)
      return {}
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { error: error.message || "Failed to sign in" }
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      console.warn('Firebase Auth unavailable, using demo mode')
      // Simulate successful signup for demo purposes
      setUser({
        id: 'demo-user',
        email: email,
        displayName: displayName,
        photoURL: '',
        ecoTokens: 50,
        totalImpact: { cleanups: 0, trees: 0, wasteCollected: 0 },
        joinedAt: new Date().toISOString(),
        level: 1
      })
      return {}
    }

    try {
      await signUpUser(email, password, displayName)
      return {}
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { error: error.message || "Failed to sign up" }
    }
  }

  const signOut = async () => {
    if (!auth) {
      setUser(null)
      return
    }

    try {
      await logoutUser()
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear local state even if Firebase logout fails
      setUser(null)
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    console.log('Update user:', updates)
    // Update local user state with the new data
    setUser(prevUser => {
      if (!prevUser) return null
      return { ...prevUser, ...updates }
    })
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
