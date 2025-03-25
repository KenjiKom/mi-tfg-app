const express = require('express');
const db = require('../db/connection');
const router = express.Router();

/// Ruta para verificar usuario y contraseña
router.get('/login', (req, res) => {
    const { Nombre, Contrasena } = req.query;
    
    db.query(
        'SELECT * FROM Usuario WHERE Nombre = ? AND Contrasena = ?',
        [Nombre, Contrasena],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length === 0) {
                return res.status(404).json({ error: 'Usuario o contraseña incorrectos' });
            }

            const user = results[0];
            res.json({
                id: user.id,
                Nombre: user.Nombre,
                is_teacher: user.is_teacher,
                is_admin: user.is_admin,
            });
        }
    );
});

router.get('/usuario', async (req, res) => {
    const nombre =  req.query.nombreAlumno;
    db.query('SELECT * FROM TFG.Usuario WHERE Nombre LIKE ?', [nombre], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


module.exports = router;
