import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import mysql.connector
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="TFG"
    )

def get_current_course():
    conn = connect_db()
    query = "SELECT MAX(Curso) FROM TFG.Matricula"
    curso = pd.read_sql(query, conn).iloc[0, 0]
    conn.close()
    return curso

def get_old_students_data():
    conn = connect_db()
    curso_actual = get_current_course()
    query = """
    SELECT M.id AS id_matricula, M.id_asignatura, M.Curso, 
           M.Nota, 
           COUNT(E.id) AS num_eventos
    FROM TFG.Matricula M
    LEFT JOIN TFG.Evento E ON M.id = E.id_matricula
    WHERE M.Curso < %s AND M.Nota IS NOT NULL
    GROUP BY M.id, M.id_asignatura, M.Curso, M.Nota
    """
    df = pd.read_sql(query, conn, params=[curso_actual])
    conn.close()
    return df

def calculate_event_means(df):
    means = df.groupby(['id_asignatura', 'Curso'])['num_eventos'].mean().reset_index()
    means.columns = ['id_asignatura', 'Curso', 'media_eventos']
    return means

def get_current_students_data():
    conn = connect_db()
    curso_actual = get_current_course()
    query = """
    SELECT M.id AS id_matricula, M.id_asignatura, M.Curso, 
           COUNT(E.id) AS num_eventos
    FROM TFG.Matricula M
    LEFT JOIN TFG.Evento E ON M.id = E.id_matricula
    WHERE M.Curso = %s
    GROUP BY M.id, M.id_asignatura, M.Curso
    """
    df = pd.read_sql(query, conn, params=[curso_actual])
    conn.close()
    return df

def determine_profile(nota, diferencia_eventos):
    if nota is None or np.isnan(nota):
        return "Sin perfil"
    nota = float(nota)
    
    umbral_actividad = 0 
    
    if nota >= 50:  # Aprobado
        if diferencia_eventos > umbral_actividad:
            return 1  # Nota aprobada, mucha actividad
        else:
            return 2   # Nota aprobada, poca actividad
    else:  # Suspenso
        if diferencia_eventos > umbral_actividad:
            return 3  # Nota suspensa, mucha actividad
        else:
            return 4    # Nota suspensa, poca actividad

def assign_profiles(df, event_means):
    # Para alumnos actuales (sin nota), usamos la media histórica de su asignatura
    if 'Nota' not in df.columns:
        # Calculamos media histórica por asignatura (todos los cursos anteriores)
        historical_means = event_means.groupby('id_asignatura')['media_eventos'].mean().reset_index()
        historical_means.columns = ['id_asignatura', 'media_historica']
        
        # Hacemos merge con las medias históricas
        df = df.merge(historical_means, on='id_asignatura', how='left')
        df['media_eventos'] = df['media_historica'].fillna(0)
    else:
        # Para alumnos históricos, usamos la media de su curso y asignatura exacta
        df = df.merge(event_means, on=['id_asignatura', 'Curso'], how='left')
        df['media_eventos'] = df['media_eventos'].fillna(0)
    
    df['diferencia_eventos'] = df['num_eventos'] - df['media_eventos']
    
    # Calcular percentiles para distribución 50/50
    df['percentil_actividad'] = df.groupby(['id_asignatura', 'Curso'])['diferencia_eventos'].rank(pct=True)
    
    return df

def train_regression_model(df):
    df_clean = df.fillna(0)
    X = df_clean[['diferencia_eventos']]
    y = df_clean['Nota']
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model = LinearRegression()
    model.fit(X_scaled, y)
    return model, scaler

def store_predictions_in_db(data):
    if data.empty:
        return
        
    conn = connect_db()
    cursor = conn.cursor()
    
    for _, row in data.iterrows():
        prediccion_fecha = datetime.now().strftime('%Y-%m-%d')
        nota_predicha = row['Nota'] if 'Nota' in row and pd.notnull(row['Nota']) else row.get('Nota_predicha', 0)
        cluster_numero = determine_profile(nota_predicha, row.get('diferencia_eventos', 0))
        cluster = f"Perfil {cluster_numero}"
        
        cursor.execute(
            "SELECT COUNT(*) FROM TFG.Prediccion WHERE id_matricula = %s",
            (int(row['id_matricula']),)
        )
        exists = cursor.fetchone()[0] > 0
        
        if exists:
            query = """
            UPDATE TFG.Prediccion 
            SET Nota_predicha = %s, Cluster = %s, Cluster_numero = %s, Fecha = %s 
            WHERE id_matricula = %s
            """
            cursor.execute(query, (
                float(nota_predicha),
                cluster,
                int(cluster_numero),
                prediccion_fecha,
                int(row['id_matricula'])
            ))
        else:
            query = """
            INSERT INTO TFG.Prediccion 
            (id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                int(row['id_matricula']),
                float(nota_predicha),
                cluster,
                int(cluster_numero),
                prediccion_fecha
            ))
    
    conn.commit()
    conn.close()

def predict_current_students():
    old_students = get_old_students_data()
    
    if old_students.empty:
        print("No hay datos históricos para entrenar el modelo")
        return
    
    event_means = calculate_event_means(old_students)
    
    if len(event_means['Curso'].unique()) == 1:
        event_means = event_means.groupby('id_asignatura')['media_eventos'].mean().reset_index()
        event_means['Curso'] = get_current_course()
    
    old_students = assign_profiles(old_students, event_means)
    
    try:
        model, scaler = train_regression_model(old_students)
    except ValueError as e:
        print(f"Error al entrenar el modelo: {str(e)}")
        return
    
    current_students = get_current_students_data()
    
    if not current_students.empty:
        current_students = assign_profiles(current_students, event_means)
        if 'diferencia_eventos' in current_students.columns:
            current_students['diferencia_eventos'] = current_students['diferencia_eventos'].fillna(0)
            X_current = scaler.transform(current_students[['diferencia_eventos']])
            current_students['Nota_predicha'] = model.predict(X_current)
    
    all_data = pd.concat([
        old_students.assign(Es_historico=True),
        current_students.assign(Es_historico=False)
    ], ignore_index=True)
    
    store_predictions_in_db(all_data)

if __name__ == "__main__":
    predict_current_students()