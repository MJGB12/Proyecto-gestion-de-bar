const { DataTypes, Model } = require('sequelize');

class Pedido extends Model {
  static initModel(sequelize) {
    Pedido.init({
      id_pedido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_mesa: { type: DataTypes.INTEGER, allowNull: false },
      id_mesero: { type: DataTypes.INTEGER, allowNull: false },
      fecha_pedido: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      estado: { type: DataTypes.STRING(20), defaultValue: 'Pendiente' },
      total: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
    }, {
      sequelize,
      tableName: 'pedido',
      timestamps: false
    });
  }
}

module.exports = Pedido;
