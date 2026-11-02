const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middlewares/authMiddleware");
const { crearCierreCaja, obtenerUltimosCierres } = require("../controllers/cierreCajaController");

router.post("/", verificarToken, crearCierreCaja);
router.get("/", verificarToken, obtenerUltimosCierres);

module.exports = router;
