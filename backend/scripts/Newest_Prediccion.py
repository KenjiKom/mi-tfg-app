import mysql.connector
from datetime import datetime
from typing import List, Dict, Tuple

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="TFG"
    )

def obtener_matriculas_anteriores() -> List[Dict]:
    """Obtiene las matrículas de cursos anteriores con estadísticas necesarias"""
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    WITH 
    MediaEventos AS (
        SELECT 
            m.id_asignatura,
            m.Curso,
            AVG(COUNT(e.id)) AS media_eventos
        FROM 
            Matricula m
        JOIN 
            Evento e ON m.id = e.id_matricula
        GROUP BY 
            m.id_asignatura, m.Curso
    ),
    EventosAlumno AS (
        SELECT 
            m.id AS id_matricula,
            m.id_usuario,
            m.id_asignatura,
            m.Curso,
            m.Nota,
            COUNT(e.id) AS total_eventos
        FROM 
            Matricula m
        LEFT JOIN 
            Evento e ON m.id = e.id_matricula
        GROUP BY 
            m.id, m.id_usuario, m.id_asignatura, m.Curso, m.Nota
    )
    SELECT 
        ea.id_matricula,
        ea.Nota,
        (ea.total_eventos - me.media_eventos) AS diferencia_eventos
    FROM 
        EventosAlumno ea
    JOIN 
        MediaEventos me ON ea.id_asignatura = me.id_asignatura AND ea.Curso = me.Curso
    WHERE 
        ea.Curso < (SELECT MAX(Curso) FROM Matricula)
    """
    
    cursor.execute(query)
    resultados = cursor.fetchall()
    conn.close()
    return resultados

def asignar_perfil(nota: float, diferencia_eventos: float, umbral_actividad: float = 0) -> Tuple[int, str]:
    """Asigna un perfil según las reglas especificadas"""
    if nota >= 50:  # Aprobado
        if diferencia_eventos > umbral_actividad:
            return (1, "Perfil 1")  # Nota aprobada, mucha actividad
        else:
            return (2, "Perfil 2")   # Nota aprobada, poca actividad
    else:  # Suspenso
        if diferencia_eventos > umbral_actividad:
            return (3, "Perfil 3")  # Nota suspensa, mucha actividad
        else:
            return (4, "Perfil 4")    # Nota suspensa, poca actividad

def guardar_predicciones():
    """Procesa las matrículas antiguas y guarda los perfiles en la tabla Prediccion"""
    matriculas = obtener_matriculas_anteriores()
    conn = connect_db()
    cursor = conn.cursor()
    
    # Preparar consulta de inserción
    insert_query = """
    INSERT INTO Prediccion (
        id_matricula,
        Nota_predicha,
        Cluster,
        Cluster_numero,
        Fecha
    ) VALUES (%s, %s, %s, %s, %s)
    """
    
    # Procesar cada matrícula
    for matricula in matriculas:
        cluster_numero, cluster_nombre = asignar_perfil(
            nota=matricula['Nota'],
            diferencia_eventos=matricula['diferencia_eventos']
        )
        
        # Valores a insertar
        values = (
            matricula['id_matricula'],
            matricula['Nota'],  # Usamos la nota real como Nota_predicha
            cluster_nombre,
            cluster_numero,
            datetime.now().date()  # Fecha actual
        )
        
        # Ejecutar inserción
        cursor.execute(insert_query, values)
    
    # Confirmar cambios y cerrar conexión
    conn.commit()
    conn.close()
    print(f"Se han guardado {len(matriculas)} predicciones de perfil")

# Ejecutar el proceso
if __name__ == "__main__":
    guardar_predicciones()
    print("Proceso completado exitosamente")