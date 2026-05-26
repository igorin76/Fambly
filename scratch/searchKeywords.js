import fs from 'fs';
import path from 'path';

const keywords = ['Valentina', 'Rodrigo', 'Martin', 'vacuna', 'renta', 'Netflix', 'luz', 'agua', 'Internet', 'Mercadona', 'Carrefour'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

console.log("Buscando palabras clave en el código...");
walkDir('./src', (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  keywords.forEach(keyword => {
    if (content.includes(keyword)) {
      // Ignorar useStore.js que ya sabemos que tiene las referencias correctas de Valentina/Rodrigo/Martín con campos vacíos
      if (filePath.includes('useStore.js') && (keyword === 'Valentina' || keyword === 'Rodrigo' || keyword === 'Martin')) {
        return;
      }
      console.log(`Encontrado '${keyword}' en ${filePath}`);
    }
  });
});
console.log("Búsqueda completada.");
