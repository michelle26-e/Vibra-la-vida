const API_URL =
  import.meta.env.VITE_CALCULADORAS_API_URL || 'http://localhost:3001/api'

const manejarRespuesta = async (respuesta) => {
  let datos = null

  try {
    datos = await respuesta.json()
  } catch {
    throw new Error('La API no respondió con un formato válido.')
  }

  if (!respuesta.ok) {
    const error = new Error(
      datos?.mensaje || 'Ocurrió un error al consultar la API.',
    )

    error.errores = datos?.errores || {}
    throw error
  }

  return datos
}

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
