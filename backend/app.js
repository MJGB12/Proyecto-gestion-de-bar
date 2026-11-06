
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const { sequelize } = require('./models');

const app = express();
app.use(cors());

// Ocultar información de Express
app.disable('x-powered-by');

// Política CSP en modo Report-Only (solo supervisión)
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' https://cdn.jsdelivr.net; " +
        "style-src 'self' https://cdn.jsdelivr.net; " +
        "img-src 'self' data:; " +
        "font-src 'self' https://cdn.jsdelivr.net; " +
        "connect-src 'self'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "frame-ancestors 'none'; " +
        "form-action 'self'"
    );
    next();
});

// Evitar interpretación incorrecta de tipos MIME
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

// Protección contra Clickjacking
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

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

