<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { guardarResultadoBienestar } from '../services/resultadosService'

const respuestas = ref({})
const mostrarResultado = ref(false)
const mensajeGuardado = ref('')

const preguntas = [
  {
    numero: 1,
    titulo: 'Pregunta 1',
    descripcion: 'Inducción del sueño: tiempo que tarda en dormirse una vez acostado.',
    icono: 'SU',
    opciones: [
      { valor: 0, texto: 'Sin problema' },
      { valor: 1, texto: 'Levemente retrasado' },
      { valor: 2, texto: 'Marcadamente retrasado' },
      { valor: 3, texto: 'Muy retrasado o no durmió en absoluto' },
    ],
  },
  {
    numero: 2,
    titulo: 'Pregunta 2',
    descripcion: 'Despertares durante la noche.',
    icono: 'NO',
    opciones: [
      { valor: 0, texto: 'Sin problema' },
      { valor: 1, texto: 'Problema menor' },
      { valor: 2, texto: 'Problema considerable' },
      { valor: 3, texto: 'Problema serio o no durmió en absoluto' },
    ],
  },
  {
    numero: 3,
    titulo: 'Pregunta 3',
    descripcion: 'Despertar final más temprano de lo deseado.',
    icono: 'DE',
    opciones: [
      { valor: 0, texto: 'Sin problema' },
      { valor: 1, texto: 'Levemente más temprano' },
      { valor: 2, texto: 'Marcadamente más temprano' },
      { valor: 3, texto: 'Mucho más temprano o no durmió en absoluto' },
    ],
  },
  {
    numero: 4,
    titulo: 'Pregunta 4',
    descripcion: 'Duración total del sueño.',
    icono: 'DU',
    opciones: [
      { valor: 0, texto: 'Suficiente' },
      { valor: 1, texto: 'Levemente insuficiente' },
      { valor: 2, texto: 'Marcadamente insuficiente' },
      { valor: 3, texto: 'Muy insuficiente o no durmió en absoluto' },
    ],
  },
  {
    numero: 5,
    titulo: 'Pregunta 5',
    descripcion: 'Calidad general del sueño.',
    icono: 'CA',
    opciones: [
      { valor: 0, texto: 'Satisfactoria' },
      { valor: 1, texto: 'Levemente insatisfactoria' },
      { valor: 2, texto: 'Marcadamente insatisfactoria' },
      { valor: 3, texto: 'Muy insatisfactoria o no durmió en absoluto' },
    ],
  },
  {
    numero: 6,
    titulo: 'Pregunta 6',
    descripcion: 'Sensación de bienestar durante el día.',
    icono: 'BI',
    opciones: [
      { valor: 0, texto: 'Normal' },
      { valor: 1, texto: 'Levemente disminuida' },
      { valor: 2, texto: 'Marcadamente disminuida' },
      { valor: 3, texto: 'Muy disminuida' },
    ],
  },
  {
    numero: 7,
    titulo: 'Pregunta 7',
    descripcion: 'Funcionamiento físico y mental durante el día.',
    icono: 'FU',
    opciones: [
      { valor: 0, texto: 'Normal' },
      { valor: 1, texto: 'Levemente disminuido' },
      { valor: 2, texto: 'Marcadamente disminuido' },
      { valor: 3, texto: 'Muy disminuido' },
    ],
  },
  {
    numero: 8,
    titulo: 'Pregunta 8',
    descripcion: 'Somnolencia durante el día.',
    icono: 'SO',
    opciones: [
      { valor: 0, texto: 'Ninguna' },
      { valor: 1, texto: 'Leve' },
      { valor: 2, texto: 'Considerable' },
      { valor: 3, texto: 'Intensa' },
    ],
  },
]

const preguntasRespondidas = computed(() => {
  return preguntas.filter((pregunta) => respuestas.value[pregunta.numero] !== undefined).length
})

const totalPreguntas = computed(() => {
  return preguntas.length
})

const progreso = computed(() => {
  return (preguntasRespondidas.value / totalPreguntas.value) * 100
})

const evaluacionCompleta = computed(() => {
  return preguntasRespondidas.value === totalPreguntas.value
})

const puntajeTotal = computed(() => {
  return preguntas.reduce((total, pregunta) => {
    return total + Number(respuestas.value[pregunta.numero] ?? 0)
  }, 0)
})

const resultado = computed(() => {
  const puntaje = puntajeTotal.value

  if (puntaje <= 5) {
    return {
      nivel: 'Sin indicios relevantes de insomnio',
      clase: 'bajo',
      descripcion:
        'El puntaje se encuentra por debajo del punto de corte usado comúnmente para identificar posible insomnio. Mantener hábitos saludables de sueño puede ayudar a conservar una buena calidad de descanso.',
    }
  }

  if (puntaje <= 9) {
    return {
      nivel: 'Posible insomnio leve',
      clase: 'medio',
      descripcion:
        'El puntaje alcanza el punto de corte orientativo para posible insomnio. Se recomienda revisar hábitos de sueño y buscar orientación profesional si las dificultades persisten.',
    }
  }

  if (puntaje <= 15) {
    return {
      nivel: 'Posible insomnio moderado',
      clase: 'moderado',
      descripcion:
        'El puntaje sugiere dificultades importantes relacionadas con el sueño. Sería recomendable consultar con un profesional de la salud para una valoración adecuada.',
    }
  }

  return {
    nivel: 'Posible insomnio elevado',
    clase: 'alto',
    descripcion:
      'El puntaje refleja dificultades considerables del sueño. Se recomienda buscar apoyo profesional para una evaluación clínica completa.',
  }
})

