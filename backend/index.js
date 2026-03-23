const express = require('express');
const cors = require('cors');
const db = require('./db/connection');
const usuarioRoutes = require('./routes/usuarioRoutes');
const asignaturaRoutes = require('./routes/asignaturaRoutes');
const prediccionRoutes = require('./routes/prediccionRoutes');
const scriptsRoutes = require('./routes/scriptsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  

// Conexión a la base de datos
db.connect();

// Rutas del API
app.use('/usuarios', usuarioRoutes);
app.use('/asignaturas', asignaturaRoutes);
app.use('/predicciones', prediccionRoutes);
app.use('/scripts', scriptsRoutes); 
app.use('/admin', adminRoutes); 
app.use('/mensajes', mensajeRoutes); 

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
