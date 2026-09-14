<script setup>
// ==========================================================
// PANEL PROFESIONAL - VIBRA LA VIDA
// ==========================================================
// En esta etapa:
// 1. El panel NO muestra pacientes de ejemplo.
// 2. "Mi cuenta" se trabaja dentro del panel profesional.
// 3. Los datos profesionales se leen y guardan en Firestore.
// ==========================================================

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { auth, db } from '../firebase/firebaseConfig'
import { cerrarSesionUsuario } from '../services/authService'

import logoVibra from '../assets/logo-vibra.png'

const router = useRouter()

// ----------------------------------------------------------
// ESTADO GENERAL DEL PANEL
// ----------------------------------------------------------

const opcionActiva = ref('principal')
const cargandoCuenta = ref(true)
const guardandoCuenta = ref(false)
const editandoCuenta = ref(false)

const mensajeCuenta = ref('')
const mensajeErrorCuenta = ref('')

let detenerObservador = null

// ----------------------------------------------------------
// USUARIO PROFESIONAL
// ----------------------------------------------------------

const doctorActual = ref(null)

const datosDoctor = ref({
  uid: '',
  nombreCompleto: '',
  correo: '',
  profesionRegistrada: '',
  especialidad: '',
  cedulaProfesional: '',
  formacionAdicional: [],
  tieneConsultorio: false,
  consultorio: {
    ubicacion: '',
    horarioAtencion: '',
    telefono: '',
  },
})

// Formulario separado para no modificar los datos mostrados
// hasta que el doctor presione "Guardar cambios".
const formularioDoctor = ref({
  nombreCompleto: '',
  especialidad: '',
  cedulaProfesional: '',
  formacionAdicional: [],
  tieneConsultorio: false,
  ubicacion: '',
  horarioAtencion: '',
  telefono: '',
})

const erroresCuenta = ref({})

const mostrarFormularioFormacion = ref(false)
const guardandoFormacion = ref(false)

const formularioFormacion = ref({
  tipo: 'Maestría',
  nombre: '',
  institucion: '',
  anio: '',
  tieneCedula: false,
  cedulaProfesional: '',
})

const erroresFormacion = ref({})

const estadoCedulaFormacion = ref('sin-verificar')
// sin-verificar | verificando | verificada | no-encontrada

const mensajeCedulaFormacion = ref('')
const datosCedulaFormacion = ref(null)

const tiposFormacion = [
  'Especialidad',
  'Subespecialidad',
  'Maestría',
  'Doctorado',
  'Diplomado',
  'Certificación',
  'Otro',
]

// ----------------------------------------------------------
// PACIENTES
// ----------------------------------------------------------
// Por ahora inicia vacío.
// Más adelante se llenará únicamente cuando exista la relación
// correspondiente entre paciente y doctor.

const pacientes = ref([])

// ----------------------------------------------------------
// RESUMEN DEL PANEL
// ----------------------------------------------------------

const resumen = computed(() => ({
  pacientes: pacientes.value.length,
  riesgo: 0,
  citasHoy: 0,
}))

// ----------------------------------------------------------
// DATOS MOSTRADOS
// ----------------------------------------------------------

const primerNombreDoctor = computed(() => {
  const nombre = datosDoctor.value.nombreCompleto?.trim()

  if (!nombre) return 'Doctor'

  return nombre.split(' ')[0]
})

const nombreProfesional = computed(() => {
  return datosDoctor.value.nombreCompleto || 'Nombre no registrado'
})

const especialidadProfesional = computed(() => {
  return datosDoctor.value.especialidad || 'No especificada'
})

const profesionRegistrada = computed(() => {
  return (
    datosDoctor.value.profesionRegistrada ||
    'Profesión no registrada'
  )
})

const cedulaProfesional = computed(() => {
  return datosDoctor.value.cedulaProfesional || 'No registrada'
})

const telefonoConsultorio = computed(() => {
  return datosDoctor.value.consultorio?.telefono || 'No registrado'
})

const ubicacionConsultorio = computed(() => {
  return datosDoctor.value.consultorio?.ubicacion || 'No registrada'
})

const horarioConsultorio = computed(() => {
  return datosDoctor.value.consultorio?.horarioAtencion || 'No registrado'
})

// ----------------------------------------------------------
// NAVEGACIÓN INTERNA
// ----------------------------------------------------------

const seleccionarOpcion = (opcion) => {
  opcionActiva.value = opcion

  mensajeCuenta.value = ''
  mensajeErrorCuenta.value = ''

  // Si sale de Mi cuenta, cancelamos una edición sin guardar.
  if (opcion !== 'mi-cuenta') {
    cancelarEdicionCuenta()
  }
}

const irMiCuenta = () => {
  seleccionarOpcion('mi-cuenta')
}

// ----------------------------------------------------------
// CARGAR CUENTA DEL DOCTOR
// ----------------------------------------------------------

