<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { registrarUsuario } from '../services/authService'
const router = useRouter()

const formulario = ref({
  nombre: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',
})

const errores = ref({})
const mensaje = ref('')
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

  if (!formulario.value.contrasena.trim()) {
    nuevosErrores.contrasena = 'Ingresa una contraseña.'
  } else if (formulario.value.contrasena.length < 6) {
    nuevosErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (!formulario.value.confirmarContrasena.trim()) {
    nuevosErrores.confirmarContrasena = 'Confirma tu contraseña.'
  } else if (formulario.value.contrasena !== formulario.value.confirmarContrasena) {
    nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'
  }

  errores.value = nuevosErrores

  return Object.keys(nuevosErrores).length === 0
}

const crearCuenta = async () => {
  mensaje.value = ''

  if (!validarFormulario()) {
    return
  }

  try {
    await registrarUsuario({
      nombre: formulario.value.nombre,
      correo: formulario.value.correo,
      contrasena: formulario.value.contrasena,
    })

    mensaje.value = 'Cuenta creada correctamente.'

    setTimeout(() => {
      router.push('/iniciar-sesion')
    }, 900)
  } catch (error) {
  console.error('Error al crear cuenta:', error.code, error.message)

  if (error.code === 'auth/email-already-in-use') {
    errores.value.correo = 'Este correo ya está registrado.'
    return
  }

  if (error.code === 'auth/invalid-email') {
    errores.value.correo = 'El correo no es válido.'
    return
  }

  if (error.code === 'auth/weak-password') {
    errores.value.contrasena = 'La contraseña es muy débil.'
    return
  }

  if (error.code === 'auth/operation-not-allowed') {
    mensaje.value = 'Debes activar Email/Password en Firebase Authentication.'
    return
  }

  if (error.code === 'auth/invalid-api-key') {
    mensaje.value = 'La configuración de Firebase no está cargando bien. Revisa el archivo .env.'
    return
  }

  if (error.code === 'permission-denied') {
    mensaje.value = 'La cuenta se creó, pero Firestore no permitió guardar los datos.'
    return
  }

    mensaje.value = `Error: ${error.code || 'desconocido'}`
  }
}
</script>

<template>
  <main class="pagina-registro">
    <section class="lado-formulario">
      <RouterLink to="/" class="boton-volver">
        ← Volver
      </RouterLink>

      <div class="contenedor-registro">
        <img
          src=""
          alt="Logo Vibra la Vida"
          class="logo-registro"
        />

        <span class="etiqueta-registro">
          Comienza tu viaje
        </span>

        <h1>Crear Cuenta</h1>

        <p class="descripcion-registro">
          Únete a nuestra comunidad y mejora tu bienestar.
        </p>

        <form class="formulario-registro" @submit.prevent="crearCuenta">
          <div class="grupo-campo">
            <label for="nombre">Nombre completo</label>

            <div class="campo-registro">
              <span class="icono-campo">♡</span>

              <input
                id="nombre"
                v-model="formulario.nombre"
                type="text"
                placeholder="Tu nombre"
              />
            </div>

            <small v-if="errores.nombre">{{ errores.nombre }}</small>
          </div>

          <div class="grupo-campo">
            <label for="correo">Correo Electrónico</label>

            <div class="campo-registro">
              <span class="icono-campo">@</span>

              <input
                id="correo"
                v-model="formulario.correo"
                type="email"
                placeholder="tu@email.com"
              />
            </div>

            <small v-if="errores.correo">{{ errores.correo }}</small>
          </div>

          <div class="grupo-campo">
            <label for="contrasena">Contraseña</label>

            <div class="campo-registro">
              <span class="icono-campo">#</span>

              <input
                id="contrasena"
                v-model="formulario.contrasena"
                :type="mostrarContrasena ? 'text' : 'password'"
                placeholder="Contraseña"
              />

              <button
                type="button"
                class="boton-ver"
                @click="mostrarContrasena = !mostrarContrasena"
              >
                {{ mostrarContrasena ? 'Ocultar' : 'Ver' }}
              </button>
            </div>

            <small v-if="errores.contrasena">{{ errores.contrasena }}</small>
          </div>

          <div class="grupo-campo">
            <label for="confirmar">Confirmar Contraseña</label>

            <div class="campo-registro">
              <span class="icono-campo">#</span>

              <input
                id="confirmar"
                v-model="formulario.confirmarContrasena"
                :type="mostrarConfirmar ? 'text' : 'password'"
                placeholder="Confirmar contraseña"
              />

              <button
                type="button"
                class="boton-ver"
                @click="mostrarConfirmar = !mostrarConfirmar"
              >
                {{ mostrarConfirmar ? 'Ocultar' : 'Ver' }}
              </button>
            </div>

            <small v-if="errores.confirmarContrasena">
              {{ errores.confirmarContrasena }}
            </small>
          </div>

          <button type="submit" class="boton-crear">
            Crear mi cuenta
            <span>→</span>
          </button>

          <p v-if="mensaje" class="mensaje-correcto">
            {{ mensaje }}
          </p>
        </form>

        <p class="texto-login">
          ¿Ya tienes una cuenta?
          <RouterLink to="/iniciar-sesion">Inicia sesión</RouterLink>
        </p>
      </div>
    </section>

    <section class="lado-imagen">
      <div class="capa-oscura"></div>

      <div class="texto-imagen">
        <span></span>

        <h2>
          Un paso más hacia tu equilibrio.
        </h2>

        <p>
          Regístrate en Vibra la Vida y accede a herramientas, encuestas
          interactivas y recursos personalizados para ti.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/CrearCuenta.css"></style>