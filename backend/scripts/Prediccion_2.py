import mysql.connector
from datetime import datetime
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List, Dict, Tuple

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="TFG"
    )

def obtener_datos_entrenamiento() -> Tuple[np.ndarray, np.ndarray]:
    """Obtiene eventos normalizados (-1 a 1) y notas reales"""
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    WITH 
    ConteoEventos AS (
        SELECT 
            m.id_asignatura,
            m.Curso,
            m.id AS id_matricula,
            COUNT(e.id) AS total_eventos,
            m.Nota
        FROM 
            Matricula m
        JOIN Usuario u ON m.id_usuario = u.id
        LEFT JOIN Evento e ON m.id = e.id_matricula
        WHERE 
            m.Nota > 0
            AND u.is_admin = False
            AND u.is_teacher = False
        GROUP BY 
            m.id, m.id_asignatura, m.Curso, m.Nota
    ),
    StatsAsignatura AS (
        SELECT 
            id_asignatura,
            Curso,
            MAX(total_eventos) AS max_eventos,
            MIN(total_eventos) AS min_eventos,
            AVG(total_eventos) AS media_eventos
        FROM 
            ConteoEventos
        GROUP BY 
            id_asignatura, Curso
    )
    SELECT 
        -- Normalización a rango [-1, 1]
        CASE 
            WHEN sa.max_eventos = sa.min_eventos THEN 0  # Evitar división por cero
            ELSE ((ce.total_eventos - sa.media_eventos) / (sa.max_eventos - sa.min_eventos)) * 2 
        END AS eventos_normalizados,
        ce.Nota
    FROM 
        ConteoEventos ce
    JOIN 
        StatsAsignatura sa ON ce.id_asignatura = sa.id_asignatura AND ce.Curso = sa.Curso
    WHERE
        sa.max_eventos != sa.min_eventos  # Excluir casos sin variación
    """
    
    cursor.execute(query)
    resultados = cursor.fetchall()
    conn.close()
    
    X = np.array([r['eventos_normalizados'] for r in resultados]).reshape(-1, 1)
    y = np.array([r['Nota'] for r in resultados])
    
    return X, y

# [El resto de las funciones se mantienen exactamente igual]
def entrenar_modelo() -> LinearRegression:
    X, y = obtener_datos_entrenamiento()
    model = LinearRegression()
    model.fit(X, y)
    return model

def obtener_matriculas_actuales() -> List[Dict]:
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    WITH 
    CurrentCourse AS (SELECT MAX(Curso) AS curso_actual FROM Matricula),
    ConteoEventos AS (
        SELECT 
            m.id_asignatura,
            m.id AS id_matricula,
            COUNT(e.id) AS total_eventos
        FROM 
            Matricula m
        JOIN Usuario u ON m.id_usuario = u.id
        LEFT JOIN Evento e ON m.id = e.id_matricula
        CROSS JOIN CurrentCourse cc
        WHERE 
            m.Curso = cc.curso_actual
            AND u.is_admin = False
            AND u.is_teacher = False
        GROUP BY 
            m.id_asignatura, m.id
    ),
    StatsAsignatura AS (
        SELECT 
            id_asignatura,
            MAX(total_eventos) AS max_eventos,
            MIN(total_eventos) AS min_eventos,
            AVG(total_eventos) AS media_eventos
        FROM 
            ConteoEventos
        GROUP BY 
            id_asignatura
    )
    SELECT 
        ce.id_matricula,
        -- Normalización a [-1, 1]
        CASE 
            WHEN sa.max_eventos = sa.min_eventos THEN 0
            ELSE ((ce.total_eventos - sa.media_eventos) / (sa.max_eventos - sa.min_eventos)) * 2
        END AS eventos_normalizados
    FROM 
        ConteoEventos ce
    JOIN 
        StatsAsignatura sa ON ce.id_asignatura = sa.id_asignatura
    WHERE
        sa.max_eventos != sa.min_eventos
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

def procesar_alumnos_actuales():
    # Entrenar modelo
    modelo = entrenar_modelo()
    
    # Obtener matriculas actuales (ahora con eventos_normalizados)
    matriculas = obtener_matriculas_actuales()
    
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
    
    # Procesar cada matrícula actual
    for matricula in matriculas:
        # Predecir nota usando eventos_normalizados
        valor_normalizado = matricula['eventos_normalizados']  # Cambio clave aquí
        nota_predicha = modelo.predict(np.array([[valor_normalizado]]))[0]
        
        # Asignar perfil (usando el valor original sin normalizar para la diferencia)
        # Recuperamos la diferencia real desde la BD si es necesario
        cluster_numero, cluster_nombre = asignar_perfil(
            nota=nota_predicha,
            diferencia_eventos=valor_normalizado  # O usar otro campo si lo prefieres
        )
        
        # Valores a insertar
        values = (
            matricula['id_matricula'],
            float(nota_predicha),
            cluster_nombre,
            cluster_numero,
            datetime.now().date()
        )
        
        # Ejecutar inserción
        cursor.execute(insert_query, values)
    
    conn.commit()
    conn.close()
    print(f"Predicciones guardadas para {len(matriculas)} alumnos actuales")

if __name__ == "__main__":
    print("Entrenando modelo y procesando alumnos actuales...")
    procesar_alumnos_actuales()
    print("Proceso completado!")