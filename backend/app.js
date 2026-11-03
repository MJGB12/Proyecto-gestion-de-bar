
const express = require('express');
require('dotenv').config();
const path = require('path');
const { sequelize } = require('./models');

const app = express();

app.use(express.json());

// Rutas de la API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/pedidos', require('./routes/pedidoRoutes'));
app.use('/api/mesas', require('./routes/mesaRoutes'));
app.use('/api/reportes', require('./routes/reporteRoutes'));
app.use('/api/cierre-caja', require('./routes/cierreCajaRoutes'));
app.use('/api/ventas', require('./routes/ventaRoutes'));

// Servir frontend
const rutaFrontend = path.join(__dirname, '../frontend');
app.use(express.static(rutaFrontend));

app.get('/', (req, res) => {
    res.sendFile(path.join(rutaFrontend, 'login.html'));
});

const PORT = process.env.PORT || 4000;

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa con PostgreSQL');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
})();

