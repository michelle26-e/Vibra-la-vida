<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { cerrarSesionUsuario, obtenerDatosUsuario } from '../services/authService'

import logoPrincipal from '../assets/logo-vibra.png'
import logoVibra from '../assets/logotexto.png'

const router = useRouter()

const usuarioActual = ref(null)
const datosUsuario = ref(null)
const seccionActiva = ref('inicio')

let detenerObservador = null

const imagenHabitos = '/img/habitos.jpg'
const imagenFrutas = '/img/frutas.jpg'

const nombreUsuario = computed(() => {
  const nombreCompleto = datosUsuario.value?.nombre || 'Usuario'
  const primerNombre = nombreCompleto.trim().split(' ')[0]

  return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1)
})

const irAMiCuenta = () => {
  router.push('/mi-cuenta')
}

onMounted(() => {
  detenerObservador = onAuthStateChanged(auth, async (usuario) => {
    usuarioActual.value = usuario

    if (usuario) {
      datosUsuario.value = await obtenerDatosUsuario(usuario.uid)
    } else {
      datosUsuario.value = null
    }
  })
})

onUnmounted(() => {
  if (detenerObservador) {
    detenerObservador()
  }
})

const cerrarSesion = async () => {
  await cerrarSesionUsuario()
  usuarioActual.value = null
  datosUsuario.value = null
  router.push('/')
}

const elementosMenu = [
  {
    titulo: 'Inicio',
    icono: 'IN',
    idSeccion: 'inicio',
  },
  {
    titulo: 'Adolescencia y Adultez Temprana',
    icono: 'AD',
    idSeccion: 'adolescencia',
  },
  {
    titulo: 'Hábitos de Vida Saludable',
    icono: 'HV',
    idSeccion: 'habitos',
  },
  {
    titulo: 'Riesgo Cardiometabólico',
    icono: 'RC',
    idSeccion: 'riesgo-cardiometabolico',
  },
  {
    titulo: 'Diabetes Mellitus',
    icono: 'DM',
    idSeccion: 'diabetes',
  },
  {
    titulo: 'Trastornos del Ritmo Cardíaco',
    icono: 'TR',
    idSeccion: 'ritmo-cardiaco',
  },
  {
    titulo: 'Sobrepeso y Obesidad',
    icono: 'SO',
    idSeccion: 'sobrepeso',
  },
  {
    titulo: 'Salud Mental y Autocuidado',
    icono: 'SM',
    idSeccion: 'salud-mental',
  },
  {
    titulo: 'Nuestra App',
    icono: 'AP',
    idSeccion: 'nuestra-app',
  },
]

