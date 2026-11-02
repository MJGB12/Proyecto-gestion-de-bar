const { Sequelize } = require('sequelize');
const Usuario = require('./usuario');
const Rol = require('./rol');
const Sede = require('./sede');
const Producto = require("./producto");
const Pedido = require('./pedido');
const DetallePedido = require('./detalle_pedido');
const Mesa = require('./mesa');
const Venta = require('./venta');
const CierreCaja = require('./cierre_caja');


const sequelize = new Sequelize(process.env.PG_URI, {
  dialect: 'postgres',
  logging: false
});

// Inicializar modelos
Usuario.initModel(sequelize);
Rol.initModel(sequelize);
Sede.initModel(sequelize);
Producto.initModel(sequelize);
Pedido.initModel(sequelize);
DetallePedido.initModel(sequelize);
Mesa.initModel(sequelize);
Venta.initModel(sequelize);
CierreCaja.initModel(sequelize);



// Asociaciones
Usuario.belongsTo(Rol, { foreignKey: 'rol', targetKey: 'id_rol', as: 'rolData' });
Usuario.belongsTo(Sede, { foreignKey: 'sede', targetKey: 'id_sede', as: 'sedeData' });

Rol.hasMany(Usuario, { foreignKey: 'rol' });
Sede.hasMany(Usuario, { foreignKey: 'sede' });

Producto.belongsTo(Sede, { foreignKey: 'id_sede', as: 'sedeData' });
Sede.hasMany(Producto, { foreignKey: 'id_sede', as: 'productos' });

// Pedidos
Pedido.belongsTo(Usuario, { foreignKey: 'id_mesero', as: 'meseroData' });
Pedido.belongsTo(Mesa, { foreignKey: 'id_mesa', as: 'mesaData' });

Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto', as: 'productoData' });

// Venta ↔ Pedido ↔ Usuario
Venta.belongsTo(Pedido, { foreignKey: 'id_pedido', as: 'pedidoData' });
Venta.belongsTo(Usuario, { foreignKey: 'id_cajero', as: 'cajeroData' });

CierreCaja.belongsTo(Usuario, { foreignKey: 'id_cajero', as: 'cajeroData' });


module.exports = { 
    sequelize,
    Usuario,
    Rol,
    Sede,
    Producto,
    Pedido,
    DetallePedido,
    Mesa,
    Venta,
    CierreCaja
};
