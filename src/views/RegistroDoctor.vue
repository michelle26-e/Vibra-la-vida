<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { registrarUsuario } from '../services/authService'

const router = useRouter()

const formulario = ref({
  nombre: '',
  correo: '',
  especialidad: '',
  contrasena: '',
  confirmarContrasena: '',
})

const busquedaEspecialidad = ref('')
const mostrarListaEspecialidades = ref(false)

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
  'Cirugía Plástica, Estética y Reconstructiva',
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
  'Psiquiatría',
  'Psiquiatría Infantil y de la Adolescencia',
  'Psicología',
  'Psicología Clínica',
  'Psicología Infantil y del Adolescente',
  'Radiología e Imagen',
  'Reumatología',
  'Reumatología Pediátrica',
  'Traumatología',
  'Traumatología y Ortopedia',
  'Urgencias Médicas',
  'Urología',
  'Urología Pediátrica',
]

const especialidadesFiltradas = computed(() => {
  const texto = busquedaEspecialidad.value.trim().toLowerCase()

  if (!texto) {
    return especialidades.slice(0, 10)
  }

  return especialidades
    .filter((especialidad) =>
      especialidad.toLowerCase().includes(texto)
    )
    .slice(0, 10)
})

const seleccionarEspecialidad = (especialidad) => {
  formulario.value.especialidad = especialidad
  busquedaEspecialidad.value = especialidad
  mostrarListaEspecialidades.value = false
}

const actualizarBusquedaEspecialidad = () => {
  formulario.value.especialidad = ''
  mostrarListaEspecialidades.value = true
}

const errores = ref({})
const mensaje = ref('')
const mensajeError = ref('')
const cargando = ref(false)
const mostrarContrasena = ref(false)
const mostrarConfirmar = ref(false)

const validarFormulario = () => {
  const nuevosErrores = {}

  if (!formulario.value.nombre.trim()) {
    nuevosErrores.nombre = 'Ingresa tu nombre completo.'
  }

  if (!formulario.value.correo.trim()) {
    nuevosErrores.correo = 'Ingresa tu correo electrónico.'
  } else if (!formulario.value.correo.includes('@')) {
    nuevosErrores.correo = 'Ingresa un correo válido.'
  }

  if (!formulario.value.especialidad) {
    nuevosErrores.especialidad =
      'Selecciona una especialidad o subespecialidad de la lista.'
  }

  if (!formulario.value.contrasena.trim()) {
    nuevosErrores.contrasena = 'Ingresa una contraseña.'
  } else if (formulario.value.contrasena.length < 6) {
    nuevosErrores.contrasena =
      'La contraseña debe tener al menos 6 caracteres.'
  }

  if (!formulario.value.confirmarContrasena.trim()) {
    nuevosErrores.confirmarContrasena = 'Confirma tu contraseña.'
  } else if (
    formulario.value.contrasena !==
    formulario.value.confirmarContrasena
  ) {
    nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'
  }

  errores.value = nuevosErrores
  return Object.keys(nuevosErrores).length === 0
}

const limpiarFormulario = () => {
  formulario.value = {
    nombre: '',
    correo: '',
    especialidad: '',
    contrasena: '',
    confirmarContrasena: '',
  }

  busquedaEspecialidad.value = ''
}

