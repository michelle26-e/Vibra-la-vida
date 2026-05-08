<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const pantallaActual = ref('dimensiones')
const dimensionSeleccionada = ref(null)
const respuestas = ref({})
const mostrarResultado = ref(false)

const opcionesRespuesta = [
  {
    valor: 0,
    texto: 'No me ha ocurrido',
  },
  {
    valor: 1,
    texto: 'Me ha ocurrido un poco, o durante parte del tiempo',
  },
  {
    valor: 2,
    texto: 'Me ha ocurrido bastante, o durante una buena parte del tiempo',
  },
  {
    valor: 3,
    texto: 'Me ha ocurrido mucho, o la mayor parte del tiempo',
  },
]

const dimensiones = [
  {
    id: 'depresion',
    titulo: 'Depresión',
    etiqueta: 'DEPRESIÓN',
    color: 'azul',
    icono: '🧠',
    descripcion:
      'Evalúa síntomas relacionados con bajo estado de ánimo, falta de motivación y desánimo.',
    preguntas: [
      {
        numero: 3,
        texto: 'No podía sentir ningún sentimiento positivo',
      },
      {
        numero: 5,
        texto: 'Se me hizo difícil tomar la iniciativa para hacer cosas',
      },
      {
        numero: 10,
        texto: 'Sentí que no tenía nada por lo que ilusionarme',
      },
      {
        numero: 13,
        texto: 'Me sentí triste y deprimido/a',
      },
      {
        numero: 16,
        texto: 'Fui incapaz de entusiasmarme con nada',
      },
      {
        numero: 17,
        texto: 'Sentí que valía poco como persona',
      },
      {
        numero: 21,
        texto: 'Sentí que la vida no tenía sentido',
      },
    ],
  },
  {
    id: 'ansiedad',
    titulo: 'Ansiedad',
    etiqueta: 'ANSIEDAD',
    color: 'amarillo',
    icono: '!',
    descripcion:
      'Evalúa síntomas físicos y mentales relacionados con nerviosismo, preocupación y señales de alerta corporal.',
    preguntas: [
      {
        numero: 2,
        texto: 'Me di cuenta de que tenía la boca seca',
      },
      {
        numero: 4,
        texto: 'Tuve dificultad para respirar',
      },
      {
        numero: 7,
        texto: 'Sentí que mis manos temblaban',
      },
      {
        numero: 9,
        texto:
          'Estaba preocupado/a por situaciones en las cuales podía tener pánico o hacer el ridículo',
      },
      {
        numero: 15,
        texto: 'Sentí que estaba a punto de pánico',
      },
      {
        numero: 19,
        texto:
          'Sentí los latidos de mi corazón sin haber hecho ejercicio',
      },
      {
        numero: 20,
        texto: 'Tuve miedo sin razón',
      },
    ],
  },
  {
    id: 'estres',
    titulo: 'Estrés',
    etiqueta: 'ESTRÉS',
    color: 'rosa',
    icono: '⌁',
    descripcion:
      'Evalúa niveles de tensión, irritabilidad, dificultad para relajarse y reacciones exageradas.',
    preguntas: [
      {
        numero: 1,
        texto: 'Me costó mucho calmarme',
      },
      {
        numero: 6,
        texto: 'Reaccioné exageradamente en ciertas situaciones',
      },
      {
        numero: 8,
        texto: 'Sentí que tenía muchos nervios',
      },
      {
        numero: 11,
        texto: 'Me noté agitado/a',
      },
      {
        numero: 12,
        texto: 'Se me hizo difícil relajarme',
      },
      {
        numero: 14,
        texto:
          'No toleré que nada me interrumpiera en lo que estaba haciendo',
      },
      {
        numero: 18,
        texto: 'Sentí que era muy irritable',
      },
    ],
  },
]

const dimensionActiva = computed(() => {
  return dimensiones.find((dimension) => dimension.id === dimensionSeleccionada.value)
})

