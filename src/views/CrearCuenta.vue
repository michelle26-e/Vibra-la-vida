<script setup>
// ==========================================================
// CREAR CUENTA - VIBRA LA VIDA
// Registro para paciente y doctor en una sola pantalla.
// La imagen y el mensaje del panel derecho cambian según
// el tipo de cuenta seleccionado.
// ==========================================================

import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { registrarUsuario } from '../services/authService'

// IMPORTANTE:
// Guarda las dos imágenes dentro de src/assets con estos nombres.
import ajolotePaciente from '../assets/ajolotenormal.png'
import ajoloteDoctor from '../assets/ajolotedoctor.png'

const router = useRouter()

// ----------------------------------------------------------
// TIPO DE CUENTA
// ----------------------------------------------------------
// "paciente" se guarda en Firebase con rol "usuario".
// "doctor" se guarda con rol "doctor".
const tipoCuenta = ref('paciente')

// ----------------------------------------------------------
// FORMULARIO
// ----------------------------------------------------------
const formulario = ref({
  nombreCompleto: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',
  especialidad: '',
  cedulaProfesional: '',
})

const errores = ref({})
const mensajeError = ref('')
const cargando = ref(false)

const mostrarContrasena = ref(false)
const mostrarConfirmarContrasena = ref(false)

// ----------------------------------------------------------
// VERIFICACIÓN DE CÉDULA PROFESIONAL
// ----------------------------------------------------------
// Estos estados ya dejan lista la interfaz para conectarla
// después con la API RESTful de tu compañero.
//
// IMPORTANTE:
// Mientras no exista la API real, NUNCA marcamos una cédula
// como verificada únicamente por tener un formato correcto.
const estadoCedula = ref('sin-verificar')
// Valores posibles:
// 'sin-verificar'
// 'verificando'
// 'verificada'
// 'no-encontrada'
// 'pendiente-api'

const mensajeCedula = ref('')
const datosCedulaVerificada = ref(null)

const cedulaVerificada = computed(() => {
  return estadoCedula.value === 'verificada'
})

// ----------------------------------------------------------
// ESPECIALIDADES
// ----------------------------------------------------------
// La lista se usa como autocompletado para cuentas de doctor.
const especialidades = [
  'Alergología e Inmunología',
  'Alergología Pediátrica',
  'Anestesiología',
  'Anestesiología Pediátrica',
  'Angiología y Cirugía Vascular',
  'Cardiología',
  'Cardiología Intervencionista',
  'Cardiología Pediátrica',
  'Cirugía Cardiovascular',
  'Cirugía General',
  'Cirugía Oncológica',
  'Cirugía Pediátrica',
  'Cirugía Plástica Estética y Reconstructiva',
  'Coloproctología',
  'Dermatología',
  'Dermatología Pediátrica',
  'Endocrinología',
  'Endocrinología Pediátrica',
  'Gastroenterología',
  'Gastroenterología Pediátrica',
  'Genética Médica',
  'Geriatría',
  'Ginecología y Obstetricia',
  'Ginecología Oncológica',
  'Hematología',
  'Hematología Pediátrica',
  'Infectología',
  'Infectología Pediátrica',
  'Medicina Crítica',
  'Medicina del Deporte',
  'Medicina del Dolor',
  'Medicina del Sueño',
  'Medicina Familiar',
  'Medicina Física y Rehabilitación',
  'Medicina General',
  'Medicina Interna',
  'Medicina Materno Fetal',
  'Medicina Nuclear',
  'Nefrología',
  'Nefrología Pediátrica',
  'Neonatología',
  'Neumología',
  'Neumología Pediátrica',
  'Neurología',
  'Neurología Pediátrica',
  'Neurocirugía',
  'Nutrición',
  'Nutrición Clínica',
  'Nutrición Pediátrica',
  'Oftalmología',
  'Oftalmología Pediátrica',
  'Oncología Médica',
  'Oncología Pediátrica',
  'Ortopedia',
  'Ortopedia Pediátrica',
  'Otorrinolaringología',
  'Otorrinolaringología Pediátrica',
  'Pediatría',
  'Psicología',
  'Psicología Clínica',
  'Psicología Infantil y del Adolescente',
  'Psiquiatría',
  'Psiquiatría Infantil y de la Adolescencia',
  'Radiología e Imagen',
  'Reumatología',
  'Reumatología Pediátrica',
  'Traumatología',
  'Traumatología y Ortopedia',
  'Urgencias Médicas',
  'Urología',
  'Urología Pediátrica',
]

