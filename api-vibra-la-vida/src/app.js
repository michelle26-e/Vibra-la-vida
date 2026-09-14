// Importamos Express.
const express = require("express");

// Importamos CORS para permitir peticiones desde Android y Web.
const cors = require("cors");

// Importamos rutas.
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const resultsRoutes = require("./routes/results.routes");
const healthRoutes = require("./routes/health.routes");
const historyRoutes = require("./routes/history.routes");
const doctorRoutes = require("./routes/doctor.routes");
const calculadorasRoutes = require("./routes/calculadoras.routes");

// Creamos la aplicación de Express.
const app = express();

/**
 * Middlewares globales.
 */

// Permite recibir JSON en el body de las peticiones.
app.use(express.json());

// Permite peticiones desde otros orígenes.
app.use(cors());

/**
 * Ruta principal de prueba.
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "API RESTful de Vibra la Vida funcionando con Firebase.",
  });
});

/**
 * Ruta para probar si el servidor está activo.
 */
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Servidor activo.",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Rutas principales de la API.
 */
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/results", resultsRoutes);

app.use(
  "/api/health-connect",
  healthRoutes
);

app.use(
  "/api/history",
  historyRoutes
);

// Rutas para doctores.
app.use(
  "/api/doctores",
  doctorRoutes
);

// Rutas para calculadoras.
app.use(
  "/api/calculadoras",
  calculadorasRoutes
);

/**
 * Ruta para manejar endpoints inexistentes.
 * Debe ir al final, después de todas las rutas.
 */
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada.",
  });
});

// Exportamos la aplicación para usarla desde server.js.
module.exports = app;