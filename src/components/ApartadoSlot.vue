<script setup>
// Este componente recibe datos simples desde el componente padre
defineProps({
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="apartado-slot">
    <div class="encabezado-apartado">
      <h2>{{ titulo }}</h2>

      <p v-if="descripcion">
        {{ descripcion }}
      </p>
    </div>

    <div class="contenido-slot">
      <slot></slot>
    </div>
  </section>
</template>