const mostrarListaEspecialidades = ref(false)

// Filtra las especialidades según lo que escribe el doctor.
const especialidadesFiltradas = computed(() => {
  const texto = formulario.value.especialidad
    .trim()
    .toLowerCase()

  if (!texto) {
    return especialidades.slice(0, 12)
  }

  return especialidades
    .filter((especialidad) =>
      especialidad.toLowerCase().includes(texto)
    )
    .slice(0, 12)
})

// ----------------------------------------------------------
// CONTENIDO DINÁMICO DEL PANEL DERECHO
// ----------------------------------------------------------
const imagenLateral = computed(() => {
  return tipoCuenta.value === 'doctor'
    ? ajoloteDoctor
    : ajolotePaciente
})

const tituloLateral = computed(() => {
  return tipoCuenta.value === 'doctor'
    ? 'Acompaña y cuida a tus pacientes.'
    : 'Un paso más hacia tu equilibrio.'
})

const textoLateral = computed(() => {
  return tipoCuenta.value === 'doctor'
    ? 'Regístrate como doctor para dar seguimiento, revisar resultados y gestionar pacientes desde un solo lugar.'
    : 'Regístrate en Vibra la Vida y accede a herramientas, encuestas interactivas y recursos personalizados para ti.'
})

// ----------------------------------------------------------
// CAMBIAR TIPO DE CUENTA
// ----------------------------------------------------------
const seleccionarTipoCuenta = (tipo) => {
  tipoCuenta.value = tipo
  mensajeError.value = ''
  errores.value = {}

  // Si vuelve a paciente, limpiamos especialidad.
  if (tipo === 'paciente') {
    formulario.value.especialidad = ''
    formulario.value.cedulaProfesional = ''
    mostrarListaEspecialidades.value = false
  }

  // Cada vez que cambia el tipo de cuenta,
  // la verificación profesional vuelve a comenzar.
  estadoCedula.value = 'sin-verificar'
  mensajeCedula.value = ''
  datosCedulaVerificada.value = null
}

// ----------------------------------------------------------
// SELECCIONAR ESPECIALIDAD
// ----------------------------------------------------------
const seleccionarEspecialidad = (especialidad) => {
  formulario.value.especialidad = especialidad
  mostrarListaEspecialidades.value = false

  if (errores.value.especialidad) {
    delete errores.value.especialidad
  }
}

// ----------------------------------------------------------
// CUANDO CAMBIA LA CÉDULA
// ----------------------------------------------------------
const alCambiarCedula = () => {
  // Dejamos únicamente números.
  formulario.value.cedulaProfesional =
    formulario.value.cedulaProfesional.replace(/\D/g, '')

  // Si el usuario modifica la cédula después de verificar,
  // debe volver a verificarse.
  estadoCedula.value = 'sin-verificar'
  mensajeCedula.value = ''
  datosCedulaVerificada.value = null

  if (errores.value.cedulaProfesional) {
    delete errores.value.cedulaProfesional
  }
}


