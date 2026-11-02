const { DataTypes, Model } = require('sequelize');

class Producto extends Model {
  static initModel(sequelize) {
    Producto.init({
      id_producto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre_producto: { type: DataTypes.STRING(100), allowNull: false },
      categoria: { type: DataTypes.STRING(50) },
      marca: { type: DataTypes.STRING(50) },
      tamaño_volumen: { type: DataTypes.STRING(30) },
      precio: { type: DataTypes.DECIMAL(10,2), allowNull: false },
      cantidad: { type: DataTypes.INTEGER, defaultValue: 0 },
      id_sede: { type: DataTypes.INTEGER, allowNull: false }
    }, {
      sequelize,
      tableName: 'producto',
      timestamps: false
    });
  }
}

module.exports = Producto;



