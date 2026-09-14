<script setup>
import BotonVolver from '../components/BotonVolver.vue'
// ==========================================================
// MI EQUIPO DE SALUD - VIBRA LA VIDA
// ==========================================================

import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import {
  RouterLink,
  useRouter,
} from 'vue-router'

import {
  onAuthStateChanged,
} from 'firebase/auth'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

import {
  auth,
  db,
} from '../firebase/firebaseConfig'

import iconEquipo from '../assets/iconapp.png'

const router = useRouter()

const usuarioActual = ref(null)
const cargando = ref(true)
const profesionales = ref([])
const mensajeError = ref('')

let detenerObservador = null


// ----------------------------------------------------------
// OBTENER PROFESIONALES VINCULADOS
// ----------------------------------------------------------

const cargarEquipoSalud = async (
  pacienteUid
) => {
  try {
    mensajeError.value = ''

    // Buscamos todos los vínculos del paciente.
    // Filtramos "activo" en el cliente para evitar
    // requerir un índice compuesto durante esta simulación.
    const consulta = query(
      collection(
        db,
        'seguimiento_profesional'
      ),
      where(
        'pacienteUid',
        '==',
        pacienteUid
      )
    )

    const respuesta =
      await getDocs(consulta)

    const vinculosActivos =
      respuesta.docs
        .map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        )
        .filter(
          (vinculo) =>
            vinculo.estado === 'activo'
        )

    // Leemos la información pública/profesional
    // de cada profesional vinculado.
    const resultados =
      await Promise.all(
        vinculosActivos.map(
          async (vinculo) => {
            const referencia =
              doc(
                db,
                'perfiles_profesionales',
                vinculo.profesionalUid
              )

            const documento =
              await getDoc(
                referencia
              )

            if (!documento.exists()) {
              return null
            }

            const datos =
              documento.data()

            return {
              uid:
                vinculo.profesionalUid,

              vinculoId:
                vinculo.id,

              fechaVinculacion:
                vinculo.fechaVinculacion ||
                null,

              nombreCompleto:
                datos.nombreCompleto ||
                datos.nombre ||
                'Profesional de la salud',

              profesionRegistrada:
                datos.profesionRegistrada ||
                'Profesión no registrada',

              especialidad:
                datos.especialidad ||
                'Área de atención no especificada',

              cedulaProfesional:
                datos.cedulaProfesional ||
                '',

              cedulaVerificada:
                Boolean(
                  datos.cedulaVerificada
                ),

              formacionAdicional:
                Array.isArray(
                  datos.formacionAdicional
                )
                  ? datos.formacionAdicional
                  : [],

              tieneConsultorio:
                Boolean(
                  datos.tieneConsultorio
                ),

              consultorio:
                datos.consultorio ||
                null,
            }
          }
        )
      )

    profesionales.value =
      resultados.filter(Boolean)
  } catch (error) {
    console.error(
      'Error al cargar el equipo de salud:',
      error
    )

    mensajeError.value =
      'No fue posible cargar tu equipo de salud.'
  } finally {
    cargando.value = false
  }
}


// ----------------------------------------------------------
// FORMATO
// ----------------------------------------------------------

const obtenerIniciales = (
  nombre = ''
) => {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (parte) =>
        parte.charAt(0).toUpperCase()
    )
    .join('')
}

const formatearHorario = (
  profesional
) => {
  return (
    profesional.consultorio
      ?.horarioAtencion ||
    'Horario no registrado'
  )
}

const formatearUbicacion = (
  profesional
) => {
  return (
    profesional.consultorio
      ?.ubicacion ||
    'Ubicación no registrada'
  )
}

const formatearTelefono = (
  profesional
) => {
  return (
    profesional.consultorio
      ?.telefono ||
    'Teléfono no registrado'
  )
}

const cantidadProfesionales = computed(
  () => profesionales.value.length
)


// ----------------------------------------------------------
// SESIÓN
// ----------------------------------------------------------

