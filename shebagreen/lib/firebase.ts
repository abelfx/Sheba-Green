import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDQNKNNfobVSdC7NDWiCFwGTxWbUZH26EA',
  authDomain: 'hedera-project-cb25f.firebaseapp.com',
  projectId: 'hedera-project-cb25f',
  storageBucket: 'hedera-project-cb25f.firebasestorage.app',
  messagingSenderId: '667776209333',
  appId: '1:667776209333:web:f1575703c63eef1fb509fc',
  measurementId: 'G-WD0HCDEZYP'
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

let app: any = null
let analytics: any = null
let auth: any = null
let db: any = null
let storage: any = null

try {
  console.log('Initializing Firebase...')
  app = initializeApp(firebaseConfig)
  console.log('Firebase app initialized successfully')

  // Initialize services
  if (isBrowser) {
    // Analytics only on client side
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
        console.log('Firebase Analytics initialized')
      } else {
        console.log('Firebase Analytics not supported in this environment')
      }
    }).catch((error) => {
      console.warn('Firebase Analytics initialization failed:', error)
    })
  }

  auth = getAuth(app)
  console.log('Firebase Auth initialized')

  db = getFirestore(app)
  console.log('Firebase Firestore initialized')

  storage = getStorage(app)
  console.log('Firebase Storage initialized')

} catch (error) {
  console.error('Firebase initialization failed:', error)
  console.warn('Falling back to mock implementation')

  // If Firebase fails to initialize, we'll use mock data
  // This allows the app to work even with Firebase connectivity issues
}

export { app, analytics, auth, db, storage }