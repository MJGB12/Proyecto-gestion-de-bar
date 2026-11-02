const { DataTypes, Model } = require('sequelize');

class Venta extends Model {
  static initModel(sequelize) {
    Venta.init({
      id_venta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_pedido: { type: DataTypes.INTEGER, allowNull: false },
      id_cajero: { type: DataTypes.INTEGER, allowNull: false },
      fecha_venta: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      total_venta: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      metodo_pago: { type: DataTypes.STRING(30) }
    }, {
      sequelize,
      tableName: 'venta',
      timestamps: false
    });
  }
}

module.exports = Venta;
