<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { cerrarSesionUsuario, obtenerDatosUsuario } from '../services/authService'

const router = useRouter()

const usuarioActual = ref(null)
const datosUsuario = ref(null)
const cargando = ref(true)

let detenerObservador = null

const nombreUsuario = computed(() => {
  const nombreCompleto = datosUsuario.value?.nombre || 'Usuario'
  const primerNombre = nombreCompleto.trim().split(' ')[0]

  return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1)
})

const inicialUsuario = computed(() => {
  return nombreUsuario.value.charAt(0).toUpperCase()
})

const correoUsuario = computed(() => {
  return usuarioActual.value?.email || datosUsuario.value?.correo || 'Sin correo registrado'
})

const cerrarSesion = async () => {
  await cerrarSesionUsuario()
  router.push('/iniciar-sesion')
}

const irARuta = (ruta) => {
  router.push(ruta)
}

onMounted(() => {
  detenerObservador = onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      router.push('/iniciar-sesion')
      return
    }

    usuarioActual.value = usuario
    datosUsuario.value = await obtenerDatosUsuario(usuario.uid)
    cargando.value = false
  })
})

onUnmounted(() => {
  if (detenerObservador) {
    detenerObservador()
  }
})
</script>

<template>
  <main class="pagina-cuenta">
    <RouterLink to="/" class="boton-volver">
      ← Volver al inicio
    </RouterLink>

    <section v-if="cargando" class="tarjeta-cargando">
      Cargando información de la cuenta...
    </section>

    <section v-else class="contenedor-cuenta">
      <section class="encabezado-cuenta">
        <div class="avatar-perfil">
          {{ inicialUsuario }}
        </div>

        <div>
          <span class="etiqueta-cuenta">Mi cuenta</span>
          <h1>Hola {{ nombreUsuario }}</h1>
          <p>
            Aquí puedes consultar tu información y acceder rápidamente a tus
            herramientas de autocuidado.
          </p>
        </div>
      </section>

      <section class="rejilla-cuenta">
        <article class="tarjeta-perfil">
          <h2>Datos de la cuenta</h2>

          <div class="dato-perfil">
            <span>Nombre</span>
            <strong>{{ datosUsuario?.nombre || 'No registrado' }}</strong>
          </div>

          <div class="dato-perfil">
            <span>Correo electrónico</span>
            <strong>{{ correoUsuario }}</strong>
          </div>

          <button class="boton-secundario">
            Editar perfil
          </button>
        </article>

        <article class="tarjeta-resumen">
          <h2>Resumen de bienestar</h2>

          <div class="rejilla-resumen">
            <div>
              <strong>0</strong>
              <span>IMC registrados</span>
            </div>

            <div>
              <strong>0</strong>
              <span>Encuestas realizadas</span>
            </div>

            <div>
              <strong>0</strong>
              <span>Registros guardados</span>
            </div>
          </div>

          <p>
            Cuando guardes resultados de IMC, calorías o cuestionarios, aquí se
            mostrará un resumen de tu progreso.
          </p>
        </article>
      </section>

      <section class="seccion-herramientas">
        <h2>Herramientas rápidas</h2>

        <div class="rejilla-herramientas">
          <button @click="irARuta('/calculadora-imc')">
            <span>IMC</span>
            Calculadora de IMC
          </button>

          <button @click="irARuta('/calculadora-calorias')">
            <span>CAL</span>
            Calculadora de Calorías
          </button>

          <button @click="irARuta('/evaluacion-dass21')">
            <span>D21</span>
            Evaluación DASS-21
          </button>

          <button @click="irARuta('/escala-insomnio-atenas')">
            <span>AIS</span>
            Insomnio de Atenas
          </button>
        </div>
      </section>

      <section class="seccion-historial">
        <h2>Historial reciente</h2>

        <div class="tarjeta-vacia">
          <strong>Aún no hay resultados guardados</strong>
          <p>
            Más adelante podrás ver aquí tus evaluaciones, cálculos y avances
            registrados dentro de Vibra la Vida.
          </p>
        </div>
      </section>

      <button class="boton-cerrar-sesion" @click="cerrarSesion">
        Cerrar sesión
      </button>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/MiCuenta.css"></style>