const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { documento, contrasenia } = req.body;

    if (!documento || !contrasenia) {
      return res.status(400).json({ mensaje: 'Documento y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({
      where: { documento, estado: true }
    });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const coincide = await bcrypt.compare(contrasenia, usuario.contrasenia);

    if (!coincide) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRETO,
      { expiresIn: '3m' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3 * 60 * 1000,
      path: '/'
    });

    res.json({
      mensaje: 'Inicio de sesión exitoso',
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

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  res.json({ mensaje: 'Sesión cerrada correctamente' });
};

module.exports = { login, logout };

