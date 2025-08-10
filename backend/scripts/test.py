import numpy as np
import mysql.connector
from Prediccion_2 import calcular_tendencia, obtener_datos_entrenamiento, connect_db
from Prediccion_1 import guardar_historico_limpiar_actual

# === Prueba 1: Conexión a la base de datos ===

def test_conexion_bd():
    try:
        conn = connect_db()
        conn.close()
        print("test_conexion_bd: conexión exitosa.")
    except Exception as e:
        print("test_conexion_bd: error al conectar a la base de datos:", e)

# === Prueba 2: Tendencia de actividad ===

def test_calcular_tendencia():
    try:
        resultado = calcular_tendencia(2138) 
        print("Resultado bruto:", resultado)
        assert isinstance(resultado, float)
        print(f"test_calcular_tendencia: tendencia obtenida = {resultado}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("test_calcular_tendencia: error:", e)

# === Prueba 3: Obtener datos de entrenamiento ===

def test_datos_entrenamiento():
    try:
        X, y = obtener_datos_entrenamiento()
        assert isinstance(X, np.ndarray) and isinstance(y, np.ndarray)
        assert X.shape[0] == y.shape[0]
        assert X.shape[1] == 2  # eventos normalizados + tendencia
        print(f"test_datos_entrenamiento: {X.shape[0]} muestras cargadas correctamente.")
    except Exception as e:
        print("test_datos_entrenamiento: error:", e)

# === Prueba 4: Guardar histórico y limpiar predicciones actuales ===

def test_guardar_historico_limpiar():
    try:
        guardar_historico_limpiar_actual()
        print("test_guardar_historico_limpiar: ejecutado sin errores.")
    except Exception as e:
        print("test_guardar_historico_limpiar: error:", e)

# === Ejecutar todas las pruebas ===

if __name__ == "__main__":
    print("Ejecutando pruebas...\n")
    test_conexion_bd()
    test_calcular_tendencia()
    test_datos_entrenamiento()
    test_guardar_historico_limpiar()