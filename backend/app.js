const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());


const usuarioRoutes = require('./routes/usuarioRoutes'); // ✅ importa la ruta nueva
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes); // ✅ ruta del CRUD

const productoRoutes = require('./routes/productoRoutes');

// ...
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes); // ✅

const pedidoRoutes = require('./routes/pedidoRoutes');
app.use('/api/pedidos', pedidoRoutes);

const mesaRoutes = require('./routes/mesaRoutes');
app.use('/api/mesas', mesaRoutes);

const reporteRoutes = require('./routes/reporteRoutes');
const cierreCajaRoutes = require('./routes/cierreCajaRoutes');

app.use('/api/reportes', reporteRoutes);
app.use('/api/cierre-caja', cierreCajaRoutes);

const ventaRoutes = require('./routes/ventaRoutes');
app.use('/api/ventas', ventaRoutes);



// Servir los archivos del frontend
const rutaFrontend = path.join(__dirname, '../frontend');
console.log("📂 Ruta del frontend:", rutaFrontend);
app.use(express.static(rutaFrontend));

app.use(express.static("C:/Users/EQUIPO/OneDrive/Documentos/bar-web/frontend"));


// Rutas de la API
app.use('/api/auth', authRoutes);

// 👉 Esta línea hace que al entrar a localhost:4000 cargue automáticamente el login
app.get('/', (req, res) => {
  res.sendFile("C:/Users/EQUIPO/OneDrive/Documentos/bar-web/frontend/login.html");
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
    app.listen(PORT, () => console.log(`🌐 Servidor corriendo en puerto ${PORT}`));
  } catch (error) {
    console.error('❌ Error al conectar la base de datos:', error);
  }
})();

