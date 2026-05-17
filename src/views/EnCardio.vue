<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { auth } from '../firebase/firebaseConfig'
import { guardarResultadoBienestar } from '../services/resultadosService'

const formulario = ref({
  sexo: 'hombre',
  edad: '',
  presionSistolica: '',
  colesterolTotal: '',
  fumador: false,
  diagnosticoDiabetes: false,
})

const errores = ref({})
const mostrarResultado = ref(false)
const mensajeGuardado = ref('')
const guardandoResultado = ref(false)

const resultado = computed(() => {
  const edad = Number(formulario.value.edad)
  const presion = Number(formulario.value.presionSistolica)
  const colesterol = Number(formulario.value.colesterolTotal)

  let puntaje = 0

  if (formulario.value.sexo === 'hombre') {
    puntaje += 1
  }

  if (edad >= 15 && edad <= 20) {
    puntaje += 1
  } else if (edad >= 21 && edad <= 29) {
    puntaje += 2
  } else if (edad >= 30 && edad <= 39) {
    puntaje += 3
  } else if (edad >= 40 && edad <= 49) {
    puntaje += 5
  } else if (edad >= 50 && edad <= 59) {
    puntaje += 7
  } else if (edad >= 60) {
    puntaje += 9
  }

  if (presion >= 120 && presion <= 129) {
    puntaje += 1
  } else if (presion >= 130 && presion <= 139) {
    puntaje += 2
  } else if (presion >= 140 && presion <= 159) {
    puntaje += 3
  } else if (presion >= 160) {
    puntaje += 4
  }

  if (colesterol >= 200 && colesterol <= 239) {
    puntaje += 1
  } else if (colesterol >= 240 && colesterol <= 279) {
    puntaje += 2
  } else if (colesterol >= 280) {
    puntaje += 3
  }

  if (formulario.value.fumador) {
    puntaje += 2
  }

  if (formulario.value.diagnosticoDiabetes) {
    puntaje += 3
  }

  const porcentaje = Math.min(30, Math.max(1, Math.round(puntaje * 1.8)))

  let nivel = 'Riesgo Bajo'
  let tipo = 'bajo'

  if (porcentaje >= 5 && porcentaje <= 14) {
    nivel = 'Riesgo Moderado'
    tipo = 'moderado'
  }

  if (porcentaje >= 15) {
    nivel = 'Riesgo Alto'
    tipo = 'alto'
  }

  return {
    porcentaje,
    nivel,
    tipo,
  }
})

const validarFormulario = () => {
  const nuevosErrores = {}

  const edad = Number(formulario.value.edad)
  const presion = Number(formulario.value.presionSistolica)
  const colesterol = Number(formulario.value.colesterolTotal)

  if (!edad) {
    nuevosErrores.edad = 'Ingresa tu edad.'
  } else if (edad < 10 || edad > 100) {
    nuevosErrores.edad = 'Ingresa una edad válida.'
  }

  if (!presion) {
    nuevosErrores.presionSistolica = 'Ingresa la presión sistólica.'
  } else if (presion < 80 || presion > 250) {
    nuevosErrores.presionSistolica = 'Ingresa una presión válida.'
  }

  if (!colesterol) {
    nuevosErrores.colesterolTotal = 'Ingresa el colesterol total.'
  } else if (colesterol < 100 || colesterol > 400) {
    nuevosErrores.colesterolTotal = 'Ingresa un colesterol válido.'
  }

  errores.value = nuevosErrores

  return Object.keys(nuevosErrores).length === 0
}

const guardarResultadoCardiovascular = async () => {
  mensajeGuardado.value = ''

  if (!auth.currentUser) {
    mensajeGuardado.value =
      'Resultado calculado. Inicia sesión para guardar este resultado en Mi cuenta.'
    return
  }

  try {
    guardandoResultado.value = true

    await guardarResultadoBienestar({
      tipo: 'riesgo_cardiometabolico',
      nombreHerramienta: 'Encuesta de Riesgo Cardiovascular',
      porcentaje: resultado.value.porcentaje,
      resultado: `${resultado.value.porcentaje}%`,
      nivelRiesgo: resultado.value.nivel,
      categoria: resultado.value.nivel,
      tipoRiesgo: resultado.value.tipo,
      respuestas: {
        sexo: formulario.value.sexo,
        edad: Number(formulario.value.edad),
        presionSistolica: Number(formulario.value.presionSistolica),
        colesterolTotal: Number(formulario.value.colesterolTotal),
        fumador: formulario.value.fumador,
        diagnosticoDiabetes: formulario.value.diagnosticoDiabetes,
      },
    })

    mensajeGuardado.value = 'Resultado guardado correctamente en Mi cuenta.'
  } catch (error) {
    console.error('Error al guardar el resultado cardiovascular:', error)
    mensajeGuardado.value = 'No se pudo guardar el resultado. Inténtalo nuevamente.'
  } finally {
    guardandoResultado.value = false
  }
}

