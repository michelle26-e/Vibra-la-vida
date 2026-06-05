<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  onAuthStateChanged,
  updateEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'

import { auth, db } from '../firebase/firebaseConfig'
import { cerrarSesionUsuario, obtenerDatosUsuario } from '../services/authService'
import { obtenerResultadosUsuario } from '../services/resultadosService'
import ItemHistorial from '../components/ItemHistorial.vue'

const router = useRouter()

const usuarioActual = ref(null)
const datosUsuario = ref(null)
const cargando = ref(true)
const resultados = ref([])

const editandoPerfil = ref(false)

const formularioPerfil = ref({
  nombre: '',
  correo: '',
})

let detenerObservador = null

const nombreUsuario = computed(() => {
  const nombreCompleto = datosUsuario.value?.nombre || 'Usuario'
  const primerNombre = nombreCompleto.trim().split(' ')[0]

  return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1)
})

const inicialUsuario = computed(() => {
  return nombreUsuario.value.charAt(0).toUpperCase()
})

const correoUsuario = computed(() => {
  return usuarioActual.value?.email || datosUsuario.value?.correo || 'Sin correo registrado'
})

const imcRegistrados = computed(() => {
  return resultados.value.filter((item) => item.tipo === 'imc').length
})

const encuestasRealizadas = computed(() => {
  const tiposEncuesta = [
    'dass21',
    'insomnio',
    'riesgo_cardiometabolico',
    'riesgo_cardiovascular',
  ]

  return resultados.value.filter((item) => tiposEncuesta.includes(item.tipo)).length
})

const registrosGuardados = computed(() => {
  return resultados.value.length
})

const historialReciente = computed(() => {
  return [...resultados.value]
    .sort((a, b) => obtenerTiempoFecha(b.fecha) - obtenerTiempoFecha(a.fecha))
    .slice(0, 6)
})

const obtenerTiempoFecha = (fecha) => {
  if (fecha?.toDate) return fecha.toDate().getTime()
  if (fecha instanceof Date) return fecha.getTime()
  return 0
}

