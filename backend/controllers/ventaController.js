const { Venta, Pedido, DetallePedido, Producto, Mesa } = require("../models");

exports.registrarVenta = async (req, res) => {
  const { id_pedido, metodo_pago } = req.body;
  const id_cajero = req.usuario.id_usuario; // quien cobra

  try {
    const pedido = await Pedido.findByPk(id_pedido, {
      include: [{ 
        model: DetallePedido, 
        include: [Producto] 
      }]
    });

    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    // Calcular total
    let total = 0;
    pedido.detalle_pedidos.forEach(det => {
      total += det.cantidad * det.producto.precio;
    });

    // Registrar venta
    const venta = await Venta.create({
      id_pedido,
      id_cajero,
      metodo_pago,
      total_venta: total
    });

    // Cambiar estado del pedido a pagado (si tienes esa columna)
    pedido.estado = "Pagado";
    await pedido.save();

    // Liberar mesa (opcional)
    await Mesa.update(
      { estado: "Disponible" },
      { where: { id_mesa: pedido.id_mesa } }
    );

    res.json({ mensaje: "Venta registrada", venta });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error registrando venta" });
  }
};

exports.listarVentas = async (req, res) => {
  try {
    const ventas = await Venta.findAll();
    res.json(ventas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error obteniendo ventas" });
  }
};
