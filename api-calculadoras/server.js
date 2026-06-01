// Express se usa para crear el servidor y las rutas de la API.
// Express podemos usar rutas como GET, POST, PUT y DELETE.
import express from 'express'

// CORS para que el frontend de Vue pueda consumir esta API.
// Sin CORS, el navegador puede bloquear las peticiones entre puertos diferentes.
import cors from 'cors'

// dotenv lee variables de entorno desde un archivo .env.
import dotenv from 'dotenv'

// Activamos dotenv para poder usar process.env.PORT si existe.
dotenv.config()

// Creamos la aplicación de Express.
const app = express()

const PORT = process.env.PORT || 3001

// Activamos CORS para permitir conexiones desde el frontend.
app.use(cors())

app.use(express.json())

// FUNCIONES AUXILIARES PARA IMC Y CALORÍAS
const convertirNumero = (valor) => {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

const validarRango = (valor, minimo, maximo) => {
  return valor !== null && valor >= minimo && valor <= maximo
}

const obtenerCategoriaIMC = (imc) => {
  if (imc < 18.5) {
    return {
      categoria: 'Bajo peso',
      clase: 'bajo-peso',
      descripcion: 'Un IMC menor a 18.5 se considera bajo peso en adultos.',
    }
  }

  if (imc >= 18.5 && imc < 25) {
    return {
      categoria: 'Normal',
      clase: 'normal',
      descripcion: 'Un IMC entre 18.5 y 24.9 se considera normal en adultos.',
    }
  }

  if (imc >= 25 && imc < 30) {
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

// RUTA PARA VERIFICAR QUE LA API FUNCIONA
app.get('/api/estado', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API de calculadoras funcionando correctamente',
  })
})

// RUTA PARA CALCULAR IMC
app.post('/api/imc', (req, res) => {
  const edad = convertirNumero(req.body.edad)
  const peso = convertirNumero(req.body.peso)
  const altura = convertirNumero(req.body.altura)
  const genero = req.body.genero || 'no especificado'

  const errores = {}

  if (!validarRango(edad, 10, 100)) {
    errores.edad = 'Ingresa una edad válida entre 10 y 100 años.'
  }

  if (!validarRango(peso, 25, 250)) {
    errores.peso = 'Ingresa un peso válido entre 25 y 250 kg.'
  }

  if (!validarRango(altura, 100, 230)) {
    errores.altura = 'Ingresa una altura válida entre 100 y 230 cm.'
  }

  if (Object.keys(errores).length > 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos inválidos',
      errores,
    })
  }

  const alturaMetros = altura / 100
  const imc = peso / (alturaMetros * alturaMetros)
  const datosCategoria = obtenerCategoriaIMC(imc)

  const posicionIndicador = Math.min(
    100,
    Math.max(0, ((imc - 15) / (40 - 15)) * 100),
  )

  return res.json({
    ok: true,
    datosEntrada: {
      edad,
      peso,
      altura,
      genero,
    },
    resultado: {
      valor: Number(imc.toFixed(1)),
      categoria: datosCategoria.categoria,
      clase: datosCategoria.clase,
      descripcion: datosCategoria.descripcion,
      posicionIndicador,
    },
  })
})

// RUTA PARA CALCULAR CALORÍAS
app.post('/api/calorias', (req, res) => {
  const sexo = req.body.sexo || 'hombre'
  const edad = convertirNumero(req.body.edad)
  const peso = convertirNumero(req.body.peso)
  const altura = convertirNumero(req.body.altura)
  const actividad = convertirNumero(req.body.actividad)

  const errores = {}

  if (!['hombre', 'mujer'].includes(sexo)) {
    errores.sexo = 'Selecciona un sexo válido.'
  }

  if (!validarRango(edad, 10, 100)) {
    errores.edad = 'Ingresa una edad válida entre 10 y 100 años.'
  }

  if (!validarRango(peso, 25, 250)) {
    errores.peso = 'Ingresa un peso válido entre 25 y 250 kg.'
  }

  if (!validarRango(altura, 100, 230)) {
    errores.altura = 'Ingresa una altura válida entre 100 y 230 cm.'
  }

  if (!validarRango(actividad, 1.2, 1.9)) {
    errores.actividad = 'Selecciona un nivel de actividad válido.'
  }

  if (Object.keys(errores).length > 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos inválidos',
      errores,
    })
  }

  let metabolismoBasal = 0

  if (sexo === 'hombre') {
    metabolismoBasal = 10 * peso + 6.25 * altura - 5 * edad + 5
  } else {
    metabolismoBasal = 10 * peso + 6.25 * altura - 5 * edad - 161
  }

  const caloriasMantenimiento = metabolismoBasal * actividad

  return res.json({
    ok: true,
    datosEntrada: {
      sexo,
      edad,
      peso,
      altura,
      actividad,
    },
    resultado: {
      metabolismoBasal: Math.round(metabolismoBasal),
      caloriasMantenimiento: Math.round(caloriasMantenimiento),
      caloriasPerderPeso: Math.round(caloriasMantenimiento - 400),
      caloriasGanarPeso: Math.round(caloriasMantenimiento + 300),
    },
  })
})

