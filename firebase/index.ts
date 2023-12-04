import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDGyPYB1yhyHFKkoWQaJJLGj0aXSh8JhAI',
  authDomain: 'chat-app-fbbec.firebaseapp.com',
  projectId: 'chat-app-fbbec',
  storageBucket: 'chat-app-fbbec.appspot.com',
  messagingSenderId: '758577699785',
  appId: '1:758577699785:web:898fe45a0919d0c7dd6618',
  measurementId: 'G-LZ615BBKJ8'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
