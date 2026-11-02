const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión");
  window.location.href = "login.html";
}

const tablaBody = document.querySelector("#tablaProductos tbody");
const form = document.getElementById("formProducto");

function quickSortProductos(arr, clave) {
  if (arr.length <= 1) return arr;

  const pivote = arr[arr.length - 1][clave];
  const menores = [];
  const mayores = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i][clave] < pivote) menores.push(arr[i]);
    else mayores.push(arr[i]);
  }

  return [
    ...quickSortProductos(menores, clave), 
    arr[arr.length - 1], 
    ...quickSortProductos(mayores, clave)
  ];
}
document.getElementById("ordenarPrecio").addEventListener("click", () => {
  productos = quickSortProductos(productos, "precio");
  mostrarProductos(productos);
});

async function cargarProductos() {
  const res = await fetch("http://localhost:4000/api/productos", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();

  tablaBody.innerHTML = "";
  data.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id_producto}</td>
      <td>${p.nombre_producto}</td>
      <td>${p.categoria || '-'}</td>
      <td>${p.marca || '-'}</td>
      <td>${p.tamaño_volumen || '-'}</td>
      <td>$${p.precio}</td>
      <td>${p.cantidad}</td>
      <td>${p.sedeData?.nombre_sede || p.id_sede}</td>
      <td>
        <button onclick="editarProducto(${p.id_producto})">✏️</button>
        <button onclick="eliminarProducto(${p.id_producto})">🗑️</button>
      </td>
    `;
    tablaBody.appendChild(fila);
  });
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(form));
  const res = await fetch("http://localhost:4000/api/productos", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  if (res.ok) {
    alert("✅ Producto registrado correctamente");
    form.reset();
    cargarProductos();
  } else {
    alert("❌ Error al registrar producto");
  }
});

async function editarProducto(id) {
  const nuevoPrecio = prompt("Nuevo precio:");
  const nuevaCantidad = prompt("Nueva cantidad:");

  const res = await fetch(`http://localhost:4000/api/productos/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ precio: nuevoPrecio, cantidad: nuevaCantidad })
  });

  if (res.ok) {
    alert("✏️ Producto actualizado");
    cargarProductos();
  } else {
    alert("❌ Error al actualizar");
  }
}

async function eliminarProducto(id) {
  if (!confirm("¿Eliminar este producto?")) return;
  const res = await fetch(`http://localhost:4000/api/productos/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (res.ok) {
    alert("🗑️ Producto eliminado");
    cargarProductos();
  } else {
    alert("❌ Error al eliminar producto");
  }
}

cargarProductos();
