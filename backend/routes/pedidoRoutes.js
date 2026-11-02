const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const pedidoController = require('../controllers/pedidoController');

// Crear pedido
router.post('/', verificarToken, pedidoController.crearPedido);

// Consultar pedidos
router.get('/', verificarToken, pedidoController.obtenerPedidos);

// Cambiar estado
router.put('/:id/estado', verificarToken, pedidoController.actualizarEstado);

router.get("/pendientes", verificarToken, pedidoController.listarPendientes);

router.put('/cerrar/:id', verificarToken, pedidoController.cerrarPedido);

module.exports = router;
