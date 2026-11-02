const { DataTypes, Model } = require('sequelize');

class Rol extends Model {
  static initModel(sequelize) {
    Rol.init({
      id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_rol: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.STRING(255)
      }
    }, {
      sequelize,
      tableName: 'rol',
      timestamps: false
    });
  }
}

module.exports = Rol;
