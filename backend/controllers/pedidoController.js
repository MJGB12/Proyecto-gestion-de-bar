// backend/controllers/pedidoController.js (sugerencia)
const { Pedido, DetallePedido, Producto, Mesa, Usuario } = require('../models');
const { Op } = require('sequelize');

exports.crearPedido = async (req, res) => {
  const { id_mesa, id_mesero, productos } = req.body;
  const t = await Pedido.sequelize.transaction();
  try {
    // Validaciones básicas
    if (!Number.isInteger(id_mesa) || !Number.isInteger(id_mesero)) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'id_mesa e id_mesero deben ser enteros válidos' });
    }
    if (!Array.isArray(productos) || productos.length === 0) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Debe enviar al menos un producto' });
    }

    const mesa = await Mesa.findByPk(id_mesa, { transaction: t });
    if (!mesa) { await t.rollback(); return res.status(404).json({ mensaje: 'Mesa no encontrada' }); }

    const mesero = await Usuario.findByPk(id_mesero, { transaction: t });
    if (!mesero) { await t.rollback(); return res.status(404).json({ mensaje: 'Mesero no encontrado' }); }

    // Crear pedido
    const pedido = await Pedido.create({ id_mesa, id_mesero }, { transaction: t });

    let total = 0;

    for (const p of productos) {
      const producto = await Producto.findByPk(p.id_producto, { transaction: t });
      if (!producto) {
        throw new Error(`Producto con ID ${p.id_producto} no encontrado`);
      }
      if (producto.cantidad < p.cantidad) {
        throw new Error(`No hay suficiente stock de ${producto.nombre_producto}`);
      }
      const subtotal = parseFloat(producto.precio) * parseInt(p.cantidad);
      total += subtotal;

      // Descontar stock
      await producto.update({ cantidad: producto.cantidad - p.cantidad }, { transaction: t });

      // Crear detalle
      await DetallePedido.create({
        id_pedido: pedido.id_pedido,
        id_producto: p.id_producto,
        cantidad: p.cantidad,
        subtotal: subtotal.toFixed(2)
      }, { transaction: t });
    }

    // Actualizar total y estado mesa
    await pedido.update({ total: total.toFixed(2) }, { transaction: t });
    await mesa.update({ estado: 'Ocupada' }, { transaction: t });

    await t.commit();
    // Devuelve pedido con sus detalles si quieres (podrías reconsultar)
    return res.status(201).json({ mensaje: 'Pedido creado correctamente', pedido });
  } catch (error) {
    await t.rollback();
    console.error(error);
    // Si es error de negocio (stock), devolver 400
    if (error.message && error.message.startsWith('No hay suficiente stock')) {
      return res.status(400).json({ mensaje: error.message });
    }
    return res.status(500).json({ mensaje: 'Error al crear pedido', error: error.message });
  }
};

exports.obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        { model: Usuario, as: 'meseroData', attributes: ['id_usuario', 'nombre_usuario'] },
        { model: Mesa, as: 'mesaData', attributes: ['id_mesa', 'numero_mesa'] },
        {
          model: DetallePedido,
          as: 'detalles',
          include: { model: Producto, as: 'productoData', attributes: ['nombre_producto', 'precio'] }
        }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const pedido = await Pedido.findByPk(id);
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });

    await pedido.update({ estado });
    // Opcional: si se cierra el pedido, liberar la mesa
    if (estado === 'Cerrado' || estado === 'Pagado') {
      const mesa = await Mesa.findByPk(pedido.id_mesa);
      if (mesa) await mesa.update({ estado: 'Disponible' });
    }

    res.json({ mensaje: `Estado actualizado a ${estado}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
  }
};

exports.listarPendientes = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { estado: "En proceso" },
      include: [
        { model: Mesa },
        {
          model: DetallePedido,
          include: [Producto]
        }
      ]
    });

    // Calcular total del pedido
    const lista = pedidos.map(p => {
      let total = 0;
      p.detalle_pedidos.forEach(det => {
        total += det.cantidad * det.producto.precio;
      });

      return {
        ...p.toJSON(),
        total
      };
    });

    res.json(lista);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error listando pedidos" });
  }
};

exports.cerrarPedido = async (req, res) => {
  const idPedido = req.params.id;
  const { metodo_pago } = req.body || {};
  const id_cajero = req.usuario?.id_usuario || req.body.id_cajero || null; // intenta tomar del token

  try {
    const pedido = await Pedido.findByPk(idPedido, {
      include: [
        {
          model: DetallePedido,
          as: 'detalles',            // coincide con models/index.js
          include: [{ model: Producto, as: 'productoData' }] // coincide con tu modelo
        }
      ]
    });

    if (!pedido) return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    if (pedido.estado && pedido.estado.toLowerCase() === 'cerrado') {
      return res.status(400).json({ ok: false, mensaje: 'El pedido ya está cerrado' });
    }

    // calcular total
    let total = 0;
    if (pedido.detalles && pedido.detalles.length > 0) {
      pedido.detalles.forEach(det => {
        const precio = det.productoData ? Number(det.productoData.precio) : Number(det.subtotal) / (det.cantidad || 1);
        total += precio * Number(det.cantidad);
      });
    } else {
      // fallback al campo total en pedido si existe
      total = Number(pedido.total || 0);
    }

    // registrar venta
    const venta = await Venta.create({
      id_pedido: pedido.id_pedido,
      id_cajero: id_cajero,
      total_venta: total.toFixed(2),
      metodo_pago: metodo_pago || 'No especificado'
    });

    // actualizar pedido a 'Cerrado' (o 'Pagado' según tu convención)
    pedido.estado = 'Cerrado';
    await pedido.save();

    // liberar mesa (si existe)
    if (pedido.id_mesa) {
      await Mesa.update({ estado: 'Disponible' }, { where: { id_mesa: pedido.id_mesa } });
    }

    return res.json({ ok: true, mensaje: 'Pedido cerrado y venta registrada', venta });
  } catch (err) {
    console.error('ERR cerrarPedido:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error al cerrar pedido', error: err.message });
  }
};