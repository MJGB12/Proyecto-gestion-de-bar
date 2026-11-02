const express = require('express');
const router = express.Router();
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');
const productoController = require('../controllers/productoController');

// 🔍 Consultar productos (todos los roles pueden)
router.get('/', verificarToken, productoController.getProductos);

// 🧾 Registrar producto (solo administrador)
router.post('/', verificarToken, soloAdmin, productoController.createProducto);

// ✏️ Actualizar producto (solo administrador)
router.put('/:id', verificarToken, soloAdmin, productoController.updateProducto);

// 🗑️ Eliminar producto (solo administrador)
router.delete('/:id', verificarToken, soloAdmin, productoController.deleteProducto);

module.exports = router;
