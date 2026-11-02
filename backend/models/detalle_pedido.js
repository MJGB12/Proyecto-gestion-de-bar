const { DataTypes, Model } = require('sequelize');

class DetallePedido extends Model {
  static initModel(sequelize) {
    DetallePedido.init({
      id_detalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_pedido: { type: DataTypes.INTEGER, allowNull: false },
      id_producto: { type: DataTypes.INTEGER, allowNull: false },
      cantidad: { type: DataTypes.INTEGER, allowNull: false },
      subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false }
    }, {
      sequelize,
      tableName: 'detalle_pedido',
      timestamps: false
    });
  }
}

module.exports = DetallePedido;
