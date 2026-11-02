const { Venta, Pedido, Usuario, Mesa, Producto, DetallePedido } = require("../models");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");


exports.reporteVentasPorFecha = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  try {
    const ventas = await Venta.findAll({
      where: {
        fecha_venta: {
          [Op.between]: [fecha_inicio, fecha_fin]
        }
      },
      include: [{ model: Usuario, as: "cajero" }]
    });

    res.json(ventas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error obteniendo reporte por fecha" });
  }
};

exports.reporteVentasPorSede = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [
        { model: Usuario, as: "cajero" },
        {
          model: Pedido,
          include: [{ model: Mesa }]
        }
      ]
    });

    res.json(ventas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error obteniendo reporte por sede" });
  }
};

exports.exportarCSV = async (req, res) => {
  try {
    const ventas = await Venta.findAll({ raw: true });

    const parser = new Parser();
    const csv = parser.parse(ventas);

    res.header("Content-Type", "text/csv");
    res.attachment("reporte_ventas.csv");
    return res.send(csv);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error exportando CSV" });
  }
};

exports.exportarPDF = async (req, res) => {
  try {
    const ventas = await Venta.findAll();

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Reporte de Ventas", { align: "center" });
    doc.moveDown();

    ventas.forEach(v => {
      doc.fontSize(12).text(`Venta #${v.id_venta} | Total: $${v.total_venta} | Fecha: ${v.fecha_venta}`);
    });

    doc.end();

  } catch (error) {
    res.status(500).json({ mensaje: "Error exportando PDF" });
  }
};

exports.reporteVentas = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [
        { model: Usuario, as: "cajero" },
        {
          model: Pedido,
          include: [
            { model: Mesa },
            {
              model: DetallePedido,
              include: [{ model: Producto }]
            }
          ]
        }
      ]
    });

    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error obteniendo reporte de ventas" });
  }
};

