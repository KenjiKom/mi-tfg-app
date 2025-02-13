const express = require('express');
const cors = require('cors');
const db = require('./db/connection');
const usuarioRoutes = require('./routes/usuarioRoutes');
const asignaturaRoutes = require('./routes/asignaturaRoutes');
const matriculaRoutes = require('./routes/matriculaRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const prediccionRoutes = require('./routes/prediccionRoutes');  // Aquí mantienes la ruta que obtiene los alumnos y predicciones

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
}));
app.use(express.json());

// Conexión a la base de datos
db.connect();

// Rutas del API
app.use('/usuarios', usuarioRoutes);
app.use('/asignaturas', asignaturaRoutes);
app.use('/matriculas', matriculaRoutes);
app.use('/eventos', eventoRoutes);
app.use('/predicciones', prediccionRoutes);

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
