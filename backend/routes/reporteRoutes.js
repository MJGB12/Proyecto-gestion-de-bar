const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');
const { reporteVentasPorFecha, reporteVentasPorSede, exportarCSV, exportarPDF } = require('../controllers/reporteController');

router.get("/ventas/fecha", verificarToken, soloAdmin, reporteVentasPorFecha);
router.get("/ventas/sede", verificarToken, soloAdmin, reporteVentasPorSede);
router.get("/ventas", reporteController.reporteVentas);
router.get("/export/csv", verificarToken, soloAdmin, exportarCSV);
router.get("/export/pdf", verificarToken, soloAdmin, exportarPDF);

module.exports = router;
