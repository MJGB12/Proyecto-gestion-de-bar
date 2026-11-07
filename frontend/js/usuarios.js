
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
  window.location.href = "login.html";
} else if (usuario.rol !== 1) {
  alert("Acceso denegado: solo administradores");
  window.location.href = "dashboard.html";
}

const tablaBody = document.querySelector("#tablaUsuarios tbody");
const form = document.getElementById("formUsuario");

async function comprobarSesion(res) {
  if (res.status === 401 || res.status === 403) {
    alert("Tu sesión no es válida o no tienes permiso para realizar esta acción.");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
    return true;
  }
  return false;
}

// Cargar lista de usuarios
async function cargarUsuarios() {
  try {
    const res = await fetch("/api/usuarios", {
      credentials: "include"
    });

    if (await comprobarSesion(res)) return;

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error al obtener usuarios:", errorText);
      alert("No se pudieron obtener los usuarios.");
      return;
    }

    const data = await res.json();
    tablaBody.replaceChildren();

    if (!Array.isArray(data) || data.length === 0) {
      const fila = document.createElement("tr");
      const celda = document.createElement("td");
      celda.colSpan = 6;
      celda.className = "text-center text-muted";
      celda.textContent = "No hay usuarios registrados";
      fila.appendChild(celda);
      tablaBody.appendChild(fila);
      return;
    }

    data.forEach(u => {
      const fila = document.createElement("tr");

      const valores = [
        u.id_usuario,
        u.nombre_usuario,
        u.documento,
        u.rolData ? u.rolData.nombre_rol : "Sin rol",
        u.sedeData ? u.sedeData.nombre_sede : "Sin sede"
      ];

      valores.forEach(valor => {
        const celda = document.createElement("td");
        celda.textContent = valor ?? "";
        fila.appendChild(celda);
      });

      const celdaAcciones = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.className = "btn btn-sm btn-warning";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => editarUsuario(u.id_usuario));

      const btnEliminar = document.createElement("button");
      btnEliminar.type = "button";
      btnEliminar.className = "btn btn-sm btn-danger";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.addEventListener("click", () => eliminarUsuario(u.id_usuario));

      celdaAcciones.append(btnEditar, " ", btnEliminar);
      fila.appendChild(celdaAcciones);
      tablaBody.appendChild(fila);
    });

  } catch (error) {
    console.error("Error en cargarUsuarios():", error);
  }
}

// Registrar nuevo usuario
form.addEventListener("submit", async e => {
  e.preventDefault();

  const datos = {
    nombre_usuario: form.nombre_usuario.value,
    documento: form.documento.value,
    contrasenia: form.contrasenia.value,
    rol: parseInt(form.rol.value),
    sede: parseInt(form.sede.value)
  };

  try {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (await comprobarSesion(res)) return;

    const data = await res.json();

    if (res.ok) {
      alert(data.mensaje);
      form.reset();
      await cargarUsuarios();
    } else {
      alert("Error: " + (data.mensaje || "No se pudo registrar el usuario"));
    }
  } catch (error) {
    console.error(error);
    alert("Error de conexión al registrar usuario");
  }
});

// Eliminar usuario
async function eliminarUsuario(id) {
  if (!confirm("¿Eliminar este usuario?")) return;

  try {
    const res = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (await comprobarSesion(res)) return;

    if (res.ok) {
      alert("Usuario eliminado correctamente");
      await cargarUsuarios();
    } else {
      alert("Error al eliminar usuario");
    }
  } catch (error) {
    console.error(error);
    alert("Error de conexión al eliminar usuario");
  }
}

// Editar usuario
async function editarUsuario(id) {
  const nombre_usuario = prompt("Nuevo nombre de usuario:");
  if (!nombre_usuario) return alert("El nombre no puede estar vacío.");

  const documento = prompt("Nuevo documento:");
  if (!documento) return alert("El documento no puede estar vacío.");

  const contrasenia = prompt("Nueva contraseña (déjala vacía si no deseas cambiarla):");

  const rol = parseInt(prompt("Nuevo rol (1=Admin, 2=Cajero, etc.):"));
  if (isNaN(rol)) return alert("Rol inválido.");

  const sede = parseInt(prompt("Nueva sede (ID numérico):"));
  if (isNaN(sede)) return alert("Sede inválida.");

  try {
    const res = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_usuario, documento, contrasenia, rol, sede })
    });

    if (await comprobarSesion(res)) return;

    if (res.ok) {
      alert("Usuario actualizado correctamente");
      await cargarUsuarios();
    } else {
      alert("Error al actualizar usuario");
    }
  } catch (error) {
    console.error(error);
    alert("Error de conexión al actualizar usuario");
  }
}

// Cerrar sesión
document.getElementById("logout").addEventListener("click", async () => {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });

    if (!res.ok) {
      alert("No se pudo cerrar la sesión correctamente.");
      return;
    }

    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  } catch (error) {
    alert("Error de conexión al cerrar sesión.");
  }
});

// Cargar usuarios al abrir
if (usuario?.rol === 1) cargarUsuarios();
