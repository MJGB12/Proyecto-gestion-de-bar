const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/ventaController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.post("/", verificarToken, ventaController.registrarVenta);
router.get("/", verificarToken, ventaController.listarVentas);

module.exports = router;
