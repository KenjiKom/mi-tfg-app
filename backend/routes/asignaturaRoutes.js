const express = require('express');
const db = require('../db/connection');
const router = express.Router();

router.get('/asignaturas-profesor', async (req, res) => {
  const { profesorId } = req.query;
  const profesorIdInt = parseInt(profesorId, 10);
  db.query(`
          SELECT DISTINCT A.Nombre 
          FROM TFG.Asignatura A
          JOIN TFG.Matricula M ON A.id = M.id_asignatura
          JOIN TFG.Usuario U ON M.id_usuario = U.id
          WHERE U.id = ?;
          `, [profesorIdInt], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
  });
});


router.get('/cursos', async (req, res) => {
  const { profesorId, asignatura } = req.query;
  const profesorIdInt = parseInt(profesorId, 10);
  db.query(`
      SELECT DISTINCT M.Curso
          FROM TFG.Matricula M
          JOIN TFG.Asignatura A ON M.id_asignatura = A.id
          JOIN TFG.Usuario U ON M.id_usuario = U.id
          WHERE U.id = ? AND A.Nombre = ?;
      `, [profesorIdInt, asignatura], (err, results) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json(results);
  });
});

router.get('/todos-cursos', async (req, res) => {
  try {
      const [rows] = await pool.query('SELECT DISTINCT Curso FROM TFG.Matricula');
      res.json(rows.map(row => ({ nombre: row.Curso })));
  } catch (error) {
      res.status(500).json({ error: 'Error obteniendo cursos' });
  }
});

router.get('/todas-asignaturas', async (req, res) => {
  try {
      const [rows] = await pool.query('SELECT id, Nombre FROM TFG.Asignatura');
      res.json(rows);
  } catch (error) {
      res.status(500).json({ error: 'Error obteniendo asignaturas' });
  }
});

module.exports = router;