const cargarCuentaDoctor = async (usuario) => {
  cargandoCuenta.value = true

  try {
    const referencia = doc(db, 'usuarios', usuario.uid)
    const documento = await getDoc(referencia)

    if (!documento.exists()) {
      mensajeErrorCuenta.value =
        'No se encontró la información profesional de esta cuenta.'

      cargandoCuenta.value = false
      return
    }

    const datos = documento.data()

    // El panel acepta cuentas profesionales nuevas
    // y también cuentas antiguas con rol "doctor".
    const esProfesional =
      datos.rol === 'profesional_salud' ||
      datos.rol === 'doctor'

    if (!esProfesional) {
      await cerrarSesionUsuario()
      router.push('/iniciar-sesion')
      return
    }

    datosDoctor.value = {
      uid: usuario.uid,
      nombreCompleto: datos.nombreCompleto || '',
      correo: datos.correo || usuario.email || '',
      profesionRegistrada:
        datos.profesionRegistrada || '',
      especialidad: datos.especialidad || '',
      cedulaProfesional: datos.cedulaProfesional || '',
      formacionAdicional: Array.isArray(datos.formacionAdicional)
        ? datos.formacionAdicional
        : [],
      tieneConsultorio: Boolean(datos.tieneConsultorio),
      consultorio: {
        ubicacion: datos.consultorio?.ubicacion || '',
        horarioAtencion:
          datos.consultorio?.horarioAtencion || '',
        telefono: datos.consultorio?.telefono || '',
      },
    }
  } catch (error) {
    console.error('Error al cargar la cuenta profesional:', error)

    mensajeErrorCuenta.value =
      'No se pudo cargar la información de la cuenta.'
  } finally {
    cargandoCuenta.value = false
  }
}

// ----------------------------------------------------------
// EDITAR CUENTA
// ----------------------------------------------------------

const activarEdicionCuenta = () => {
  formularioDoctor.value = {
    nombreCompleto: datosDoctor.value.nombreCompleto,
    especialidad: datosDoctor.value.especialidad,
    cedulaProfesional: datosDoctor.value.cedulaProfesional,
    tieneConsultorio: datosDoctor.value.tieneConsultorio,
    ubicacion:
      datosDoctor.value.consultorio?.ubicacion || '',
    horarioAtencion:
      datosDoctor.value.consultorio?.horarioAtencion || '',
    telefono:
      datosDoctor.value.consultorio?.telefono || '',
  }

  erroresCuenta.value = {}
  mensajeCuenta.value = ''
  mensajeErrorCuenta.value = ''
  editandoCuenta.value = true
}

const cancelarEdicionCuenta = () => {
  editandoCuenta.value = false
  erroresCuenta.value = {}
}

// ----------------------------------------------------------
// VALIDACIÓN
// ----------------------------------------------------------

const validarCuentaDoctor = () => {
  const errores = {}

  if (!formularioDoctor.value.nombreCompleto.trim()) {
    errores.nombreCompleto =
      'Ingresa tu nombre completo.'
  }

  if (!formularioDoctor.value.especialidad.trim()) {
    errores.especialidad =
      'Ingresa tu especialidad o subespecialidad.'
  }

  const cedula =
    formularioDoctor.value.cedulaProfesional.trim()

  if (!cedula) {
    errores.cedulaProfesional =
      'Ingresa tu cédula profesional.'
  } else if (!/^\d{5,12}$/.test(cedula)) {
    errores.cedulaProfesional =
      'Ingresa únicamente los números de tu cédula.'
  }

  if (formularioDoctor.value.tieneConsultorio) {
    if (!formularioDoctor.value.ubicacion.trim()) {
      errores.ubicacion =
        'Ingresa la ubicación del consultorio.'
    }

    if (!formularioDoctor.value.horarioAtencion.trim()) {
      errores.horarioAtencion =
        'Ingresa el horario de atención.'
    }

    const telefono =
      formularioDoctor.value.telefono
        .replace(/\D/g, '')

    if (!telefono) {
      errores.telefono =
        'Ingresa un número de teléfono.'
    } else if (telefono.length !== 10) {
      errores.telefono =
        'El teléfono debe contener 10 dígitos.'
    }
  }

  erroresCuenta.value = errores

  return Object.keys(errores).length === 0
}

// ----------------------------------------------------------
// GUARDAR CUENTA EN FIRESTORE
// ----------------------------------------------------------

const guardarCuentaDoctor = async () => {
  mensajeCuenta.value = ''
  mensajeErrorCuenta.value = ''

  if (!validarCuentaDoctor()) {
    return
  }

  const usuario = auth.currentUser

  if (!usuario) {
    mensajeErrorCuenta.value =
      'Tu sesión terminó. Inicia sesión nuevamente.'
    return
  }

  guardandoCuenta.value = true

  try {
    const tieneConsultorio =
      formularioDoctor.value.tieneConsultorio

    const telefonoLimpio =
      formularioDoctor.value.telefono
        .replace(/\D/g, '')

    const datosActualizados = {
      nombreCompleto:
        formularioDoctor.value.nombreCompleto.trim(),

      especialidad:
        formularioDoctor.value.especialidad.trim(),

      cedulaProfesional:
        formularioDoctor.value.cedulaProfesional.trim(),

      tieneConsultorio,

      // Si no tiene consultorio se guarda null.
      consultorio: tieneConsultorio
        ? {
            ubicacion:
              formularioDoctor.value.ubicacion.trim(),

            horarioAtencion:
              formularioDoctor.value.horarioAtencion.trim(),

            telefono: telefonoLimpio,
          }
        : null,
    }

    // merge:true conserva correo, uid, rol, fechaRegistro
    // y cualquier otro dato existente.
    await setDoc(
      doc(db, 'usuarios', usuario.uid),
      datosActualizados,
      { merge: true }
    )

    datosDoctor.value = {
      ...datosDoctor.value,
      ...datosActualizados,
      consultorio:
        datosActualizados.consultorio || {
          ubicacion: '',
          horarioAtencion: '',
          telefono: '',
        },
    }

    editandoCuenta.value = false

    mensajeCuenta.value =
      'Información profesional actualizada correctamente.'
  } catch (error) {
    console.error(
      'Error al guardar la cuenta profesional:',
      error
    )

    mensajeErrorCuenta.value =
      'No se pudieron guardar los cambios. Inténtalo nuevamente.'
  } finally {
    guardandoCuenta.value = false
  }
}

