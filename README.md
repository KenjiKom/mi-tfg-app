## Arquitectura del sistema

El proyecto está compuesto por tres bloques principales:

- Backend: Desarrollado en Node.js, gestiona la lógica de negocio y la conexión con la base de datos.
- Frontend: Desarrollado en React, permite la visualización de predicciones y métricas.
- Módulo de Machine Learning: Implementado en Python, genera predicciones de rendimiento académico y clasifica estudiantes en perfiles (clusters).

---

# Instalación y puesta en marcha

## 1. Requisitos previos

Asegúrate de tener instalado:

- Sistema operativo: Windows 10/11, Linux o macOS  
- Node.js v18.x o superior  
- npm v9.x o superior  
- Python 3.10 o superior  
- MySQL  
- Navegador actualizado (Google Chrome recomendado)

Verificar versiones instaladas:

```bash
node --version
npm --version
python --version
```

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/KenjiKom/mi-tfg-app.git
cd mi-tfg-app
```

---

## 3. Instalación del backend

```bash
cd backend
npm install
```

---

## 4. Instalación del frontend

Desde la raíz del proyecto:

```bash
npm install
```

---

## 5. Configuración de la base de datos

1. Asegúrate de que MySQL esté en ejecución.
2. Configura las credenciales de conexión en el archivo correspondiente del backend (por ejemplo `.env` o archivo de configuración).
3. Crea la base de datos necesaria.
4. Si el proyecto incluye contenedor Docker para la base de datos, ejecútalo previamente.

---

## Ejecución en entorno de desarrollo

### Ejecutar el backend

```bash
cd backend
node index.js
```

### Ejecutar el frontend

En otra terminal:

```bash
npm start
```

El frontend se abrirá automáticamente en el navegador (normalmente en http://localhost:3000).

---

# Despliegue en producción

Para generar la versión optimizada del frontend:

```bash
npm run build
```

Esto generará una carpeta `build/` que puede:

- Servirse desde un servidor estático.
- Integrarse con el backend.
- Desplegarse en un servidor como Nginx o Apache.

---

# Buenas prácticas de desarrollo

- Usar componentes funcionales y hooks en React.
- Mantener separada la lógica de negocio del acceso a datos.
- Modularizar el código.
- Documentar controladores y componentes complejos.
- Seguir el principio KISS (Keep It Simple, Stupid).
- Utilizar control de versiones con Git (recomendado modelo Git Flow en entornos colaborativos).

---

# Notas adicionales

Este sistema está diseñado para integrarse con Moodle y puede ampliarse fácilmente con:

- Nuevos modelos predictivos.
- Nuevas métricas de analítica.
- Nuevas visualizaciones.
- Nuevos roles o funcionalidades.

Si necesitas ayuda para extender el sistema o modificar su arquitectura, revisa la documentación técnica del proyecto.
