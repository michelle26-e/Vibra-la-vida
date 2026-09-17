// ==========================================================
// RUTAS DE CITAS - VIBRA LA VIDA
// ==========================================================

const express = require('express')

const {
  obtenerMisCitas,
  crearCita,
  actualizarCita,
  confirmarCitaPaciente,
  solicitarReagendaPaciente,
  cancelarCitaPaciente,
  eliminarCita,
} = require('../controllers/citas.controller')

const {
  verifyFirebaseToken,
} = require('../middlewares/auth.middleware')


const router = express.Router()


// ----------------------------------------------------------
// TODAS LAS RUTAS NECESITAN SESIÓN FIREBASE VÁLIDA
// ----------------------------------------------------------

router.use(
  verifyFirebaseToken
)


// ----------------------------------------------------------
// OBTENER MIS CITAS
// ----------------------------------------------------------
// Profesional -> sus citas.
// Paciente    -> sus citas.
// ----------------------------------------------------------

router.get(
  '/',
  obtenerMisCitas
)


// ----------------------------------------------------------
// CREAR CITA
// ----------------------------------------------------------
// Solo profesional.
// ----------------------------------------------------------

router.post(
  '/',
  crearCita
)


// ----------------------------------------------------------
// ACTUALIZAR CITA
// ----------------------------------------------------------
// Profesional:
// puede editar sus propias citas.
//
// Paciente:
// solo puede confirmar, solicitar reagenda o cancelar
// sus propias citas.
// ----------------------------------------------------------

// ----------------------------------------------------------
// CONFIRMAR CITA
// ----------------------------------------------------------
// Acción del paciente. No edita fecha, hora ni datos médicos.
// ----------------------------------------------------------

router.post(
  '/:id/confirmar',
  confirmarCitaPaciente
)


// ----------------------------------------------------------
// CANCELAR CITA
// ----------------------------------------------------------
// Acción del paciente. No elimina físicamente el documento.
// ----------------------------------------------------------

router.post(
  '/:id/cancelar',
  cancelarCitaPaciente
)


// ----------------------------------------------------------
// SOLICITAR REAGENDA
// ----------------------------------------------------------
// El paciente no cambia fecha ni hora.
// Solo envía la solicitud al profesional.
// ----------------------------------------------------------

router.post(
  '/:id/solicitar-reagenda',
  solicitarReagendaPaciente
)


router.put(
  '/:id',
  actualizarCita
)


// ----------------------------------------------------------
// ELIMINAR FÍSICAMENTE
// ----------------------------------------------------------
// Solo profesional.
// El paciente cancela usando PUT.
// ----------------------------------------------------------

router.delete(
  '/:id',
  eliminarCita
)


module.exports = router
