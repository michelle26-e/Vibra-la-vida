
<script setup>
// Importamos lo que necesitamos para que la página funcione
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { calcularCaloriasApi } from '../services/calculadorasApi'
import { guardarResultadoBienestar } from '../services/resultadosService'

// Guardamos los datos que el usuario ingresa en el formulario
const formulario = ref({
  sexo: 'hombre',
  edad: '',
  peso: '',
  altura: '',
  actividad: '1.2',
})

const errores = ref({})
const calculado = ref(false)
const calculando = ref(false)
const mensajeGuardado = ref('')

// Aquí guardamos los resultados del cálculo de calorías
const resultadoCalorias = ref({
  metabolismoBasal: 0,
  caloriasMantenimiento: 0,
  caloriasPerderPeso: 0,
  caloriasGanarPeso: 0,
})

const nivelesActividad = [
  {
    valor: '1.2',
    texto: 'Sedentario (Poco o ningún ejercicio)',
  },
  {
    valor: '1.375',
    texto: 'Ligero (Ejercicio ligero 1-3 días/sem)',
  },
  {
    valor: '1.55',
    texto: 'Moderado (Ejercicio moderado 3-5 días/sem)',
  },
  {
    valor: '1.725',
    texto: 'Activo (Ejercicio fuerte 6-7 días/sem)',
  },
  {
    valor: '1.9',
    texto: 'Muy Activo (Atleta, trabajo físico)',
  },
]

const ocultarResultado = () => {
  calculado.value = false
  mensajeGuardado.value = ''
  errores.value = {}
}

const seleccionarSexo = (sexo) => {
  formulario.value.sexo = sexo
  ocultarResultado()
}

// Revisamos que los datos ingresados sean válidos
const validarFormulario = () => {
  const nuevosErrores = {}

  const edad = Number(formulario.value.edad)
  const peso = Number(formulario.value.peso)
  const altura = Number(formulario.value.altura)

  if (!edad) {
    nuevosErrores.edad = 'Ingresa tu edad.'
  } else if (edad < 10 || edad > 100) {
    nuevosErrores.edad = 'Ingresa una edad válida.'
  }

  if (!peso) {
    nuevosErrores.peso = 'Ingresa tu peso.'
  } else if (peso < 25 || peso > 250) {
    nuevosErrores.peso = 'Ingresa un peso válido en kilogramos.'
  }

  if (!altura) {
    nuevosErrores.altura = 'Ingresa tu altura.'
  } else if (altura < 100 || altura > 230) {
    nuevosErrores.altura = 'Ingresa una altura válida en centímetros.'
  }

  errores.value = nuevosErrores

  return Object.keys(nuevosErrores).length === 0
}

// Guardamos el resultado en la cuenta del usuario
const guardarResultadoCalorias = async () => {
  mensajeGuardado.value = ''

  const nivelActividad = nivelesActividad.find(
    (nivel) => nivel.valor === formulario.value.actividad,
  )

  try {
    await guardarResultadoBienestar({
      tipo: 'calorias',
      nombreHerramienta: 'Calculadora de Calorías',
      sexo: formulario.value.sexo,
      edad: Number(formulario.value.edad),
      pesoKg: Number(formulario.value.peso),
      alturaCm: Number(formulario.value.altura),
      actividad: nivelActividad?.texto || formulario.value.actividad,
      metabolismoBasal: resultadoCalorias.value.metabolismoBasal,
      caloriasMantenimiento: resultadoCalorias.value.caloriasMantenimiento,
      caloriasPerderPeso: resultadoCalorias.value.caloriasPerderPeso,
      caloriasGanarPeso: resultadoCalorias.value.caloriasGanarPeso,
      resultado: `${resultadoCalorias.value.caloriasMantenimiento} kcal/día`,
      categoria: 'Gasto energético estimado',
    })

    mensajeGuardado.value = 'Resultado guardado correctamente en Mi cuenta.'
  } catch (error) {
    console.error('Error al guardar el resultado de calorías:', error)

    if (error.message?.includes('iniciar sesión')) {
      mensajeGuardado.value =
        'Resultado calculado. Inicia sesión para guardar este resultado en Mi cuenta.'
      return
    }

    mensajeGuardado.value =
      'Resultado calculado, pero no se pudo guardar en este momento.'
  }
}

