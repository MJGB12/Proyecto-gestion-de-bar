const { Venta, CierreCaja } = require("../models");
const { Op } = require("sequelize");

exports.crearCierreCaja = async (req, res) => {
  const { total_real, observaciones } = req.body;
  const id_cajero = req.usuario.id_usuario;

  try {
    const ventasHoy = await Venta.findAll({
      where: {
        fecha_venta: {
          [Op.gte]: new Date().setHours(0,0,0,0)
        },
        id_cajero
      }
    });

    const total_sistema = ventasHoy.reduce((sum, v) => sum + parseFloat(v.total_venta), 0);
    const diferencia = total_real - total_sistema;

    const cierre = await CierreCaja.create({
      id_cajero,
      total_sistema,
      total_real,
      diferencia,
      observaciones
    });

    res.json({ mensaje: "Cierre registrado", cierre });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error realizando cierre de caja" });
  }
};

exports.obtenerUltimosCierres = async (req, res) => {
  try {
    const cierres = await CierreCaja.findAll({
      order: [['id_cierre', 'DESC']],
      limit: 20
    });

    res.json(cierres);

  } catch (error) {
    res.status(500).json({ mensaje: "Error obteniendo cierres" });
  }
};
