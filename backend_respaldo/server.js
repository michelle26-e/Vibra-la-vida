const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PUERTO = process.env.PORT || 3000

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)

app.use(express.json())

const esNumeroValido = (valor, minimo, maximo) => {
  const numero = Number(valor)
  return !Number.isNaN(numero) && numero >= minimo && numero <= maximo
}

const obtenerCategoriaIMC = (imc) => {
  if (imc < 18.5) {
    return {
      categoria: 'Bajo peso',
      descripcion: 'Un IMC menor a 18.5 se considera bajo peso en adultos.',
    }
  }

  if (imc >= 18.5 && imc < 25) {
    return {
      categoria: 'Normal',
      descripcion: 'Un IMC entre 18.5 y 24.9 se considera normal en adultos.',
    }
  }

  if (imc >= 25 && imc < 30) {
    return {
      categoria: 'Sobrepeso',
      descripcion: 'Un IMC entre 25 y 29.9 se considera sobrepeso en adultos.',
    }
  }

  return {
    categoria: 'Obesidad',
    descripcion: 'Un IMC de 30 o más se considera obesidad en adultos.',
  }
}

app.get('/api/salud', (req, res) => {
  res.json({
    mensaje: 'API de Vibra la Vida funcionando correctamente',
  })
})

app.post('/api/imc', (req, res) => {
  const { edad, genero, altura, peso } = req.body

  if (!esNumeroValido(edad, 10, 100)) {
    return res.status(400).json({
      error: 'Ingresa una edad válida.',
    })
  }

  if (!esNumeroValido(altura, 100, 230)) {
    return res.status(400).json({
      error: 'Ingresa una altura válida en centímetros.',
    })
  }

  if (!esNumeroValido(peso, 25, 250)) {
    return res.status(400).json({
      error: 'Ingresa un peso válido en kilogramos.',
    })
  }

  const alturaMetros = Number(altura) / 100
  const pesoKg = Number(peso)

  const imc = pesoKg / (alturaMetros * alturaMetros)
  const imcRedondeado = Number(imc.toFixed(1))
  const resultado = obtenerCategoriaIMC(imcRedondeado)

  res.json({
    edad: Number(edad),
    genero,
    altura: Number(altura),
    peso: Number(peso),
    imc: imcRedondeado,
    categoria: resultado.categoria,
    descripcion: resultado.descripcion,
    nota:
      'Esta calculadora es una herramienta educativa. En adolescentes, la valoración ideal debe realizarse con percentiles por edad y sexo.',
  })
})

app.post('/api/calorias', (req, res) => {
  const { sexo, edad, peso, altura, actividad } = req.body

  if (sexo !== 'hombre' && sexo !== 'mujer') {
    return res.status(400).json({
      error: 'Selecciona un sexo válido.',
    })
  }

  if (!esNumeroValido(edad, 10, 100)) {
    return res.status(400).json({
      error: 'Ingresa una edad válida.',
    })
  }

  if (!esNumeroValido(peso, 25, 250)) {
    return res.status(400).json({
      error: 'Ingresa un peso válido en kilogramos.',
    })
  }

  if (!esNumeroValido(altura, 100, 230)) {
    return res.status(400).json({
      error: 'Ingresa una altura válida en centímetros.',
    })
  }

  const factoresActividad = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9,
  }

  const factorActividad =
    factoresActividad[actividad] || Number(actividad)

  if (!factorActividad || factorActividad < 1.1 || factorActividad > 2) {
    return res.status(400).json({
      error: 'Selecciona un nivel de actividad física válido.',
    })
  }

  const edadNumero = Number(edad)
  const pesoNumero = Number(peso)
  const alturaNumero = Number(altura)

  let metabolismoBasal = 0

  if (sexo === 'hombre') {
    metabolismoBasal = 10 * pesoNumero + 6.25 * alturaNumero - 5 * edadNumero + 5
  } else {
    metabolismoBasal = 10 * pesoNumero + 6.25 * alturaNumero - 5 * edadNumero - 161
  }

  const caloriasMantenimiento = metabolismoBasal * factorActividad

  res.json({
    sexo,
    edad: edadNumero,
    peso: pesoNumero,
    altura: alturaNumero,
    actividad,
    factorActividad,
    metabolismoBasal: Math.round(metabolismoBasal),
    caloriasMantenimiento: Math.round(caloriasMantenimiento),
    caloriasPerderPeso: Math.round(caloriasMantenimiento - 400),
    caloriasGanarPeso: Math.round(caloriasMantenimiento + 300),
    nota:
      'Esta estimación es educativa. Las necesidades reales pueden variar según salud, crecimiento, composición corporal y otros factores.',
  })
})

app.listen(PUERTO, () => {
  console.log(`API de Vibra la Vida corriendo en http://localhost:${PUERTO}`)
})