import sys
import pandas as pd
import pymysql
from sqlalchemy import create_engine

DB_USER = "root"
DB_PASSWORD = "root"
DB_HOST = "localhost"
DB_NAME = "TFG"

engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}")

def cargar_datos_a_bd(curso, eventos_path):
    eventos_excel = pd.read_excel(eventos_path)

    # Convertir manualmente la columna 'Hora' a datetime
    eventos_excel['Hora'] = pd.to_datetime(eventos_excel['Hora'], format='%d/%m/%y, %H:%M:%S', errors='coerce')

    # Filtrar fechas inválidas
    eventos_excel = eventos_excel[
        (eventos_excel['Hora'] >= '1900-01-01') & (eventos_excel['Hora'] <= '2100-12-31')
    ]

    # Cargar datos desde la base de datos
    usuarios_db = pd.read_sql("SELECT id, Nombre FROM Usuario", con=engine)
    matricula_db = pd.read_sql("SELECT * FROM Matricula", con=engine)
    eventos_db = pd.read_sql("SELECT * FROM Evento", con=engine)

    eventos = []

    for _, evento in eventos_excel.iterrows():
        usuario_evento = usuarios_db[usuarios_db['Nombre'] == evento["Nombre usuario"]]
        if not usuario_evento.empty:
            id_usuario = usuario_evento['id'].values[0]
        else:
            continue  

        # Filtrar matrículas del usuario en el curso proporcionado
        matriculas_usuario = matricula_db[(matricula_db['id_usuario'] == id_usuario) & (matricula_db['Curso'] == curso)]
        if matriculas_usuario.empty:
            continue  

        for _, matricula in matriculas_usuario.iterrows():
            existe_evento = eventos_db[
                (eventos_db['id_matricula'] == matricula['id']) &
                (eventos_db['Hora'] == evento['Hora']) &
                (eventos_db['Evento'] == evento['Nombre evento']) &
                (eventos_db['Descripción'] == evento['Descripcion']) &
                (eventos_db['Ip'] == evento['Direccion IP'])
            ]

            if existe_evento.empty:
                eventos.append({
                    'id_matricula': matricula['id'],
                    'Hora': evento['Hora'],
                    'Nombre': evento['Nombre usuario'],
                    'Afectado': evento['Usuario afectado'],
                    'Contexto': evento['Contexto del evento'],
                    'Componente': evento['Componente'],
                    'Evento': evento['Nombre evento'],
                    'Descripción': evento['Descripcion'],
                    'Origen': evento['Origen'],
                    'Ip': evento['Direccion IP']
                })

    eventos_df = pd.DataFrame(eventos)

    if not eventos_df.empty:
        eventos_df.to_sql('Evento', con=engine, if_exists='append', index=False)
        print(f"Se han insertado {len(eventos_df)} registros nuevos en la tabla Evento.")
    else:
        print("No se encontraron registros nuevos para insertar en la tabla Evento.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python Carga_datos_3.py <curso> <eventos.xlsx>")
        sys.exit(1)

    curso = sys.argv[1]  # Ahora recibe el curso como parámetro directamente
    eventos_path = sys.argv[2]

    cargar_datos_a_bd(curso, eventos_path)
