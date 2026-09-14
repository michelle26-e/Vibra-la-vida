// ==========================================================
// SERVICIO DE AUTENTICACIÓN - VIBRA LA VIDA
// ==========================================================

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

import {
  auth,
  db,
} from '../firebase/firebaseConfig'


// ----------------------------------------------------------
// REGISTRAR USUARIO
// ----------------------------------------------------------

export const registrarUsuario = async ({
  nombreCompleto,
  correo,
  contrasena,
  rol = 'usuario',

  // Datos profesionales.
  especialidad = null,
  cedulaProfesional = null,
  cedulaVerificada = false,
  profesionRegistrada = null,
  institucionRegistro = null,
  anioRegistro = null,
}) => {
  const credencial =
    await createUserWithEmailAndPassword(
      auth,
      correo.trim().toLowerCase(),
      contrasena
    )

  const usuario =
    credencial.user


  const datosUsuario = {
    uid: usuario.uid,

    nombreCompleto:
      nombreCompleto.trim(),

    correo:
      correo.trim().toLowerCase(),

    rol,

    fechaRegistro:
      serverTimestamp(),
  }


  // --------------------------------------------------------
  // INFORMACIÓN PROFESIONAL
  // --------------------------------------------------------
  // Se guarda únicamente para cuentas profesionales.
  // También aceptamos "doctor" por compatibilidad con
  // cuentas antiguas del proyecto.
  // --------------------------------------------------------

  const esProfesional =
    rol === 'profesional_salud' ||
    rol === 'doctor'


  if (esProfesional) {
    datosUsuario.especialidad =
      especialidad || null

    datosUsuario.cedulaProfesional =
      cedulaProfesional || null

    datosUsuario.cedulaVerificada =
      Boolean(cedulaVerificada)

    datosUsuario.profesionRegistrada =
      profesionRegistrada || null

    datosUsuario.institucionRegistro =
      institucionRegistro || null

    datosUsuario.anioRegistro =
      anioRegistro || null

    // Los datos del consultorio se completan después
    // desde Mi cuenta profesional.
    datosUsuario.tieneConsultorio = false
    datosUsuario.consultorio = null
  }


  await setDoc(
    doc(
      db,
      'usuarios',
      usuario.uid
    ),
    datosUsuario
  )


  return usuario
}


// ----------------------------------------------------------
// INICIAR SESIÓN
// ----------------------------------------------------------

export const iniciarSesionUsuario = async ({
  correo,
  contrasena,
}) => {
  const credencial =
    await signInWithEmailAndPassword(
      auth,
      correo.trim().toLowerCase(),
      contrasena
    )

  return credencial.user
}


// ----------------------------------------------------------
// CERRAR SESIÓN
// ----------------------------------------------------------

export const cerrarSesionUsuario = async () => {
  await signOut(auth)
}


// ----------------------------------------------------------
// OBTENER DATOS DE FIRESTORE
// ----------------------------------------------------------

export const obtenerDatosUsuario = async (
  uid
) => {
  if (!uid) {
    return null
  }

  const referencia =
    doc(
      db,
      'usuarios',
      uid
    )

  const documento =
    await getDoc(referencia)

  if (!documento.exists()) {
    return null
  }

  return documento.data()
}
