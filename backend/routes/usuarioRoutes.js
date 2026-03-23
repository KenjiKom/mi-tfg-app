const express = require('express');
const db = require('../db/connection');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/login', async (req, res) => {  
    const { Nombre, Contrasena } = req.body;
    try {
        db.query(
            'SELECT * FROM Usuario WHERE Nombre = ?',
            [Nombre],
            async (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                if (results.length === 0) {
                    return res.status(404).json({ error: 'Usuario o contraseña incorrectos' });
                }

                const user = results[0];
                
                const match = await bcrypt.compare(Contrasena, user.Contrasena);
                if (!match) {
                    return res.status(404).json({ error: 'Usuario o contraseña incorrectos' });
                }

                res.json({
                    id: user.id,
                    Nombre: user.Nombre,
                    is_teacher: user.is_teacher,
                    is_admin: user.is_admin,
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

router.get('/usuario', async (req, res) => {
    const nombre =  req.query.nombreAlumno;
    db.query('SELECT * FROM TFG.Usuario WHERE Nombre LIKE ?', [nombre], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});


module.exports = router;