// Función principal que calcula las calorías necesarias diarias
const calcularCalorias = async () => {
  if (!validarFormulario()) {
    calculado.value = false
    return
  }

  calculando.value = true
  mensajeGuardado.value = ''

  try {
    const respuesta = await calcularCaloriasApi({
      sexo: formulario.value.sexo,
      edad: Number(formulario.value.edad),
      peso: Number(formulario.value.peso),
      altura: Number(formulario.value.altura),
      actividad: Number(formulario.value.actividad),
    })

    resultadoCalorias.value = {
      metabolismoBasal: respuesta.resultado.metabolismoBasal,
      caloriasMantenimiento: respuesta.resultado.caloriasMantenimiento,
      caloriasPerderPeso: respuesta.resultado.caloriasPerderPeso,
      caloriasGanarPeso: respuesta.resultado.caloriasGanarPeso,
    }

    calculado.value = true
    await guardarResultadoCalorias()
  } catch (error) {
    console.error('Error al calcular calorías desde la API:', error)

    if (error.errores) {
      errores.value = error.errores
    }

    calculado.value = false
    mensajeGuardado.value =
      'No se pudieron calcular las calorías. Verifica que la API esté activa.'
  } finally {
    calculando.value = false
  }
}
</script>

<template>
  <main class="pagina-calorias">
    <RouterLink to="/" class="boton-regresar">
      ← Volver al Inicio
    </RouterLink>

    <section class="contenedor-calorias">
      <header class="encabezado-calorias">
        <div class="icono-encabezado">⌁</div>

        <h1>Calculadora de Calorías</h1>

        <p>
          Estima tu Gasto Energético Diario Total para mantener, perder o ganar
          peso.
        </p>
      </header>

      <div class="contenido-calorias">
        <form class="formulario-calorias" @submit.prevent="calcularCalorias">
          <div class="opciones-sexo">
            <button
              type="button"
              class="boton-sexo"
              :class="{ activo: formulario.sexo === 'hombre' }"
              @click="seleccionarSexo('hombre')"
            >
              Hombre
            </button>

            <button
              type="button"
              class="boton-sexo"
              :class="{ activo: formulario.sexo === 'mujer' }"
              @click="seleccionarSexo('mujer')"
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
                @input="ocultarResultado"
              />
              <small v-if="errores.edad">{{ errores.edad }}</small>
            </div>

            <div class="grupo-campo">
              <label for="peso">Peso (kg)</label>
              <input
                id="peso"
                v-model="formulario.peso"
                type="number"
                placeholder="kg"
                @input="ocultarResultado"
              />
              <small v-if="errores.peso">{{ errores.peso }}</small>
            </div>

            <div class="grupo-campo">
              <label for="altura">Altura (cm)</label>
              <input
                id="altura"
                v-model="formulario.altura"
                type="number"
                placeholder="cm"
                @input="ocultarResultado"
              />
              <small v-if="errores.altura">{{ errores.altura }}</small>
            </div>
          </div>

          <div class="grupo-campo">
            <label for="actividad">Nivel de Actividad Física</label>

            <select
              id="actividad"
              v-model="formulario.actividad"
              class="selector-actividad"
              @change="ocultarResultado"
            >
              <option
                v-for="nivel in nivelesActividad"
                :key="nivel.valor"
                :value="nivel.valor"
              >
                {{ nivel.texto }}
              </option>
            </select>
          </div>

          <button
            type="submit"
            class="boton-calcular"
            :disabled="calculando"
          >
            {{ calculando ? 'Calculando...' : 'Calcular Calorías' }}
          </button>
        </form>

        <section v-if="calculado" class="seccion-resultado">
          <h2>Resultado estimado</h2>

          <div class="resultado-principal">
            <span>{{ resultadoCalorias.caloriasMantenimiento }}</span>
            <p>calorías al día para mantener tu peso</p>
          </div>

          <div class="rejilla-resultados">
            <div class="tarjeta-resultado">
              <h3>Metabolismo basal</h3>
              <strong>{{ resultadoCalorias.metabolismoBasal }} kcal</strong>
              <p>Energía aproximada que tu cuerpo usa en reposo.</p>
            </div>

            <div class="tarjeta-resultado">
              <h3>Para perder peso</h3>
              <strong>{{ resultadoCalorias.caloriasPerderPeso }} kcal</strong>
              <p>Estimación con déficit moderado aproximado.</p>
            </div>

            <div class="tarjeta-resultado">
              <h3>Para ganar peso</h3>
              <strong>{{ resultadoCalorias.caloriasGanarPeso }} kcal</strong>
              <p>Estimación con superávit ligero aproximado.</p>
            </div>
          </div>

          <p class="nota-resultado">
            Esta herramienta es educativa. Las necesidades reales pueden variar
            según salud, composición corporal, crecimiento, medicamentos y otros
            factores. En adolescentes, lo ideal es consultar a un profesional.
          </p>

          <p v-if="mensajeGuardado" class="mensaje-guardado">
            {{ mensajeGuardado }}
          </p>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/CalculadoraCalorias.css"></style>
