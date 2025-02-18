const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');  // Para ejecutar comandos de consola (como Python)
const router = express.Router();

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Establece el destino como la carpeta 'uploads' en el directorio 'backend'
    cb(null, path.join(__dirname, '..', 'uploads'));  // Esto va a la carpeta uploads dentro de 'backend'
  },
  filename: (req, file, cb) => {
    // Usar el timestamp para garantizar un nombre único para cada archivo
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Inicializar multer con la configuración de almacenamiento
const upload = multer({ storage: storage });

// Ruta para subir el archivo y ejecutar el script
router.post('/upload-and-run', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Log del archivo subido
  console.log('Archivo subido:', req.file);

  // Ejecutar un script de Python (reemplaza el nombre del script y los argumentos según corresponda)
  const scriptPath = path.join(__dirname, '..', 'scripts', 'Carga_datos_1.py');  // Ruta al script Python
  const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);  // Ruta del archivo subido

  // Comando para ejecutar el script Python pasando el archivo como argumento
  const command = `python3 ${scriptPath} ${filePath}`;

  // Ejecutar el script de Python
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el script: ${error.message}`);
      return res.status(500).json({ message: 'Error al ejecutar el script', error: error.message });
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ message: 'Error en el script', error: stderr });
    }

    // Si todo salió bien, retornar el resultado
    console.log(`stdout: ${stdout}`);
    res.json({ message: 'Archivo subido y script ejecutado correctamente', output: stdout });
  });
});

module.exports = router;