const crearCuentaDoctor = async () => {
  mensaje.value = ''
  mensajeError.value = ''

  if (!validarFormulario()) return

  try {
    cargando.value = true

    await registrarUsuario({
      nombreCompleto: formulario.value.nombre.trim(),
      correo: formulario.value.correo.trim(),
      contrasena: formulario.value.contrasena,
      rol: 'doctor',
      especialidad: formulario.value.especialidad,
    })

    mensaje.value = 'Cuenta de doctor creada correctamente.'
    limpiarFormulario()

    setTimeout(() => {
      router.push('/doctor')
    }, 900)
  } catch (error) {
    console.error('Error al registrar doctor:', error)

    if (error.code === 'auth/email-already-in-use') {
      mensajeError.value = 'Este correo ya está registrado.'
    } else if (error.code === 'auth/invalid-email') {
      mensajeError.value = 'El correo electrónico no es válido.'
    } else if (error.code === 'auth/weak-password') {
      mensajeError.value = 'La contraseña es demasiado débil.'
    } else {
      mensajeError.value =
        'No se pudo crear la cuenta del doctor. Intenta nuevamente.'
    }
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <main class="pagina-registro-doctor">
    <section class="lado-formulario-doctor">
      <RouterLink to="/" class="boton-volver">
        ← Volver
      </RouterLink>

      <div class="contenedor-registro-doctor">
        <span class="etiqueta-registro-doctor">
          Acceso profesional
        </span>

        <h1>Registro de Doctor</h1>

        <p class="descripcion-registro-doctor">
          Crea tu cuenta profesional para comenzar a gestionar y dar seguimiento
          a tus pacientes.
        </p>

        <form
          class="formulario-registro-doctor"
          @submit.prevent="crearCuentaDoctor"
        >
          <div class="grupo-campo-doctor">
            <label for="nombre-doctor">Nombre completo</label>

            <div class="campo-registro-doctor">
              <span class="icono-campo-doctor">DR</span>

              <input
                id="nombre-doctor"
                v-model="formulario.nombre"
                type="text"
                placeholder="Tu nombre completo"
              />
            </div>

            <small v-if="errores.nombre">
              {{ errores.nombre }}
            </small>
          </div>

          <div class="grupo-campo-doctor">
            <label for="correo-doctor">Correo electrónico</label>

            <div class="campo-registro-doctor">
              <span class="icono-campo-doctor">@</span>

              <input
                id="correo-doctor"
                v-model="formulario.correo"
                type="email"
                placeholder="doctor@correo.com"
              />
            </div>

            <small v-if="errores.correo">
              {{ errores.correo }}
            </small>
          </div>

          <div class="grupo-campo-doctor">
            <label for="especialidad-doctor">
              Especialidad o subespecialidad
            </label>

            <div class="buscador-especialidad">
              <div class="campo-registro-doctor">
                <span class="icono-campo-doctor">ESP</span>

                <input
                  id="especialidad-doctor"
                  v-model="busquedaEspecialidad"
                  type="text"
                  autocomplete="off"
                  placeholder="Ej. Pediatría, Cardiología Pediátrica..."
                  @input="actualizarBusquedaEspecialidad"
                  @focus="mostrarListaEspecialidades = true"
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
                  v-for="especialidad in especialidadesFiltradas"
                  :key="especialidad"
                  type="button"
                  @click="seleccionarEspecialidad(especialidad)"
                >
                  {{ especialidad }}
                </button>
              </div>
            </div>

            <small v-if="errores.especialidad">
              {{ errores.especialidad }}
            </small>
          </div>

          <div class="grupo-campo-doctor">
            <label for="contrasena-doctor">Contraseña</label>

            <div class="campo-registro-doctor">
              <span class="icono-campo-doctor">#</span>

              <input
                id="contrasena-doctor"
                v-model="formulario.contrasena"
                :type="mostrarContrasena ? 'text' : 'password'"
                placeholder="Contraseña"
              />

              <button
                type="button"
                class="boton-ver-doctor"
                @click="mostrarContrasena = !mostrarContrasena"
              >
                {{ mostrarContrasena ? 'Ocultar' : 'Ver' }}
              </button>
            </div>

            <small v-if="errores.contrasena">
              {{ errores.contrasena }}
            </small>
          </div>

          <div class="grupo-campo-doctor">
            <label for="confirmar-doctor">Confirmar contraseña</label>

            <div class="campo-registro-doctor">
              <span class="icono-campo-doctor">#</span>

              <input
                id="confirmar-doctor"
                v-model="formulario.confirmarContrasena"
                :type="mostrarConfirmar ? 'text' : 'password'"
                placeholder="Confirmar contraseña"
              />

              <button
                type="button"
                class="boton-ver-doctor"
                @click="mostrarConfirmar = !mostrarConfirmar"
              >
                {{ mostrarConfirmar ? 'Ocultar' : 'Ver' }}
              </button>
            </div>

            <small v-if="errores.confirmarContrasena">
              {{ errores.confirmarContrasena }}
            </small>
          </div>

          <p v-if="mensajeError" class="mensaje-error-doctor">
            {{ mensajeError }}
          </p>

          <button
            type="submit"
            class="boton-crear-doctor"
            :disabled="cargando"
          >
            {{
              cargando
                ? 'Creando cuenta...'
                : 'Crear cuenta profesional'
            }}
            <span v-if="!cargando">→</span>
          </button>

          <p v-if="mensaje" class="mensaje-correcto-doctor">
            {{ mensaje }}
          </p>
        </form>

        <p class="texto-login-doctor">
          ¿Ya tienes una cuenta?
          <RouterLink to="/iniciar-sesion">
            Inicia sesión
          </RouterLink>
        </p>
      </div>
    </section>

    <section class="lado-visual-doctor">
      <div class="capa-visual-doctor"></div>

      <div class="contenido-visual-doctor">
        <span class="marca-doctor">Vibra la Vida</span>

        <h2>
          Seguimiento profesional para una vida más saludable.
        </h2>

        <p>
          Consulta a tus pacientes, revisa sus resultados y lleva un seguimiento
          organizado desde un solo lugar.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/RegistroDoctor.css"></style>
