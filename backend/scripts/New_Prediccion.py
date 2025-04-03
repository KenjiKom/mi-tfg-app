import pandas as pd
import numpy as np
import joblib
import os
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import mysql.connector
from datetime import datetime

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="TFG"
    )

def get_current_course():
    conn = connect_db()
    query = """
    SELECT MAX(Curso) FROM TFG.Matricula 
    """
    curso = pd.read_sql(query, conn)
    conn.close()
    return curso.iloc[0, 0]

def get_old_students_data():
    conn = connect_db()
    curso_actual = get_current_course()
    query = """
    SELECT M.id AS id_matricula, M.id_asignatura, M.Curso, 
           COALESCE(M.Nota, 0) AS Nota, 
           COUNT(E.id) AS num_eventos
    FROM TFG.Matricula M
    LEFT JOIN TFG.Evento E ON M.id = E.id_matricula
    WHERE M.Curso < %s
    GROUP BY M.id, M.id_asignatura, M.Curso, M.Nota;
    """
    df = pd.read_sql(query, conn, params=[curso_actual])
    conn.close()
    return df

def calculate_event_means(df):
    return df.groupby(['id_asignatura', 'Curso'])['num_eventos'].mean().reset_index().rename(columns={'num_eventos': 'media_eventos'})

def get_current_students_data():
    conn = connect_db()
    curso_actual = get_current_course()
    query = """
    SELECT M.id AS id_matricula, M.id_asignatura, COUNT(E.id) AS num_eventos
    FROM TFG.Matricula M
    LEFT JOIN TFG.Evento E ON M.id = E.id_matricula
    WHERE M.Curso = %s
    GROUP BY M.id, M.id_asignatura;
    """
    df = pd.read_sql(query, conn, params=[curso_actual])
    conn.close()
    return df

def assign_profiles(df, event_means):
    df = df.merge(event_means, on=['id_asignatura', 'Curso'], how='left')
    df['diferencia_eventos'] = df['num_eventos'] - df['media_eventos']
    df['Cluster'] = df.apply(lambda row: determine_profile(row['Nota'], row['diferencia_eventos']), axis=1)
    return df

def determine_profile(nota, diferencia_eventos):
    if nota >= 7.5:
        return "Perfil 1" if diferencia_eventos >= 0 else "Perfil 2"
    elif nota >= 5:
        return "Perfil 3"
    else:
        return "Perfil 4" if diferencia_eventos < 0 else "Perfil 0"

def train_regression_model(df):
    event_means = calculate_event_means(df)
    df = assign_profiles(df, event_means)
    X = df[['diferencia_eventos']]
    y = df['Nota']
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model = LinearRegression()
    model.fit(X_scaled, y)
    return model, scaler, event_means

def predict_current_students():
    old_students_data = get_old_students_data()
    model, scaler, event_means = train_regression_model(old_students_data)
    current_students_data = get_current_students_data()
    current_students_data = current_students_data.merge(event_means, on=['id_asignatura'], how='left')
    current_students_data['diferencia_eventos'] = current_students_data['num_eventos'] - current_students_data['media_eventos']
    X_current = scaler.transform(current_students_data[['diferencia_eventos']])
    current_students_data['Nota_predicha'] = model.predict(X_current)
    current_students_data['Cluster'] = current_students_data.apply(lambda row: determine_profile(row['Nota_predicha'], row['diferencia_eventos']), axis=1)
    store_predictions_in_db(pd.concat([old_students_data, current_students_data], ignore_index=True))

def store_predictions_in_db(df):
    conn = connect_db()
    cursor = conn.cursor()
    for _, row in df.iterrows():
        prediccion_fecha = datetime.now().strftime('%Y-%m-%d')
        query_check = "SELECT COUNT(*) FROM TFG.Prediccion WHERE id_matricula = %s"
        cursor.execute(query_check, (int(row['id_matricula']),))
        exists = cursor.fetchone()[0]
        if exists > 0:
            query_update = """
            UPDATE TFG.Prediccion 
            SET Nota_predicha = %s, Cluster = %s, Cluster_numero = %s, Fecha = %s 
            WHERE id_matricula = %s
            """
            cursor.execute(query_update, (row['Nota_predicha'], row['Cluster'], int(row['Cluster'][-1]), prediccion_fecha, int(row['id_matricula'])))
        else:
            query_insert = """
            INSERT INTO TFG.Prediccion (id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query_insert, (int(row['id_matricula']), row['Nota_predicha'], row['Cluster'], int(row['Cluster'][-1]), prediccion_fecha))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    predict_current_students()
    print("Predicciones completadas.")