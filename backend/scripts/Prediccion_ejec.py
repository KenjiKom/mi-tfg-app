import subprocess
import sys
import os

def ejecutar_scripts():
    scripts = ["Prediccion_1.py", "Prediccion_2.py"]
    
    # Cambiar al directorio del script actual para asegurar rutas correctas
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    for script in scripts:
        try:
            # Ejecutar con entorno heredado y mostrar solo errores críticos
            result = subprocess.run(
                [sys.executable, script],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
        except subprocess.CalledProcessError as e:
            # Escribir error en stderr y terminar
            sys.stderr.write(f"Error al ejecutar {script}:\n")
            sys.stderr.write(e.stderr)
            sys.exit(1)

if __name__ == "__main__":
    ejecutar_scripts()