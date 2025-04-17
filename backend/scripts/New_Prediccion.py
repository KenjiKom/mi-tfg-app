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
           CASE WHEN M.Nota IS NULL THEN 0 ELSE M.Nota END AS Nota,
           COUNT(E.id) AS num_eventos
    FROM TFG.Matricula M
    LEFT JOIN TFG.Evento E ON M.id = E.id_matricula
    WHERE M.Curso < %s
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
    SELECT M.id AS id_matricula, M.id_asignatura, M.Curso, COUNT(E.id) AS num_eventos
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
    umbral_actividad = 0  # Puedes ajustar este valor según tus datos
    
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
    curso_actual = get_current_course()
    
    if 'Nota' not in df.columns:
        # Media histórica por asignatura (de cursos anteriores)
        historical_means = (
            event_means[event_means['Curso'] != curso_actual]
            .groupby('id_asignatura')['media_eventos']
            .mean()
            .reset_index()
            .rename(columns={'media_eventos': 'media_historica'})
        )
        
        df = df.merge(historical_means, on='id_asignatura', how='left')
        df['media_eventos'] = df['media_historica'].fillna(0)
    else:
        # Alumnos históricos: usar media de su curso y asignatura exacta
        df = df.merge(event_means, on=['id_asignatura', 'Curso'], how='left')
        df['media_eventos'] = df['media_eventos'].fillna(0)

    df['diferencia_eventos'] = df['num_eventos'] - df['media_eventos']
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
        
        # Determinar la nota a almacenar
        if row['Es_historico']:
            # Para alumnos históricos, no almacenamos nota predicha (usar NULL)
            nota_predicha = None
            nota_final = row['Nota'] if 'Nota' in row and pd.notnull(row['Nota']) else None
        else:
            # Para alumnos actuales, usar la nota predicha
            nota_predicha = row['Nota_predicha'] if 'Nota_predicha' in row and pd.notnull(row['Nota_predicha']) else 0
            nota_final = nota_predicha
        
        # Calcular el perfil
        dif_eventos = row.get('diferencia_eventos', 0)
        cluster_numero = determine_profile(nota_final, dif_eventos)
        cluster = f"Perfil {cluster_numero}"
        
        # Verificar si ya existe una predicción para esta matrícula
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
            params = (
                float(nota_predicha) if nota_predicha is not None else None,
                cluster,
                int(cluster_numero),
                prediccion_fecha, 
                int(row['id_matricula'])
            )
        else:
            query = """
            INSERT INTO TFG.Prediccion 
            (id_matricula, Nota_predicha, Cluster, Cluster_numero, Fecha)
            VALUES (%s, %s, %s, %s, %s)
            """
            params = (
                int(row['id_matricula']),
                float(nota_predicha) if nota_predicha is not None else None,
                cluster,
                int(cluster_numero),
                prediccion_fecha
            )
        
        try:
            cursor.execute(query, params)
        except mysql.connector.Error as err:
            print(f"Error al almacenar predicción para matrícula {row['id_matricula']}: {err}")
            # Si falla por NULL en Nota_predicha, intentamos con un valor por defecto
            if "Nota_predicha' cannot be null" in str(err):
                params = list(params)
                params[1] = 0.0  # Valor por defecto
                cursor.execute(query, tuple(params))
    
    conn.commit()
    conn.close()

def predict_current_students():
    # 1. Obtener datos históricos
    old_students = get_old_students_data()
    
    if old_students.empty:
        print("No hay datos históricos para entrenar el modelo")
        return
    
    # 2. Calcular medias de eventos para normalización
    event_means = calculate_event_means(old_students)
    
    # 3. Preparar datos históricos
    old_students = old_students.merge(event_means, on=['id_asignatura', 'Curso'], how='left')
    old_students['media_eventos'] = old_students['media_eventos'].fillna(0)
    old_students['diferencia_eventos'] = old_students['num_eventos'] - old_students['media_eventos']
    
    # 4. Entrenar modelo con históricos
    try:
        model, scaler = train_regression_model(old_students)
    except ValueError as e:
        print(f"Error al entrenar el modelo: {str(e)}")
        return
    
    # 5. Procesar alumnos actuales
    current_students = get_current_students_data()
    
    if not current_students.empty:
        # 5.1 Calcular diferencia de eventos para actuales
        current_students = current_students.merge(
            event_means.groupby('id_asignatura')['media_eventos'].mean().reset_index(),
            on='id_asignatura',
            how='left'
        )
        current_students['media_eventos'] = current_students['media_eventos'].fillna(0)
        current_students['diferencia_eventos'] = current_students['num_eventos'] - current_students['media_eventos']
        
        # 5.2 Predecir notas para actuales
        X_current = scaler.transform(current_students[['diferencia_eventos']])
        current_students['Nota_predicha'] = model.predict(X_current).clip(0, 100)
    
    # 6. Asignar perfiles a TODOS los alumnos (históricos y actuales)
    # 6.1 Preparar datos combinados
    old_students['Tipo'] = 'historico'
    current_students['Tipo'] = 'actual'
    
    combined = pd.concat([
        old_students[['id_matricula', 'id_asignatura', 'Curso', 'Nota', 'diferencia_eventos', 'Tipo']],
        current_students[['id_matricula', 'id_asignatura', 'Curso', 'Nota_predicha', 'diferencia_eventos', 'Tipo']]
    ], ignore_index=True)
    
    # 6.2 Asignar perfiles según tipo
    combined['Perfil'] = combined.apply(
        lambda x: determine_profile(
            x['Nota'] if x['Tipo'] == 'historico' else x['Nota_predicha'],
            x['diferencia_eventos']
        ),
        axis=1
    )
    
    # 7. Guardar resultados
    store_predictions_in_db(combined)

if __name__ == "__main__":
    predict_current_students()