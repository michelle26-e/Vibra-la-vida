// Dirección de la API de las calculadoras
const API_URL =
  import.meta.env.VITE_CALCULADORAS_API_URL || 'http://localhost:3001/api'

// Revisa la respuesta que manda la API
const manejarRespuesta = async (respuesta) => {
  let datos = null

  try {
    // Convierte la respuesta a JSON
    datos = await respuesta.json()
  } catch {
    throw new Error('La API no respondió con un formato válido.')
  }

  // Si la respuesta trae error, lo muestra
  if (!respuesta.ok) {
    const error = new Error(
      datos?.mensaje || 'Ocurrió un error al consultar la API.',
    )

    error.errores = datos?.errores || {}
    throw error
  }

  // Regresa los datos correctos
  return datos
}

// Envía los datos para calcular el IMC
export const calcularIMCApi = async (datosFormulario) => {
  const respuesta = await fetch(`${API_URL}/imc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosFormulario),
  })

  return manejarRespuesta(respuesta)
}

// Envía los datos para calcular las calorías
export const calcularCaloriasApi = async (datosFormulario) => {
  const respuesta = await fetch(`${API_URL}/calorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosFormulario),
  })

  return manejarRespuesta(respuesta)
}