const express = require('express');
const db = require('../db/connection');
const router = express.Router();

router.post('/guardar', async (req, res) => {
    try {
      const { id_usuario_receptor, id_usuario_emisor, asunto, texto } = req.body;
      
      const [result] = await db.execute(
        'INSERT INTO Mensaje (id_usuario_receptor, id_usuario_emisor, asunto, texto) VALUES (?, ?, ?, ?)',
        [id_usuario_receptor, id_usuario_emisor, asunto, texto]
      );
      
      res.status(201).json({ 
        message: 'Mensaje enviado correctamente',
        id: result.insertId 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al enviar el mensaje' });
    }
  });


module.exports = router;
