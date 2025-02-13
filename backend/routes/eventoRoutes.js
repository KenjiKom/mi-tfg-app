const express = require('express');
const db = require('../db/connection');
const router = express.Router();

// Obtener todos los eventos
router.get('/', (req, res) => {
    db.query('SELECT * FROM Evento', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