// CRUD DE RESULTADOS PARA PROBAR EN POSTMAN
let resultados = []
let siguienteId = 1

const buscarResultadoPorId = (id) => {
  const idNumero = Number(id)

  return resultados.find((resultado) => resultado.id === idNumero)
}

// READ - OBTENER TODOS LOS RESULTADOS
app.get('/api/resultados', (req, res) => {
  res.json({
    ok: true,
    total: resultados.length,
    resultados,
  })
})

// READ - OBTENER UN RESULTADO POR ID
app.get('/api/resultados/:id', (req, res) => {
  const resultado = buscarResultadoPorId(req.params.id)

  if (!resultado) {
    return res.status(404).json({
      ok: false,
      mensaje: 'Resultado no encontrado.',
    })
  }

  return res.json({
    ok: true,
    resultado,
  })
})

// CREATE - CREAR UN NUEVO RESULTADO
app.post('/api/resultados', (req, res) => {
  const { tipo, titulo, valor, categoria, descripcion } = req.body

  const errores = {}

  if (!tipo || typeof tipo !== 'string') {
    errores.tipo = 'El tipo de resultado es obligatorio.'
  }

  if (!titulo || typeof titulo !== 'string') {
    errores.titulo = 'El título del resultado es obligatorio.'
  }

  if (Object.keys(errores).length > 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos inválidos',
      errores,
    })
  }

  const nuevoResultado = {
    id: siguienteId,
    tipo,
    titulo,
    valor: valor ?? null,
    categoria: categoria || 'Sin categoría',
    descripcion: descripcion || 'Sin descripción',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
  }

  resultados.push(nuevoResultado)
  siguienteId += 1

  return res.status(201).json({
    ok: true,
    mensaje: 'Resultado creado correctamente.',
    resultado: nuevoResultado,
  })
})

// UPDATE - ACTUALIZAR UN RESULTADO
app.put('/api/resultados/:id', (req, res) => {
  const resultado = buscarResultadoPorId(req.params.id)

  if (!resultado) {
    return res.status(404).json({
      ok: false,
      mensaje: 'Resultado no encontrado.',
    })
  }

  const { tipo, titulo, valor, categoria, descripcion } = req.body

  resultado.tipo = tipo || resultado.tipo
  resultado.titulo = titulo || resultado.titulo
  resultado.valor = valor ?? resultado.valor
  resultado.categoria = categoria || resultado.categoria
  resultado.descripcion = descripcion || resultado.descripcion
  resultado.fechaActualizacion = new Date().toISOString()

  return res.json({
    ok: true,
    mensaje: 'Resultado actualizado correctamente.',
    resultado,
  })
})

// DELETE - ELIMINAR UN RESULTADO
app.delete('/api/resultados/:id', (req, res) => {
  const idNumero = Number(req.params.id)

  const indiceResultado = resultados.findIndex(
    (resultado) => resultado.id === idNumero,
  )

  if (indiceResultado === -1) {
    return res.status(404).json({
      ok: false,
      mensaje: 'Resultado no encontrado.',
    })
  }

  const resultadoEliminado = resultados.splice(indiceResultado, 1)

  return res.json({
    ok: true,
    mensaje: 'Resultado eliminado correctamente.',
    resultado: resultadoEliminado[0],
  })
})

// RUTA PARA MANEJAR ERRORES 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: 'Ruta no encontrada',
  })
})

// LEVANTAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`API de calculadoras corriendo en http://localhost:${PORT}`)
})