// ----------------------------------------------------------
// FORMACIÓN ACADÉMICA ADICIONAL
// ----------------------------------------------------------

const abrirFormularioFormacion = () => {
  formularioFormacion.value = {
    tipo: 'Maestría',
    nombre: '',
    institucion: '',
    anio: '',
    tieneCedula: false,
    cedulaProfesional: '',
  }

  erroresFormacion.value = {}
  estadoCedulaFormacion.value = 'sin-verificar'
  mensajeCedulaFormacion.value = ''
  datosCedulaFormacion.value = null

  mostrarFormularioFormacion.value = true
}


const cancelarFormacion = () => {
  mostrarFormularioFormacion.value = false
  erroresFormacion.value = {}
  estadoCedulaFormacion.value = 'sin-verificar'
  mensajeCedulaFormacion.value = ''
  datosCedulaFormacion.value = null
}


const alCambiarCedulaFormacion = () => {
  formularioFormacion.value.cedulaProfesional =
    formularioFormacion.value.cedulaProfesional
      .replace(/\D/g, '')

  estadoCedulaFormacion.value = 'sin-verificar'
  mensajeCedulaFormacion.value = ''
  datosCedulaFormacion.value = null

  if (erroresFormacion.value.cedulaProfesional) {
    delete erroresFormacion.value.cedulaProfesional
  }
}


const quitarCedulaFormacion = () => {
  formularioFormacion.value.tieneCedula = false
  formularioFormacion.value.cedulaProfesional = ''

  estadoCedulaFormacion.value = 'sin-verificar'
  mensajeCedulaFormacion.value = ''
  datosCedulaFormacion.value = null

  if (erroresFormacion.value.cedulaProfesional) {
    delete erroresFormacion.value.cedulaProfesional
  }
}


const verificarCedulaFormacion = async () => {
  const cedula =
    formularioFormacion.value.cedulaProfesional.trim()

  const nombreCompleto =
    datosDoctor.value.nombreCompleto.trim()

  mensajeCedulaFormacion.value = ''
  datosCedulaFormacion.value = null

  if (!/^\d{7,8}$/.test(cedula)) {
    estadoCedulaFormacion.value = 'no-encontrada'

    erroresFormacion.value.cedulaProfesional =
      'La cédula debe contener 7 u 8 dígitos.'

    return
  }

  delete erroresFormacion.value.cedulaProfesional

  estadoCedulaFormacion.value = 'verificando'

  try {
    const respuesta = await fetch(
      'http://localhost:3001/api/doctores/verificar-cedula',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula,
          nombreCompleto,
        }),
      }
    )

    const datos = await respuesta.json()

    if (!respuesta.ok || !datos.valida) {
      estadoCedulaFormacion.value = 'no-encontrada'

      mensajeCedulaFormacion.value =
        datos.mensaje ||
        'No fue posible verificar esta cédula.'

      return
    }

    estadoCedulaFormacion.value = 'verificada'
    datosCedulaFormacion.value = datos.profesional

    mensajeCedulaFormacion.value =
      'Cédula de esta formación verificada correctamente.'
  } catch (error) {
    console.error(
      'Error al verificar cédula de formación:',
      error
    )

    estadoCedulaFormacion.value = 'no-encontrada'
    mensajeCedulaFormacion.value =
      'No se pudo conectar con el servicio de verificación.'
  }
}


const validarFormacion = () => {
  const errores = {}

  if (!formularioFormacion.value.tipo) {
    errores.tipo =
      'Selecciona el tipo de formación.'
  }

  if (!formularioFormacion.value.nombre.trim()) {
    errores.nombre =
      'Ingresa el nombre del estudio o formación.'
  }

  if (!formularioFormacion.value.institucion.trim()) {
    errores.institucion =
      'Ingresa la institución.'
  }

  const anio =
    formularioFormacion.value.anio.trim()

  if (
    anio &&
    !/^\d{4}$/.test(anio)
  ) {
    errores.anio =
      'Ingresa un año válido de 4 dígitos.'
  }

  if (formularioFormacion.value.tieneCedula) {
    const cedula =
      formularioFormacion.value.cedulaProfesional.trim()

    if (!cedula) {
      errores.cedulaProfesional =
        'Ingresa la cédula de esta formación.'
    } else if (!/^\d{7,8}$/.test(cedula)) {
      errores.cedulaProfesional =
        'La cédula debe contener 7 u 8 dígitos.'
    } else if (
      estadoCedulaFormacion.value !== 'verificada'
    ) {
      errores.cedulaProfesional =
        'Verifica esta cédula antes de guardar.'
    }
  }

  erroresFormacion.value = errores

  return Object.keys(errores).length === 0
}


