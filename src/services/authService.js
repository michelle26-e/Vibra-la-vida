import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseConfig'

export const registrarUsuario = async ({ nombre, correo, contrasena }) => {
  const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena)
  const usuario = credencial.user

  await setDoc(doc(db, 'usuarios', usuario.uid), {
    uid: usuario.uid,
    nombre,
    correo,
    rol: 'usuario',
    fechaRegistro: serverTimestamp(),
  })

  return usuario
}

export const iniciarSesionUsuario = async ({ correo, contrasena }) => {
  const credencial = await signInWithEmailAndPassword(auth, correo, contrasena)
  return credencial.user
}

export const cerrarSesionUsuario = async () => {
  await signOut(auth)
}

export const obtenerDatosUsuario = async (uid) => {
  const referencia = doc(db, 'usuarios', uid)
  const documento = await getDoc(referencia)

  if (!documento.exists()) {
    return null
  }

  return documento.data()
}