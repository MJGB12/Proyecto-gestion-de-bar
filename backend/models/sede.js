const { DataTypes, Model } = require('sequelize');

class Sede extends Model {
  static initModel(sequelize) {
    Sede.init({
      id_sede: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_sede: {               // 👈 usa aquí el nombre real del campo
        type: DataTypes.STRING(100),
        allowNull: false
      },
      direccion: {
        type: DataTypes.STRING(255)
      }
    }, {
      sequelize,
      tableName: 'sede',
      timestamps: false
    });
  }
}

module.exports = Sede;

