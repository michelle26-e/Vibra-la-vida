<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const formulario = ref({
  correo: '',
  contrasena: '',
})

const errores = ref({})
const mostrarContrasena = ref(false)
const mensaje = ref('')

const validarFormulario = () => {
  const nuevosErrores = {}

  if (!formulario.value.correo.trim()) {
    nuevosErrores.correo = 'Ingresa tu correo electrónico.'
  } else if (!formulario.value.correo.includes('@')) {
    nuevosErrores.correo = 'Ingresa un correo válido.'
  }

  if (!formulario.value.contrasena.trim()) {
    nuevosErrores.contrasena = 'Ingresa tu contraseña.'
  } else if (formulario.value.contrasena.length < 6) {
    nuevosErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres.'
  }

  errores.value = nuevosErrores

  return Object.keys(nuevosErrores).length === 0
}

const iniciarSesion = () => {
  mensaje.value = ''

  if (!validarFormulario()) {
    return
  }

  mensaje.value = 'Inicio de sesión validado correctamente.'

  setTimeout(() => {
    router.push('/')
  }, 900)
}
</script>

<template>
  <main class="pagina-login">
    <section class="lado-formulario">
      <RouterLink to="/" class="boton-volver">
        ← Volver
      </RouterLink>

      <div class="contenedor-login">

        <span class="etiqueta-bienvenida">
          Bienvenido de nuevo
        </span>

        <h1>Iniciar Sesión</h1>

        <p class="descripcion-login">
          Ingresa tus credenciales para continuar tu viaje de bienestar.
        </p>

        <form class="formulario-login" @submit.prevent="iniciarSesion">
          <div class="grupo-campo">
            <label for="correo">Correo Electrónico</label>

            <div class="campo-login">
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
            <div class="fila-label">
              <label for="contrasena">Contraseña</label>

              <button type="button" class="boton-olvido">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div class="campo-login">
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

          <button type="submit" class="boton-ingresar">
            Entrar a mi cuenta
            <span>→</span>
          </button>

          <p v-if="mensaje" class="mensaje-correcto">
            {{ mensaje }}
          </p>
        </form>

        <p class="texto-registro">
          ¿Aún no tienes una cuenta?
          <RouterLink to="/registro">Regístrate ahora</RouterLink>
        </p>
      </div>
    </section>

    <section class="lado-imagen">
      <div class="texto-imagen">
        <span></span>

        <h2>
          Tu bienestar es una prioridad, no una opción.
        </h2>

        <p>
          Inicia sesión y descubre nuevas herramientas de autocuidado,
          encuestas y hábitos para potenciar tu vida.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/IniciarSesion.css"></style>