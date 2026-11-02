const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const mesaController = require('../controllers/mesaController');

router.get('/', verificarToken, mesaController.obtenerMesas);
router.get('/por-sede/:id', verificarToken, mesaController.obtenerPorSede);
router.post('/', verificarToken, mesaController.crearMesa);
router.put('/:id/estado', verificarToken, mesaController.actualizarEstado);


module.exports = router;
