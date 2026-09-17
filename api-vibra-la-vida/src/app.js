// ============================================================================
// APP.JS - VIBRA LA VIDA
// ============================================================================


// ============================================================================
// IMPORTACIONES
// ============================================================================

const express = require("express");
const cors = require("cors");


// ============================================================================
// IMPORTAR RUTAS
// ============================================================================

const authRoutes =
  require("./routes/auth.routes");

const userRoutes =
  require("./routes/user.routes");

const resultsRoutes =
  require("./routes/results.routes");

const healthRoutes =
  require("./routes/health.routes");

const historyRoutes =
  require("./routes/history.routes");

const doctorRoutes =
  require("./routes/doctor.routes");

const calculadorasRoutes =
  require("./routes/calculadoras.routes");

// Rutas para citas médicas.
const citasRoutes =
  require("./routes/citas.routes");


// ============================================================================
// CREAR APLICACIÓN EXPRESS
// ============================================================================

const app =
  express();


// ============================================================================
// MIDDLEWARES GLOBALES
// ============================================================================

// Permite recibir JSON en el body.
app.use(
  express.json()
);

// Permite peticiones desde Android, Web, etc.
app.use(
  cors()
);


// ============================================================================
// RUTA PRINCIPAL
// ============================================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "API RESTful de Vibra la Vida funcionando con Firebase.",
    });
  }
);


// ============================================================================
// STATUS
// ============================================================================

app.get(
  "/api/status",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Servidor activo.",
      timestamp:
        new Date().toISOString(),
    });
  }
);


// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================


// ---------------------------------------------------------------------------
// AUTENTICACIÓN
// ---------------------------------------------------------------------------

app.use(
  "/api/auth",
  authRoutes
);


// ---------------------------------------------------------------------------
// USUARIOS
// ---------------------------------------------------------------------------

app.use(
  "/api/users",
  userRoutes
);


// ---------------------------------------------------------------------------
// RESULTADOS
// ---------------------------------------------------------------------------

app.use(
  "/api/results",
  resultsRoutes
);


// ---------------------------------------------------------------------------
// HEALTH CONNECT
// ---------------------------------------------------------------------------

app.use(
  "/api/health-connect",
  healthRoutes
);


// ---------------------------------------------------------------------------
// HISTORIAL
// ---------------------------------------------------------------------------

app.use(
  "/api/history",
  historyRoutes
);


// ---------------------------------------------------------------------------
// PROFESIONALES / VERIFICACIÓN DE CÉDULA
// ---------------------------------------------------------------------------

app.use(
  "/api/doctores",
  doctorRoutes
);


// ---------------------------------------------------------------------------
// CALCULADORAS
// ---------------------------------------------------------------------------

app.use(
  "/api/calculadoras",
  calculadorasRoutes
);


// ---------------------------------------------------------------------------
// CITAS MÉDICAS
// ---------------------------------------------------------------------------
//
// GET    /api/citas
// POST   /api/citas
//
// ACCIONES DEL PACIENTE:
// POST   /api/citas/:id/confirmar
// POST   /api/citas/:id/solicitar-reagenda
// POST   /api/citas/:id/cancelar
//
// ACCIONES DEL PROFESIONAL:
// PUT    /api/citas/:id
// DELETE /api/citas/:id
//
// ---------------------------------------------------------------------------

app.use(
  "/api/citas",
  citasRoutes
);


// ============================================================================
// RUTA NO ENCONTRADA
// ============================================================================
//
// IMPORTANTE:
// Siempre debe quedar al final de todas las rutas.
//
// ============================================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "Ruta no encontrada.",
    });
  }
);


// ============================================================================
// EXPORTAR APP
// ============================================================================

module.exports =
  app;