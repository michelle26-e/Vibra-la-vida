<script setup>
// Este componente hijo recibe datos desde HomeView.vue
defineProps({
  icono: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  texto: {
    type: String,
    required: true,
  },
  boton: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
})

// Avisa al componente padre cuando se da click
const emit = defineEmits(['abrir'])
</script>

<template>
  <div
    class="tarjeta-accion"
    :class="`tarjeta-${color}`"
    @click="emit('abrir')"
  >
    <div class="icono-tarjeta" :class="color">
      {{ icono }}
    </div>

    <h3>{{ titulo }}</h3>

    <p>{{ texto }}</p>

    <button :class="color">
      {{ boton }}
      <span>→</span>
    </button>
  </div>
</template>