const calcularRiesgo = async () => {
  if (!validarFormulario()) {
    return
  }

  mostrarResultado.value = true

  await guardarResultadoCardiovascular()

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, 100)
}

const calcularNuevamente = () => {
  mostrarResultado.value = false
  mensajeGuardado.value = ''
}
</script>

<template>
  <main class="pagina-riesgo">
    <RouterLink to="/" class="boton-regresar">
      ← Volver al Inicio
    </RouterLink>

    <section class="contenedor-riesgo">
      <header class="encabezado-riesgo">
        <div class="icono-encabezado">♡</div>

        <h1>Riesgo Cardiovascular</h1>

        <p>
          Estima la probabilidad de sufrir un evento cardiovascular en los
          próximos 10 años.
        </p>
      </header>

      <div class="contenido-riesgo">
        <section class="tarjeta-advertencia">
          <div class="icono-advertencia">!</div>

          <div>
            <h2>Herramienta Educativa</h2>

            <p>
              Esta es una simulación simplificada con fines educativos. Las
              escalas clínicas reales suelen aplicarse a partir de los 40 años,
              pero esta herramienta ilustra cómo los hábitos en la juventud
              pueden impactar en el futuro.
            </p>
          </div>
        </section>

        <form
          v-if="!mostrarResultado"
          class="formulario-riesgo"
          @submit.prevent="calcularRiesgo"
        >
          <div class="opciones-sexo">
            <button
              type="button"
              class="boton-sexo"
              :class="{ activo: formulario.sexo === 'hombre' }"
              @click="formulario.sexo = 'hombre'"
            >
              Hombre
            </button>

            <button
              type="button"
              class="boton-sexo"
              :class="{ activo: formulario.sexo === 'mujer' }"
              @click="formulario.sexo = 'mujer'"
            >
              Mujer
            </button>
          </div>

          <div class="rejilla-campos">
            <div class="grupo-campo">
              <label for="edad">Edad</label>
              <input
                id="edad"
                v-model="formulario.edad"
                type="number"
                placeholder="Años"
              />
              <small v-if="errores.edad">{{ errores.edad }}</small>
            </div>

            <div class="grupo-campo">
              <label for="presion">Presión Sistólica</label>
              <input
                id="presion"
                v-model="formulario.presionSistolica"
                type="number"
                placeholder="mmHg"
              />
              <small v-if="errores.presionSistolica">
                {{ errores.presionSistolica }}
              </small>
            </div>

            <div class="grupo-campo">
              <label for="colesterol">Colesterol Total</label>
              <input
                id="colesterol"
                v-model="formulario.colesterolTotal"
                type="number"
                placeholder="mg/dL"
              />
              <small v-if="errores.colesterolTotal">
                {{ errores.colesterolTotal }}
              </small>
            </div>
          </div>

          <div class="rejilla-opciones">
            <label class="tarjeta-opcion">
              <input v-model="formulario.fumador" type="checkbox" />
              <span></span>
              Fumador activo
            </label>

            <label class="tarjeta-opcion">
              <input
                v-model="formulario.diagnosticoDiabetes"
                type="checkbox"
              />
              <span></span>
              Diagnóstico de Diabetes
            </label>
          </div>

          <button type="submit" class="boton-calcular">
            Estimar Riesgo Simulado
          </button>
        </form>

        <section v-else class="seccion-resultado">
          <p class="titulo-resultado">
            Estimación de riesgo a 10 años:
          </p>

          <div class="contenedor-resultado">
            <div class="circulo-riesgo" :class="resultado.tipo">
              {{ resultado.porcentaje }}%
            </div>

            <div class="etiqueta-riesgo" :class="resultado.tipo">
              {{ resultado.nivel }}
            </div>
          </div>

          <div class="tarjeta-recomendacion">
            <div class="icono-recomendacion">♡</div>

            <div>
              <h3>Recomendación General</h3>

              <p>
                Mantén una dieta equilibrada, realiza actividad física
                regularmente y evita el consumo de tabaco.
                <strong>Acude a controles periódicos</strong>
                para que un profesional evalúe tus marcadores con exámenes de
                laboratorio.
              </p>
            </div>
          </div>

          <p v-if="guardandoResultado" class="mensaje-guardado">
            Guardando resultado...
          </p>

          <p v-if="mensajeGuardado" class="mensaje-guardado">
            {{ mensajeGuardado }}
          </p>

          <button class="boton-reiniciar" @click="calcularNuevamente">
            ↻ Calcular nuevamente
          </button>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/EnCardio.css"></style>
