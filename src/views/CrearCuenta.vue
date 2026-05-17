<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { cerrarSesionUsuario, obtenerDatosUsuario } from '../services/authService'
import {
  guardarResultadoBienestar,
  obtenerResultadosUsuario,
} from '../services/resultadosService'

const router = useRouter()

const usuarioActual = ref(null)
const datosUsuario = ref(null)
const cargando = ref(true)
const probandoGuardado = ref(false)
const resultados = ref([])

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

const imcRegistrados = computed(() => {
  return resultados.value.filter((resultado) => resultado.tipo === 'imc').length
})

const encuestasRealizadas = computed(() => {
  return resultados.value.filter((resultado) =>
    ['dass21', 'insomnio', 'riesgo_cardiometabolico'].includes(resultado.tipo)
  ).length
})

const registrosGuardados = computed(() => {
  return resultados.value.length
})

const historialReciente = computed(() => {
  return [...resultados.value]
    .sort((a, b) => obtenerTiempoFecha(b.fecha) - obtenerTiempoFecha(a.fecha))
    .slice(0, 5)
})

const obtenerTiempoFecha = (fecha) => {
  if (!fecha) return 0

  if (typeof fecha.toDate === 'function') {
    return fecha.toDate().getTime()
  }

  const fechaConvertida = new Date(fecha)
  return Number.isNaN(fechaConvertida.getTime()) ? 0 : fechaConvertida.getTime()
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible'

  const fechaConvertida =
    typeof fecha.toDate === 'function' ? fecha.toDate() : new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) {
    return 'Fecha no disponible'
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fechaConvertida)
}

const obtenerNombreHerramienta = (tipo) => {
  const nombres = {
    imc: 'Calculadora de IMC',
    calorias: 'Calculadora de Calorías',
    dass21: 'Evaluación DASS-21',
    insomnio: 'Insomnio de Atenas',
    riesgo_cardiometabolico: 'Riesgo cardiometabólico',
    prueba: 'Prueba de guardado',
  }

  return nombres[tipo] || 'Resultado guardado'
}

const obtenerClaseHistorial = (tipo) => {
  const clases = {
    imc: 'historial-naranja',
    calorias: 'historial-verde',
    dass21: 'historial-cian',
    insomnio: 'historial-morado',
    riesgo_cardiometabolico: 'historial-rosa',
    prueba: 'historial-azul',
  }

  return clases[tipo] || 'historial-azul'
}

const obtenerIconoHistorial = (tipo) => {
  const iconos = {
    imc: 'IMC',
    calorias: 'CAL',
    dass21: 'D21',
    insomnio: 'AIS',
    riesgo_cardiometabolico: 'RC',
    prueba: 'OK',
  }

  return iconos[tipo] || 'RS'
}

const obtenerDescripcionResultado = (resultado) => {
  if (resultado.tipo === 'imc') {
    const valorIMC = resultado.imc || resultado.resultado || 'Sin dato'
    const categoria = resultado.categoria || 'Sin categoría'
    return `IMC: ${valorIMC}. Categoría: ${categoria}.`
  }

  if (resultado.tipo === 'calorias') {
    const calorias = resultado.calorias || resultado.resultado || 'Sin dato'
    return `Estimación calórica diaria: ${calorias}.`
  }

  if (resultado.tipo === 'dass21') {
    const depresion = resultado.nivelDepresion || resultado.depresion || 'Sin dato'
    const ansiedad = resultado.nivelAnsiedad || resultado.ansiedad || 'Sin dato'
    const estres = resultado.nivelEstres || resultado.estres || 'Sin dato'

    return `Depresión: ${depresion}. Ansiedad: ${ansiedad}. Estrés: ${estres}.`
  }

  if (resultado.tipo === 'insomnio') {
    const puntuacion = resultado.puntuacion || resultado.resultado || 'Sin dato'
    const interpretacion = resultado.interpretacion || resultado.categoria || 'Sin interpretación'

    return `Puntuación: ${puntuacion}. ${interpretacion}.`
  }

  if (resultado.tipo === 'riesgo_cardiometabolico') {
    const nivel = resultado.nivelRiesgo || resultado.categoria || 'Sin clasificación'
    const puntuacion = resultado.puntuacion || resultado.resultado || 'Sin dato'

    return `Nivel de riesgo: ${nivel}. Puntuación: ${puntuacion}.`
  }

  return resultado.resultado || resultado.categoria || 'Resultado guardado correctamente.'
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

const probarGuardadoResultado = async () => {
  if (probandoGuardado.value) return

  try {
    probandoGuardado.value = true

    await guardarResultadoBienestar({
      tipo: 'prueba',
      nombreHerramienta: 'Prueba desde Mi cuenta',
      resultado: 'Resultado guardado correctamente',
      categoria: 'Prueba',
    })

    await cargarResultadosUsuario()

    alert('Resultado de prueba guardado correctamente.')
  } catch (error) {
    console.error('Error al guardar el resultado:', error)
    alert(error.message || 'No se pudo guardar el resultado.')
  } finally {
    probandoGuardado.value = false
  }
}

onMounted(() => {
  detenerObservador = onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      router.push('/iniciar-sesion')
      return
    }

    try {
      cargando.value = true
      usuarioActual.value = usuario
      datosUsuario.value = await obtenerDatosUsuario(usuario.uid)
      await cargarResultadosUsuario()
    } catch (error) {
      console.error('Error al cargar la cuenta:', error)
      alert('No se pudo cargar la información de tu cuenta.')
    } finally {
      cargando.value = false
    }
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

          <button
            class="boton-prueba-guardar"
            :disabled="probandoGuardado"
            @click="probarGuardadoResultado"
          >
            {{ probandoGuardado ? 'Guardando...' : 'Probar guardado de resultado' }}
          </button>
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
            v-for="resultado in historialReciente"
            :key="resultado.id"
            class="item-historial"
          >
            <div
              class="icono-historial"
              :class="obtenerClaseHistorial(resultado.tipo)"
            >
              {{ obtenerIconoHistorial(resultado.tipo) }}
            </div>

            <div class="contenido-historial">
              <span>{{ obtenerNombreHerramienta(resultado.tipo) }}</span>
              <strong>{{ resultado.nombreHerramienta || obtenerNombreHerramienta(resultado.tipo) }}</strong>
              <p>{{ obtenerDescripcionResultado(resultado) }}</p>
              <small>{{ formatearFecha(resultado.fecha) }}</small>
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
