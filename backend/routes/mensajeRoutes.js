const express = require('express');
const db = require('../db/connection');
const router = express.Router();

router.post('/guardar', async (req, res) => {
  try {
      let { id_usuario_receptor, id_usuario_emisor, asunto, texto } = req.body;
      id_usuario_emisor = parseInt(id_usuario_emisor, 10);

      console.log( id_usuario_receptor, id_usuario_emisor, asunto, texto);

      if (!id_usuario_receptor || !id_usuario_emisor || !asunto || !texto) {
          return res.status(400).json({ message: 'Faltan datos en la solicitud' });
      }

      db.query(
          'INSERT INTO Mensaje (id_usuario_receptor, id_usuario_emisor, asunto, texto) VALUES (?, ?, ?, ?)',
          [id_usuario_receptor, id_usuario_emisor, asunto, texto],
          (error, results) => {
              if (error) {
                  console.error("Error en la inserción del mensaje:", error);
                  return res.status(500).json({ message: 'Error al enviar el mensaje' });
              }

              res.status(201).json({ 
                  message: 'Mensaje enviado correctamente',
                  id: results.insertId 
              });
          }
      );

  } catch (error) {
      console.error("Error general en el servidor:", error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/lista/:id_usuario_receptor', async (req, res) => {
  try {
      const { id_usuario_receptor } = req.params;

      if (!id_usuario_receptor) {
          return res.status(400).json({ message: 'Falta el ID del estudiante' });
      }

      const query = `
          SELECT m.id, m.id_usuario_emisor, m.id_usuario_receptor, m.asunto, m.texto, m.fecha_envio, 
                 p.Nombre AS nombre_profesor
          FROM Mensaje m
          JOIN Usuario p ON m.id_usuario_emisor = p.id
          WHERE m.id_usuario_receptor = ? 
          ORDER BY m.fecha_envio DESC
      `;

      db.query(query, [id_usuario_receptor], (error, results) => {
          if (error) {
              console.error("Error obteniendo los mensajes:", error);
              return res.status(500).json({ message: 'Error al obtener los mensajes' });
          }

          res.status(200).json(results);
      });

  } catch (error) {
      console.error("Error en la consulta de mensajes:", error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});




module.exports = router;
