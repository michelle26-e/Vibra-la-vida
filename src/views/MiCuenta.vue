<script setup>
// Importamos lo que necesitamos para que la página funcione
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { cerrarSesionUsuario, obtenerDatosUsuario } from '../services/authService'
import { obtenerResultadosUsuario } from '../services/resultadosService'

const router = useRouter()

// Guardamos los datos del usuario que ha iniciado sesión
const usuarioActual = ref(null)
const datosUsuario = ref(null)
const cargando = ref(true)
// Guardamos todos los resultados que el usuario ha calculado
const resultados = ref([])

let detenerObservador = null

// Obtenemos el primer nombre del usuario para el saludo
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

// Contamos cuántos cálculos de IMC tiene guardados
const imcRegistrados = computed(() => {
  return resultados.value.filter((item) => item.tipo === 'imc').length
})

// Contamos cuántas encuestas ha completado
const encuestasRealizadas = computed(() => {
  const tiposEncuesta = [
    'dass21',
    'insomnio',
    'riesgo_cardiometabolico',
    'riesgo_cardiovascular',
  ]

  return resultados.value.filter((item) => tiposEncuesta.includes(item.tipo)).length
})

// Contamos el total de resultados guardados
const registrosGuardados = computed(() => {
  return resultados.value.length
})

// Obtenemos los últimos 6 resultados en orden más reciente
const historialReciente = computed(() => {
  return [...resultados.value]
    .sort((a, b) => {
      const fechaA = obtenerTiempoFecha(a.fecha)
      const fechaB = obtenerTiempoFecha(b.fecha)

      return fechaB - fechaA
    })
    .slice(0, 6)
})

const obtenerTiempoFecha = (fecha) => {
  if (fecha?.toDate) {
    return fecha.toDate().getTime()
  }

  if (fecha instanceof Date) {
    return fecha.getTime()
  }

  return 0
}

const formatearFecha = (fecha) => {
  if (!fecha?.toDate) {
    return 'Fecha reciente'
  }

  return fecha.toDate().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const obtenerNombreResultado = (resultado) => {
  if (resultado.nombreHerramienta) {
    return resultado.nombreHerramienta
  }

  const nombres = {
    imc: 'Calculadora de IMC',
    calorias: 'Calculadora de Calorías',
    dass21: 'Evaluación DASS-21',
    insomnio: 'Escala de Insomnio de Atenas',
    riesgo_cardiometabolico: 'Encuesta de Riesgo Cardiometabólico',
    riesgo_cardiovascular: 'Encuesta de Riesgo Cardiovascular',
  }

  return nombres[resultado.tipo] || 'Resultado guardado'
}

const obtenerIconoResultado = (tipo) => {
  const iconos = {
    imc: 'IMC',
    calorias: 'CAL',
    dass21: 'D21',
    insomnio: 'AIS',
    riesgo_cardiometabolico: 'RC',
    riesgo_cardiovascular: 'RC',
  }

  return iconos[tipo] || 'OK'
}

const obtenerClaseHistorial = (tipo) => {
  const clases = {
    imc: 'historial-naranja',
    calorias: 'historial-verde',
    dass21: 'historial-cian',
    insomnio: 'historial-morado',
    riesgo_cardiometabolico: 'historial-rosa',
    riesgo_cardiovascular: 'historial-rosa',
  }

  return clases[tipo] || 'historial-azul'
}

const obtenerDetalleResultado = (resultado) => {
  if (resultado.tipo === 'riesgo_cardiometabolico' || resultado.tipo === 'riesgo_cardiovascular') {
    return `${resultado.nivelRiesgo || resultado.nivel || 'Resultado calculado'}${
      resultado.porcentaje ? ` · ${resultado.porcentaje}%` : ''
    }`
  }

  if (resultado.tipo === 'imc') {
    return `${resultado.categoria || 'IMC registrado'}${
      resultado.imc ? ` · IMC ${resultado.imc}` : ''
    }`
  }

  if (resultado.tipo === 'calorias') {
    return resultado.calorias
      ? `${resultado.calorias} kcal estimadas al día`
      : 'Estimación de calorías registrada'
  }

  if (resultado.tipo === 'dass21') {
    return `Depresión: ${resultado.nivelDepresion || 'N/A'} · Ansiedad: ${
      resultado.nivelAnsiedad || 'N/A'
    } · Estrés: ${resultado.nivelEstres || 'N/A'}`
  }

  if (resultado.tipo === 'insomnio') {
    return resultado.interpretacion || resultado.categoria || 'Resultado de sueño registrado'
  }

  return resultado.categoria || resultado.resultado || 'Registro guardado correctamente'
}

const cargarResultadosUsuario = async () => {
  resultados.value = await obtenerResultadosUsuario()
}

const cerrarSesion = async () => {
  await cerrarSesionUsuario()
  router.push('/iniciar-sesion')
}

const irARuta = (ruta) => {
  router.push(ruta)
}

// Se ejecuta cuando se carga la página para verificar si el usuario tiene sesión
onMounted(() => {
  detenerObservador = onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      router.push('/iniciar-sesion')
      return
    }

    usuarioActual.value = usuario
    datosUsuario.value = await obtenerDatosUsuario(usuario.uid)
    await cargarResultadosUsuario()
    cargando.value = false
  })
})

// Se ejecuta cuando abandona la página para detener la verificación del usuario
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
              <strong>{{ imcRegistrados }}</strong>
              <span>IMC registrados</span>
            </div>

            <div>
              <strong>{{ encuestasRealizadas }}</strong>
              <span>Encuestas realizadas</span>
            </div>

            <div>
              <strong>{{ registrosGuardados }}</strong>
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

        <div v-if="historialReciente.length" class="lista-historial">
          <article
            v-for="item in historialReciente"
            :key="item.id"
            class="item-historial"
          >
            <div
              class="icono-historial"
              :class="obtenerClaseHistorial(item.tipo)"
            >
              {{ obtenerIconoResultado(item.tipo) }}
            </div>

            <div class="contenido-historial">
              <span>{{ formatearFecha(item.fecha) }}</span>
              <strong>{{ obtenerNombreResultado(item) }}</strong>
              <p>{{ obtenerDetalleResultado(item) }}</p>
            </div>
          </article>
        </div>

        <div v-else class="tarjeta-vacia">
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
