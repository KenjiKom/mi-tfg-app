import sys
import pandas as pd
import pymysql
from sqlalchemy import create_engine

DB_USER = "root"
DB_PASSWORD = "root"
DB_HOST = "localhost"
DB_NAME = "TFG"

engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}")

def cargar_datos_a_bd(usuarios_path, asignaturas_path):
    # Cargar usuarios
    usuarios = pd.read_excel(usuarios_path)
    usuarios.columns = usuarios.columns.str.strip()

    if "Usuario" in usuarios.columns:
        usuarios = usuarios.rename(columns={"Usuario": "Nombre"})
    else:
        raise ValueError("El archivo de usuarios no contiene la columna 'Usuario'.")

    if "Contrasena" not in usuarios.columns:
        raise ValueError("El archivo de usuarios no contiene la columna 'Contrasena'.")

    usuarios["is_teacher"] = usuarios.get("is_teacher", "").fillna("").apply(lambda x: True if x == "Y" else False)
    usuarios["is_admin"] = usuarios.get("is_admin", "").fillna("").apply(lambda x: True if x == "Y" else False)

    usuarios_existentes = pd.read_sql("SELECT Nombre FROM Usuario", con=engine)
    usuarios_nuevos = usuarios[~usuarios["Nombre"].isin(usuarios_existentes["Nombre"])]

    if not usuarios_nuevos.empty:
        usuarios_nuevos.to_sql("Usuario", con=engine, if_exists="append", index=False)
        print("Usuarios nuevos cargados exitosamente.")
    else:
        print("No se encontraron usuarios nuevos para cargar.")

    # Cargar asignaturas
    asignaturas = pd.read_excel(asignaturas_path)
    asignaturas.columns = asignaturas.columns.str.strip()

    asignaturas_existentes = pd.read_sql("SELECT Nombre FROM Asignatura", con=engine)
    asignaturas_nuevas = asignaturas[~asignaturas["Nombre"].isin(asignaturas_existentes["Nombre"])]

    if not asignaturas_nuevas.empty:
        asignaturas_nuevas.to_sql("Asignatura", con=engine, if_exists="append", index=False)
        print("Asignaturas nuevas cargadas correctamente.")
    else:
        print("No se encontraron asignaturas nuevas para cargar.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python cargar_datos.py <usuarios.xlsx> <asignaturas.xlsx>")
        sys.exit(1)

    usuarios_path = sys.argv[1]
    asignaturas_path = sys.argv[2]

    cargar_datos_a_bd(usuarios_path, asignaturas_path)
