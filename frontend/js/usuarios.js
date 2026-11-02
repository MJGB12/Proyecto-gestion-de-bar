const token = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario"));

// ✅ Verifica si el usuario tiene permisos de administrador
if (!token || !usuario || usuario.rol !== 1) {
  alert("Acceso denegado: solo administradores");
  window.location.href = "login.html";
}

const tablaBody = document.querySelector("#tablaUsuarios tbody");
const form = document.getElementById("formUsuario");

// ✅ Cargar lista de usuarios
async function cargarUsuarios() {
  try {
    console.log("🔁 Cargando usuarios...");
    const res = await fetch("http://localhost:4000/api/usuarios", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error al obtener usuarios:", errorText);
      alert("❌ No se pudieron obtener los usuarios. Ver consola.");
      return;
    }

    const data = await res.json();
    console.log("✅ Usuarios recibidos:", data);

    tablaBody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No hay usuarios registrados</td></tr>`;
      return;
    }

    // 🔹 Renderizar tabla
    data.forEach(u => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${u.id_usuario}</td>
        <td>${u.nombre_usuario}</td>
        <td>${u.documento}</td>
        <td>${u.rolData ? u.rolData.nombre_rol : 'Sin rol'}</td>
        <td>${u.sedeData ? u.sedeData.nombre_sede : 'Sin sede'}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editarUsuario(${u.id_usuario})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id_usuario})">🗑️</button>
        </td>
      `;
      tablaBody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error en cargarUsuarios():", error);
  }
}

// ✅ Registrar nuevo usuario
form.addEventListener("submit", async e => {
  e.preventDefault();

  const datos = {
    nombre_usuario: form.nombre_usuario.value,
    documento: form.documento.value,
    contrasenia: form.contrasenia.value,
    rol: parseInt(form.rol.value),
    sede: parseInt(form.sede.value)
  };

  const res = await fetch("http://localhost:4000/api/usuarios", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  });

  if (res.ok) {
    const data = await res.json();
    alert("✅ " + data.mensaje);
    form.reset();
    await cargarUsuarios(); // 🔁 Actualiza tabla
  } else {
    const err = await res.json();
    alert("❌ Error: " + err.mensaje);
  }
});

// ✅ Eliminar usuario
async function eliminarUsuario(id) {
  if (!confirm("¿Eliminar este usuario?")) return;

  const res = await fetch(`http://localhost:4000/api/usuarios/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (res.ok) {
    alert("🗑️ Usuario eliminado correctamente");
    await cargarUsuarios();
  } else {
    alert("❌ Error al eliminar usuario");
  }
}

// ✅ Editar usuario
async function editarUsuario(id) {
  // 🔹 Pedir nuevos datos
  const nombre_usuario = prompt("Nuevo nombre de usuario:");
  if (!nombre_usuario) return alert("El nombre no puede estar vacío.");

  const documento = prompt("Nuevo documento:");
  if (!documento) return alert("El documento no puede estar vacío.");

  const contrasenia = prompt("Nueva contraseña (déjala vacía si no deseas cambiarla):");

  const rol = parseInt(prompt("Nuevo rol (1=Admin, 2=Cajero, etc.):"));
  if (isNaN(rol)) return alert("Rol inválido.");

  const sede = parseInt(prompt("Nueva sede (ID numérico):"));
  if (isNaN(sede)) return alert("Sede inválida.");

  const res = await fetch(`http://localhost:4000/api/usuarios/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nombre_usuario, documento, contrasenia, rol, sede })
  });

  if (res.ok) {
    alert("✏️ Usuario actualizado correctamente");
    await cargarUsuarios();
  } else {
    alert("❌ Error al actualizar usuario");
  }
}

// ✅ Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ✅ Cargar usuarios al abrir
cargarUsuarios();
