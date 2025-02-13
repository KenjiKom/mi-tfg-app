const express = require('express');
const db = require('../db/connection');
const router = express.Router();

// Obtener todas las asignaturas
router.get('/', (req, res) => {
    db.query('SELECT * FROM Asignatura', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
