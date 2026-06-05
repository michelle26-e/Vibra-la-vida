<script setup>
// Este componente hijo recibe un objeto completo llamado resultado
const props = defineProps({
  resultado: {
    type: Object,
    required: true,
  },
})

// FTener el nombre del resultado por ejemplo del imc da calculadora de imc
const obtenerNombreResultado = () => {
  if (props.resultado.nombreHerramienta) {
    return props.resultado.nombreHerramienta
  }

  const nombres = {
    imc: 'Calculadora de IMC',
    calorias: 'Calculadora de Calorías',
    dass21: 'Evaluación DASS-21',
    insomnio: 'Escala de Insomnio de Atenas',
    riesgo_cardiometabolico: 'Encuesta de Riesgo Cardiometabólico',
    riesgo_cardiovascular: 'Encuesta de Riesgo Cardiovascular',
  }

  return nombres[props.resultado.tipo] || 'Resultado guardado'
}

// Función para obtener el ícono del resultado
const obtenerIconoResultado = () => {
  const iconos = {
    imc: 'IMC',
    calorias: 'CAL',
    dass21: 'D21',
    insomnio: 'AIS',
    riesgo_cardiometabolico: 'RC',
    riesgo_cardiovascular: 'RC',
  }

  return iconos[props.resultado.tipo] || 'OK'
}

// Tener clase de color del historial
const obtenerClaseHistorial = () => {
  const clases = {
    imc: 'historial-naranja',
    calorias: 'historial-verde',
    dass21: 'historial-cian',
    insomnio: 'historial-morado',
    riesgo_cardiometabolico: 'historial-rosa',
    riesgo_cardiovascular: 'historial-rosa',
  }

  return clases[props.resultado.tipo] || 'historial-azul'
}

// ostrar la fecha
const formatearFecha = () => {
  if (!props.resultado.fecha?.toDate) {
    return 'Fecha reciente'
  }

  return props.resultado.fecha.toDate().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Mostar del resultado
const obtenerDetalleResultado = () => {
  if (
    props.resultado.tipo === 'riesgo_cardiometabolico' ||
    props.resultado.tipo === 'riesgo_cardiovascular'
  ) {
    return `${props.resultado.nivelRiesgo || props.resultado.nivel || 'Resultado calculado'}${
      props.resultado.porcentaje ? ` · ${props.resultado.porcentaje}%` : ''
    }`
  }

  if (props.resultado.tipo === 'imc') {
    return `${props.resultado.categoria || 'IMC registrado'}${
      props.resultado.imc ? ` · IMC ${props.resultado.imc}` : ''
    }`
  }

  if (props.resultado.tipo === 'calorias') {
    return props.resultado.calorias
      ? `${props.resultado.calorias} kcal estimadas al día`
      : 'Estimación de calorías registrada'
  }

  if (props.resultado.tipo === 'dass21') {
    return `Depresión: ${props.resultado.nivelDepresion || 'N/A'} · Ansiedad: ${
      props.resultado.nivelAnsiedad || 'N/A'
    } · Estrés: ${props.resultado.nivelEstres || 'N/A'}`
  }

  if (props.resultado.tipo === 'insomnio') {
    return props.resultado.interpretacion || props.resultado.categoria || 'Resultado de sueño registrado'
  }

  return 'Registro guardado correctamente'
}
</script>

<template>
  <article class="item-historial">
    <div
      class="icono-historial"
      :class="obtenerClaseHistorial()"
    >
      {{ obtenerIconoResultado() }}
    </div>

    <div class="contenido-historial">
      <span>{{ formatearFecha() }}</span>
      <strong>{{ obtenerNombreResultado() }}</strong>
      <p>{{ obtenerDetalleResultado() }}</p>
    </div>
  </article>
</template>