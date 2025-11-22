// create-files.js
const fs = require("fs");
const path = require("path");

// Carpeta donde quieres crear los archivos.
// Cambia esta ruta si tus JSON están en otra carpeta.
const directory = path.join(__dirname);

for (let i = 4; i <= 72; i++) {
  const filename = `forense-apps${i}.json`;
  const filepath = path.join(directory, filename);

  // Si quieres que el archivo quede completamente vacío, usa ""
  // Si quieres que tenga {}, cambia "" por "{}"
  fs.writeFileSync(filepath, "", "utf8");

  console.log(`Archivo creado: ${filename}`);
}

console.log("Listo. Se generaron los archivos vacíos del 4 al 72.");
