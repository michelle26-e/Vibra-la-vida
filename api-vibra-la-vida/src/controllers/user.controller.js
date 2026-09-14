// ============================================================================
// USER CONTROLLER
// ============================================================================
//
// Este controlador maneja la información del perfil
// del usuario autenticado.
//
// El UID NO viene del body.
//
// El UID se obtiene del token de Firebase mediante
// auth.middleware.js.
//
// ============================================================================


// Importamos Firestore y FieldValue.
const {
  db,
  FieldValue,
} = require("../config/firebase");


// ============================================================================
// OBTENER MI PERFIL
// ============================================================================
//
// GET /api/users/me
//
// Requiere:
//
// Authorization: Bearer TOKEN
//
// ============================================================================

async function getMyProfile(req, res) {

  try {


    // ========================================================================
    // UID DEL USUARIO AUTENTICADO
    // ========================================================================

    const uid =
      req.user.uid;


    // ========================================================================
    // BUSCAR USUARIO
    // ========================================================================

    const userDoc =
      await db
        .collection("usuarios")
        .doc(uid)
        .get();


    // ========================================================================
    // PERFIL NO ENCONTRADO
    // ========================================================================

    if (!userDoc.exists) {

      return res.status(404).json({

        success: false,

        message:
          "Perfil no encontrado.",

      });
    }


    // ========================================================================
    // PERFIL ENCONTRADO
    // ========================================================================

    return res.json({

      success: true,

      user: userDoc.data(),

    });


  } catch (error) {


    console.error(
      "Error en getMyProfile:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Error al obtener el perfil.",

      error:
        error.message,

    });
  }
}


// ============================================================================
// ACTUALIZAR MI PERFIL
// ============================================================================
//
// PUT /api/users/me
//
// Body esperado:
//
// {
//   "edad": "19",
//   "genero": "Mujer",
//   "peso": "62",
//   "estatura": "1.65",
//   "nivelActividad": "Moderado",
//   "enfermedadesCronicas": [
//       "Diabetes mellitus",
//       "Hipertensión arterial"
//   ],
//   "otraEnfermedadCronica": ""
// }
//
// ============================================================================

async function updateMyProfile(req, res) {

  try {


    // ========================================================================
    // UID DEL TOKEN
    // ========================================================================

    const uid =
      req.user.uid;


    // ========================================================================
    // DATOS RECIBIDOS
    // ========================================================================

    const {

      edad,

      genero,

      peso,

      estatura,

      nivelActividad,

      enfermedadesCronicas,

      otraEnfermedadCronica,

    } = req.body;


    // ========================================================================
    // VALIDAR ENFERMEDADES CRÓNICAS
    // ========================================================================
    //
    // Siempre queremos guardar un arreglo.
    //
    // Si Android no manda nada:
    //
    // []
    //
    // ========================================================================

    const enfermedadesFinales =
      Array.isArray(enfermedadesCronicas)
        ? enfermedadesCronicas
        : [];


    // ========================================================================
    // ACTUALIZAR FIRESTORE
    // ========================================================================

    await db
      .collection("usuarios")
      .doc(uid)
      .update({


        // --------------------------------------------------------------------
        // PERFIL
        // --------------------------------------------------------------------

        edad:
          edad ?? null,


        genero:
          genero ?? null,


        peso:
          peso ?? null,


        estatura:
          estatura ?? null,


        nivelActividad:
          nivelActividad ?? null,


        // --------------------------------------------------------------------
        // ANTECEDENTES DECLARADOS
        // --------------------------------------------------------------------

        enfermedadesCronicas:
          enfermedadesFinales,


        otraEnfermedadCronica:
          otraEnfermedadCronica ?? "",


        // --------------------------------------------------------------------
        // FECHA DE ACTUALIZACIÓN
        // --------------------------------------------------------------------

        actualizadoEn:
          FieldValue.serverTimestamp(),

      });


    // ========================================================================
    // RESPUESTA
    // ========================================================================

    return res.json({

      success: true,

      message:
        "Perfil actualizado correctamente.",

    });


  } catch (error) {


    console.error(
      "Error en updateMyProfile:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Error al actualizar el perfil.",

      error:
        error.message,

    });
  }
}


// ============================================================================
// EXPORTACIONES
// ============================================================================

module.exports = {

  getMyProfile,

  updateMyProfile,

};