const preguntasRespondidas = computed(() => {
  if (!dimensionActiva.value) return 0

  return dimensionActiva.value.preguntas.filter((pregunta) => {
    return respuestas.value[pregunta.numero] !== undefined
  }).length
})

const totalPreguntas = computed(() => {
  return dimensionActiva.value?.preguntas.length || 0
})

const porcentajeProgreso = computed(() => {
  if (!totalPreguntas.value) return 0

  return (preguntasRespondidas.value / totalPreguntas.value) * 100
})

const evaluacionCompleta = computed(() => {
  return preguntasRespondidas.value === totalPreguntas.value
})

const puntajeDirecto = computed(() => {
  if (!dimensionActiva.value) return 0

  return dimensionActiva.value.preguntas.reduce((total, pregunta) => {
    return total + Number(respuestas.value[pregunta.numero] ?? 0)
  }, 0)
})

const puntajeFinal = computed(() => {
  return puntajeDirecto.value * 2
})

const resultado = computed(() => {
  if (!dimensionActiva.value) {
    return {
      nivel: 'Sin resultado',
      clase: 'neutral',
      recomendacion: '',
    }
  }

  const valor = puntajeFinal.value
  const tipo = dimensionActiva.value.id

  if (tipo === 'depresion') {
    if (valor <= 9) return crearResultado('Normal', 'normal')
    if (valor <= 13) return crearResultado('Leve', 'leve')
    if (valor <= 20) return crearResultado('Moderado', 'moderado')
    if (valor <= 27) return crearResultado('Severo', 'severo')
    return crearResultado('Extremadamente severo', 'muy-severo')
  }

  if (tipo === 'ansiedad') {
    if (valor <= 7) return crearResultado('Normal', 'normal')
    if (valor <= 9) return crearResultado('Leve', 'leve')
    if (valor <= 14) return crearResultado('Moderado', 'moderado')
    if (valor <= 19) return crearResultado('Severo', 'severo')
    return crearResultado('Extremadamente severo', 'muy-severo')
  }

  if (valor <= 14) return crearResultado('Normal', 'normal')
  if (valor <= 18) return crearResultado('Leve', 'leve')
  if (valor <= 25) return crearResultado('Moderado', 'moderado')
  if (valor <= 33) return crearResultado('Severo', 'severo')
  return crearResultado('Extremadamente severo', 'muy-severo')
})

const crearResultado = (nivel, clase) => {
  let recomendacion =
    'Este resultado es orientativo. Mantén hábitos de autocuidado y considera hablar con un profesional de la salud si los síntomas persisten.'

  if (clase === 'moderado' || clase === 'severo' || clase === 'muy-severo') {
    recomendacion =
      'El resultado sugiere un nivel elevado de síntomas. Se recomienda buscar orientación con un profesional de la salud mental para una valoración adecuada.'
  }

  return {
    nivel,
    clase,
    recomendacion,
  }
}

const seleccionarDimension = (idDimension) => {
  dimensionSeleccionada.value = idDimension
  respuestas.value = {}
  mostrarResultado.value = false
  pantallaActual.value = 'evaluacion'

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, 100)
}

const volverADimensiones = () => {
  pantallaActual.value = 'dimensiones'
  dimensionSeleccionada.value = null
  respuestas.value = {}
  mostrarResultado.value = false
}

const responderPregunta = (numeroPregunta, valor) => {
  respuestas.value[numeroPregunta] = valor
  mostrarResultado.value = false
}

