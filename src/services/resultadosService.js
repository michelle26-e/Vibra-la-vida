import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import { auth, db } from '../firebase/firebaseConfig'

export const guardarResultadoBienestar = async (datosResultado) => {
  const usuario = auth.currentUser

  if (!usuario) {
    throw new Error('Debes iniciar sesión para guardar tus resultados.')
  }

  const resultado = {
    uid: usuario.uid,
    ...datosResultado,
    fecha: serverTimestamp(),
  }

  const referencia = await addDoc(
    collection(db, 'resultados_bienestar'),
    resultado
  )

  return referencia.id
}

export const obtenerResultadosUsuario = async () => {
  const usuario = auth.currentUser

  if (!usuario) {
    return []
  }

  const consulta = query(
    collection(db, 'resultados_bienestar'),
    where('uid', '==', usuario.uid)
  )

  const respuesta = await getDocs(consulta)

  return respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }))
}