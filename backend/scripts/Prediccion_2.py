import mysql.connector
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from typing import List, Dict, Tuple

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="TFG"
    )

def calcular_tendencia(id_matricula: int) -> float:
    """Calcula la pendiente de la regresión lineal de actividad semanal"""
    conn = connect_db()
    cursor = conn.cursor()
    
    query = """
    SELECT 
        WEEK(Hora, 3) as semana,
        COUNT(*) as cantidad
    FROM 
        Evento
    WHERE 
        id_matricula = %s
    GROUP BY 
        semana
    ORDER BY 
        semana
    """
    
    cursor.execute(query, (id_matricula,))
    semanas_data = cursor.fetchall()
    conn.close()
    
    if len(semanas_data) < 2:
        return 0
    
    semanas = np.array([d[0] for d in semanas_data])
    cantidades = np.array([d[1] for d in semanas_data])
    slope, _ = np.polyfit(semanas, cantidades, 1)
    return slope

def obtener_datos_entrenamiento() -> Tuple[np.ndarray, np.ndarray]:
    """Obtiene datos históricos normalizados para entrenamiento"""
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    WITH 
    ConteoPorMatricula AS (
        SELECT 
            m.id,
            m.id_asignatura,
            m.Curso,
            COUNT(e.id) as total_eventos,
            IFNULL(m.Nota, 0) AS Nota
        FROM 
            Matricula m
        LEFT JOIN Evento e ON m.id = e.id_matricula
        WHERE 
            m.Curso < (SELECT MAX(Curso) FROM Matricula)
        GROUP BY 
            m.id, m.id_asignatura, m.Curso, m.Nota
    ),
    StatsPorAsignatura AS (
        SELECT 
            id_asignatura,
            Curso,
            AVG(total_eventos) as media_eventos,
            MAX(total_eventos) as max_eventos,
            MIN(total_eventos) as min_eventos
        FROM 
            ConteoPorMatricula
        GROUP BY 
            id_asignatura, Curso
    )
    SELECT 
        c.id,
        c.Nota,
        ((c.total_eventos - s.media_eventos) / NULLIF((s.max_eventos - s.min_eventos), 1)) as eventos_norm
    FROM 
        ConteoPorMatricula c
    JOIN StatsPorAsignatura s ON c.id_asignatura = s.id_asignatura AND c.Curso = s.Curso
    WHERE
        s.max_eventos != s.min_eventos
    """
    
    cursor.execute(query)
    datos = cursor.fetchall()
    conn.close()
    
    X = []
    y = []
    for dato in datos:
        tendencia = calcular_tendencia(dato['id'])
        X.append([dato['eventos_norm'], tendencia])
        y.append(dato['Nota'])
    
    return np.array(X), np.array(y)

def obtener_matriculas_actuales() -> List[Dict]:
    """Obtiene matrículas actuales con eventos normalizados"""
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    WITH 
    CurrentCourse AS (SELECT MAX(Curso) as curso_actual FROM Matricula),
    ConteoPorMatricula AS (
        SELECT 
            m.id,
            m.id_asignatura,
            COUNT(e.id) as total_eventos
        FROM 
            Matricula m
        LEFT JOIN Evento e ON m.id = e.id_matricula
        CROSS JOIN CurrentCourse cc
        WHERE 
            m.Curso = cc.curso_actual
        GROUP BY 
            m.id, m.id_asignatura
    ),
    StatsPorAsignatura AS (
        SELECT 
            id_asignatura,
            AVG(total_eventos) as media_eventos,
            MAX(total_eventos) as max_eventos,
            MIN(total_eventos) as min_eventos
        FROM 
            ConteoPorMatricula
        GROUP BY 
            id_asignatura
    )
    SELECT 
        c.id,
        ((c.total_eventos - s.media_eventos) / NULLIF((s.max_eventos - s.min_eventos), 1)) as eventos_norm
    FROM 
        ConteoPorMatricula c
    JOIN StatsPorAsignatura s ON c.id_asignatura = s.id_asignatura
    WHERE
        s.max_eventos != s.min_eventos
    """
    
    cursor.execute(query)
    resultados = cursor.fetchall()
    conn.close()
    return resultados

def asignar_perfil(nota: float, eventos_norm: float, tendencia: float) -> Tuple[int, str]:
    """Asigna 1 de 8 perfiles basados en:
    - Nota (aprobado/suspenso)
    - Actividad (alta/baja)
    - Tendencia (creciente/decreciente)"""
    if nota >= 50:
        if eventos_norm > 0:
            return (1, "Aprobado-AltaAct-Creciente") if tendencia > 0 else (2, "Aprobado-AltaAct-Decreciente")
        else:
            return (3, "Aprobado-BajaAct-Creciente") if tendencia > 0 else (4, "Aprobado-BajaAct-Decreciente")
    else:
        if eventos_norm > 0:
            return (5, "Suspenso-AltaAct-Creciente") if tendencia > 0 else (6, "Suspenso-AltaAct-Decreciente")
        else:
            return (7, "Suspenso-BajaAct-Creciente") if tendencia > 0 else (8, "Suspenso-BajaAct-Decreciente")

def guardar_predicciones(modelo, matriculas):
    """Guarda las predicciones en la base de datos"""
    conn = connect_db()
    cursor = conn.cursor()
    
    
    cursor.execute("""
    DELETE p FROM Prediccion p
    JOIN Matricula m ON p.id_matricula = m.id
    WHERE m.Curso = (SELECT MAX(Curso) FROM Matricula)
    """)
    
    insert_query = """
    INSERT INTO Prediccion (
        id_matricula,
        Nota_predicha,
        Cluster,
        Cluster_numero,
        Fecha
    ) VALUES (%s, %s, %s, %s, %s)
    """
    
    for matricula in matriculas:
        try:
            tendencia = calcular_tendencia(matricula['id'])
            X_pred = np.array([[matricula['eventos_norm'], tendencia]])
            nota_pred = float(modelo.predict(X_pred)[0])
            nota_pred = max(0, min(100, nota_pred))
            
            cluster_num, cluster_nom = asignar_perfil(
                nota=nota_pred,
                eventos_norm=matricula['eventos_norm'],
                tendencia=tendencia
            )
            
            cursor.execute(insert_query, (
                matricula['id'],
                nota_pred,
                cluster_nom,
                cluster_num,
                datetime.now().date()
            ))
            
        except Exception as e:
            print(f"Error procesando matrícula {matricula.get('id', 'DESCONOCIDO')}: {str(e)}")
            continue
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    
    X_train, y_train = obtener_datos_entrenamiento()
    
    modelo = RandomForestRegressor(n_estimators=300, max_depth=3, min_samples_leaf=5, random_state=42)
    modelo.fit(X_train, y_train)
    
    matriculas = obtener_matriculas_actuales()
    
    guardar_predicciones(modelo, matriculas)
