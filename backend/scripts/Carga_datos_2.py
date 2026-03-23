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

def cargar_datos_a_bd(usuarios_path, curso, asignatura, notas_path):
    
    usuarios_excel = pd.read_excel(usuarios_path)
    notas_excel = pd.read_excel(notas_path)

    usuarios_db = pd.read_sql("SELECT id, Nombre FROM Usuario", con=engine)
    usuarios_validos = usuarios_db[usuarios_db['Nombre'].isin(usuarios_excel['Usuario'])]

    asignatura_db = pd.read_sql("SELECT id, Nombre FROM Asignatura", con=engine)
    asignatura_validada = asignatura_db[asignatura_db['Nombre'] == asignatura]

    if asignatura_validada.empty:
        print(f"Error: La asignatura '{asignatura}' no existe en la base de datos.")
        return

    id_asignatura = asignatura_validada.iloc[0]['id']

    matriculas_existentes = pd.read_sql("SELECT id_usuario, id_asignatura, Curso, Nota FROM Matricula", con=engine)

    matriculas = []
    for _, usuario in usuarios_validos.iterrows():
        nota_fila = notas_excel[
            (notas_excel['Usuario'] == usuario['Nombre'])
        ]
        nota_final = None
        if not nota_fila.empty and nota_fila['Total del curso (Real)'].iloc[0] != '-':
            nota_final = nota_fila['Total del curso (Real)'].iloc[0]

        existe_matricula = matriculas_existentes[
            (matriculas_existentes['id_usuario'] == usuario['id']) &
            (matriculas_existentes['id_asignatura'] == id_asignatura) &
            (matriculas_existentes['Curso'] == curso)
        ]

        if existe_matricula.empty:
            matriculas.append({
                'id_usuario': usuario['id'],
                'id_asignatura': id_asignatura,
                'Curso': curso,
                'Nota': nota_final
            })
        elif nota_final is not None:
            with engine.connect() as connection:
                connection.execute(
                    text(f"""
                        UPDATE Matricula
                        SET Nota = {nota_final}
                        WHERE id_usuario = {usuario['id']} AND
                            id_asignatura = {id_asignatura} AND
                            Curso = '{curso}'
                    """)
                )

    if matriculas:
        matriculas_df = pd.DataFrame(matriculas)
        matriculas_df.to_sql('Matricula', con=engine, if_exists='append', index=False)
        print(f"Se han insertado {len(matriculas_df)} registros nuevos en la tabla Matricula.")
    else:
        print("No se encontraron nuevas matrículas para insertar.")

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Uso: python Carga_datos_2.py <usuarios.xlsx> <curso> <asignatura> <notas.xlsx>")
        sys.exit(1)

    usuarios_path = sys.argv[1]
    curso = sys.argv[3]
    asignatura = sys.argv[2]
    notas_path = sys.argv[4]

    cargar_datos_a_bd(usuarios_path, curso, asignatura, notas_path)
