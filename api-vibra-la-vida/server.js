// Cargamos las variables de entorno del archivo .env.
require("dotenv").config();

// Importamos la app de Express.
const app = require("./src/app");

// Definimos el puerto.
// Si no existe PORT en .env, usará 3001.
const PORT = process.env.PORT || 3001;

/**
 * Iniciamos el servidor.
 */
app.listen(PORT, () => {
  console.log(`API de Vibra la vida corriendo en http://localhost:${PORT}`);
});