const responderPregunta = (numeroPregunta, valor) => {
  respuestas.value[numeroPregunta] = valor
  mostrarResultado.value = false
  mensajeGuardado.value = ''
}


const guardarResultadoAtenas = async () => {
  mensajeGuardado.value = ''

  try {
    await guardarResultadoBienestar({
      tipo: 'insomnio',
      nombreHerramienta: 'Escala de Insomnio de Atenas',
      puntajeTotal: puntajeTotal.value,
      puntajeMaximo: 24,
      nivel: resultado.value.nivel,
      categoria: resultado.value.nivel,
      descripcion: resultado.value.descripcion,
      resultado: `${puntajeTotal.value} / 24 puntos`,
    })

    mensajeGuardado.value = 'Resultado guardado correctamente en Mi cuenta.'
  } catch (error) {
    console.error('Error al guardar el resultado de Atenas:', error)

    if (error.message?.includes('iniciar sesión')) {
      mensajeGuardado.value =
        'Resultado calculado. Inicia sesión para guardar este resultado en Mi cuenta.'
      return
    }

    mensajeGuardado.value =
      'Resultado calculado, pero no se pudo guardar en este momento.'
  }
}

const verResultado = async () => {
  if (!evaluacionCompleta.value) return

  mostrarResultado.value = true

  await guardarResultadoAtenas()

  setTimeout(() => {
    const seccionResultado = document.getElementById('resultado-atenas')
    seccionResultado?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

const reiniciarEvaluacion = () => {
  respuestas.value = {}
  mostrarResultado.value = false
  mensajeGuardado.value = ''

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, 100)
}
</script>

<template>
  <main class="pagina-atenas">
    <RouterLink to="/" class="boton-regresar">
      ← Volver al Temario
    </RouterLink>

    <section class="encabezado-evaluacion">
      <span class="etiqueta-principal">Evaluación de sueño</span>

      <h1>Escala de Insomnio de Atenas</h1>

      <p>
        Esta evaluación mide la calidad de tu sueño y detecta posibles
        dificultades. Responde según cómo has dormido
        <strong>durante el último mes.</strong>
      </p>
    </section>

    <section class="tarjeta-escala">
      <h2>Escala de calificación</h2>

      <p>
        Cada pregunta se califica de 0 a 3, donde 0 indica “sin problema” y 3
        indica “problema severo”. Selecciona la opción que mejor describa tu
        experiencia.
      </p>
    </section>

    <section class="contenedor-preguntas">
      <article
        v-for="pregunta in preguntas"
        :key="pregunta.numero"
        class="tarjeta-pregunta"
      >
        <div class="encabezado-pregunta">
          <span class="icono-pregunta">{{ pregunta.icono }}</span>

          <div>
            <h2>{{ pregunta.titulo }}</h2>
            <p>{{ pregunta.descripcion }}</p>
          </div>
        </div>

        <div class="opciones-respuesta">
          <button
            v-for="opcion in pregunta.opciones"
            :key="opcion.valor"
            type="button"
            class="boton-opcion"
            :class="{
              seleccionado: respuestas[pregunta.numero] === opcion.valor,
            }"
            @click="responderPregunta(pregunta.numero, opcion.valor)"
          >
            <span>{{ opcion.valor }}</span>
            {{ opcion.texto }}
          </button>
        </div>
      </article>
    </section>

    <section class="barra-final">
      <div class="contenedor-progreso">
        <div
          class="progreso-actual"
          :style="{ width: `${progreso}%` }"
        ></div>
      </div>

      <span>{{ preguntasRespondidas }} de {{ totalPreguntas }}</span>

      <button
        class="boton-resultados"
        :disabled="!evaluacionCompleta"
        @click="verResultado"
      >
        Ver Resultados
      </button>
    </section>

    <section
      v-if="mostrarResultado"
      id="resultado-atenas"
      class="tarjeta-resultado"
      :class="resultado.clase"
    >
      <h2>Resultado de la Escala de Insomnio de Atenas</h2>

      <div class="resultado-principal">
        <span>{{ puntajeTotal }}</span>
        <p>puntos de 24</p>
      </div>

      <h3>{{ resultado.nivel }}</h3>

      <p>
        {{ resultado.descripcion }}
      </p>

      <div class="tarjeta-aviso">
        Esta herramienta es únicamente informativa y no sustituye una valoración
        médica, psicológica o de sueño realizada por un profesional.
      </div>

      <p v-if="mensajeGuardado" class="mensaje-guardado">
        {{ mensajeGuardado }}
      </p>

      <button class="boton-reiniciar" @click="reiniciarEvaluacion">
        Realizar nuevamente
      </button>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/EsInsomnioAtenas.css"></style>