const formatearFecha = (fecha) => {
  if (!fecha?.toDate) return 'Fecha reciente'

  return fecha.toDate().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const obtenerNombreResultado = (resultado) => {
  if (resultado.nombreHerramienta) return resultado.nombreHerramienta

  const nombres = {
    imc: 'Calculadora de IMC',
    calorias: 'Calculadora de Calorías',
    dass21: 'Evaluación DASS-21',
    insomnio: 'Escala de Insomnio de Atenas',
    riesgo_cardiometabolico: 'Encuesta de Riesgo Cardiometabólico',
    riesgo_cardiovascular: 'Encuesta de Riesgo Cardiovascular',
  }

  return nombres[resultado.tipo] || 'Resultado guardado'
}

const obtenerIconoResultado = (tipo) => {
  const iconos = {
    imc: 'IMC',
    calorias: 'CAL',
    dass21: 'D21',
    insomnio: 'AIS',
    riesgo_cardiometabolico: 'RC',
    riesgo_cardiovascular: 'RC',
  }

  return iconos[tipo] || 'OK'
}

const obtenerClaseHistorial = (tipo) => {
  const clases = {
    imc: 'historial-naranja',
    calorias: 'historial-verde',
    dass21: 'historial-cian',
    insomnio: 'historial-morado',
    riesgo_cardiometabolico: 'historial-rosa',
    riesgo_cardiovascular: 'historial-rosa',
  }

  return clases[tipo] || 'historial-azul'
}

const obtenerDetalleResultado = (resultado) => {
  if (
    resultado.tipo === 'riesgo_cardiometabolico' ||
    resultado.tipo === 'riesgo_cardiovascular'
  ) {
    return `${resultado.nivelRiesgo || resultado.nivel || 'Resultado calculado'}${
      resultado.porcentaje ? ` · ${resultado.porcentaje}%` : ''
    }`
  }

  if (resultado.tipo === 'imc') {
    return `${resultado.categoria || 'IMC registrado'}${
      resultado.imc ? ` · IMC ${resultado.imc}` : ''
    }`
  }

  if (resultado.tipo === 'calorias') {
    return resultado.calorias
      ? `${resultado.calorias} kcal estimadas al día`
      : 'Estimación de calorías registrada'
  }

  if (resultado.tipo === 'dass21') {
    return `Depresión: ${resultado.nivelDepresion || 'N/A'} · Ansiedad: ${
      resultado.nivelAnsiedad || 'N/A'
    } · Estrés: ${resultado.nivelEstres || 'N/A'}`
  }

  if (resultado.tipo === 'insomnio') {
    return resultado.interpretacion || resultado.categoria || 'Resultado de sueño registrado'
  }

  return resultado.categoria || resultado.resultado || 'Registro guardado correctamente'
}

const cargarResultadosUsuario = async () => {
  resultados.value = await obtenerResultadosUsuario()
}

const activarEdicionPerfil = () => {
  formularioPerfil.value.nombre = datosUsuario.value?.nombre || ''
  formularioPerfil.value.correo = correoUsuario.value
  editandoPerfil.value = true
}

const cancelarEdicionPerfil = () => {
  editandoPerfil.value = false
}

const guardarPerfil = async () => {
  const usuario = auth.currentUser

  if (!usuario) return

  try {
    await updateDoc(doc(db, 'usuarios', usuario.uid), {
      nombre: formularioPerfil.value.nombre,
      correo: formularioPerfil.value.correo,
    })

    if (formularioPerfil.value.correo !== usuario.email) {
      await updateEmail(usuario, formularioPerfil.value.correo)
    }

    datosUsuario.value = {
      ...datosUsuario.value,
      nombre: formularioPerfil.value.nombre,
      correo: formularioPerfil.value.correo,
    }

    editandoPerfil.value = false
    alert('Perfil actualizado correctamente.')
  } catch (error) {
    console.error(error)

    if (error.code === 'auth/requires-recent-login') {
      alert('Por seguridad, vuelve a iniciar sesión para cambiar el correo.')
      return
    }

    alert('No se pudo actualizar el perfil. Inténtalo nuevamente.')
  }
}

const eliminarPerfil = async () => {
  const confirmar = confirm(
    '¿Seguro que deseas eliminar tu perfil? Esta acción no se puede deshacer.'
  )

  if (!confirmar) return

  const usuario = auth.currentUser

  if (!usuario) return

  const contrasena = prompt(
    'Por seguridad, escribe tu contraseña para eliminar tu cuenta.'
  )

  if (!contrasena) return

  try {
    const credencial = EmailAuthProvider.credential(usuario.email, contrasena)

    await reauthenticateWithCredential(usuario, credencial)

    await deleteDoc(doc(db, 'usuarios', usuario.uid))

    await deleteUser(usuario)

    alert('Perfil eliminado correctamente.')
    router.push('/')
  } catch (error) {
    console.error(error)

    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      alert('La contraseña es incorrecta.')
      return
    }

    alert('No se pudo eliminar el perfil. Inténtalo nuevamente.')
  }
}

const cerrarSesion = async () => {
  await cerrarSesionUsuario()
  router.push('/iniciar-sesion')
}

const irARuta = (ruta) => {
  router.push(ruta)
}

onMounted(() => {
  detenerObservador = onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      router.push('/iniciar-sesion')
      return
    }

    usuarioActual.value = usuario
    datosUsuario.value = await obtenerDatosUsuario(usuario.uid)
    await cargarResultadosUsuario()
    cargando.value = false
  })
})

onUnmounted(() => {
  if (detenerObservador) {
    detenerObservador()
  }
})
</script>