// ----------------------------------------------------------
// VERIFICAR CÉDULA
// ----------------------------------------------------------
const verificarCedula = async () => {
  mensajeCedula.value = ''
  datosCedulaVerificada.value = null

  const cedula =
    formulario.value.cedulaProfesional.trim()

  // Validación local ÚNICAMENTE de formato.
  // Esto NO significa que la cédula exista.
  if (!cedula) {
    estadoCedula.value = 'sin-verificar'
    errores.value.cedulaProfesional =
      'Ingresa tu cédula profesional.'
    return
  }

  if (!/^\d{5,12}$/.test(cedula)) {
    estadoCedula.value = 'no-encontrada'
    errores.value.cedulaProfesional =
      'La cédula debe contener únicamente números.'
    return
  }

  delete errores.value.cedulaProfesional

  estadoCedula.value = 'verificando'

  try {
    // ======================================================
    // AQUÍ SE CONECTARÁ LA API RESTFUL
    // ======================================================
    //
    // Ejemplo para cuando tu compañero termine el endpoint:
    //
    // const respuesta = await fetch(
    //   'http://localhost:3001/api/doctores/verificar-cedula',
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       cedula,
    //       nombreCompleto:
    //         formulario.value.nombreCompleto.trim(),
    //     }),
    //   }
    // )
    //
    // const datos = await respuesta.json()
    //
    // if (!respuesta.ok || !datos.valida) {
    //   estadoCedula.value = 'no-encontrada'
    //   mensajeCedula.value =
    //     datos.mensaje ||
    //     'No fue posible verificar esta cédula profesional.'
    //   return
    // }
    //
    // estadoCedula.value = 'verificada'
    // datosCedulaVerificada.value = datos
    // mensajeCedula.value = 'Cédula profesional verificada.'
    //
    // ======================================================

    // POR AHORA:
    // La interfaz queda lista, pero no fingimos una
    // verificación que todavía no existe.
    await new Promise((resolve) =>
      setTimeout(resolve, 650)
    )

    estadoCedula.value = 'pendiente-api'
    mensajeCedula.value =
      'La cédula tiene un formato válido. La verificación oficial se habilitará cuando se conecte la API RESTful.'
  } catch (error) {
    console.error(
      'Error al verificar la cédula:',
      error
    )

    estadoCedula.value = 'no-encontrada'
    mensajeCedula.value =
      'No se pudo verificar la cédula. Inténtalo nuevamente.'
  }
}


// ----------------------------------------------------------
// VALIDACIÓN
// ----------------------------------------------------------
const validarFormulario = () => {
  const nuevosErrores = {}

  if (!formulario.value.nombreCompleto.trim()) {
    nuevosErrores.nombreCompleto =
      'Ingresa tu nombre completo.'
  }

  if (!formulario.value.correo.trim()) {
    nuevosErrores.correo =
      'Ingresa tu correo electrónico.'
  } else {
    const expresionCorreo =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !expresionCorreo.test(
        formulario.value.correo.trim()
      )
    ) {
      nuevosErrores.correo =
        'Ingresa un correo electrónico válido.'
    }
  }

  if (!formulario.value.contrasena) {
    nuevosErrores.contrasena =
      'Ingresa una contraseña.'
  } else if (
    formulario.value.contrasena.length < 6
  ) {
    nuevosErrores.contrasena =
      'La contraseña debe tener al menos 6 caracteres.'
  }

  if (!formulario.value.confirmarContrasena) {
    nuevosErrores.confirmarContrasena =
      'Confirma tu contraseña.'
  } else if (
    formulario.value.contrasena !==
    formulario.value.confirmarContrasena
  ) {
    nuevosErrores.confirmarContrasena =
      'Las contraseñas no coinciden.'
  }

  // Solo doctor requiere especialidad y cédula profesional.
  if (tipoCuenta.value === 'doctor') {
    if (!formulario.value.especialidad.trim()) {
      nuevosErrores.especialidad =
        'Selecciona una especialidad o subespecialidad.'
    } else if (
      !especialidades.includes(
        formulario.value.especialidad
      )
    ) {
      nuevosErrores.especialidad =
        'Selecciona una especialidad de la lista.'
    }

    const cedula =
      formulario.value.cedulaProfesional.trim()

    if (!cedula) {
      nuevosErrores.cedulaProfesional =
        'Ingresa tu cédula profesional.'
    } else if (!/^\d{5,12}$/.test(cedula)) {
      nuevosErrores.cedulaProfesional =
        'La cédula debe contener únicamente números.'
    } else if (!cedulaVerificada.value) {
      nuevosErrores.cedulaProfesional =
        'Debes verificar tu cédula profesional antes de crear la cuenta.'
    }
  }

  errores.value = nuevosErrores

  return Object.keys(nuevosErrores).length === 0
}

