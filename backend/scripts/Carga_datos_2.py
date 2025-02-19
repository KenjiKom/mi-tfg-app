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

def cargar_datos_a_bd(usuarios_path, asignaturas_path, curso_path, notas_path):
    # Cargar los datos desde los archivos Excel
    usuarios_excel = pd.read_excel(usuarios_path)
    asignaturas_excel = pd.read_excel(asignaturas_path)
    curso_actual = pd.read_excel(curso_path)
    notas_excel = pd.read_excel(notas_path)
    
    # Obtener el curso actual
    curso = curso_actual.iloc[0, 0]

    # 1. Obtener los usuarios en la base de datos
    usuarios_db = pd.read_sql("SELECT id, Nombre FROM Usuario", con=engine)
    usuarios_validos = usuarios_db[usuarios_db['Nombre'].isin(usuarios_excel['Usuario'])]

    # 2. Obtener las asignaturas en la base de datos
    asignaturas_db = pd.read_sql("SELECT id, Nombre FROM Asignatura", con=engine)
    asignaturas_validas = asignaturas_db[asignaturas_db['Nombre'].isin(asignaturas_excel['Nombre'])]

    # 3. Obtener las matrículas existentes
    matriculas_existentes = pd.read_sql("SELECT id_usuario, id_asignatura, Curso, Nota FROM Matricula", con=engine)

    # Crear registros de matrícula
    matriculas = []
    for _, usuario in usuarios_validos.iterrows():
        for _, asignatura in asignaturas_validas.iterrows():
            # Buscar si hay una nota para este usuario y asignatura
            nota_fila = notas_excel[
                (notas_excel['Usuario'] == usuario['Nombre'])
            ]
            nota_final = None
            if not nota_fila.empty and nota_fila['Total del curso (Real)'].iloc[0] != '-':
                nota_final = nota_fila['Total del curso (Real)'].iloc[0]

            # Verificar si la matrícula ya existe
            existe_matricula = matriculas_existentes[
                (matriculas_existentes['id_usuario'] == usuario['id']) &
                (matriculas_existentes['id_asignatura'] == asignatura['id']) &
                (matriculas_existentes['Curso'] == curso)
            ]

            if existe_matricula.empty:
                # Si no existe, agregar una nueva matrícula
                matriculas.append({
                    'id_usuario': usuario['id'],
                    'id_asignatura': asignatura['id'],
                    'Curso': curso,
                    'Nota': nota_final
                })
            elif nota_final is not None:
                # Si ya existe y tiene una nueva nota, actualizar la nota
                with engine.connect() as connection:
                    connection.execute(
                        text(f"""
                            UPDATE Matricula
                            SET Nota = {nota_final}
                            WHERE id_usuario = {usuario['id']} AND
                                id_asignatura = {asignatura['id']} AND
                                Curso = '{curso}'
                        """)
                    )

    # Convertir la lista de nuevas matrículas a un DataFrame
    if matriculas:
        matriculas_df = pd.DataFrame(matriculas)

        # Insertar los registros en la tabla Matricula de la base de datos
        matriculas_df.to_sql('Matricula', con=engine, if_exists='append', index=False)
        print(f"Se han insertado {len(matriculas_df)} registros nuevos en la tabla Matricula.")
    else:
        print("No se encontraron nuevas matrículas para insertar.")

# Ejecutar el script
if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Uso: python Carga_datos_2.py <usuarios.xlsx> <asignaturas.xlsx> <curso.xlsx> <notas.xlsx>")
        sys.exit(1)

    usuarios_path = sys.argv[1]
    asignaturas_path = sys.argv[2]
    curso_path = sys.argv[3]
    notas_path = sys.argv[4]

    cargar_datos_a_bd(usuarios_path, asignaturas_path, curso_path, notas_path)
