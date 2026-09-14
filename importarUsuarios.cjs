// ==========================================================
// CONTROLADOR DE PROFESIONALES - VIBRA LA VIDA
// ==========================================================
//
// Este endpoint valida:
// 1. Formato de la cédula.
// 2. Que la cédula no esté ya ocupada en Vibra la Vida.
// 3. Existencia de la cédula mediante idoo.dev.
// 4. Coincidencia del nombre.
//
// IMPORTANTE:
// Si la cédula ya está registrada, NO se informa ese motivo
// al usuario. Se responde con un mensaje genérico.
// ==========================================================

const {
  db,
} = require("../config/firebase");


// ----------------------------------------------------------
// NORMALIZAR TEXTO
// ----------------------------------------------------------

const normalizarTexto = (texto = "") => {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
};


// ----------------------------------------------------------
// MENSAJE GENÉRICO
// ----------------------------------------------------------

const responderValidacionNoDisponible = (res) => {
  return res.status(400).json({
    ok: false,
    valida: false,
    mensaje:
      "No fue posible validar la información profesional. Revisa tus datos e inténtalo nuevamente.",
  });
};


// ----------------------------------------------------------
// COMPROBAR SI LA CÉDULA YA ESTÁ REGISTRADA
// ----------------------------------------------------------

const cedulaYaRegistrada = async (cedula) => {
  const snapshot = await db
    .collection("usuarios")
    .where(
      "cedulaProfesional",
      "==",
      cedula
    )
    .limit(1)
    .get();

  return !snapshot.empty;
};


// ----------------------------------------------------------
// VERIFICAR CÉDULA PROFESIONAL
// ----------------------------------------------------------

const verificarCedula = async (req, res) => {
  try {
    const {
      cedula,
      nombreCompleto,
    } = req.body || {};

    // ------------------------------------------------------
    // VALIDACIÓN BÁSICA
    // ------------------------------------------------------

    if (
      !cedula ||
      !nombreCompleto
    ) {
      return responderValidacionNoDisponible(
        res
      );
    }

    if (!/^\d{7,8}$/.test(cedula)) {
      return responderValidacionNoDisponible(
        res
      );
    }

    // ------------------------------------------------------
    // CÉDULA ÚNICA DENTRO DE VIBRA LA VIDA
    // ------------------------------------------------------
    // No revelamos al cliente si el motivo del rechazo
    // es que la cédula ya existe en otra cuenta.

    const yaExiste =
      await cedulaYaRegistrada(
        cedula
      );

    if (yaExiste) {
      console.warn(
        "[VERIFICACION_PROFESIONAL] Registro rechazado: cédula ya utilizada."
      );

      return responderValidacionNoDisponible(
        res
      );
    }

    // ------------------------------------------------------
    // API KEY
    // ------------------------------------------------------

    const apiKey =
      process.env.CEDULA_API_KEY;

    if (!apiKey) {
      console.error(
        "[VERIFICACION_PROFESIONAL] Falta CEDULA_API_KEY."
      );

      return res.status(500).json({
        ok: false,
        valida: false,
        mensaje:
          "No fue posible realizar la verificación en este momento.",
      });
    }

    // ------------------------------------------------------
    // CONSULTAR IDOO
    // ------------------------------------------------------

    const respuesta = await fetch(
      "https://api.idoo.dev/v1/consultar-cedula-profesional/",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          cedula,
        }),
      }
    );

    const datos =
      await respuesta.json();

    if (
      !respuesta.ok ||
      !datos.valid
    ) {
      console.warn(
        "[VERIFICACION_PROFESIONAL] La fuente externa no validó la cédula."
      );

      return responderValidacionNoDisponible(
        res
      );
    }

    // La respuesta actual de idoo.dev entrega
    // los registros directamente dentro de data[].
    const profesionista =
      Array.isArray(datos.data)
        ? datos.data[0]
        : null;

    if (!profesionista) {
      return responderValidacionNoDisponible(
        res
      );
    }

    // ------------------------------------------------------
    // CONSTRUIR NOMBRE REGISTRADO
    // ------------------------------------------------------

    const nombreRegistro = [
      profesionista.nombre,
      profesionista.primerApellido,
      profesionista.segundoApellido,
    ]
      .filter(Boolean)
      .join(" ");

    // ------------------------------------------------------
    // COMPARAR NOMBRE
    // ------------------------------------------------------

    const nombreIngresado =
      normalizarTexto(
        nombreCompleto
      );

    const nombreOficial =
      normalizarTexto(
        nombreRegistro
      );

    if (
      nombreIngresado !==
      nombreOficial
    ) {
      console.warn(
        "[VERIFICACION_PROFESIONAL] El nombre no coincide con la cédula."
      );

      return responderValidacionNoDisponible(
        res
      );
    }

    // ------------------------------------------------------
    // RESPUESTA CORRECTA
    // ------------------------------------------------------

    return res.json({
      ok: true,
      valida: true,

      mensaje:
        "Información profesional verificada correctamente.",

      profesional: {
        cedula:
          String(
            profesionista.cedula ||
            cedula
          ),

        nombre:
          nombreRegistro,

        profesion:
          profesionista.profesion ||
          profesionista.titulo ||
          null,

        institucion:
          profesionista.institucion ||
          null,

        anioRegistro:
          profesionista.anioRegistro ||
          null,
      },
    });
  } catch (error) {
    console.error(
      "[VERIFICACION_PROFESIONAL] Error:",
      error
    );

    return res.status(500).json({
      ok: false,
      valida: false,
      mensaje:
        "No fue posible realizar la verificación en este momento.",
    });
  }
};


module.exports = {
  verificarCedula,
};
