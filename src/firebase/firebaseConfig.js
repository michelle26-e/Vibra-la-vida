// Conecta la app con Firebase
import { initializeApp } from 'firebase/app'

// Sirve para iniciar sesión, registrar usuarios y cerrar sesión
import { getAuth } from 'firebase/auth'

// Sirve para usar la base de datos de Firebase
import { getFirestore } from 'firebase/firestore'

// Datos de conexión del proyecto de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Inicia Firebase
const app = initializeApp(firebaseConfig)

// Ayuda a usar el login y registro en otras partes del proyecto
export const auth = getAuth(app)

// ayuda usar la base de datos en otras partes del proyecto
export const db = getFirestore(app)