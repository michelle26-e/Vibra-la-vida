// Funcion para registrar, iniciar y cerrar sesión
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

// Funcion para guardar y leer datos
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

// Hace la conexión con Firebase
import { auth, db } from '../firebase/firebaseConfig'

// Registra un nuevo usuario
export const registrarUsuario = async ({ nombre, correo, contrasena }) => {
  const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena)
  const usuario = credencial.user

  // Guarda los datos del usuario en la base de datos
  await setDoc(doc(db, 'usuarios', usuario.uid), {
    uid: usuario.uid,
    nombre,
    correo,
    rol: 'usuario',
    fechaRegistro: serverTimestamp(),
  })

  return usuario
}

// Inicia sesión con correo y contraseña
export const iniciarSesionUsuario = async ({ correo, contrasena }) => {
  const credencial = await signInWithEmailAndPassword(auth, correo, contrasena)
  return credencial.user
}

// Cierra la sesión del usuario
export const cerrarSesionUsuario = async () => {
  await signOut(auth)
}

// Busca los datos del usuario en la base de datos
export const obtenerDatosUsuario = async (uid) => {
  const referencia = doc(db, 'usuarios', uid)
  const documento = await getDoc(referencia)

  // Si no encuentra datos, regresa null
  if (!documento.exists()) {
    return null
  }

  // Regresa los datos encontrados
  return documento.data()
}