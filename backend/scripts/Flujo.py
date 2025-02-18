import subprocess

# Lista de scripts que deseas ejecutar
scripts = [
    ".\Carga_datos_1.py",
    ".\Carga_datos_2.py",
    ".\Carga_datos_3.py",
]

# Ejecuta cada script uno a uno
for script in scripts:
    result = subprocess.run(["python", script], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"El script {script} se ejecutó correctamente.")
    else:
        print(f"Hubo un error en el script {script}: {result.stderr}")