const completarEvaluacion = () => {
  if (!evaluacionCompleta.value) return

  mostrarResultado.value = true

  setTimeout(() => {
    const resultado = document.getElementById('resultado-dass')
    resultado?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}
</script>

<template>
  <main class="pagina-dass">
    <RouterLink to="/" class="boton-regresar">
      ← Volver al Temario
    </RouterLink>

    <section v-if="pantallaActual === 'dimensiones'" class="seccion-dimensiones">
      <span class="etiqueta-principal">AUTOEVALUACIÓN</span>

      <h1>Cuestionario DASS-21</h1>

      <p class="descripcion-principal">
        Selecciona la dimensión que deseas evaluar. Puedes completar una o todas
        las evaluaciones según tu preferencia.
      </p>

      <div class="rejilla-dimensiones">
        <button
          v-for="dimension in dimensiones"
          :key="dimension.id"
          type="button"
          class="tarjeta-dimension"
          :class="dimension.color"
          @click="seleccionarDimension(dimension.id)"
        >
          <span class="icono-dimension">{{ dimension.icono }}</span>

          <h2>{{ dimension.titulo }}</h2>

          <p>{{ dimension.descripcion }}</p>

          <strong>7 preguntas</strong>
        </button>
      </div>
    </section>

    <section v-else class="seccion-evaluacion">
      <button class="boton-secundario" @click="volverADimensiones">
        ← Volver a dimensiones
      </button>

      <span class="etiqueta-dimension" :class="dimensionActiva.color">
        {{ dimensionActiva.etiqueta }}
      </span>

      <h1>Evaluación de {{ dimensionActiva.titulo }}</h1>

      <p class="descripcion-evaluacion">
        {{ dimensionActiva.descripcion }} Indica cuánto te aplicó
        <strong>durante la semana pasada.</strong>
      </p>

      <section class="tarjeta-escala">
        <h2>Escala de calificación</h2>

        <div class="rejilla-escala">
          <div
            v-for="opcion in opcionesRespuesta"
            :key="opcion.valor"
            class="opcion-escala"
          >
            <strong>{{ opcion.valor }}:</strong>
            <span>{{ opcion.texto }}</span>
          </div>
        </div>
      </section>

      <section class="contenedor-preguntas">
        <article
          v-for="pregunta in dimensionActiva.preguntas"
          :key="pregunta.numero"
          class="tarjeta-pregunta"
          :class="dimensionActiva.color"
        >
          <h3>
            {{ pregunta.numero }}. {{ pregunta.texto }}
          </h3>

          <div class="opciones-pregunta">
            <button
              v-for="opcion in opcionesRespuesta"
              :key="opcion.valor"
              type="button"
              class="boton-respuesta"
              :class="{
                seleccionado: respuestas[pregunta.numero] === opcion.valor,
              }"
              @click="responderPregunta(pregunta.numero, opcion.valor)"
            >
              {{ opcion.valor }}
            </button>
          </div>
        </article>
      </section>

      <section class="barra-final">
        <div class="progreso-contenedor">
          <div
            class="progreso-actual"
            :style="{ width: `${porcentajeProgreso}%` }"
          ></div>
        </div>

        <span>{{ preguntasRespondidas }} de {{ totalPreguntas }}</span>

        <button
          class="boton-completar"
          :disabled="!evaluacionCompleta"
          @click="completarEvaluacion"
        >
          Completar
        </button>
      </section>

      <section
        v-if="mostrarResultado"
        id="resultado-dass"
        class="tarjeta-resultado"
        :class="resultado.clase"
      >
        <h2>Resultado de {{ dimensionActiva.titulo }}</h2>

        <div class="resultado-resumen">
          <div>
            <span>Puntaje directo</span>
            <strong>{{ puntajeDirecto }} / 21</strong>
          </div>

          <div>
            <span>Puntaje final</span>
            <strong>{{ puntajeFinal }} / 42</strong>
          </div>

          <div>
            <span>Nivel</span>
            <strong>{{ resultado.nivel }}</strong>
          </div>
        </div>

        <p>
          {{ resultado.recomendacion }}
        </p>

        <p class="nota-clinica">
          Esta autoevaluación es únicamente informativa y no representa un
          diagnóstico médico o psicológico.
        </p>

        <button class="boton-secundario" @click="volverADimensiones">
          Evaluar otra dimensión
        </button>
      </section>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/EvaDASS-21.css"></style>