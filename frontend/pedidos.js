// pedidos.js (reemplaza tu archivo)
const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión");
  window.location.href = "login.html";
}

const form = document.getElementById("formPedido");
const listaProductos = document.getElementById("listaProductos");
const selectProducto = document.getElementById("selectProducto");
const tablaBody = document.getElementById("tablaPedidos");
const btnAgregar = document.getElementById("btnAgregar");

const inputMesa = document.getElementById("id_mesa");
const inputMesero = document.getElementById("id_mesero");
const inputCantidad = document.getElementById("cantidad");

let productosPedido = [];

// Formatea número a moneda simple
function formatMoney(n) {
  return Number(n).toFixed(2);
}

// Cargar productos desde backend y poblar select
async function cargarProductos() {
  try {
    const res = await fetch("http://localhost:4000/api/productos", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.status === 401) throw new Error("Token inválido o expirado");
    const data = await res.json();
    selectProducto.innerHTML = '<option value="">Selecciona producto</option>';
    data.forEach(p => {
      // asegúrate que tu backend devuelva id_producto, nombre_producto, precio
      selectProducto.innerHTML += `<option value="${p.id_producto}" data-precio="${p.precio}">${p.nombre_producto} - $${formatMoney(p.precio)}</option>`;
    });
  } catch (err) {
    alert("Error cargando productos: " + err.message);
    selectProducto.innerHTML = '<option value="">No se pudieron cargar productos</option>';
    console.error(err);
  }
}

// Agregar producto al array
btnAgregar.addEventListener("click", () => {
  const id_producto = parseInt(selectProducto.value);
  const cantidad = parseInt(inputCantidad.value);
  const opcion = selectProducto.options[selectProducto.selectedIndex];
  if (!opcion || !opcion.value) {
    alert("Selecciona un producto válido");
    return;
  }
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    alert("Ingresa una cantidad válida");
    return;
  }
  const nombre = opcion.textContent.split(" - ")[0].trim();
  const precio = parseFloat(opcion.dataset.precio) || 0;

  productosPedido.push({ id_producto, cantidad, nombre, precio });
  actualizarLista();
});

// Actualizar lista visual de productos
function actualizarLista() {
  listaProductos.innerHTML = "";
  productosPedido.forEach((p, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `${p.nombre} (x${p.cantidad}) - $${formatMoney(p.precio * p.cantidad)}
      <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${index})">🗑️</button>`;
    listaProductos.appendChild(li);
  });
}

// Eliminar producto
window.eliminarProducto = function(i) {
  productosPedido.splice(i, 1);
  actualizarLista();
};

// Registrar pedido
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (productosPedido.length === 0) {
    alert("Agrega al menos un producto");
    return;
  }

  const id_mesa = parseInt(inputMesa.value);
  const id_mesero = parseInt(inputMesero.value);

  if (!Number.isInteger(id_mesa) || !Number.isInteger(id_mesero)) {
    alert("Mesa o ID de mesero inválido");
    return;
  }

  const datos = {
    id_mesa,
    id_mesero,
    productos: productosPedido.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad }))
  };

  try {
    const res = await fetch("http://localhost:4000/api/pedidos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Pedido registrado correctamente");
      productosPedido = [];
      actualizarLista();
      form.reset();
      await cargarPedidos();
    } else {
      // Mostrar mensaje recibido del backend (más informativo)
      alert("❌ " + (data.mensaje || JSON.stringify(data)));
    }
  } catch (err) {
    alert("❌ Error al registrar pedido: " + err.message);
    console.error(err);
  }
});

// Cargar pedidos y mostrarlos en la tabla
async function cargarPedidos() {
  try {
    const res = await fetch("http://localhost:4000/api/pedidos", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.status === 401) {
      alert("Token inválido o expirado");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }
    const data = await res.json();
    tablaBody.innerHTML = "";
    data.forEach(p => {
      const fila = document.createElement("tr");
      const estado = p.estado || "Pendiente";
      const badgeClass = estado === 'Listo' ? 'success' : estado === 'Preparando' ? 'warning' : 'secondary';
      fila.innerHTML = `
        <td>${p.id_pedido}</td>
        <td>${p.mesaData?.numero_mesa ?? p.id_mesa}</td>
        <td>${p.meseroData?.nombre_usuario ?? p.id_mesero}</td>
        <td>$${formatMoney(p.total ?? 0)}</td>
        <td><span class="badge bg-${badgeClass}">${estado}</span></td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="actualizarEstado(${p.id_pedido}, 'Preparando')">⏳ Preparar</button>
          <button class="btn btn-sm btn-success" onclick="actualizarEstado(${p.id_pedido}, 'Listo')">✅ Listo</button>
          <button class="btn btn-success" onclick="cerrarPedidoFrontend(${p.id_pedido})">Cerrar pedido</button>
        </td>
      `;
      tablaBody.appendChild(fila);
    });
  } catch (err) {
    alert("Error cargando pedidos: " + err.message);
    console.error(err);
  }
}

// Actualizar estado del pedido
window.actualizarEstado = async function(id, estado) {
  try {
    const res = await fetch(`http://localhost:4000/api/pedidos/${id}/estado`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ estado })
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.mensaje || 'Estado actualizado');
      cargarPedidos();
    } else {
      alert("Error: " + (data.mensaje || JSON.stringify(data)));
    }
  } catch (err) {
    alert("Error actualizando estado: " + err.message);
    console.error(err);
  }
}

async function cerrarPedidoFrontend(idPedido) {
  try {
    // si tienes un select para metodo, busca el valor; si no, pedir al cajero
    let metodo = document.getElementById(`metodo_${idPedido}`)?.value;
    if (!metodo) metodo = prompt("Método de pago (Efectivo / Tarjeta / Nequi):", "Efectivo");

    const token = localStorage.getItem('token'); // asegúrate que guardas el token
    const res = await fetch(`${apiBase}/api/pedidos/cerrar/${idPedido}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ metodo_pago: metodo })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Error cerrar pedido response:', data);
      alert(data.mensaje || 'Error al cerrar pedido');
      return;
    }

    alert('Pedido cerrado y venta registrada correctamente');
    // refrescar la UI (lista de pedidos, mesas, etc.)
    if (typeof cargarPedidos === 'function') cargarPedidos();
    if (typeof cargarMesas === 'function') cargarMesas();
  } catch (err) {
    console.error('fetch error cerrarPedido:', err);
    alert('Error de red al cerrar pedido (ver consola)');
  }
}

// Inicializar
cargarProductos();
cargarPedidos();
