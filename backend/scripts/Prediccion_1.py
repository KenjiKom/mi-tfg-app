import mysql.connector
from datetime import datetime
import numpy as np
from typing import List, Dict, Tuple

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="TFG"
    )

def guardar_historico_limpiar_actual():
    """Guarda las predicciones actuales en histórico y limpia la tabla Prediccion"""
    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        
        cursor.execute("""
        INSERT INTO Prediccion_Hist (
            id_matricula, 
            Nota_predicha, 
            Cluster, 
            Cluster_numero, 
            Fecha
        )
        SELECT 
            id_matricula,
            Nota_predicha,
            Cluster,
            Cluster_numero,
            Fecha
        FROM Prediccion
        """)
        
        cursor.execute("TRUNCATE TABLE Prediccion")
        
        conn.commit()
        print("Datos históricos guardados y tabla Prediccion limpiada")
        
    except Exception as e:
        conn.rollback()
        print(f"Error en guardado histórico: {str(e)}")
        raise
    finally:
        conn.close()

def calcular_tendencia_eventos(id_matricula: int) -> int:
    """Determina si la actividad es creciente (1) o decreciente (-1)"""
    conn = connect_db()
    cursor = conn.cursor()
    
    query = """
    SELECT 
        WEEK(Hora) as semana,
        COUNT(*) as cantidad
    FROM 
        Evento
    WHERE 
        id_matricula = %s
    GROUP BY 
        WEEK(Hora)
    ORDER BY 
        semana
    """
    
    cursor.execute(query, (id_matricula,))
    resultados = cursor.fetchall()
    conn.close()
    
    if len(resultados) < 2:
        return 1  # Por defecto si no hay suficientes datos
    
    primera = resultados[0][1]
    ultima = resultados[-1][1]
    return 1 if ultima >= primera else -1

def obtener_matriculas_anteriores() -> List[Dict]:
    """Obtiene matrículas incluyendo las con nota 0"""
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    WITH 
    ConteoEventos AS (
        SELECT 
            m.id,
            m.id_asignatura,
            m.Curso,
            COUNT(e.id) AS total_eventos,
            MAX(COUNT(e.id)) OVER (PARTITION BY m.id_asignatura, m.Curso) AS max_eventos,
            MIN(COUNT(e.id)) OVER (PARTITION BY m.id_asignatura, m.Curso) AS min_eventos,
            AVG(COUNT(e.id)) OVER (PARTITION BY m.id_asignatura, m.Curso) AS media_eventos,
            IFNULL(m.Nota, 0) AS Nota
        FROM 
            Matricula m
        LEFT JOIN 
            Evento e ON m.id = e.id_matricula
        GROUP BY 
            m.id, m.id_asignatura, m.Curso, m.Nota
    )
    SELECT 
        id,
        Nota,
        CASE 
            WHEN max_eventos = min_eventos THEN 0
            ELSE ((total_eventos - media_eventos) / (max_eventos - min_eventos)) * 2 
        END AS eventos_normalizados
    FROM 
        ConteoEventos
    WHERE 
        Curso < (SELECT MAX(Curso) FROM Matricula)
    """
    
    cursor.execute(query)
    resultados = cursor.fetchall()
    conn.close()
    return resultados

def asignar_perfil(nota: float, eventos_norm: float, tendencia: int) -> Tuple[int, str]:
    """Asigna 1 de 8 perfiles basados en:
    - Nota (aprobado/suspenso)
    - Actividad (alta/baja)
    - Tendencia (creciente/decreciente)"""
    if nota >= 50:  # Aprobado
        if eventos_norm > 0:  # Alta actividad
            return (1, "Aprobado-AltaAct-Creciente") if tendencia > 0 else (2, "Aprobado-AltaAct-Decreciente")
        else:  # Baja actividad
            return (3, "Aprobado-BajaAct-Creciente") if tendencia > 0 else (4, "Aprobado-BajaAct-Decreciente")
    else:  # Suspenso
        if eventos_norm > 0:  # Alta actividad
            return (5, "Suspenso-AltaAct-Creciente") if tendencia > 0 else (6, "Suspenso-AltaAct-Decreciente")
        else:  # Baja actividad
            return (7, "Suspenso-BajaAct-Creciente") if tendencia > 0 else (8, "Suspenso-BajaAct-Decreciente")

def guardar_predicciones():
    matriculas = obtener_matriculas_anteriores()
    conn = connect_db()
    cursor = conn.cursor()
    

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
        tendencia = calcular_tendencia_eventos(matricula['id'])
        cluster_num, cluster_nom = asignar_perfil(
            nota=matricula['Nota'],
            eventos_norm=matricula['eventos_normalizados'],
            tendencia=tendencia
        )
        
        cursor.execute(insert_query, (
            matricula['id'],
            matricula['Nota'],
            cluster_nom,
            cluster_num,
            datetime.now().date()
        ))
    
    conn.commit()
    conn.close()
    print(f"Predicciones históricas guardadas: {len(matriculas)} registros")

if __name__ == "__main__":
    
    guardar_historico_limpiar_actual()
    guardar_predicciones()