const guardarFormacion = async () => {
  if (!validarFormacion()) {
    return
  }

  const usuario = auth.currentUser

  if (!usuario) {
    mensajeErrorCuenta.value =
      'Tu sesión terminó. Inicia sesión nuevamente.'
    return
  }

  guardandoFormacion.value = true

  try {
    const nuevaFormacion = {
      id: `${Date.now()}`,

      tipo:
        formularioFormacion.value.tipo,

      nombre:
        formularioFormacion.value.nombre.trim(),

      institucion:
        formularioFormacion.value.institucion.trim(),

      anio:
        formularioFormacion.value.anio.trim() || null,

      tieneCedula:
        formularioFormacion.value.tieneCedula,

      cedulaProfesional:
        formularioFormacion.value.tieneCedula
          ? formularioFormacion.value.cedulaProfesional.trim()
          : null,

      verificada:
        formularioFormacion.value.tieneCedula
          ? estadoCedulaFormacion.value === 'verificada'
          : false,

      profesionRegistrada:
        formularioFormacion.value.tieneCedula
          ? datosCedulaFormacion.value?.profesion || null
          : null,

      institucionRegistro:
        formularioFormacion.value.tieneCedula
          ? datosCedulaFormacion.value?.institucion || null
          : null,
    }

    const nuevaLista = [
      ...datosDoctor.value.formacionAdicional,
      nuevaFormacion,
    ]

    await setDoc(
      doc(db, 'usuarios', usuario.uid),
      {
        formacionAdicional: nuevaLista,
      },
      {
        merge: true,
      }
    )

    datosDoctor.value.formacionAdicional =
      nuevaLista

    mensajeCuenta.value =
      'Formación académica agregada correctamente.'

    cancelarFormacion()
  } catch (error) {
    console.error(
      'Error al guardar formación adicional:',
      error
    )

    mensajeErrorCuenta.value =
      'No se pudo guardar la formación académica.'
  } finally {
    guardandoFormacion.value = false
  }
}


const eliminarFormacion = async (id) => {
  const usuario = auth.currentUser

  if (!usuario) {
    return
  }

  const confirmar = window.confirm(
    '¿Deseas eliminar esta formación académica?'
  )

  if (!confirmar) {
    return
  }

  try {
    const nuevaLista =
      datosDoctor.value.formacionAdicional.filter(
        (formacion) =>
          formacion.id !== id
      )

    await setDoc(
      doc(db, 'usuarios', usuario.uid),
      {
        formacionAdicional: nuevaLista,
      },
      {
        merge: true,
      }
    )

    datosDoctor.value.formacionAdicional =
      nuevaLista

    mensajeCuenta.value =
      'Formación eliminada correctamente.'
  } catch (error) {
    console.error(
      'Error al eliminar formación:',
      error
    )

    mensajeErrorCuenta.value =
      'No se pudo eliminar la formación.'
  }
}


// ----------------------------------------------------------
// CERRAR SESIÓN
// ----------------------------------------------------------

