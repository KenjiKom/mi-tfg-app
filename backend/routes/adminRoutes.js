const express = require('express');
const db = require('../db/connection');
const router = express.Router();

 // // // // // USUARIOS // // // // //

// Ruta para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
      db.query(`SELECT * FROM Usuario`, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
    } catch (error) {
      res.status(500).send('Error al obtener los usuarios');
    }
  });
  
  // Ruta para agregar un nuevo usuario
router.post('/usuarios', async (req, res) => {
    const { Nombre, Contrasena, is_teacher, is_admin } = req.body;
    try {
      const result = await db.query('INSERT INTO Usuario (Nombre, Contrasena, is_teacher, is_admin) VALUES (?, ?, ?, ?)', [Nombre, Contrasena, is_teacher, is_admin]);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).send('Error al agregar el usuario');
    }
  });
  
  // Ruta para actualizar un usuario
router.put('/usuarios/:id', async (req, res) => {
    const { Nombre, Contrasena, is_teacher, is_admin } = req.body;
    try {
      const result = await db.query('UPDATE Usuario SET Nombre = ?, Contrasena = ?, is_teacher = ?, is_admin = ? WHERE id = ?', [Nombre, Contrasena, is_teacher, is_admin, req.params.id]);
      res.json(result);
    } catch (error) {
      res.status(500).send('Error al actualizar el usuario');
    }
  });
  
  // Ruta para eliminar un usuario
router.delete('/usuarios/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM Usuario WHERE id = ?', [req.params.id]);
      res.status(204).send();
    } catch (error) {
      res.status(500).send('Error al eliminar el usuario');
    }
  });

// // // // // ASIGNATURAS // // // // //

// Ruta para obtener todas las asignaturas
router.get('/asignaturas', async (req, res) => {
  try {
      db.query(`SELECT * FROM Asignatura`, (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(results);
      });
  } catch (error) {
      res.status(500).send('Error al obtener las asignaturas');
  }
});

// Ruta para agregar una nueva asignatura
router.post('/asignaturas', async (req, res) => {
  const { Nombre } = req.body;
  try {
      const result = await db.query('INSERT INTO Asignatura (Nombre) VALUES (?)', [Nombre]);
      res.status(201).json(result);
  } catch (error) {
      res.status(500).send('Error al agregar la asignatura');
  }
});

// Ruta para actualizar una asignatura
router.put('/asignaturas/:id', async (req, res) => {
  const { Nombre } = req.body;
  try {
      const result = await db.query('UPDATE Asignatura SET Nombre = ? WHERE id = ?', [Nombre, req.params.id]);
      res.json(result);
  } catch (error) {
      res.status(500).send('Error al actualizar la asignatura');
  }
});

// Ruta para eliminar una asignatura
router.delete('/asignaturas/:id', async (req, res) => {
  try {
      await db.query('DELETE FROM Asignatura WHERE id = ?', [req.params.id]);
      res.status(204).send();
  } catch (error) {
      res.status(500).send('Error al eliminar la asignatura');
  }
});

// // // // // CURSOS // // // // //

// Ruta para obtener todos los cursos
router.get('/cursos', async (req, res) => {
  try {
      db.query(`SELECT * FROM Curso`, (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(results);
      });
  } catch (error) {
      res.status(500).send('Error al obtener los cursos');
  }
});

// Ruta para agregar un nuevo curso
router.post('/cursos', async (req, res) => {
  const { Nombre } = req.body;
  try {
      const result = await db.query('INSERT INTO Curso (Nombre) VALUES (?)', [Nombre]);
      res.status(201).json(result);
  } catch (error) {
      res.status(500).send('Error al agregar el curso');
  }
});

// Ruta para actualizar un curso
router.put('/cursos/:id', async (req, res) => {
  const { Nombre } = req.body;
  try {
      const result = await db.query('UPDATE Curso SET Nombre = ? WHERE id = ?', [Nombre, req.params.id]);
      res.json(result);
  } catch (error) {
      res.status(500).send('Error al actualizar el curso');
  }
});

// Ruta para eliminar un curso
router.delete('/cursos/:id', async (req, res) => {
  try {
      await db.query('DELETE FROM Curso WHERE id = ?', [req.params.id]);
      res.status(204).send();
  } catch (error) {
      res.status(500).send('Error al eliminar el curso');
  }
});

// // // // // MATRICULAS // // // // //

// Ruta para obtener todos los cursos
router.get('/matriculas', async (req, res) => {
  try {
      db.query(`SELECT * FROM Matricula`, (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(results);
      });
  } catch (error) {
      res.status(500).send('Error al obtener las matriculas');
  }
});

