const { DataTypes, Model } = require('sequelize');

class Mesa extends Model {
  static initModel(sequelize) {
    Mesa.init({
      id_mesa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      numero_mesa: { type: DataTypes.INTEGER, allowNull: false },
      estado: { type: DataTypes.STRING(20), defaultValue: 'Disponible' },
      id_sede: { type: DataTypes.INTEGER, allowNull: false }
    }, {
      sequelize,
      tableName: 'mesa',
      timestamps: false
    });
  }
}

module.exports = Mesa;
