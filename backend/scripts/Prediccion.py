import pandas as pd
import numpy as np
import joblib
import os
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import mysql.connector
from datetime import datetime, timedelta

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
    SELECT MAX(Curso) FROM Matricula 
    """
    curso = pd.read_sql(query, conn)
    conn.close()
    return curso.iloc[0, 0]

def get_old_students_data():
    conn = connect_db()
    curso_actual = get_current_course()
    curso_anterior = str(int(curso_actual.split('-')[0]) - 1) + "-" + str(int(curso_actual.split('-')[1]) - 1)

    query = """
    SELECT M.id AS id_matricula, 
        M.Nota, 
        COUNT(E.id) AS num_eventos, 
        MAX(E.Hora) AS ultima_fecha_evento
    FROM Evento E
    JOIN Matricula M ON E.id_matricula = M.id
    WHERE M.Curso = %s 
    AND E.Evento IN ("Se ha subido una entrega.", "Mensaje enviado", 
                 "Algún contenido ha sido publicado.", "Curso visto", 
                 "Tema visto", "Entrega creada", "Intento enviado")
    GROUP BY M.id, M.Nota;
    """
    df = pd.read_sql(query, conn, params=[curso_anterior])
    conn.close()
    return df

def preprocess_old_students_data(df):
    df['num_eventos'] = df['num_eventos'].fillna(0.0).astype(float)
    df['Nota'] = df['Nota'].fillna(0.0).astype(float)
    
    # Convertir fecha a datetime
    df['ultima_fecha_evento'] = pd.to_datetime(df['ultima_fecha_evento'])
    
    # Calcular diferencia en días desde la primera fecha de evento registrada
    df['dias_desde_ultimo_evento'] = (df['ultima_fecha_evento'] - df['ultima_fecha_evento'].min()).dt.days
    df['dias_desde_ultimo_evento'] = df['dias_desde_ultimo_evento'].fillna(0).astype(float)
    
    return df[['num_eventos', 'dias_desde_ultimo_evento', 'Nota']]

def kmeans_old_students(df):
    X = preprocess_old_students_data(df)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=4, random_state=42)
    df['Cluster'] = kmeans.fit_predict(X_scaled)

    store_predictions_in_db(df, None, None, False)

def preprocess_current_students_data(df):
    df['ultima_fecha_evento'] = pd.to_datetime(df['ultima_fecha_evento'])
    df['dias_desde_ultimo_evento'] = (df['ultima_fecha_evento'] - df['ultima_fecha_evento'].min()).dt.days
    df['dias_desde_ultimo_evento'] = df['dias_desde_ultimo_evento'].fillna(0).astype(float)

    return df[['num_eventos', 'dias_desde_ultimo_evento']]

def get_current_students_data():
    conn = connect_db()
    curso_actual = get_current_course()
    query = """
    SELECT M.id AS id_matricula, 
       COUNT(E.id) AS num_eventos,
       MAX(E.Hora) AS ultima_fecha_evento
    FROM Evento E
    JOIN Matricula M ON E.id_matricula = M.id
    WHERE M.Curso = %s
    AND E.Evento IN ("Se ha subido una entrega.", "Mensaje enviado", 
                 "Algún contenido ha sido publicado.", "Curso visto", 
                 "Tema visto", "Entrega creada", "Intento enviado")
    GROUP BY M.id;
    """
    df = pd.read_sql(query, conn, params=[curso_actual])
    conn.close()
    df['ultima_fecha_evento'] = pd.to_datetime(df['ultima_fecha_evento'])
    return df[['id_matricula', 'num_eventos', 'ultima_fecha_evento']]

def preprocess_current_students_data_with_cluster(df):
    df['ultima_fecha_evento'] = pd.to_datetime(df['ultima_fecha_evento'])
    df['dias_desde_ultimo_evento'] = (df['ultima_fecha_evento'] - df['ultima_fecha_evento'].min()).dt.days
    df['dias_desde_ultimo_evento'] = df['dias_desde_ultimo_evento'].fillna(0).astype(float)

def train_random_forest():
    old_data = get_old_students_with_clusters()
    preprocess_current_students_data_with_cluster(old_data)
    
    if 'Cluster' not in old_data.columns:
        raise ValueError("Error: La columna 'Cluster' no existe en old_data. Asegúrate de ejecutar kmeans_old_students antes.")

    X_old = old_data[['num_eventos', 'dias_desde_ultimo_evento']]
    y_old_cluster = old_data['Cluster']
    y_old_nota = old_data['Nota']

    scaler = StandardScaler()
    X_old_scaled = scaler.fit_transform(X_old)

    rf_cluster = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_cluster.fit(X_old_scaled, y_old_cluster)

    rf_nota = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_nota.fit(X_old_scaled, y_old_nota)

    return rf_cluster, rf_nota, scaler

def get_old_students_with_clusters():
    conn = connect_db()
    curso_actual = get_current_course()
    curso_anterior = str(int(curso_actual.split('-')[0]) - 1) + "-" + str(int(curso_actual.split('-')[1]) - 1)

    query = """
    SELECT M.id AS id_matricula, M.Nota, COUNT(E.id) AS num_eventos, P.Cluster_numero AS Cluster, MAX(E.Hora) AS ultima_fecha_evento
    FROM Evento E
    JOIN Matricula M ON E.id_matricula = M.id
    JOIN Prediccion P ON M.id = P.id_matricula
    WHERE M.Curso = %s AND E.Evento IN ("Se ha subido una entrega.", "Mensaje enviado", 
    "Algún contenido ha sido publicado.", "Curso visto", 
    "Tema visto", "Entrega creada", "Intento enviado")
    GROUP BY M.id, M.Nota, P.Cluster_numero;
    """

    df = pd.read_sql(query, conn, params=[curso_anterior])
    conn.close()
    # Asegurarse de que no haya NaN en 'Nota'
    df['Nota'] = df['Nota'].fillna(0)  # Rellenar NaN con un valor predeterminado (0)
    return df

def store_predictions_in_db(df, nota_pred, cluster_pred, is_current=True):
    conn = connect_db()
    cursor = conn.cursor()

    for idx, row in df.iterrows():
        prediccion_fecha = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Si cluster_pred o nota_pred son None, se obtiene la información del DataFrame
        nota_a_guardar = float(nota_pred[idx]) if nota_pred is not None else float(row['Nota'])
        cluster_a_guardar = int(cluster_pred[idx]) if cluster_pred is not None else int(row['Cluster'])

        query_check = "SELECT COUNT(*) FROM Prediccion WHERE id_matricula = %s"
        cursor.execute(query_check, (int(row['id_matricula']),))
        exists = cursor.fetchone()[0]

        if exists > 0:
            query_update = """
            UPDATE Prediccion 
            SET Nota_predicha = %s, Cluster = %s, Cluster_numero = %s, Fecha = %s 
            WHERE id_matricula = %s
            """
            params = (nota_a_guardar, f"Perfil {cluster_a_guardar}", cluster_a_guardar, prediccion_fecha, int(row['id_matricula']))
            cursor.execute(query_update, params)
        else:
            query_insert = """
            INSERT INTO Prediccion (id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha)
            VALUES (%s, %s, %s, %s, %s)
            """
            params = (int(row['id_matricula']), nota_a_guardar, f"Perfil {cluster_a_guardar}", cluster_a_guardar, prediccion_fecha)
            cursor.execute(query_insert, params)

    conn.commit()
    conn.close()

def predict_current_students():
    df = get_current_students_data()
    X_current = preprocess_current_students_data(df)
    if not os.path.exists('rf_cluster_model.pkl'):
        rf_cluster, rf_nota, scaler = train_random_forest()
        joblib.dump(rf_cluster, 'rf_cluster_model.pkl')
        joblib.dump(rf_nota, 'rf_nota_model.pkl')
        joblib.dump(scaler, 'scaler.pkl')
    else:
        rf_cluster = joblib.load('rf_cluster_model.pkl')
        rf_nota = joblib.load('rf_nota_model.pkl')
        scaler = joblib.load('scaler.pkl')
    X_current_scaled = scaler.transform(X_current)
    cluster_pred = rf_cluster.predict(X_current_scaled)
    nota_pred = rf_nota.predict(X_current_scaled)
    store_predictions_in_db(df, nota_pred, cluster_pred, True)

if __name__ == "__main__":
    old_students_data = get_old_students_data()
    kmeans_old_students(old_students_data)  # Asegura que Cluster se genera antes
    print("PERFILES DE USUARIOS GUARDADOS.")
    
    predict_current_students()
    print("PREDICCIONES DE USUARIOS GUARDADOS.")

