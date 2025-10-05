import { auth, db } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// Sign up a new user and save profile data
export async function signUpUser(email: string, password: string, username: string): Promise<User | null> {
  try {
    console.log('🔄 Attempting Firebase signup for:', email)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log('✅ Firebase Auth signup successful, saving profile...')

    try {
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString()
      })
      console.log('✅ Profile saved to Firestore')
    } catch (firestoreError: any) {
      console.warn('⚠️ Firestore save failed, but Auth succeeded:', firestoreError.message)
      // Continue with auth success even if Firestore fails
      console.log('🔄 Auth successful, proceeding without Firestore data')
    }

    return user
  } catch (error: any) {
    console.error('❌ Firebase signup error:', error.code, error.message)

    // If it's a network/connectivity error, provide helpful message
    if (error.code === 'auth/network-request-failed' ||
        error.code === 'unavailable' ||
        error.message?.includes('offline') ||
        error.code === 'auth/internal-error') {
      throw new Error('Network connection failed. Please check your internet connection and try again.')
    }

    // For other auth errors, throw the original error
    throw error
  }
}

// Log in existing user
export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    console.log('Attempting Firebase login for:', email)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log('Firebase login successful!')
    return user
  } catch (error: any) {
    console.error('Firebase login error:', error.code, error.message)

    // Provide user-friendly error messages
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.')
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.')
    } else if (error.code === 'auth/network-request-failed' ||
               error.code === 'unavailable' ||
               error.message?.includes('offline')) {
      throw new Error('Network connection failed. Please check your internet connection.')
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.')
    }

    throw error
  }
}

// Log out user
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth)
    console.log('Logged out successfully.')
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

// Get profile data of logged-in user
export async function getUserProfile(uid: string): Promise<any | null> {
  try {
    console.log('Fetching user profile from Firestore for UID:', uid)
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      console.log('Profile found in Firestore')
      return userDoc.data()
    } else {
      console.log('No profile found for this user, returning default data')
      return {
        username: 'User',
        email: '',
        createdAt: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('Profile fetch error:', error.code, error.message)

    // If Firestore is unavailable, return default profile data
    if (error.code === 'unavailable' ||
        error.code === 'failed-precondition' ||
        error.message?.includes('offline') ||
        error.message?.includes('network')) {
      console.warn('Firestore unavailable, using default profile data')
      return {
        username: 'User',
        email: '',
        createdAt: new Date().toISOString()
      }
    }

    throw error
  }
}

// Listen for authentication state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}