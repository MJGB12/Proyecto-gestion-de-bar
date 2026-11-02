const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// ✅ Listar usuarios
router.get('/', verificarToken, soloAdmin, usuarioController.getUsuarios);

// ✅ Crear usuario
router.post('/', verificarToken, soloAdmin, usuarioController.crearUsuario);

// ✅ Eliminar usuario
router.delete('/:id', verificarToken, soloAdmin, usuarioController.eliminarUsuario);

// ✅ Actualizar usuario
router.put('/:id', verificarToken, soloAdmin, usuarioController.actualizarUsuario);


module.exports = router;
