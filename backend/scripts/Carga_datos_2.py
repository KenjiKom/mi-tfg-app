import pandas as pd
import pymysql
from sqlalchemy import create_engine

# Orden topológico de la subida de datos: Usuarios -> Asignaturas -> Matricula -> Eventos (la entidad predicciones se realiza más tarde junto al algoritmo) 

DB_USER = "root"
DB_PASSWORD = "root"
DB_HOST = "localhost"
DB_NAME = "TFG"

engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}")

# Función para cargar los datos
def cargar_datos_a_bd():
    # Cargar los datos desde los archivos Excel
    usuarios_excel = pd.read_excel(r"C:\Users\juank\OneDrive\Escritorio\TFG\Datos\Asignaturas\BD\Origen\Usuarios\Usuarios.xlsx")
    asignaturas_excel = pd.read_excel(r"C:\Users\juank\OneDrive\Escritorio\TFG\Datos\Asignaturas\BD\Origen\Asignatura\Asignatura.xlsx")
    curso_actual = pd.read_excel(r"C:\Users\juank\OneDrive\Escritorio\TFG\Datos\Asignaturas\Curso_Actual.xlsx")
    notas_excel = pd.read_excel(r"C:\Users\juank\OneDrive\Escritorio\TFG\Datos\Asignaturas\BD\Origen\Notas\Notas.xlsx")

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
                        f"""
                        UPDATE Matricula
                        SET Nota = {nota_final}
                        WHERE id_usuario = {usuario['id']} AND
                              id_asignatura = {asignatura['id']} AND
                              Curso = '{curso}'
                        """
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
    cargar_datos_a_bd()
