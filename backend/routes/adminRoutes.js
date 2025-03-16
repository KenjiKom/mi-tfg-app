const express = require('express');
const db = require('../db/connection');
const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
      const usuarios = await db.query('SELECT * FROM Usuario');
      res.json(usuarios);
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

  
  // Ruta para obtener todas las asignaturas
router.get('/asignaturas', async (req, res) => {
    try {
      const asignaturas = await db.query('SELECT * FROM Asignatura');
      res.json(asignaturas);
    } catch (error) {
      res.status(500).send('Error al obtener las asignaturas');
    }
  });
  
  // Ruta para agregar una asignatura
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



module.exports = router;
