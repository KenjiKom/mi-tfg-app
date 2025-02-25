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


module.exports = router;
