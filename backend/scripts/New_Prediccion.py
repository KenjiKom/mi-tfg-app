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
        return 0
    nota = float(nota)
    if nota >= 7.5:
        return 1 if diferencia_eventos >= 0 else 2
    elif nota >= 5:
        return 3
    else:
        return 4 if diferencia_eventos < 0 else 0

def assign_profiles(df, event_means):
    df = df.merge(event_means, on=['id_asignatura', 'Curso'], how='left')
    df['diferencia_eventos'] = df['num_eventos'] - df['media_eventos']
    df['Cluster_numero'] = df.apply(lambda row: determine_profile(row.get('Nota', row.get('Nota_predicha')), row['diferencia_eventos']), axis=1)
    df['Cluster'] = "Perfil " + df['Cluster_numero'].astype(str)
    return df

def train_regression_model(df):
    X = df[['diferencia_eventos']]
    y = df['Nota']
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model = LinearRegression()
    model.fit(X_scaled, y)
    return model, scaler

def predict_current_students():
    old_students = get_old_students_data()
    
    if old_students.empty:
        print("No hay datos históricos para entrenar el modelo")
        return
    
    event_means = calculate_event_means(old_students)
    old_students = assign_profiles(old_students, event_means)
    model, scaler = train_regression_model(old_students)
    current_students = get_current_students_data()
    
    if not current_students.empty:
        global_means = event_means.groupby('id_asignatura')['media_eventos'].mean().reset_index()
        current_students = current_students.merge(global_means, on='id_asignatura', how='left')
        current_students['diferencia_eventos'] = current_students['num_eventos'] - current_students['media_eventos']
        X_current = scaler.transform(current_students[['diferencia_eventos']])
        current_students['Nota_predicha'] = model.predict(X_current)
        current_students = assign_profiles(current_students, event_means)
    
    store_predictions_in_db(current_students)

def store_predictions_in_db(df):
    if df.empty:
        return
        
    conn = connect_db()
    cursor = conn.cursor()
    
    for _, row in df.iterrows():
        prediccion_fecha = datetime.now().strftime('%Y-%m-%d')
        
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
                float(row['Nota_predicha']),
                str(row['Cluster']),
                int(row['Cluster_numero']),
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
                float(row['Nota_predicha']),
                str(row['Cluster']),
                int(row['Cluster_numero']),
                prediccion_fecha
            ))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    predict_current_students()