onMounted(() => {
  detenerObservador =
    onAuthStateChanged(
      auth,
      async (usuario) => {
        if (!usuario) {
          router.push(
            '/iniciar-sesion'
          )
          return
        }

        usuarioActual.value =
          usuario

        await cargarEquipoSalud(
          usuario.uid
        )
      }
    )
})

onUnmounted(() => {
  if (detenerObservador) {
    detenerObservador()
  }
})
</script>


<template>
  <main class="pagina-equipo-salud">

    <BotonVolver />


    <section class="contenedor-equipo">

      <header class="encabezado-equipo">

        <div class="icono-principal-equipo">
          <img
            :src="iconEquipo"
            alt="Equipo de salud"
          />
        </div>


        <div>
          <span class="etiqueta-equipo">
            Acompañamiento
          </span>

          <h1>
            Mi equipo de salud
          </h1>

          <p>
            Aquí puedes consultar a los profesionales
            que actualmente están vinculados a tu seguimiento.
          </p>
        </div>

      </header>


      <section
        v-if="cargando"
        class="estado-equipo"
      >
        Cargando tu equipo de salud...
      </section>


      <section
        v-else-if="mensajeError"
        class="estado-equipo error"
      >
        {{ mensajeError }}
      </section>


      <section
        v-else-if="
          cantidadProfesionales === 0
        "
        class="estado-equipo vacio"
      >
        <h2>
          No tienes profesionales vinculados actualmente
        </h2>

        <p>
          Cuando un profesional sea vinculado a tu seguimiento,
          esta sección aparecerá con su información.
        </p>
      </section>


      <section
        v-else
        class="rejilla-profesionales"
      >

        <article
          v-for="
            profesional in profesionales
          "
          :key="profesional.uid"
          class="tarjeta-profesional"
        >

          <div class="cabecera-profesional">

            <div class="avatar-profesional">
              {{
                obtenerIniciales(
                  profesional.nombreCompleto
                )
              }}
            </div>


            <div class="identidad-profesional">

              <span
                v-if="
                  profesional.cedulaVerificada
                "
                class="estado-verificado"
              >
                Cédula verificada
              </span>

              <h2>
                {{
                  profesional.nombreCompleto
                }}
              </h2>

              <p class="profesion">
                {{
                  profesional.profesionRegistrada
                }}
              </p>

            </div>

          </div>


          <div class="datos-profesional">

            <div class="dato-equipo">
              <span>
                Área de atención
              </span>

              <strong>
                {{ profesional.especialidad }}
              </strong>
            </div>


            <div
              v-if="
                profesional.cedulaProfesional
              "
              class="dato-equipo"
            >
              <span>
                Cédula profesional
              </span>

              <strong>
                {{
                  profesional.cedulaProfesional
                }}
              </strong>
            </div>


            <div class="dato-equipo">
              <span>
                Ubicación
              </span>

              <strong>
                {{
                  formatearUbicacion(
                    profesional
                  )
                }}
              </strong>
            </div>


            <div class="dato-equipo">
              <span>
                Horario de atención
              </span>

              <strong>
                {{
                  formatearHorario(
                    profesional
                  )
                }}
              </strong>
            </div>


            <div class="dato-equipo">
              <span>
                Teléfono
              </span>

              <strong>
                {{
                  formatearTelefono(
                    profesional
                  )
                }}
              </strong>
            </div>

          </div>


          <div
            v-if="
              profesional.formacionAdicional.some(
                (estudio) =>
                  estudio &&
                  estudio.tipo &&
                  estudio.nombre
              )
            "
            class="formacion-resumen"
          >
            <span>
              Formación adicional
            </span>

            <p>
              {{
                profesional.formacionAdicional
                  .filter(
                    (estudio) =>
                      estudio &&
                      estudio.tipo &&
                      estudio.nombre
                  )
                  .slice(0, 2)
                  .map(
                    (estudio) =>
                      `${estudio.tipo}: ${estudio.nombre}`
                  )
                  .join(' · ')
              }}
            </p>
          </div>

        </article>

      </section>

    </section>

  </main>
</template>


<style scoped src="../assets/styles/miEquipoSalud.css"></style>
