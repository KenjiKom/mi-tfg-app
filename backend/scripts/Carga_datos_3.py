import sys
import pandas as pd
import pymysql
from sqlalchemy import create_engine
from sqlalchemy import text

DB_USER = "root"
DB_PASSWORD = "root"
DB_HOST = "localhost"
DB_NAME = "TFG"

engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}")

def cargar_datos_a_bd(curso, eventos_path):
    eventos_excel = pd.read_excel(eventos_path)

    eventos_excel['Hora'] = pd.to_datetime(
        eventos_excel['Hora'],
        format='%d/%m/%y, %H:%M:%S',
        errors='coerce'
    )

    eventos_excel = eventos_excel.dropna(subset=['Hora'])

    usuarios = pd.read_sql("SELECT id, Nombre FROM Usuario", con=engine)
    usuarios_dict = dict(zip(usuarios['Nombre'], usuarios['id']))

    matriculas = pd.read_sql(
        text("SELECT id AS id_matricula, id_usuario FROM Matricula WHERE Curso = :curso"),
        con=engine,
        params={"curso": curso}
    )


    eventos_excel['id_usuario'] = eventos_excel['Nombre usuario'].map(usuarios_dict)
    eventos_excel = eventos_excel.dropna(subset=['id_usuario'])

    eventos_excel = eventos_excel.merge(
        matriculas,
        on='id_usuario',
        how='inner'
    )

    eventos_excel = eventos_excel.rename(columns={
        'Nombre usuario': 'Nombre',
        'Usuario afectado': 'Afectado',
        'Contexto del evento': 'Contexto',
        'Nombre evento': 'Evento',
        'Descripcion': 'Descripción',
        'Direccion IP': 'Ip'
    })

    columnas_finales = [
        'id_matricula', 'Hora', 'Nombre', 'Afectado',
        'Contexto', 'Componente', 'Evento',
        'Descripción', 'Origen', 'Ip'
    ]

    eventos_excel[columnas_finales].to_sql(
        'Evento',
        con=engine,
        if_exists='append',
        index=False,
        chunksize=5000,
        method='multi'
    )

    print(f"Carga completada: {len(eventos_excel)} eventos procesados")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python Carga_datos_3.py <curso> <eventos.xlsx>")
        sys.exit(1)

    curso = sys.argv[1] 
    eventos_path = sys.argv[2]

    cargar_datos_a_bd(curso, eventos_path)
