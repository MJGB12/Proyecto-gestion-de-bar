const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { documento, contrasenia } = req.body;
    if (!documento || !contrasenia)
      return res.status(400).json({ mensaje: 'Documento y contraseña son requeridos' });

    const usuario = await Usuario.findOne({ where: { documento, estado: true } });
    if (!usuario)
      return res.status(404).json({ mensaje: 'Usuario no encontrado o inactivo' });

    // Si aún no tienes las contraseñas encriptadas, compara directamente
    const coincide = usuario.contrasenia === contrasenia ||
                     await bcrypt.compare(contrasenia, usuario.contrasenia);

    if (!coincide)
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRETO,
      { expiresIn: '3m' } // 3 minutos
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = { login };
