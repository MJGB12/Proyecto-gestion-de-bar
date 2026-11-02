const { DataTypes, Model } = require('sequelize');

class CierreCaja extends Model {
  static initModel(sequelize) {
    CierreCaja.init({
      id_cierre: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_cajero: { type: DataTypes.INTEGER, allowNull: false },
      fecha_cierre: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      total_sistema: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
      total_real: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
      diferencia: { type: DataTypes.DECIMAL(10,2) },
      observaciones: { type: DataTypes.TEXT }
    }, {
      sequelize,
      tableName: 'cierre_caja',
      timestamps: false
    });
  }
}

module.exports = CierreCaja;
