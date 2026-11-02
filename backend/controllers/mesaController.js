const { Mesa } = require('../models');

exports.obtenerMesas = async (req, res) => {
  try {
    const mesas = await Mesa.findAll();
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mesas', error });
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const mesa = await Mesa.findByPk(id);
    if (!mesa) return res.status(404).json({ mensaje: 'Mesa no encontrada' });

    await mesa.update({ estado });
    res.json({ mensaje: `Estado de la mesa actualizado a "${estado}"` });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado de mesa', error });
  }
};

exports.crearMesa = async (req, res) => {
  try {
    const { numero_mesa, id_sede } = req.body;
    const nueva = await Mesa.create({ numero_mesa, id_sede });
    res.json({ mensaje: 'Mesa creada correctamente', mesa: nueva });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear mesa', error });
  }
};

exports.obtenerPorSede = async (req, res) => {
  try {
    const { id } = req.params;

    const mesas = await Mesa.findAll({
      where: { id_sede: id }
    });

    res.json(mesas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mesas por sede', error });
  }
};