// Sirve para guardar y consultar datos
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'

// Hace la conexión con Firebase
import { auth, db } from '../firebase/firebaseConfig'

// Guarda el resultado del usuario
export const guardarResultadoBienestar = async (datosResultado) => {
  const usuario = auth.currentUser

  // Si no hay usuario, no deja guardar
  if (!usuario) {
    throw new Error('Debes iniciar sesión para guardar tus resultados.')
  }

  // Datos que se van a guardar
  const resultado = {
    uid: usuario.uid,
    ...datosResultado,
    fecha: serverTimestamp(),
  }

  // Guarda el resultado en la base de datos
  const referencia = await addDoc(
    collection(db, 'resultados_bienestar'),
    resultado
  )

  return referencia.id
}

// Tiene los resultados del usuario actual
export const obtenerResultadosUsuario = async () => {
  const usuario = auth.currentUser

  // Si no hay usuario, regresa una lista vacía
  if (!usuario) {
    return []
  }

  // Busca solo los resultados de ese usuario
  const consulta = query(
    collection(db, 'resultados_bienestar'),
    where('uid', '==', usuario.uid)
  )

  const respuesta = await getDocs(consulta)

  // Regresa los resultados encontrados
  return respuesta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }))
}