// Ruta para agregar un nuevo curso
router.post('/matriculas', async (req, res) => {
  const { id_usuario, id_asignatura, Curso, Nota } = req.body;
  try {
      const result = await db.query('INSERT INTO Matricula (id_usuario, id_asignatura, Curso, Nota) VALUES (?)', [id_usuario, id_asignatura, Curso, Nota]);
      res.status(201).json(result);
  } catch (error) {
      res.status(500).send('Error al agregar las matriculas');
  }
});

// Ruta para actualizar un curso
router.put('/matriculas/:id', async (req, res) => {
  const { id_usuario, id_asignatura, Curso, Nota } = req.body;
  try {
      const result = await db.query('UPDATE Matricula SET id_usuario = ?, id_asignatura = ?, Curso = ?, Nota = ? WHERE id = ?', [id_usuario, id_asignatura, Curso, Nota, req.params.id]);
      res.json(result);
  } catch (error) {
      res.status(500).send('Error al actualizar la matricula');
  }
});

// Ruta para eliminar un curso
router.delete('/matriculas/:id', async (req, res) => {
  try {
      await db.query('DELETE FROM Matricula WHERE id = ?', [req.params.id]);
      res.status(204).send();
  } catch (error) {
      res.status(500).send('Error al eliminar la matricula');
  }
});

// // // // // EVENTOS // // // // //

// Obtener eventos con paginación y búsqueda
router.get('/eventos', async (req, res) => {
  const { page = 1, limit = 5, search = '' } = req.query;
  const offset = (page - 1) * limit;
  
  try {
      const query = `SELECT * FROM Evento WHERE Nombre LIKE ? LIMIT ? OFFSET ?`;
      db.query(query, [`%${search}%`, parseInt(limit), parseInt(offset)], (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(results);
      });
  } catch (error) {
      res.status(500).send('Error al obtener los eventos');
  }
});

// Crear un nuevo evento
router.post('/eventos', async (req, res) => {
  const { id_matricula, Hora, Nombre, Afectado, Contexto, Componente, Evento, Descripción, Origen, Ip } = req.body;
  
  try {
      const query = `INSERT INTO Evento (id_matricula, Hora, Nombre, Afectado, Contexto, Componente, Evento, Descripción, Origen, Ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(query, [id_matricula, Hora, Nombre, Afectado, Contexto, Componente, Evento, Descripción, Origen, Ip], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: result.insertId, ...req.body });
      });
  } catch (error) {
      res.status(500).send('Error al agregar el evento');
  }
});

// Actualizar un evento
router.put('/eventos/:id', async (req, res) => {
  const { id_matricula, Hora, Nombre, Afectado, Contexto, Componente, Evento, Descripción, Origen, Ip } = req.body;
  
  try {
      const query = `UPDATE Evento SET id_matricula=?, Hora=?, Nombre=?, Afectado=?, Contexto=?, Componente=?, Evento=?, Descripción=?, Origen=?, Ip=? WHERE id=?`;
      db.query(query, [id_matricula, Hora, Nombre, Afectado, Contexto, Componente, Evento, Descripción, Origen, Ip, req.params.id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: req.params.id, ...req.body });
      });
  } catch (error) {
      res.status(500).send('Error al actualizar el evento');
  }
});

// Eliminar un evento
router.delete('/eventos/:id', async (req, res) => {
  try {
      db.query('DELETE FROM Evento WHERE id = ?', [req.params.id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(204).send();
      });
  } catch (error) {
      res.status(500).send('Error al eliminar el evento');
  }
});

// // // // // PREDICCION // // // // //

// Obtener todas las predicciones
router.get('/predicciones', async (req, res) => {
  try {
      db.query('SELECT * FROM Prediccion', (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(results);
      });
  } catch (error) {
      res.status(500).send('Error al obtener las predicciones');
  }
});

// Agregar una nueva predicción
router.post('/predicciones', async (req, res) => {
  const { id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha } = req.body;
  try {
      db.query(
          'INSERT INTO Prediccion (id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha) VALUES (?, ?, ?, ?, ?)',
          [id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha],
          (err, result) => {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({ id: result.insertId, id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha });
          }
      );
  } catch (error) {
      res.status(500).send('Error al agregar la predicción');
  }
});

// Actualizar una predicción
router.put('/predicciones/:id', async (req, res) => {
  const { id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha } = req.body;
  try {
      db.query(
          'UPDATE Prediccion SET id_matricula = ?, Nota_predicha = ?, Cluster = ?, Cluster_numero = ?, Fecha = ? WHERE id = ?',
          [id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha, req.params.id],
          (err, result) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ id: req.params.id, id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha });
          }
      );
  } catch (error) {
      res.status(500).send('Error al actualizar la predicción');
  }
});

// Eliminar una predicción
router.delete('/predicciones/:id', async (req, res) => {
  try {
      db.query('DELETE FROM Prediccion WHERE id = ?', [req.params.id], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(204).send();
      });
  } catch (error) {
      res.status(500).send('Error al eliminar la predicción');
  }
});

module.exports = router;