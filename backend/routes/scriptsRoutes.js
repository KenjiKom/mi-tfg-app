const express = require("express");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const router = express.Router();

// Configurar almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads")); // Guardar en 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Mantener el nombre original
  },
});

// Configurar Multer para aceptar archivos
const upload = multer({ storage: storage });

router.post(
  "/upload-and-run",
  upload.fields([
    { name: "usuarios", maxCount: 1 },
    { name: "notas", maxCount: 1 },
    { name: "eventos", maxCount: 1 },
  ]),
  (req, res) => {
    const { asignatura, curso } = req.body;

    if (!curso || !asignatura) {
      return res.status(400).json({ message: "Curso y asignatura son obligatorios." });
    }

    if (!req.files || !req.files.usuarios || !req.files.notas || !req.files.eventos) {
      return res.status(400).json({ message: "Todos los archivos deben ser subidos." });
    }

    const usuariosPath = path.join(__dirname, "..", "uploads", req.files.usuarios[0].filename);
    const notasPath = path.join(__dirname, "..", "uploads", req.files.notas[0].filename);
    const eventosPath = path.join(__dirname, "..", "uploads", req.files.eventos[0].filename);

    const cargaDatos1Script = path.join(__dirname, "..", "scripts", "Carga_datos_1.py");
    const cargaDatos2Script = path.join(__dirname, "..", "scripts", "Carga_datos_2.py");
    const cargaDatos3Script = path.join(__dirname, "..", "scripts", "Carga_datos_3.py");

    // Ejecutar primero Carga_datos_1.py
    const command1 = `python ${cargaDatos1Script} ${usuariosPath}`;

    exec(command1, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar Carga_datos_1.py: ${error.message}`);
        return res.status(500).json({ message: "Error al ejecutar Carga_datos_1.py", error: error.message });
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ message: "Error en Carga_datos_1.py", error: stderr });
      }

      console.log(`stdout Carga_datos_1.py: ${stdout}`);

      // Si Carga_datos_1.py se ejecuta correctamente, ejecutar Carga_datos_2.py
      const command2 = `python ${cargaDatos2Script} ${usuariosPath} "${asignatura}" "${curso}" ${notasPath}`;

      exec(command2, (error2, stdout2, stderr2) => {
        if (error2) {
          console.error(`Error al ejecutar Carga_datos_2.py: ${error2.message}`);
          return res.status(500).json({ message: "Error al ejecutar Carga_datos_2.py", error: error2.message });
        }

        if (stderr2) {
          console.error(`stderr Carga_datos_2.py: ${stderr2}`);
          return res.status(500).json({ message: "Error en Carga_datos_2.py", error: stderr2 });
        }

        console.log(`stdout Carga_datos_2.py: ${stdout2}`);

        // Si Carga_datos_2.py se ejecuta correctamente, ejecutar Carga_datos_3.py
        const command3 = `python ${cargaDatos3Script} "${curso}" ${eventosPath}`;

        exec(command3, (error3, stdout3, stderr3) => {
          if (error3) {
            console.error(`Error al ejecutar Carga_datos_3.py: ${error3.message}`);
            return res.status(500).json({ message: "Error al ejecutar Carga_datos_3.py", error: error3.message });
          }

          if (stderr3) {
            console.error(`stderr Carga_datos_3.py: ${stderr3}`);
            return res.status(500).json({ message: "Error en Carga_datos_3.py", error: stderr3 });
          }

          console.log(`stdout Carga_datos_3.py: ${stdout3}`);
          res.json({ message: "Archivos subidos y scripts ejecutados correctamente", output: stdout3 });
        });
      });
    });
  }
);

router.post("/prediccion-script", (req, res) => {
  const predictionScript = path.join(__dirname, "..", "scripts", "Prediccion.py");
  const command1 = `python ${predictionScript}`;

  exec(command1, (error, stderr, stdoutP) => {
    if (error) {
      console.error(`Error al ejecutar Prediccion.py: ${error.message}`);
      return res.status(500).json({ message: "Error al ejecutar Prediccion.py", error: error.message });
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ message: "Predicciones realizadas", error: stderr });
    }

    console.log(`stdout Prediccion.py: ${stdoutP}`);
    res.json({ message: "Predicciones realizadas.", output: stdoutP });
  });
});

module.exports = router;
