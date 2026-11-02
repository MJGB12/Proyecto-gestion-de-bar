const { DataTypes, Model } = require('sequelize');

class Usuario extends Model {
  static initModel(sequelize) {
    Usuario.init({
      id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre_usuario: { type: DataTypes.STRING(100), allowNull: false },
      documento: { type: DataTypes.STRING(20), unique: true },
      contrasenia: { type: DataTypes.STRING(255), allowNull: false },
      rol: { type: DataTypes.INTEGER, allowNull: false },
      sede: { type: DataTypes.INTEGER },
      estado: { type: DataTypes.BOOLEAN, defaultValue: true },
      fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, { sequelize, tableName: 'usuario', timestamps: false });
  }
}

module.exports = Usuario;
