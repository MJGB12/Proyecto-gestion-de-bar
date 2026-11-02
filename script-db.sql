-- ============================================================
--  BASE DE DATOS: bar_db
--  ESQUEMA: Gestión del Bar
--  AUTOR: Marlon Jair Gonzalez Barbosa
-- ============================================================

-- Eliminamos tablas si existen
DROP TABLE IF EXISTS detalle_pedido, pedido, venta, cierre_caja,
producto, mesa, usuario, rol, sede;

-- ===========================
-- TABLA: Rol
-- ===========================
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- ===========================
-- TABLA: Sede
-- ===========================
CREATE TABLE sede (
    id_sede SERIAL PRIMARY KEY,
    nombre_sede VARCHAR(100) NOT NULL,
    direccion VARCHAR(150),
    telefono VARCHAR(20)
);

-- ===========================
-- TABLA: Usuario
-- ===========================
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol INT NOT NULL REFERENCES rol(id_rol),
    sede INT REFERENCES sede(id_sede),
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- TABLA: Mesa
-- ===========================
CREATE TABLE mesa (
    id_mesa SERIAL PRIMARY KEY,
    numero_mesa INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Disponible',
    id_sede INT NOT NULL REFERENCES sede(id_sede)
);

-- ===========================
-- TABLA: Producto
-- ===========================
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    marca VARCHAR(50),
    tamaño_volumen VARCHAR(30),
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT DEFAULT 0,
    id_sede INT NOT NULL REFERENCES sede(id_sede)
);

-- ===========================
-- TABLA: Pedido
-- ===========================
CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_mesa INT NOT NULL REFERENCES mesa(id_mesa),
    id_mesero INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    total DECIMAL(10,2) DEFAULT 0
);

-- ===========================
-- TABLA: DetallePedido
-- ===========================
CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedido(id_pedido),
    id_producto INT NOT NULL REFERENCES producto(id_producto),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10,2) NOT NULL
);

-- ===========================
-- TABLA: Venta
-- ===========================
CREATE TABLE venta (
    id_venta SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedido(id_pedido),
    id_cajero INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30)
);

-- ===========================
-- TABLA: CierreCaja
-- ===========================
CREATE TABLE cierre_caja (
    id_cierre SERIAL PRIMARY KEY,
    id_cajero INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_cierre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_sistema DECIMAL(10,2) DEFAULT 0,
    total_real DECIMAL(10,2) DEFAULT 0,
    diferencia DECIMAL(10,2),
    observaciones TEXT
);

-- ===========================
-- COMENTARIOS Y DATOS INICIALES
-- ===========================
COMMENT ON TABLE usuario IS 'Usuarios del sistema (admin, cajero, mesero)';
COMMENT ON TABLE producto IS 'Productos disponibles en el bar';
COMMENT ON TABLE pedido IS 'Pedidos realizados por los meseros';
COMMENT ON TABLE venta IS 'Ventas procesadas por los cajeros';
COMMENT ON TABLE cierre_caja IS 'Registro del cierre diario de caja';

-- Datos iniciales
INSERT INTO rol (nombre_rol, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Cajero', 'Procesa pagos y cierres de caja'),
('Mesero', 'Toma pedidos y gestiona mesas');

INSERT INTO sede (nombre_sede, direccion, telefono)
VALUES ('Parkway', 'Calle 51 #63-41', '6016394628');

-- Usuario administrador inicial (la contraseña real se encripta desde backend)
INSERT INTO usuario (nombre_usuario, documento, contraseña, rol, sede)
VALUES ('Administrador', '1000000000', 'admin123', 1, 1);

select * from usuario
