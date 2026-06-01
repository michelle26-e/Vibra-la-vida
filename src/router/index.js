// Importa las rutas de Vue
import { createRouter, createWebHistory } from 'vue-router'

// Importa las páginas
import HomeView from '../views/HomeView.vue'
import RiesgoCardiovascularView from '../views/EnCardio.vue'
import CalculadoraIMCView from '../views/CalculadoraIMC.vue'
import CalculadoraCaloriasView from '../views/CalculadoraCalorias.vue'
import EvaluacionDass21View from '../views/EvaDASS-21.vue'
import EscalaInsomnioAtenasView from '../views/EsInsomnioAtenas.vue'
import IniciarSesionView from '../views/IniciarSesion.vue'
import CrearCuentaView from '../views/CrearCuenta.vue'
import MiCuentaView from '../views/MiCuenta.vue'
import PanelDoctor from '../views/PanelDoctor.vue'
import RegistroDoctor from '../views/RegistroDoctor.vue'

// Crea las rutas del proyecto
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'inicio',
      component: HomeView,
    },
    {
      path: '/riesgo-cardiovascular',
      name: 'riesgo-cardiovascular',
      component: RiesgoCardiovascularView,
    },
    {
      path: '/calculadora-imc',
      name: 'calculadora-imc',
      component: CalculadoraIMCView,
    },
    {
      path: '/calculadora-calorias',
      name: 'calculadora-calorias',
      component: CalculadoraCaloriasView,
    },
    {
      path: '/evaluacion-dass21',
      name: 'evaluacion-dass21',
      component: EvaluacionDass21View,
    },
    {
      path: '/escala-insomnio-atenas',
      name: 'escala-insomnio-atenas',
      component: EscalaInsomnioAtenasView,
    },
    {
      path: '/iniciar-sesion',
      name: 'iniciar-sesion',
      component: IniciarSesionView,
    },
    {
      path: '/registro',
      name: 'registro',
      component: CrearCuentaView,
    },
    {
      path: '/mi-cuenta',
      name: 'mi-cuenta',
      component: MiCuentaView,
    },
    {
      path: '/registro-doctor',
      name: 'registro-doctor',
      component: RegistroDoctor,
    },
    {
      path: '/doctor',
      name: 'doctor',
      component: PanelDoctor,
    },
  ],
})

// Exporta las rutas
export default router