const seccionesTemario = [
  {
    id: 'adolescencia',
    icono: 'AD',
    titulo: 'Adolescencia y Adultez Temprana',
    color: 'azul',
    texto:
      'Aprende sobre la importancia de esta etapa, los factores que influyen en tu día a día y cómo la información adecuada puede ayudarte a tomar decisiones informadas para tu autocuidado.',
    imagenes: [
      {
        ruta: imagenHabitos,
        titulo: 'Conceptos Clave',
        texto:
          'Información esencial para entender los fundamentos y su impacto en el bienestar.',
      },
      {
        ruta: imagenFrutas,
        titulo: 'Prevención y Conciencia',
        texto:
          'Conoce las medidas de prevención generales y la importancia de consultar a tu médico.',
      },
    ],
    tarjetas: [],
  },
  {
    id: 'habitos',
    icono: 'HV',
    titulo: 'Hábitos de Vida Saludable',
    color: 'verde',
    texto:
      'Aprende sobre la importancia de mantener hábitos saludables como una alimentación equilibrada, actividad física, descanso adecuado y autocuidado diario.',
    imagenes: [
      {
        ruta: imagenHabitos,
        titulo: 'Conceptos Clave',
        texto:
          'Información esencial para entender los fundamentos y su impacto en el bienestar.',
      },
      {
        ruta: imagenFrutas,
        titulo: 'Prevención y Conciencia',
        texto:
          'Conoce las medidas de prevención generales y la importancia de consultar a tu médico.',
      },
    ],
    tarjetas: [],
  },
  {
    id: 'riesgo-cardiometabolico',
    icono: 'RC',
    titulo: 'Riesgo Cardiometabólico',
    color: 'rosa',
    texto:
      'Aprende sobre los factores relacionados con la salud cardiovascular y metabólica, como presión arterial, colesterol, diabetes, alimentación y actividad física.',
    imagenes: [
      {
        ruta: imagenHabitos,
        titulo: 'Conceptos Clave',
        texto:
          'Información esencial para entender los fundamentos y su impacto en el bienestar.',
      },
      {
        ruta: imagenFrutas,
        titulo: 'Prevención y Conciencia',
        texto:
          'Conoce las medidas de prevención generales y la importancia de consultar a tu médico.',
      },
    ],
    tarjetas: [
      {
        icono: 'RC',
        titulo: 'Riesgo Cardiovascular',
        texto:
          'Realiza una simulación educativa para estimar riesgos cardiovasculares básicos.',
        boton: 'Comenzar simulación',
        color: 'rosa',
        ruta: '/riesgo-cardiovascular',
      },
    ],
  },
  {
    id: 'diabetes',
    icono: 'DM',
    titulo: 'Diabetes Mellitus',
    color: 'azul',
    texto:
      'Conoce información básica sobre la diabetes mellitus, sus factores de riesgo, medidas de prevención y la importancia de mantener hábitos saludables.',
    imagenes: [
      {
        ruta: imagenHabitos,
        titulo: 'Conceptos Clave',
        texto:
          'Información esencial para entender los fundamentos y su impacto en el bienestar.',
      },
      {
        ruta: imagenFrutas,
        titulo: 'Prevención y Conciencia',
        texto:
          'Conoce las medidas de prevención generales y la importancia de consultar a tu médico.',
      },
    ],
    tarjetas: [],
  },
  {
    id: 'ritmo-cardiaco',
    icono: 'TR',
    titulo: 'Trastornos del Ritmo Cardíaco',
    color: 'rojo',
    texto:
      'Aprende sobre la importancia del ritmo cardíaco, los signos de alerta y la necesidad de acudir con un profesional de salud ante síntomas persistentes.',
    imagenes: [
      {
        ruta: imagenHabitos,
        titulo: 'Conceptos Clave',
        texto:
          'Información esencial para entender los fundamentos y su impacto en el bienestar.',
      },
      {
        ruta: imagenFrutas,
        titulo: 'Prevención y Conciencia',
        texto:
          'Conoce las medidas de prevención generales y la importancia de consultar a tu médico.',
      },
    ],
    tarjetas: [],
  },
  {
    id: 'sobrepeso',
    icono: 'SO',
    titulo: 'Sobrepeso y Obesidad',
    color: 'naranja',
    texto:
      'Aprende sobre el sobrepeso, la obesidad y la relación que tienen con la alimentación, actividad física, metabolismo y prevención de enfermedades.',
    imagenes: [
      {
        ruta: imagenHabitos,
        titulo: 'Conceptos Clave',
        texto:
          'Información esencial para entender los fundamentos y su impacto en el bienestar.',
      },
      {
        ruta: imagenFrutas,
        titulo: 'Prevención y Conciencia',
        texto:
          'Conoce las medidas de prevención generales y la importancia de consultar a tu médico.',
      },
    ],
    tarjetas: [
      {
        icono: 'IMC',
        titulo: 'Calculadora de IMC',
        texto:
          'Evalúa tu índice de masa corporal rápidamente y conoce en qué rango te encuentras.',
        boton: 'Calcular ahora',
        color: 'naranja',
        ruta: '/calculadora-imc',
      },
      {
        icono: 'CAL',
        titulo: 'Calculadora de Calorías',
        texto:
          'Estima tu gasto calórico diario según tu actividad física.',
        boton: 'Calcular ahora',
        color: 'verde',
        ruta: '/calculadora-calorias',
      },
    ],
  },
  {
    id: 'salud-mental',
    icono: 'SM',
    titulo: 'Salud Mental y Autocuidado',
    color: 'cian',
    texto:
      'La salud mental es un pilar fundamental del bienestar general. Incluye nuestro bienestar emocional, psicológico y social. Afecta la forma en que pensamos, sentimos y actuamos cuando enfrentamos la vida.',
    imagenes: [],
    tarjetas: [
      {
        icono: 'D21',
        titulo: 'Evaluación con DASS-21',
        texto:
          'Escala para identificar niveles de depresión, ansiedad y estrés. Conoce cómo te has sentido durante la última semana.',
        boton: 'Comenzar encuesta',
        color: 'cian',
        ruta: '/evaluacion-dass21',
      },
      {
        icono: 'AIS',
        titulo: 'Escala de Insomnio de Atenas',
        texto:
          'Cuestionario breve para evaluar la calidad de tu sueño y detectar posibles dificultades al dormir.',
        boton: 'Comenzar encuesta',
        color: 'morado',
        ruta: '/escala-insomnio-atenas',
      },
    ],
  },
]

const irAlTemario = () => {
  const seccion = document.getElementById('temario')
  seccion?.scrollIntoView({ behavior: 'smooth' })
}

