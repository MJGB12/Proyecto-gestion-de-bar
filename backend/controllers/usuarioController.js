const { Usuario, Rol, Sede } = require('../models');
const bcrypt = require('bcrypt');

exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        'id_usuario',
        'nombre_usuario',
        'documento',
        'rol',
        'sede',
        'estado',
        'fecha_registro'
      ],
      include: [
        { model: Rol, as: 'rolData', attributes: ['id_rol', 'nombre_rol'] },
        { model: Sede, as: 'sedeData', attributes: ['id_sede', 'nombre_sede'] }

      ]
    });
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};

// ✅ Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre_usuario, documento, contrasenia, rol, sede } = req.body;

    const hash = await bcrypt.hash(contrasenia, 10);

    const nuevo = await Usuario.create({
      nombre_usuario,
      documento,
      contrasenia: hash,
      rol,
      sede,
      estado: true
    });

    res.json({ mensaje: 'Usuario creado correctamente', usuario: nuevo });
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario', error });
  }
};

// ✅ Actualizar usuario existente
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_usuario, documento, contrasenia, rol, sede, estado } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Si envían contraseña nueva, la encripta
    let nuevaContrasenia = usuario.contrasenia;
    if (contrasenia && contrasenia.trim() !== '') {
      nuevaContrasenia = await bcrypt.hash(contrasenia, 10);
    }

    await usuario.update({
      nombre_usuario,
      documento,
      contrasenia: nuevaContrasenia,
      rol,
      sede,
      estado
    });

    res.json({ mensaje: 'Usuario actualizado correctamente', usuario });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error });
  }
};

// ✅ Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error });
  }
};
