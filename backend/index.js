const express = require('express');
const cors = require('cors');
const db = require('./db/connection');
const usuarioRoutes = require('./routes/usuarioRoutes');
const asignaturaRoutes = require('./routes/asignaturaRoutes');
const matriculaRoutes = require('./routes/matriculaRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const prediccionRoutes = require('./routes/prediccionRoutes');
const scriptsRoutes = require('./routes/scriptsRoutes');  // Aquí debes asegurarte de que esté la ruta correcta

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Necesario para procesar formularios

// Conexión a la base de datos
db.connect();

// Rutas del API
app.use('/usuarios', usuarioRoutes);
app.use('/asignaturas', asignaturaRoutes);
app.use('/matriculas', matriculaRoutes);
app.use('/eventos', eventoRoutes);
app.use('/predicciones', prediccionRoutes);
app.use('/scripts', scriptsRoutes);  // Asegúrate de que esta ruta esté bien registrada

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