const irASeccion = (idSeccion) => {
  seccionActiva.value = idSeccion

  const seccion = document.getElementById(idSeccion)

  if (seccion) {
    seccion.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

const abrirTarjeta = (tarjeta) => {
  if (tarjeta.ruta) {
    router.push(tarjeta.ruta)
  }
}
</script>

<template>
  <div class="pagina-inicio">
    <aside class="barra-lateral">
      <div class="contenedor-logo">
        <img :src="logoVibra" alt="Logo Vibra la Vida" />
      </div>

      <div class="botones-acceso">
        <div v-if="usuarioActual" class="caja-cuenta">
          <h3 class="saludo-cuenta">
            Hola {{ nombreUsuario }}
          </h3>

          <button class="boton-mi-cuenta" @click="irAMiCuenta">
            Mi cuenta
          </button>

          <button class="boton-cerrar" @click="cerrarSesion">
            Cerrar sesión
          </button>
        </div>

        <div v-else class="acciones-sesion">
          <button class="boton boton-login" @click="router.push('/iniciar-sesion')">
            Iniciar Sesión
          </button>

          <button class="boton boton-registro" @click="router.push('/registro')">
            Crear Cuenta
          </button>
        </div>
      </div>

      <p class="titulo-menu">Temario informativo</p>

      <nav class="menu-lateral">
        <button
          v-for="elemento in elementosMenu"
          :key="elemento.titulo"
          type="button"
          class="enlace-menu"
          :class="{ activo: seccionActiva === elemento.idSeccion }"
          @click="irASeccion(elemento.idSeccion)"
        >
          <span class="icono-menu">{{ elemento.icono }}</span>
          <span>{{ elemento.titulo }}</span>
          <span
            v-if="seccionActiva === elemento.idSeccion"
            class="punto-activo"
          ></span>
        </button>
      </nav>

      <div class="tarjeta-descarga">
        <h3>Lleva tu bienestar</h3>
        <p>Descarga la app y haz seguimiento a tus hábitos.</p>
        <button>Descargar para Android</button>
      </div>
    </aside>

    <main id="inicio" class="contenido-principal">
      <section class="tarjeta-aviso">
        <div class="icono-aviso">!</div>

        <div>
          <h3>Aviso Importante</h3>
          <p>
            La información contenida en esta página tiene fines exclusivamente
            educativos e informativos.
            <strong>
              No emitimos prescripciones médicas, diagnósticos ni tratamientos.
            </strong>
            Ante cualquier duda o síntoma, consulte siempre a un profesional de
            la salud calificado.
          </p>
        </div>
      </section>

      <section class="seccion-bienvenida">
        <div class="texto-bienvenida">
          <span class="etiqueta">Explora y aprende</span>

          <h1>
            Bienvenido a
            <span>Vibra la Vida</span>
          </h1>

          <p>
            Navega a través de nuestros temas para conocer más sobre el cuidado
            del cuerpo, prevención de riesgos y la importancia de la salud
            mental, con información pensada especialmente para jóvenes de 15 a
            20 años.
          </p>

          <button class="boton-principal" @click="irAlTemario">
            Ver temario
          </button>
        </div>

        <div class="imagen-bienvenida">
          <img :src="logoPrincipal" alt="Imagen principal Vibra la Vida" />
        </div>
      </section>

      <section id="temario" class="contenedor-temario">
        <article
          v-for="seccion in seccionesTemario"
          :id="seccion.id"
          :key="seccion.id"
          class="bloque-tema"
        >
          <div class="titulo-seccion">
            <span :class="seccion.color">{{ seccion.icono }}</span>
            <h2>{{ seccion.titulo }}</h2>
          </div>

          <div class="tarjeta-tema">
            <p class="descripcion-tema">
              {{ seccion.texto }}
            </p>

            <div v-if="seccion.imagenes.length" class="rejilla-imagenes">
              <div
                v-for="imagen in seccion.imagenes"
                :key="imagen.titulo"
                class="contenido-imagen"
              >
                <img :src="imagen.ruta" :alt="imagen.titulo" />

                <h3>{{ imagen.titulo }}</h3>
                <p>{{ imagen.texto }}</p>
              </div>
            </div>

            <div v-if="seccion.tarjetas.length" class="rejilla-tarjetas">
              <div
                v-for="tarjeta in seccion.tarjetas"
                :key="tarjeta.titulo"
                class="tarjeta-accion"
                :class="`tarjeta-${tarjeta.color}`"
                @click="abrirTarjeta(tarjeta)"
              >
                <div class="icono-tarjeta" :class="tarjeta.color">
                  {{ tarjeta.icono }}
                </div>

                <h3>{{ tarjeta.titulo }}</h3>
                <p>{{ tarjeta.texto }}</p>

                <button :class="tarjeta.color">
                  {{ tarjeta.boton }}
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        <section id="nuestra-app" class="seccion-app">
          <div class="contenido-app">
            <span class="etiqueta-app">Disponible ahora</span>

            <h2>
              Tu bienestar, en
              <span>la palma de tu mano.</span>
            </h2>

            <p>
              Descarga la aplicación oficial de Vibra la Vida. Accede a
              herramientas de seguimiento de hábitos y mantén el registro de tus
              avances de manera sencilla.
            </p>

            <button class="boton-tienda">
              Descargar para Android
            </button>
          </div>

          <div class="vista-celular">
            <div class="pantalla-celular">
              <div class="encabezado-celular">
                <span>Hola</span>
                <strong>Tu progreso de hoy</strong>
                <h3>75%</h3>
              </div>

              <div class="tarjeta-celular">Autocuidado</div>
              <div class="tarjeta-celular">Hábitos</div>
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<style scoped src="../assets/styles/home.css"></style>