// Importamos Firebase Auth desde nuestra configuración.
const { auth } = require("../config/firebase");

/**
 * Middleware para verificar el token de Firebase.
 *
 * El cliente debe mandar el token en los headers:
 *
 * Authorization: Bearer TOKEN
 *
 * Ese TOKEN será el ID Token generado por Firebase Auth
 * desde Android o desde la página web.
 */
async function verifyFirebaseToken(req, res, next) {
  try {
    // Obtenemos el header Authorization.
    const authHeader = req.headers.authorization;

    // Si no se envió el header, respondemos error.
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No se proporcionó token de autenticación.",
      });
    }

    // El formato correcto es:
    // Bearer TOKEN
    const token = authHeader.split(" ")[1];

    // Si no viene token después de Bearer, respondemos error.
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido.",
      });
    }

    // Verificamos el token con Firebase Admin.
    const decodedToken = await auth.verifyIdToken(token);

    // Guardamos los datos del usuario autenticado en req.user.
    // Esto se puede usar en los controladores protegidos.
    req.user = {
      uid: decodedToken.uid,
      correo: decodedToken.email || null,
      nombre: decodedToken.name || null,
    };

    // Continuamos hacia el siguiente controlador.
    next();
  } catch (error) {
    console.error("Error verificando token:", error);

    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }
}

module.exports = {
  verifyFirebaseToken,
};