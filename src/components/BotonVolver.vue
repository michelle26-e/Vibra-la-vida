<script setup>

// ==========================================================
// BOTÓN VOLVER - VIBRA LA VIDA
// ==========================================================
//
// Este botón NO manda directamente al "/".
//
// Usa el historial del navegador para regresar
// a la pantalla anterior.
//
// Esto permite conservar la posición donde
// estaba el usuario en el Home.
// ==========================================================

import {
  useRouter,
} from 'vue-router'


const router =
  useRouter()


// ==========================================================
// VOLVER
// ==========================================================

const volver = () => {

  // Si existe historial anterior,
  // regresamos normalmente.
  if (
    window.history.length > 1
  ) {

    router.back()

    return

  }


  // En caso de que el usuario haya entrado
  // directamente mediante una URL,
  // regresamos al Home.
  router.push('/')

}

</script>


<template>

  <button
    type="button"
    class="boton-volver-global"
    @click="volver"
  >

    ← Volver

  </button>

</template>


<style scoped>

.boton-volver-global {

  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-height: 42px;

  padding:
    0
    17px;


  border:
    1px solid
    #d9e6e9;

  border-radius:
    13px;


  color:
    #0f6e83;

  background:
    #ffffff;


  font-size:
    13px;

  font-weight:
    850;

  font-family:
    inherit;


  cursor:
    pointer;


  box-shadow:
    0 5px 14px
    rgba(
      7,
      58,
      78,
      0.05
    );


  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

}


.boton-volver-global:hover {

  color:
    #ffffff;

  background:
    #0f6e83;

  transform:
    translateY(-1px);

}

</style>