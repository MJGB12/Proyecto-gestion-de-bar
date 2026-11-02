const { Producto, Sede } = require('../models');

exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: { model: Sede, as: 'sedeData', attributes: ['id_sede', 'nombre_sede'] }
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error });
  }
};

exports.createProducto = async (req, res) => {
  try {
    const { nombre_producto, categoria, marca, tamaño_volumen, precio, cantidad, id_sede } = req.body;
    const nuevo = await Producto.create({ nombre_producto, categoria, marca, tamaño_volumen, precio, cantidad, id_sede });
    res.json({ mensaje: '✅ Producto registrado correctamente', nuevo });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al registrar producto', error });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    await producto.update(req.body);
    res.json({ mensaje: '✏️ Producto actualizado correctamente', producto });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al actualizar producto', error });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    await producto.destroy();
    res.json({ mensaje: '🗑️ Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al eliminar producto', error });
  }
};
