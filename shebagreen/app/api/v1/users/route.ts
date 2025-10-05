import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
let auth: any = null
let db: any = null

try {
  if (getApps().length === 0 &&
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
    auth = getAuth()
    db = getFirestore()
    console.log('Firebase Admin SDK initialized successfully')
  } else {
    console.warn('Firebase Admin SDK credentials not configured, API will return mock responses')
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization failed:', error)
  console.warn('API will return mock responses')
}

interface UserRequest {
  userId: string
  displayName: string
  hederaAccountId?: string
  evmAddress?: string
}

interface UserDocument {
  userId: string
  displayName: string
  email?: string
  hederaAccountId?: string
  evmAddress?: string
  did?: string
  createdAt: string
  updatedAt: string
}

export async function POST(request: NextRequest) {
  try {
    // If Firebase Admin is not available, return mock response
    if (!auth || !db) {
      console.log('Firebase Admin not available, returning mock response')

      const body: UserRequest = await request.json()
      const { userId, displayName, hederaAccountId, evmAddress } = body

      const mockResponse = {
        userId: userId || 'mock-user',
        displayName: displayName || 'Mock User',
        hederaAccountId: hederaAccountId || '0.0.123456',
        evmAddress: evmAddress || '0x1234567890abcdef1234567890abcdef12345678',
        did: hederaAccountId ? `did:hedera:testnet:${hederaAccountId}_${userId}` : 'did:hedera:testnet:0.0.123456_mock-user',
        createdAt: new Date().toISOString(),
      }

      return NextResponse.json(mockResponse, { status: 201 })
    }

    // Verify Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    const idToken = authHeader.split('Bearer ')[1]
    let decodedToken

    try {
      decodedToken = await auth.verifyIdToken(idToken)
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: UserRequest = await request.json()
    const { userId, displayName, hederaAccountId, evmAddress } = body

    // Validate that userId matches the authenticated user's UID
    if (userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      )
    }

    // Get user document reference
    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    let userData: UserDocument

    if (userDoc.exists) {
      // Update existing user
      const existingData = userDoc.data() as UserDocument
      userData = {
        ...existingData,
        displayName: displayName || existingData.displayName,
        updatedAt: new Date().toISOString(),
      }

      // Add Hedera data if provided
      if (hederaAccountId) {
        userData.hederaAccountId = hederaAccountId
      }
      if (evmAddress) {
        userData.evmAddress = evmAddress
      }

      // Generate DID if Hedera account is provided and DID doesn't exist
      if (hederaAccountId && !userData.did) {
        userData.did = `did:hedera:testnet:${hederaAccountId}_${userId}`
      }

      await userRef.update(userData)
    } else {
      // Create new user document
      userData = {
        userId,
        displayName: displayName || decodedToken.name || 'User',
        email: decodedToken.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add Hedera data if provided
      if (hederaAccountId) {
        userData.hederaAccountId = hederaAccountId
        userData.did = `did:hedera:testnet:${hederaAccountId}_${userId}`
      }
      if (evmAddress) {
        userData.evmAddress = evmAddress
      }

      await userRef.set(userData)
    }

    // Return sanitized user document (exclude any sensitive fields)
    const sanitizedUser = {
      userId: userData.userId,
      displayName: userData.displayName,
      hederaAccountId: userData.hederaAccountId,
      evmAddress: userData.evmAddress,
      did: userData.did,
      createdAt: userData.createdAt,
    }

    return NextResponse.json(sanitizedUser, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}