<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const formulario = ref({
  edad: 18,
  genero: 'hombre',
  altura: 170,
  peso: 60,
})

const errores = ref({})
const calculado = ref(false)

const resultadoIMC = ref({
  valor: '--',
  categoria: 'Sin calcular',
  clase: 'sin-calcular',
  descripcion: 'Ingresa tus datos y presiona el botón para calcular tu IMC.',
  posicionIndicador: 0,
})

const ocultarResultado = () => {
  calculado.value = false

  resultadoIMC.value = {
    valor: '--',
    categoria: 'Sin calcular',
    clase: 'sin-calcular',
    descripcion: 'Ingresa tus datos y presiona el botón para calcular tu IMC.',
    posicionIndicador: 0,
  }
}

const seleccionarGenero = (genero) => {
  formulario.value.genero = genero
  ocultarResultado()
}

const validarFormulario = () => {
  const nuevosErrores = {}

  const edad = Number(formulario.value.edad)
  const altura = Number(formulario.value.altura)
  const peso = Number(formulario.value.peso)

  if (!edad) {
    nuevosErrores.edad = 'Ingresa tu edad.'
  } else if (edad < 10 || edad > 100) {
    nuevosErrores.edad = 'Ingresa una edad válida.'
  }

  if (!altura) {
    nuevosErrores.altura = 'Ingresa tu altura.'
  } else if (altura < 100 || altura > 230) {
    nuevosErrores.altura = 'Ingresa una altura válida en centímetros.'
  }

  if (!peso) {
    nuevosErrores.peso = 'Ingresa tu peso.'
  } else if (peso < 25 || peso > 250) {
    nuevosErrores.peso = 'Ingresa un peso válido en kilogramos.'
  }

  errores.value = nuevosErrores

  return Object.keys(nuevosErrores).length === 0
}

const obtenerCategoriaIMC = (valorIMC) => {
  if (valorIMC < 18.5) {
    return {
      categoria: 'Bajo peso',
      clase: 'bajo-peso',
      descripcion: 'Un IMC menor a 18.5 se considera bajo peso en adultos.',
    }
  }

  if (valorIMC >= 18.5 && valorIMC < 25) {
    return {
      categoria: 'Normal',
      clase: 'normal',
      descripcion: 'Un IMC entre 18.5 y 24.9 se considera normal en adultos.',
    }
  }

  if (valorIMC >= 25 && valorIMC < 30) {
    return {
      categoria: 'Sobrepeso',
      clase: 'sobrepeso',
      descripcion: 'Un IMC entre 25 y 29.9 se considera sobrepeso en adultos.',
    }
  }

  return {
    categoria: 'Obesidad',
    clase: 'obesidad',
    descripcion: 'Un IMC de 30 o más se considera obesidad en adultos.',
  }
}

const calcularIMC = () => {
  if (!validarFormulario()) {
    calculado.value = false
    return
  }

  const alturaMetros = Number(formulario.value.altura) / 100
  const peso = Number(formulario.value.peso)

  const valorIMC = peso / (alturaMetros * alturaMetros)

  const datosCategoria = obtenerCategoriaIMC(valorIMC)

  const posicionIndicador = Math.min(
    100,
    Math.max(0, ((valorIMC - 15) / (40 - 15)) * 100),
  )

  resultadoIMC.value = {
    valor: valorIMC.toFixed(1),
    categoria: datosCategoria.categoria,
    clase: datosCategoria.clase,
    descripcion: datosCategoria.descripcion,
    posicionIndicador,
  }

  calculado.value = true
}
</script>

<template>
  <main class="pagina-imc">
    <RouterLink to="/" class="boton-regresar">
      ← Volver al Inicio
    </RouterLink>

    <section class="contenedor-imc">
      <div class="columna-formulario">
        <h1>Calculadora de IMC</h1>

        <p class="descripcion">
          El índice de masa corporal (IMC) es un número que se calcula con base
          en el peso y la estatura de la persona. Para la mayoría de las
          personas adultas, el IMC se usa como una referencia general para
          identificar categorías de peso que pueden relacionarse con problemas
          de salud.
        </p>

        <form class="formulario-imc" @submit.prevent="calcularIMC">
          <div class="fila-superior">
            <div class="grupo-campo">
              <label for="edad">Edad</label>

              <div class="campo-con-unidad">
                <input
                  id="edad"
                  v-model="formulario.edad"
                  type="number"
                  placeholder="Edad"
                  @input="ocultarResultado"
                />
                <span>años</span>
              </div>

              <small v-if="errores.edad">{{ errores.edad }}</small>
            </div>

            <div class="grupo-campo">
              <label>Género</label>

              <div class="selector-genero">
                <button
                  type="button"
                  :class="{ activo: formulario.genero === 'hombre' }"
                  @click="seleccionarGenero('hombre')"
                >
                  Hombre
                </button>

                <button
                  type="button"
                  :class="{ activo: formulario.genero === 'mujer' }"
                  @click="seleccionarGenero('mujer')"
                >
                  Mujer
                </button>
              </div>
            </div>
          </div>

          <div class="grupo-campo">
            <label for="altura">Altura</label>

            <div class="campo-con-unidad campo-largo">
              <input
                id="altura"
                v-model="formulario.altura"
                type="number"
                placeholder="Altura"
                @input="ocultarResultado"
              />
              <span>cm</span>
            </div>

            <small v-if="errores.altura">{{ errores.altura }}</small>
          </div>

          <div class="grupo-campo">
            <label for="peso">Peso</label>

            <div class="campo-con-unidad campo-largo">
              <input
                id="peso"
                v-model="formulario.peso"
                type="number"
                placeholder="Peso"
                @input="ocultarResultado"
              />
              <span>kg</span>
            </div>

            <small v-if="errores.peso">{{ errores.peso }}</small>
          </div>

          <button type="submit" class="boton-calcular">
            Calcular IMC
          </button>
        </form>
      </div>

      <div class="columna-resultado">
        <p class="texto-resultado">Tu IMC es de</p>

        <div class="valor-imc">
          {{ resultadoIMC.valor }}
          <span v-if="calculado">kg/m²</span>
        </div>

        <h2 :class="resultadoIMC.clase">
          {{ resultadoIMC.categoria }}
        </h2>

        <div class="barra-imc">
          <span
            v-if="calculado"
            class="indicador-imc"
            :style="{ left: `${resultadoIMC.posicionIndicador}%` }"
          ></span>
        </div>

        <div class="marcas-imc">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>

        <div class="tarjeta-informacion">
          <p>
            {{ resultadoIMC.descripcion }}
          </p>

          <p class="nota">
            *Nota: Para adolescentes menores de 19 años, los médicos suelen usar
            tablas de percentiles por edad y sexo. Esta calculadora utiliza la
            escala estándar como una referencia educativa general.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/CalculadoraIMC.css"></style>