<template>
  <main class="pagina-cuenta">
    <RouterLink to="/" class="boton-volver">
      ← Volver al inicio
    </RouterLink>

    <section v-if="cargando" class="tarjeta-cargando">
      Cargando información de la cuenta...
    </section>

    <section v-else class="contenedor-cuenta">
      <section class="encabezado-cuenta">
        <div class="avatar-perfil">
          {{ inicialUsuario }}
        </div>

        <div>
          <span class="etiqueta-cuenta">Mi cuenta</span>
          <h1>Hola {{ nombreUsuario }}</h1>
          <p>
            Aquí puedes consultar tu información y acceder rápidamente a tus
            herramientas de autocuidado.
          </p>
        </div>
      </section>

      <section class="rejilla-cuenta">
        <article class="tarjeta-perfil">
          <h2>Datos de la cuenta</h2>

          <div v-if="!editandoPerfil">
            <div class="dato-perfil">
              <span>Nombre</span>
              <strong>{{ datosUsuario?.nombre || 'No registrado' }}</strong>
            </div>

            <div class="dato-perfil">
              <span>Correo electrónico</span>
              <strong>{{ correoUsuario }}</strong>
            </div>

            <button class="boton-secundario" @click="activarEdicionPerfil">
              Editar perfil
            </button>

            <button class="boton-eliminar-perfil" @click="eliminarPerfil">
              Eliminar perfil
            </button>
          </div>

          <form v-else class="formulario-perfil" @submit.prevent="guardarPerfil">
            <label>Nombre</label>
            <input v-model="formularioPerfil.nombre" type="text" required />

            <label>Correo electrónico</label>
            <input v-model="formularioPerfil.correo" type="email" required />

            <button class="boton-secundario" type="submit">
              Guardar cambios
            </button>

            <button
              class="boton-cancelar-perfil"
              type="button"
              @click="cancelarEdicionPerfil"
            >
              Cancelar
            </button>
          </form>
        </article>

        <article class="tarjeta-resumen">
          <h2>Resumen de bienestar</h2>

          <div class="rejilla-resumen">
            <div>
              <strong>{{ imcRegistrados }}</strong>
              <span>IMC registrados</span>
            </div>

            <div>
              <strong>{{ encuestasRealizadas }}</strong>
              <span>Encuestas realizadas</span>
            </div>

            <div>
              <strong>{{ registrosGuardados }}</strong>
              <span>Registros guardados</span>
            </div>
          </div>

          <p>
            Cuando guardes resultados de IMC, calorías o cuestionarios, aquí se
            mostrará un resumen de tu progreso.
          </p>
        </article>
      </section>

      <section class="seccion-herramientas">
        <h2>Herramientas rápidas</h2>

        <div class="rejilla-herramientas">
          <button @click="irARuta('/calculadora-imc')">
            <span>IMC</span>
            Calculadora de IMC
          </button>

          <button @click="irARuta('/calculadora-calorias')">
            <span>CAL</span>
            Calculadora de Calorías
          </button>

          <button @click="irARuta('/evaluacion-dass21')">
            <span>D21</span>
            Evaluación DASS-21
          </button>

          <button @click="irARuta('/escala-insomnio-atenas')">
            <span>AIS</span>
            Insomnio de Atenas
          </button>
        </div>
      </section>

      <section class="seccion-historial">
        <h2>Historial reciente</h2>

        <div v-if="historialReciente.length" class="lista-historial">
          <ItemHistorial
            v-for="item in historialReciente"
            :key="item.id"
            :resultado="item"
          />    
        </div>

        <div v-else class="tarjeta-vacia">
          <strong>Aún no hay resultados guardados</strong>
          <p>
            Más adelante podrás ver aquí tus evaluaciones, cálculos y avances
            registrados dentro de Vibra la Vida.
          </p>
        </div>
      </section>

      <button class="boton-cerrar-sesion" @click="cerrarSesion">
        Cerrar sesión
      </button>
    </section>
  </main>
</template>

<style scoped src="../assets/styles/MiCuenta.css"></style>