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

router.get('/detalle_alumno', (req, res) => {
    const { alumno, asignatura, curso } = req.query;

    if (!alumno || !asignatura || !curso) {
        console.error("Solicitud incorrecta: faltan parámetros");
        return res.status(400).json({ error: "Faltan parámetros: alumno, asignatura o curso" });
    }

    console.log("Buscando id_matricula para:", { alumno, asignatura, curso });

    const matriculaQuery = `
        SELECT m.id AS id_matricula
        FROM TFG.Matricula m
        JOIN TFG.Usuario u ON m.id_usuario = u.id
        JOIN TFG.Asignatura a ON m.id_asignatura = a.id
        WHERE u.Nombre = ? AND a.Nombre = ? AND m.Curso = ?;
    `;

    db.query(matriculaQuery, [alumno, asignatura, curso], (err, matriculaResult) => {
        if (err) {
            console.error("Error en la consulta SQL:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }

        if (matriculaResult.length === 0) {
            return res.status(404).json({ error: "No se encontró la matrícula del alumno" });
        }

        const id_matricula = matriculaResult[0].id_matricula;
        console.log("Encontrado id_matricula:", id_matricula);

        const alumnoQuery = `
            SELECT 
                u.Nombre AS Alumno, 
                p.Nota_predicha, 
                p.Cluster, 
                p.Fecha,
                a.Nombre AS Asignatura,
                m.Curso
            FROM TFG.Prediccion p
            JOIN TFG.Matricula m ON p.id_matricula = m.id
            JOIN TFG.Usuario u ON m.id_usuario = u.id
            JOIN TFG.Asignatura a ON m.id_asignatura = a.id
            WHERE p.id_matricula = ?;
        `;

        db.query(alumnoQuery, [id_matricula], (err, alumnoResult) => {
            if (err) {
                console.error("Error en la consulta SQL:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            if (alumnoResult.length === 0) {
                return res.status(404).json({ error: "Alumno no encontrado o sin predicciones" });
            }

            const alumno = alumnoResult[0];
            const eventosQuery = `
                SELECT 
                    Nombre, Afectado, Contexto, Componente, Evento, Descripción, Origen, Ip, Hora
                FROM TFG.Evento
                WHERE id_matricula = ?;
            `;

            db.query(eventosQuery, [id_matricula], (err, eventosResult) => {
                if (err) {
                    console.error("Error obteniendo eventos:", err);
                    return res.status(500).json({ error: "Error interno del servidor" });
                }

                res.json({
                    Alumno: alumno.Alumno,
                    Nota_predicha: alumno.Nota_predicha,
                    Cluster: alumno.Cluster,
                    Fecha_prediccion: alumno.Fecha,
                    Asignatura: alumno.Asignatura,
                    Curso: alumno.Curso,
                    Eventos: eventosResult.length,
                    Eventos: eventosResult
                });
            });
        });
    });
});


module.exports = router;
