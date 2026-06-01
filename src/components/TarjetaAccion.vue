<script setup>
// Este componente hijo recibe los datos de cada tarjeta desde HomeView.vue
defineProps({
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

// Avisa al componente padre cuando se hace clic en la tarjeta
const emit = defineEmits(['abrir'])
</script>

<template>
  <div
    class="tarjeta-accion"
    :class="`tarjeta-${color}`"
    @click="emit('abrir')"
  >
    <h3>{{ titulo }}</h3>

    <p>{{ texto }}</p>

    <button
      type="button"
      :class="`boton-${color}`"
      @click.stop="emit('abrir')"
    >
      {{ boton }}
      <span>→</span>
    </button>
  </div>
</template>

<style scoped>
/* Estilo general de todas las tarjetas */
.tarjeta-accion {
  padding: 28px 30px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

/* Movimiento suave al pasar el mouse */
.tarjeta-accion:hover {
  transform: translateY(-3px);
}

/* Título */
.tarjeta-accion h3 {
  margin: 0 0 14px;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
}

/* Descripción */
.tarjeta-accion p {
  margin: 0 0 22px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

/* Botón tipo enlace, sin borde ni recuadro */
.tarjeta-accion button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.tarjeta-accion button:hover {
  transform: translateX(4px);
  opacity: 0.82;
}

/* =========================
   COLORES DE LAS TARJETAS
   ========================= */

/* Rosa */
.tarjeta-rosa {
  background: #fff5f7;
  border-color: #fecdd3;
}

.tarjeta-rosa:hover {
  border-color: #fb7185;
  box-shadow: 0 14px 28px rgba(225, 29, 72, 0.10);
}

.boton-rosa {
  color: #e11d48;
}

/* Naranja */
.tarjeta-naranja {
  background: #fffaf5;
  border-color: #fed7aa;
}

.tarjeta-naranja:hover {
  border-color: #fdba74;
  box-shadow: 0 14px 28px rgba(249, 115, 22, 0.10);
}

.boton-naranja {
  color: #ea580c;
}

/* Verde */
.tarjeta-verde {
  background: #f6fdf8;
  border-color: #bbf7d0;
}

.tarjeta-verde:hover {
  border-color: #86efac;
  box-shadow: 0 14px 28px rgba(22, 163, 74, 0.10);
}

.boton-verde {
  color: #16a34a;
}

/* Cian */
.tarjeta-cian {
  background: #f3fdff;
  border-color: #a5f3fc;
}

.tarjeta-cian:hover {
  border-color: #67e8f9;
  box-shadow: 0 14px 28px rgba(6, 182, 212, 0.10);
}

.boton-cian {
  color: #0891b2;
}

/* Morado */
.tarjeta-morado {
  background: #faf8ff;
  border-color: #ddd6fe;
}

.tarjeta-morado:hover {
  border-color: #c4b5fd;
  box-shadow: 0 14px 28px rgba(124, 58, 237, 0.10);
}

.boton-morado {
  color: #7c3aed;
}

/* Azul */
.tarjeta-azul {
  background: #f5f9ff;
  border-color: #bfdbfe;
}

.tarjeta-azul:hover {
  border-color: #93c5fd;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.10);
}

.boton-azul {
  color: #2563eb;
}

/* Rojo */
.tarjeta-rojo {
  background: #fff6f6;
  border-color: #fecaca;
}

.tarjeta-rojo:hover {
  border-color: #fca5a5;
  box-shadow: 0 14px 28px rgba(239, 68, 68, 0.10);
}

.boton-rojo {
  color: #dc2626;
}
</style>