const cerrarSesion = async () => {
  try {
    await cerrarSesionUsuario()
    router.push('/iniciar-sesion')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

// ----------------------------------------------------------
// CICLO DE VIDA
// ----------------------------------------------------------

onMounted(() => {
  detenerObservador = onAuthStateChanged(
    auth,
    async (usuario) => {
      if (!usuario) {
        router.push('/iniciar-sesion')
        return
      }

      doctorActual.value = usuario
      await cargarCuentaDoctor(usuario)
    }
  )
})

onUnmounted(() => {
  if (detenerObservador) {
    detenerObservador()
  }
})
</script>

<template>
  <main class="panel-doctor">

    <!-- ====================================================
         MENÚ LATERAL
         ==================================================== -->
    <aside class="menu-doctor">

      <div class="contenedor-logo-doctor">
        <img
          :src="logoVibra"
          alt="Logo Vibra la Vida"
          class="logo-doctor"
        />
      </div>

      <nav class="navegacion-doctor">

        <button
          type="button"
          :class="{
            activo:
              opcionActiva === 'principal'
          }"
          @click="
            seleccionarOpcion('principal')
          "
        >
          <span class="icono-menu">⌂</span>
          <span>Principal</span>
        </button>

        <button
          type="button"
          :class="{
            activo:
              opcionActiva === 'pacientes'
          }"
          @click="
            seleccionarOpcion('pacientes')
          "
        >
          <span class="icono-menu">♟</span>
          <span>Pacientes</span>
        </button>

        <button
          type="button"
          :class="{
            activo:
              opcionActiva === 'resultados'
          }"
          @click="
            seleccionarOpcion('resultados')
          "
        >
          <span class="icono-menu">▥</span>
          <span>Resultados</span>
        </button>

        <button
          type="button"
          :class="{
            activo:
              opcionActiva === 'citas'
          }"
          @click="
            seleccionarOpcion('citas')
          "
        >
          <span class="icono-menu">▦</span>
          <span>Citas</span>
        </button>

      </nav>

      <div class="menu-inferior-doctor">

        <button
          type="button"
          class="boton-mi-cuenta"
          :class="{
            activo:
              opcionActiva === 'mi-cuenta'
          }"
          @click="irMiCuenta"
        >
          <span class="icono-menu">○</span>
          <span>Mi cuenta</span>
        </button>

        <div class="linea-menu"></div>

        <button
          type="button"
          class="boton-cerrar-sesion"
          @click="cerrarSesion"
        >
          <span class="icono-menu">↪</span>
          <span>Cerrar sesión</span>
        </button>

      </div>

    </aside>


    <!-- ====================================================
         CONTENIDO
         ==================================================== -->
    <section class="contenido-panel-doctor">

      <!-- ==================================================
           PRINCIPAL
           ================================================== -->
      <template v-if="opcionActiva === 'principal'">

        <header class="encabezado-panel">
          <div>
            <span class="etiqueta-panel">
              Panel profesional
            </span>

            <h1>
              Te damos la bienvenida, {{ primerNombreDoctor }}
            </h1>

            <p>
              Aquí podrás consultar a los pacientes que
              posteriormente sean vinculados a tu seguimiento.
            </p>
          </div>
        </header>


        <section class="tarjetas-resumen">

          <article class="tarjeta-resumen">
            <span class="titulo-tarjeta">
              Pacientes en seguimiento
            </span>

            <strong>
              {{ resumen.pacientes }}
            </strong>

            <small>
              Pacientes vinculados
            </small>
          </article>


          <article class="tarjeta-resumen">
            <span class="titulo-tarjeta">
              Requieren revisión
            </span>

            <strong>
              {{ resumen.riesgo }}
            </strong>

            <small>
              Sin alertas por el momento
            </small>
          </article>


          <article class="tarjeta-resumen">
            <span class="titulo-tarjeta">
              Citas de hoy
            </span>

            <strong>
              {{ resumen.citasHoy }}
            </strong>

            <small>
              Programadas para hoy
            </small>
          </article>

        </section>


        <section class="estado-vacio-doctor">

          <div class="icono-vacio-doctor">
            ♡
          </div>

          <div>
            <h2>
              Aún no tienes pacientes en seguimiento
            </h2>

            <p>
              Los pacientes aparecerán aquí cuando
              exista una vinculación de seguimiento
              dentro de Vibra la Vida.
            </p>
          </div>

        </section>

      </template>


      <!-- ==================================================
           PACIENTES
           ================================================== -->
      <template v-else-if="opcionActiva === 'pacientes'">

        <header class="encabezado-panel">
          <div>
            <span class="etiqueta-panel">
              Seguimiento
            </span>

            <h1>
              Pacientes
            </h1>

            <p>
              En este apartado aparecerán únicamente
              los pacientes vinculados a tu seguimiento.
            </p>
          </div>
        </header>


        <section class="estado-vacio-doctor">

          <div class="icono-vacio-doctor">
            ♡
          </div>

          <div>
            <h2>
              No hay pacientes vinculados
            </h2>

            <p>
              Por ahora no existe información de
              pacientes disponible para esta cuenta.
            </p>
          </div>

        </section>

      </template>


      <!-- ==================================================
           RESULTADOS
           ================================================== -->
      <template v-else-if="opcionActiva === 'resultados'">

        <header class="encabezado-panel">
          <div>
            <span class="etiqueta-panel">
              Seguimiento
            </span>

            <h1>
              Resultados
            </h1>

            <p>
              Los resultados aparecerán cuando
              existan pacientes vinculados.
            </p>
          </div>
        </header>


        <section class="estado-vacio-doctor">

          <div class="icono-vacio-doctor">
            ▥
          </div>

          <div>
            <h2>
              Sin resultados disponibles
            </h2>

            <p>
              Todavía no hay información clínica
              vinculada a esta cuenta profesional.
            </p>
          </div>

        </section>

      </template>


      <!-- ==================================================
           CITAS
           ================================================== -->
      <template v-else-if="opcionActiva === 'citas'">

        <header class="encabezado-panel">
          <div>
            <span class="etiqueta-panel">
              Agenda
            </span>

            <h1>
              Citas
            </h1>

            <p>
              Aquí administraremos posteriormente
              las citas de tus pacientes.
            </p>
          </div>
        </header>


        <section class="estado-vacio-doctor">

          <div class="icono-vacio-doctor">
            ▦
          </div>

          <div>
            <h2>
              No tienes citas registradas
            </h2>

            <p>
              Cuando configuremos el módulo de citas
              aparecerán aquí.
            </p>
          </div>

        </section>

      </template>


      <!-- ==================================================
           MI CUENTA DEL DOCTOR
           ================================================== -->
      <template v-else-if="opcionActiva === 'mi-cuenta'">

        <header class="encabezado-panel encabezado-cuenta-doctor">

          <div>
            <span class="etiqueta-panel">
              Perfil profesional
            </span>

            <h1>
              Mi cuenta
            </h1>

            <p>
              Administra la información profesional
              que utilizarás dentro de Vibra la Vida.
            </p>
          </div>

        </header>


        <section
          v-if="cargandoCuenta"
          class="estado-vacio-doctor"
        >
          <div>
            <h2>
              Cargando información...
            </h2>
          </div>
        </section>


        <template v-else>

          <!-- ================================================
               MODO LECTURA
               ================================================ -->
          <section
            v-if="!editandoCuenta"
            class="cuenta-doctor"
          >

            <article class="tarjeta-profesional">

              <div class="cabecera-tarjeta-profesional">

                <div>
                  <span class="mini-etiqueta-doctor">
                    Información profesional
                  </span>

                  <h2>
                    {{ nombreProfesional }}
                  </h2>

                  <p>
                    {{ especialidadProfesional }}
                  </p>
                </div>


                <button
                  type="button"
                  class="boton-editar-doctor"
                  @click="activarEdicionCuenta"
                >
                  Editar información
                </button>

              </div>


              <div class="rejilla-datos-doctor">

                <div class="dato-doctor">
                  <span>
                    Nombre completo
                  </span>

                  <strong>
                    {{ nombreProfesional }}
                  </strong>
                </div>


                <div class="dato-doctor">
                  <span>
                    Profesión registrada
                  </span>

                  <strong>
                    {{ profesionRegistrada }}
                  </strong>
                </div>


                <div class="dato-doctor">
                  <span>
                    Especialidad / área de atención
                  </span>

                  <strong>
                    {{ especialidadProfesional }}
                  </strong>
                </div>


                <div class="dato-doctor">
                  <span>
                    Cédula profesional
                  </span>

                  <strong>
                    {{ cedulaProfesional }}
                  </strong>
                </div>

              </div>

            </article>


            <article class="tarjeta-formacion">

              <div class="cabecera-formacion">

                <div>
                  <span class="mini-etiqueta-doctor">
                    Formación académica adicional
                  </span>

                  <h2>
                    Estudios y certificaciones
                  </h2>

                  <p>
                    Agrega maestrías, especialidades,
                    doctorados, diplomados o certificaciones.
                  </p>
                </div>


                <button
                  v-if="!mostrarFormularioFormacion"
                  type="button"
                  class="boton-agregar-formacion"
                  @click="abrirFormularioFormacion"
                >
                  + Agregar formación
                </button>

              </div>


              <div
                v-if="
                  datosDoctor.formacionAdicional.length > 0
                "
                class="lista-formacion"
              >

                <article
                  v-for="
                    formacion in datosDoctor.formacionAdicional
                  "
                  :key="formacion.id"
                  class="item-formacion"
                >

                  <div class="contenido-formacion">

                    <div class="fila-tipo-formacion">

                      <span class="tipo-formacion">
                        {{ formacion.tipo }}
                      </span>

                      <span
                        class="estado-formacion"
                        :class="{
                          verificada:
                            formacion.verificada
                        }"
                      >
                        {{
                          formacion.verificada
                            ? 'Verificada'
                            : 'Información proporcionada'
                        }}
                      </span>

                    </div>


                    <h3>
                      {{ formacion.nombre }}
                    </h3>


                    <p>
                      {{ formacion.institucion }}
                    </p>


                    <div class="meta-formacion">

                      <span v-if="formacion.anio">
                        {{ formacion.anio }}
                      </span>

                      <span
                        v-if="
                          formacion.cedulaProfesional
                        "
                      >
                        Cédula:
                        {{ formacion.cedulaProfesional }}
                      </span>

                    </div>

                  </div>


                  <button
                    type="button"
                    class="boton-eliminar-formacion"
                    @click="
                      eliminarFormacion(formacion.id)
                    "
                  >
                    Eliminar
                  </button>

                </article>

              </div>


              <div
                v-else-if="
                  !mostrarFormularioFormacion
                "
                class="sin-formacion"
              >
                <p>
                  Aún no has agregado formación académica
                  adicional.
                </p>
              </div>


              <form
                v-if="mostrarFormularioFormacion"
                class="formulario-formacion"
                @submit.prevent="guardarFormacion"
              >

                <div class="rejilla-formacion">

                  <div class="grupo-campo-doctor">

                    <label for="tipoFormacion">
                      Tipo de formación
                    </label>

                    <select
                      id="tipoFormacion"
                      v-model="
                        formularioFormacion.tipo
                      "
                    >
                      <option
                        v-for="tipo in tiposFormacion"
                        :key="tipo"
                        :value="tipo"
                      >
                        {{ tipo }}
                      </option>
                    </select>

                  </div>


                  <div class="grupo-campo-doctor">

                    <label for="nombreFormacion">
                      Nombre
                    </label>

                    <input
                      id="nombreFormacion"
                      v-model="
                        formularioFormacion.nombre
                      "
                      type="text"
                      placeholder="Ej. Nutrición Clínica"
                    />

                    <small
                      v-if="
                        erroresFormacion.nombre
                      "
                    >
                      {{ erroresFormacion.nombre }}
                    </small>

                  </div>


                  <div class="grupo-campo-doctor">

                    <label for="institucionFormacion">
                      Institución
                    </label>

                    <input
                      id="institucionFormacion"
                      v-model="
                        formularioFormacion.institucion
                      "
                      type="text"
                      placeholder="Universidad o institución"
                    />

                    <small
                      v-if="
                        erroresFormacion.institucion
                      "
                    >
                      {{ erroresFormacion.institucion }}
                    </small>

                  </div>


                  <div class="grupo-campo-doctor">

                    <label for="anioFormacion">
                      Año
                    </label>

                    <input
                      id="anioFormacion"
                      v-model="
                        formularioFormacion.anio
                      "
                      type="text"
                      inputmode="numeric"
                      maxlength="4"
                      placeholder="Ej. 2024"
                    />

                    <small
                      v-if="
                        erroresFormacion.anio
                      "
                    >
                      {{ erroresFormacion.anio }}
                    </small>

                  </div>

                </div>


                <div class="bloque-cedula-formacion">

                  <div class="encabezado-cedula-formacion">

                    <div>
                      <strong>
                        ¿Esta formación tiene cédula profesional?
                      </strong>

                      <span>
                        Si cuenta con una cédula propia,
                        también podemos verificarla.
                      </span>
                    </div>


                    <div class="opciones-consultorio">

                      <button
                        type="button"
                        :class="{
                          activo:
                            formularioFormacion.tieneCedula
                        }"
                        @click="
                          formularioFormacion.tieneCedula = true
                        "
                      >
                        Sí
                      </button>

                      <button
                        type="button"
                        :class="{
                          activo:
                            !formularioFormacion.tieneCedula
                        }"
                        @click="quitarCedulaFormacion"
                      >
                        No
                      </button>

                    </div>

                  </div>


                  <div
                    v-if="
                      formularioFormacion.tieneCedula
                    "
                    class="fila-cedula-formacion"
                  >

                    <div class="grupo-campo-doctor">

                      <label for="cedulaFormacion">
                        Cédula profesional
                      </label>

                      <input
                        id="cedulaFormacion"
                        v-model="
                          formularioFormacion.cedulaProfesional
                        "
                        type="text"
                        inputmode="numeric"
                        maxlength="8"
                        placeholder="7 u 8 dígitos"
                        @input="alCambiarCedulaFormacion"
                      />

                      <small
                        v-if="
                          erroresFormacion.cedulaProfesional
                        "
                      >
                        {{
                          erroresFormacion.cedulaProfesional
                        }}
                      </small>

                    </div>


                    <button
                      type="button"
                      class="boton-verificar-formacion"
                      :disabled="
                        estadoCedulaFormacion === 'verificando' ||
                        !formularioFormacion.cedulaProfesional
                      "
                      @click="verificarCedulaFormacion"
                    >
                      {{
                        estadoCedulaFormacion === 'verificando'
                          ? 'Verificando...'
                          : estadoCedulaFormacion === 'verificada'
                            ? 'Verificada'
                            : 'Verificar cédula'
                      }}
                    </button>

                  </div>


                  <div
                    v-if="
                      estadoCedulaFormacion !== 'sin-verificar'
                    "
                    class="mensaje-verificacion-formacion"
                    :class="estadoCedulaFormacion"
                  >
                    {{
                      mensajeCedulaFormacion ||
                      (
                        estadoCedulaFormacion === 'verificando'
                          ? 'Consultando cédula...'
                          : ''
                      )
                    }}
                  </div>

                </div>


                <div class="acciones-formacion">

                  <button
                    type="button"
                    class="boton-cancelar-doctor"
                    :disabled="guardandoFormacion"
                    @click="cancelarFormacion"
                  >
                    Cancelar
                  </button>


                  <button
                    type="submit"
                    class="boton-guardar-doctor"
                    :disabled="guardandoFormacion"
                  >
                    {{
                      guardandoFormacion
                        ? 'Guardando...'
                        : 'Guardar formación'
                    }}
                  </button>

                </div>

              </form>

            </article>


            <article class="tarjeta-consultorio">

              <div class="cabecera-consultorio">

                <div>
                  <span class="mini-etiqueta-doctor">
                    Consultorio
                  </span>

                  <h2>
                    Datos de atención
                  </h2>
                </div>


                <span
                  class="estado-consultorio"
                  :class="{
                    activo:
                      datosDoctor.tieneConsultorio
                  }"
                >
                  {{
                    datosDoctor.tieneConsultorio
                      ? 'Consultorio registrado'
                      : 'Sin consultorio'
                  }}
                </span>

              </div>


              <template
                v-if="datosDoctor.tieneConsultorio"
              >

                <div class="rejilla-consultorio">

                  <div class="dato-doctor dato-ancho">
                    <span>
                      Ubicación
                    </span>

                    <strong>
                      {{ ubicacionConsultorio }}
                    </strong>
                  </div>


                  <div class="dato-doctor">
                    <span>
                      Horario de atención
                    </span>

                    <strong>
                      {{ horarioConsultorio }}
                    </strong>
                  </div>


                  <div class="dato-doctor">
                    <span>
                      Número de teléfono
                    </span>

                    <strong>
                      {{ telefonoConsultorio }}
                    </strong>
                  </div>

                </div>

              </template>


              <div
                v-else
                class="sin-consultorio"
              >
                <p>
                  Actualmente no tienes información
                  de un consultorio registrada.
                </p>

                <button
                  type="button"
                  class="boton-agregar-consultorio"
                  @click="activarEdicionCuenta"
                >
                  Agregar consultorio
                </button>
              </div>

            </article>


            <p
              v-if="mensajeCuenta"
              class="mensaje-cuenta correcto"
            >
              {{ mensajeCuenta }}
            </p>


            <p
              v-if="mensajeErrorCuenta"
              class="mensaje-cuenta error"
            >
              {{ mensajeErrorCuenta }}
            </p>

          </section>


          <!-- ================================================
               MODO EDICIÓN
               ================================================ -->
          <form
            v-else
            class="formulario-cuenta-doctor"
            @submit.prevent="guardarCuentaDoctor"
          >

            <article class="tarjeta-formulario-doctor">

              <div class="cabecera-formulario-doctor">
                <div>
                  <span class="mini-etiqueta-doctor">
                    Información profesional
                  </span>

                  <h2>
                    Editar datos
                  </h2>
                </div>

                <p>
                  Completa la información que utilizarás
                  como profesional dentro de la plataforma.
                </p>
              </div>


              <div class="rejilla-formulario-doctor">

                <div class="grupo-campo-doctor">

                  <label for="nombreDoctor">
                    Nombre completo
                  </label>

                  <input
                    id="nombreDoctor"
                    v-model="
                      formularioDoctor.nombreCompleto
                    "
                    type="text"
                    autocomplete="name"
                    placeholder="Nombre completo"
                  />

                  <small
                    v-if="
                      erroresCuenta.nombreCompleto
                    "
                  >
                    {{
                      erroresCuenta.nombreCompleto
                    }}
                  </small>

                </div>


                <div class="grupo-campo-doctor">

                  <label for="especialidadDoctor">
                    Especialidad o área de atención
                  </label>

                  <input
                    id="especialidadDoctor"
                    v-model="
                      formularioDoctor.especialidad
                    "
                    type="text"
                    placeholder="Ej. Cardiología, Nutrición clínica, Psicología..."
                  />

                  <small
                    v-if="
                      erroresCuenta.especialidad
                    "
                  >
                    {{
                      erroresCuenta.especialidad
                    }}
                  </small>

                </div>


                <div class="grupo-campo-doctor">

                  <label for="cedulaDoctor">
                    Cédula profesional
                  </label>

                  <input
                    id="cedulaDoctor"
                    v-model="
                      formularioDoctor.cedulaProfesional
                    "
                    type="text"
                    inputmode="numeric"
                    placeholder="Número de cédula"
                  />

                  <small
                    v-if="
                      erroresCuenta.cedulaProfesional
                    "
                  >
                    {{
                      erroresCuenta.cedulaProfesional
                    }}
                  </small>

                </div>

              </div>

            </article>


            <article class="tarjeta-formulario-doctor">

              <div class="cabecera-formulario-doctor">

                <div>
                  <span class="mini-etiqueta-doctor">
                    Consultorio
                  </span>

                  <h2>
                    Información de atención
                  </h2>
                </div>

              </div>


              <div class="selector-consultorio">

                <div>
                  <strong>
                    ¿Cuentas con consultorio?
                  </strong>

                  <span>
                    Agrega esta información solamente
                    si actualmente atiendes en uno.
                  </span>
                </div>


                <div class="opciones-consultorio">

                  <button
                    type="button"
                    :class="{
                      activo:
                        formularioDoctor
                          .tieneConsultorio
                    }"
                    @click="
                      formularioDoctor
                        .tieneConsultorio = true
                    "
                  >
                    Sí
                  </button>


                  <button
                    type="button"
                    :class="{
                      activo:
                        !formularioDoctor
                          .tieneConsultorio
                    }"
                    @click="
                      formularioDoctor
                        .tieneConsultorio = false
                    "
                  >
                    No
                  </button>

                </div>

              </div>


              <div
                v-if="
                  formularioDoctor.tieneConsultorio
                "
                class="rejilla-formulario-doctor consultorio-formulario"
              >

                <div
                  class="grupo-campo-doctor campo-completo"
                >

                  <label for="ubicacionConsultorio">
                    Ubicación del consultorio
                  </label>

                  <input
                    id="ubicacionConsultorio"
                    v-model="
                      formularioDoctor.ubicacion
                    "
                    type="text"
                    placeholder="Dirección o ubicación"
                  />

                  <small
                    v-if="
                      erroresCuenta.ubicacion
                    "
                  >
                    {{ erroresCuenta.ubicacion }}
                  </small>

                </div>


                <div class="grupo-campo-doctor">

                  <label for="horarioConsultorio">
                    Horario de atención
                  </label>

                  <input
                    id="horarioConsultorio"
                    v-model="
                      formularioDoctor
                        .horarioAtencion
                    "
                    type="text"
                    placeholder="Ej. Lun - Vie, 9:00 a 17:00"
                  />

                  <small
                    v-if="
                      erroresCuenta.horarioAtencion
                    "
                  >
                    {{
                      erroresCuenta.horarioAtencion
                    }}
                  </small>

                </div>


                <div class="grupo-campo-doctor">

                  <label for="telefonoConsultorio">
                    Número de teléfono
                  </label>

                  <input
                    id="telefonoConsultorio"
                    v-model="
                      formularioDoctor.telefono
                    "
                    type="tel"
                    inputmode="tel"
                    placeholder="10 dígitos"
                  />

                  <small
                    v-if="
                      erroresCuenta.telefono
                    "
                  >
                    {{ erroresCuenta.telefono }}
                  </small>

                </div>

              </div>

            </article>


            <p
              v-if="mensajeErrorCuenta"
              class="mensaje-cuenta error"
            >
              {{ mensajeErrorCuenta }}
            </p>


            <div class="acciones-formulario-doctor">

              <button
                type="button"
                class="boton-cancelar-doctor"
                :disabled="guardandoCuenta"
                @click="cancelarEdicionCuenta"
              >
                Cancelar
              </button>


              <button
                type="submit"
                class="boton-guardar-doctor"
                :disabled="guardandoCuenta"
              >
                {{
                  guardandoCuenta
                    ? 'Guardando...'
                    : 'Guardar cambios'
                }}
              </button>

            </div>

          </form>

        </template>

      </template>

    </section>

  </main>
</template>

<style
  scoped
  src="../assets/styles/panelDoctor.css"
></style>