// ----------------------------------------------------------
// CREAR CUENTA
// ----------------------------------------------------------
const crearCuenta = async () => {
  mensajeError.value = ''

  if (!validarFormulario()) {
    return
  }

  cargando.value = true

  try {
    await registrarUsuario({
      nombreCompleto:
        formulario.value.nombreCompleto.trim(),

      correo:
        formulario.value.correo.trim(),

      contrasena:
        formulario.value.contrasena,

      rol:
        tipoCuenta.value === 'doctor'
          ? 'doctor'
          : 'usuario',

      especialidad:
        tipoCuenta.value === 'doctor'
          ? formulario.value.especialidad
          : null,

      // Cuando authService acepte estos campos,
      // quedarán guardados con la cuenta del doctor.
      cedulaProfesional:
        tipoCuenta.value === 'doctor'
          ? formulario.value.cedulaProfesional
          : null,

      cedulaVerificada:
        tipoCuenta.value === 'doctor'
          ? cedulaVerificada.value
          : false,
    })

    // Después del registro regresamos al inicio.
    // Si prefieres enviarlo directamente a iniciar sesión,
    // cambia '/' por '/iniciar-sesion'.
    router.push('/')
  } catch (error) {
    console.error(
      'Error al crear la cuenta:',
      error
    )

    switch (error.code) {
      case 'auth/email-already-in-use':
        mensajeError.value =
          'Este correo ya tiene una cuenta registrada.'
        break

      case 'auth/invalid-email':
        mensajeError.value =
          'El correo electrónico no es válido.'
        break

      case 'auth/weak-password':
        mensajeError.value =
          'La contraseña es demasiado débil.'
        break

      case 'auth/network-request-failed':
        mensajeError.value =
          'No se pudo conectar. Revisa tu conexión a internet.'
        break

      default:
        mensajeError.value =
          'No se pudo crear la cuenta. Inténtalo nuevamente.'
        break
    }
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <main class="pagina-registro">

    <!-- ====================================================
         LADO IZQUIERDO - FORMULARIO
         ==================================================== -->
    <section class="lado-formulario">

      <RouterLink
        to="/"
        class="boton-regresar-home"
      >
        ← Volver al inicio
      </RouterLink>

      <div class="contenido-formulario">

        <span class="etiqueta-viaje">
          Comienza tu viaje
        </span>

        <h1>Crear Cuenta</h1>

        <p class="descripcion-registro">
          Únete a nuestra comunidad y mejora tu bienestar.
        </p>

        <!-- ==================================================
             SELECTOR PACIENTE / DOCTOR
             ================================================== -->
        <div class="selector-tipo">

          <button
            type="button"
            class="opcion-tipo"
            :class="{
              activa: tipoCuenta === 'paciente'
            }"
            @click="
              seleccionarTipoCuenta('paciente')
            "
          >
            Soy paciente
          </button>

          <button
            type="button"
            class="opcion-tipo"
            :class="{
              activa: tipoCuenta === 'doctor'
            }"
            @click="
              seleccionarTipoCuenta('doctor')
            "
          >
            Soy doctor
          </button>

        </div>

        <!-- ==================================================
             FORMULARIO
             ================================================== -->
        <form
          class="formulario-registro"
          @submit.prevent="crearCuenta"
        >

          <!-- NOMBRE COMPLETO -->
          <div class="grupo-campo">
            <label for="nombreCompleto">
              Nombre completo
            </label>

            <div
              class="campo-registro"
              :class="{
                error:
                  errores.nombreCompleto
              }"
            >
              <span class="icono-campo">♡</span>

              <input
                id="nombreCompleto"
                v-model="formulario.nombreCompleto"
                type="text"
                autocomplete="name"
                placeholder="Tu nombre"
              />
            </div>

            <small
              v-if="errores.nombreCompleto"
              class="mensaje-campo-error"
            >
              {{ errores.nombreCompleto }}
            </small>
          </div>

          <!-- CORREO -->
          <div class="grupo-campo">
            <label for="correo">
              Correo Electrónico
            </label>

            <div
              class="campo-registro"
              :class="{
                error: errores.correo
              }"
            >
              <span class="icono-campo">@</span>

              <input
                id="correo"
                v-model="formulario.correo"
                type="email"
                autocomplete="email"
                placeholder="tu@email.com"
              />
            </div>

            <small
              v-if="errores.correo"
              class="mensaje-campo-error"
            >
              {{ errores.correo }}
            </small>
          </div>

          <!-- ESPECIALIDAD SOLO PARA DOCTOR -->
          <div
            v-if="tipoCuenta === 'doctor'"
            class="grupo-campo"
          >
            <label for="especialidad">
              Especialidad o subespecialidad
            </label>

            <div class="contenedor-autocomplete">

              <div
                class="campo-registro"
                :class="{
                  error: errores.especialidad
                }"
              >
                <span class="icono-campo">
                  ✚
                </span>

                <input
                  id="especialidad"
                  v-model="formulario.especialidad"
                  type="text"
                  autocomplete="off"
                  placeholder="Busca tu especialidad"
                  @focus="
                    mostrarListaEspecialidades = true
                  "
                  @input="
                    mostrarListaEspecialidades = true
                  "
                />
              </div>

              <div
                v-if="
                  mostrarListaEspecialidades &&
                  especialidadesFiltradas.length
                "
                class="lista-especialidades"
              >
                <button
                  v-for="
                    especialidad
                    in especialidadesFiltradas
                  "
                  :key="especialidad"
                  type="button"
                  class="opcion-especialidad"
                  @mousedown.prevent="
                    seleccionarEspecialidad(
                      especialidad
                    )
                  "
                >
                  {{ especialidad }}
                </button>
              </div>

            </div>

            <small
              v-if="errores.especialidad"
              class="mensaje-campo-error"
            >
              {{ errores.especialidad }}
            </small>
          </div>

          <!-- CÉDULA PROFESIONAL SOLO PARA DOCTOR -->
          <div
            v-if="tipoCuenta === 'doctor'"
            class="grupo-campo"
          >
            <label for="cedulaProfesional">
              Cédula profesional
            </label>

            <div class="fila-verificacion-cedula">

              <div
                class="campo-registro campo-cedula"
                :class="{
                  error:
                    errores.cedulaProfesional,
                  verificado:
                    estadoCedula === 'verificada'
                }"
              >
                <span class="icono-campo">
                  ID
                </span>

                <input
                  id="cedulaProfesional"
                  v-model="formulario.cedulaProfesional"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="12"
                  placeholder="Número de cédula"
                  @input="alCambiarCedula"
                />
              </div>

              <button
                type="button"
                class="boton-verificar-cedula"
                :class="{
                  verificada:
                    estadoCedula === 'verificada'
                }"
                :disabled="
                  estadoCedula === 'verificando' ||
                  !formulario.cedulaProfesional
                "
                @click="verificarCedula"
              >
                {{
                  estadoCedula === 'verificando'
                    ? 'Verificando...'
                    : estadoCedula === 'verificada'
                      ? 'Verificada'
                      : 'Verificar'
                }}
              </button>

            </div>

            <small
              v-if="errores.cedulaProfesional"
              class="mensaje-campo-error"
            >
              {{ errores.cedulaProfesional }}
            </small>

            <div
              v-if="estadoCedula !== 'sin-verificar'"
              class="estado-verificacion-cedula"
              :class="estadoCedula"
            >
              <span class="indicador-estado">
                {{
                  estadoCedula === 'verificada'
                    ? '✓'
                    : estadoCedula === 'no-encontrada'
                      ? '×'
                      : estadoCedula === 'verificando'
                        ? '…'
                        : 'i'
                }}
              </span>

              <div>
                <strong>
                  {{
                    estadoCedula === 'verificada'
                      ? 'Cédula profesional verificada'
                      : estadoCedula === 'no-encontrada'
                        ? 'No fue posible verificarla'
                        : estadoCedula === 'verificando'
                          ? 'Consultando cédula profesional'
                          : 'Verificación pendiente'
                  }}
                </strong>

                <p v-if="mensajeCedula">
                  {{ mensajeCedula }}
                </p>

                <template
                  v-if="
                    estadoCedula === 'verificada' &&
                    datosCedulaVerificada
                  "
                >
                  <p
                    v-if="
                      datosCedulaVerificada.nombre
                    "
                  >
                    {{
                      datosCedulaVerificada.nombre
                    }}
                  </p>

                  <p
                    v-if="
                      datosCedulaVerificada.profesion
                    "
                  >
                    {{
                      datosCedulaVerificada.profesion
                    }}
                  </p>
                </template>
              </div>
            </div>

            <small class="ayuda-cedula">
              La cuenta de doctor solo podrá crearse
              cuando la cédula sea validada por la API.
            </small>
          </div>

          <!-- CONTRASEÑA -->
          <div class="grupo-campo">
            <label for="contrasena">
              Contraseña
            </label>

            <div
              class="campo-registro"
              :class="{
                error: errores.contrasena
              }"
            >
              <span class="icono-campo">#</span>

              <input
                id="contrasena"
                v-model="formulario.contrasena"
                :type="
                  mostrarContrasena
                    ? 'text'
                    : 'password'
                "
                autocomplete="new-password"
                placeholder="Contraseña"
              />

              <button
                type="button"
                class="boton-ver"
                @click="
                  mostrarContrasena =
                    !mostrarContrasena
                "
              >
                {{
                  mostrarContrasena
                    ? 'Ocultar'
                    : 'Ver'
                }}
              </button>
            </div>

            <small
              v-if="errores.contrasena"
              class="mensaje-campo-error"
            >
              {{ errores.contrasena }}
            </small>
          </div>

          <!-- CONFIRMAR CONTRASEÑA -->
          <div class="grupo-campo">
            <label for="confirmarContrasena">
              Confirmar Contraseña
            </label>

            <div
              class="campo-registro"
              :class="{
                error:
                  errores.confirmarContrasena
              }"
            >
              <span class="icono-campo">#</span>

              <input
                id="confirmarContrasena"
                v-model="
                  formulario.confirmarContrasena
                "
                :type="
                  mostrarConfirmarContrasena
                    ? 'text'
                    : 'password'
                "
                autocomplete="new-password"
                placeholder="Confirmar contraseña"
              />

              <button
                type="button"
                class="boton-ver"
                @click="
                  mostrarConfirmarContrasena =
                    !mostrarConfirmarContrasena
                "
              >
                {{
                  mostrarConfirmarContrasena
                    ? 'Ocultar'
                    : 'Ver'
                }}
              </button>
            </div>

            <small
              v-if="
                errores.confirmarContrasena
              "
              class="mensaje-campo-error"
            >
              {{
                errores.confirmarContrasena
              }}
            </small>
          </div>

          <!-- ERROR GENERAL -->
          <p
            v-if="mensajeError"
            class="mensaje-error-general"
          >
            {{ mensajeError }}
          </p>

          <!-- CREAR CUENTA -->
          <button
            type="submit"
            class="boton-crear"
            :disabled="
              cargando ||
              (
                tipoCuenta === 'doctor' &&
                !cedulaVerificada
              )
            "
          >
            <span>
              {{
                cargando
                  ? 'Creando cuenta...'
                  : tipoCuenta === 'doctor'
                    ? 'Crear cuenta de doctor'
                    : 'Crear mi cuenta'
              }}
            </span>

            <span v-if="!cargando">
              →
            </span>
          </button>

        </form>

        <p class="pie-registro">
          ¿Ya tienes una cuenta?

          <RouterLink to="/iniciar-sesion">
            Inicia sesión
          </RouterLink>
        </p>

      </div>

    </section>


    <!-- ====================================================
         LADO DERECHO - MASCOTA DINÁMICA
         ==================================================== -->
    <section
      class="lado-imagen"
      :class="{
        'modo-doctor':
          tipoCuenta === 'doctor'
      }"
    >

      <!-- Círculos decorativos -->
      <span class="circulo circulo-superior"></span>
      <span class="circulo circulo-inferior"></span>

      <div class="contenido-lateral">

        <!-- La imagen cambia automáticamente -->
        <img
          :src="imagenLateral"
          :alt="
            tipoCuenta === 'doctor'
              ? 'Ajolote doctor Vibra la Vida'
              : 'Ajolote Vibra la Vida'
          "
          class="imagen-ajolote"
        />

        <div class="texto-imagen">

          <span class="linea-acento"></span>

          <h2>
            {{ tituloLateral }}
          </h2>

          <p>
            {{ textoLateral }}
          </p>

        </div>

      </div>

    </section>

  </main>
</template>

<style
  scoped
  src="../assets/styles/CrearCuenta.css"
></style>
