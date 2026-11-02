const jwt = require('jsonwebtoken');
require('dotenv').config();

// ✅ Verifica que el token JWT sea válido
function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) {
    return res.status(403).json({ mensaje: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRETO, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
    req.usuario = decoded; // Guarda la info del usuario dentro del request
    next();
  });
}

// ✅ Permite solo al rol administrador (rol = 1)
function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 1) {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };
