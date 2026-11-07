const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(403).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRETO, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }

    req.usuario = decoded;
    next();
  });
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 1) {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
  }

  next();
}

module.exports = { verificarToken, soloAdmin };
