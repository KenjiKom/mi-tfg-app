const express = require('express');
const db = require('../db/connection');
const router = express.Router();

// Obtener los alumnos y sus predicciones para un profesor y una asignatura
// Ejemplo para obtener los alumnos de la asignatura del profesor
router.get('/alumnos', (req, res) => {
    const profesorId = req.query.profesorId; // Aquí recibimos el id del profesor
    
    // Consulta para obtener las predicciones de los alumnos
    let query = `
        SELECT
            m.Curso,
            u.Nombre AS Alumno,
            p.Nota_predicha,
            CASE 
                WHEN p.Cluster = 'Perfil 5' THEN 'Baja nota, muchos eventos'
                WHEN p.Cluster = 'Perfil 4' THEN 'Baja nota, pocos eventos y baja constancia'
                WHEN p.Cluster = 'Perfil 3' THEN 'Alta nota, pocos eventos y poca constancia'
                WHEN p.Cluster = 'Perfil 2' THEN 'Alta nota, pocos eventos y mucha constancia'
                WHEN p.Cluster = 'Perfil 1' THEN 'Alta nota, muchos eventos'
                WHEN p.Cluster = 'Perfil 0' THEN 'Baja nota, pocos eventos y mucha constancia'
                ELSE p.Cluster -- Por si hay otros perfiles no definidos
            END AS Cluster,
            p.Cluster_numero,
            a.Nombre AS Asignatura
        FROM Matricula m
        JOIN Usuario u ON m.id_usuario = u.id
        JOIN Prediccion p ON m.id = p.id_matricula
        JOIN Asignatura a ON m.id_asignatura = a.id
        WHERE m.id_asignatura IN (
            SELECT id_asignatura FROM Matricula WHERE id_usuario = ?
        )
        ORDER BY m.Curso;
    `;
    
    db.query(query, [profesorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Ruta para obtener las predicciones de un alumno
router.get('/predicciones-alumno', (req, res) => {
    const alumnoId = req.query.alumnoId; // El ID del alumno desde la solicitud 

    const query = `
        SELECT 
            m.Curso, 
            a.Nombre AS Asignatura,
            p.Nota_predicha, 
            CASE 
                WHEN p.Cluster = 'Perfil 5' THEN 'Baja nota, muchos eventos'
                WHEN p.Cluster = 'Perfil 4' THEN 'Baja nota, pocos eventos y baja constancia'
                WHEN p.Cluster = 'Perfil 3' THEN 'Alta nota, pocos eventos y poca constancia'
                WHEN p.Cluster = 'Perfil 2' THEN 'Alta nota, pocos eventos y mucha constancia'
                WHEN p.Cluster = 'Perfil 1' THEN 'Alta nota, muchos eventos'
                WHEN p.Cluster = 'Perfil 0' THEN 'Baja nota, pocos eventos y mucha constancia'
                ELSE p.Cluster -- Por si hay otros perfiles no definidos
            END AS Cluster, 
            p.Cluster_numero
        FROM Matricula m
        JOIN Prediccion p ON m.id = p.id_matricula
        JOIN Asignatura a ON m.id_asignatura = a.id
        WHERE m.id_usuario = ?;
    `;
  
    db.query(query, [alumnoId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron predicciones para este alumno' });
        }

        res.json(results);
    });
});


module.exports = router;
