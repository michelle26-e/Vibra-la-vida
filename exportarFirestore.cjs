const admin = require('firebase-admin')
const fs = require('fs')

const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function exportar(nombreColeccion) {
  const snapshot = await db.collection(nombreColeccion).get()

  const datos = []

  snapshot.forEach((doc) => {
    datos.push({
      id: doc.id,
      ...doc.data(),
    })
  })

  fs.writeFileSync(
    `${nombreColeccion}.json`,
    JSON.stringify(datos, null, 2),
    'utf8'
  )

  console.log(`${nombreColeccion}.json generado`)
}

async function main() {
  await exportar('usuarios')
  await exportar('resultados_bienestar')

  console.log('Base de datos descargada correctamente.')
}

main()