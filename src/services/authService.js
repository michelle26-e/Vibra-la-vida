import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { auth, db } from '../firebase/firebaseConfig'

export const registrarUsuario = async ({
  nombreCompleto,
  correo,
  contrasena,
  rol = 'usuario',
  especialidad = null,
}) => {
  const credencial = await createUserWithEmailAndPassword(
    auth,
    correo.trim(),
    contrasena
  )

  const usuario = credencial.user

  const datosUsuario = {
    uid: usuario.uid,
    nombreCompleto: nombreCompleto.trim(),
    correo: correo.trim(),
    rol,
    fechaRegistro: serverTimestamp(),
  }

  if (rol === 'doctor' && especialidad) {
    datosUsuario.especialidad = especialidad
  }

  await setDoc(
    doc(db, 'usuarios', usuario.uid),
    datosUsuario
  )

  return usuario
}

export const iniciarSesionUsuario = async ({ correo, contrasena }) => {
  const credencial = await signInWithEmailAndPassword(
    auth,
    correo.trim(),
    contrasena
  )

  return credencial.user
}

export const cerrarSesionUsuario = async () => {
  await signOut(auth)
}

export const obtenerDatosUsuario = async (uid) => {
  if (!uid) return null

  const referencia = doc(db, 'usuarios', uid)
  const documento = await getDoc(referencia)

  if (!documento.exists()) return null

  return documento.data()
}
