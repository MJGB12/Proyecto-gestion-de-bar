document.addEventListener("DOMContentLoaded", () => {

    const sedeGuardada = localStorage.getItem("sedeSeleccionada");

    if (!sedeGuardada) {
        const modal = new bootstrap.Modal(document.getElementById('modalSede'));
        modal.show();
    } else {
        cargarMesas(sedeGuardada);
    }

    document.getElementById("btnGuardarSede").addEventListener("click", () => {
        const sede = document.getElementById("selectSede").value;
        if (!sede) return alert("Selecciona una sede.");

        localStorage.setItem("sedeSeleccionada", sede);

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalSede'));
        modal.hide();

        cargarMesas(sede);
    });

});

document.getElementById("cambiarSede").addEventListener("click", () => {
    localStorage.removeItem("sedeSeleccionada");

    const modal = new bootstrap.Modal(document.getElementById('modalSede'));
    modal.show();
});


const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión");
  window.location.href = "login.html";
}

const grid = document.getElementById("mesaGrid");

async function cargarMesas(idSede) {

  // 🔥 Si no se pasó sede, usar la guardada
  if (!idSede) {
    idSede = localStorage.getItem("sedeSeleccionada");
  }

  const res = await fetch(`http://localhost:4000/api/mesas/por-sede/${idSede}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const mesas = await res.json();

  grid.innerHTML = "";
  mesas.forEach(m => {
    const div = document.createElement("div");
    div.className = `mesa-card ${
      m.estado === "Disponible"
        ? "disponible"
        : m.estado === "Ocupada"
        ? "ocupada"
        : "pendiente"
    }`;

    div.innerHTML = `
      <div>Mesa ${m.numero_mesa}</div>
      <div class="estado-texto">${m.estado}</div>
    `;

    div.addEventListener("click", () => abrirOpcionesMesa(m));

    grid.appendChild(div);
  });
}


function abrirOpcionesMesa(mesa) {
  let opciones = "";

  if (mesa.estado === "Disponible") {
    opciones = `
      <button class="btn btn-warning w-100 mb-2" onclick="cambiarEstado(${mesa.id_mesa}, 'Ocupada')">🪑 Ocupar mesa</button>
      <button class="btn btn-primary w-100" onclick="crearPedido(${mesa.id_mesa})">🧾 Crear pedido</button>
    `;
  } else if (mesa.estado === "Ocupada") {
    opciones = `
      <button class="btn btn-success w-100 mb-2" onclick="cambiarEstado(${mesa.id_mesa}, 'Pendiente')">💰 Cuenta pendiente</button>
      <button class="btn btn-secondary w-100" onclick="cambiarEstado(${mesa.id_mesa}, 'Disponible')">✅ Liberar mesa</button>
    `;
  } else {
    opciones = `
      <button class="btn btn-secondary w-100" onclick="cambiarEstado(${mesa.id_mesa}, 'Disponible')">✅ Liberar mesa</button>
    `;
  }

  const modal = document.createElement("div");
  modal.className = "modal-backdrop fade show";
  modal.innerHTML = `
    <div class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
      <div class="bg-dark p-4 rounded text-center" style="max-width:300px;">
        <h5>Mesa ${mesa.numero_mesa}</h5>
        <div class="my-3">${opciones}</div>
        <button class="btn btn-outline-light w-100" onclick="cerrarModal()">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function cerrarModal() {
  const modal = document.querySelector(".modal-backdrop");
  if (modal) modal.remove();
}

async function cambiarEstado(id, estado) {

  await fetch(`http://localhost:4000/api/mesas/${id}/estado`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ estado })
  });

  cerrarModal();

  const sede = localStorage.getItem("sedeSeleccionada");
  cargarMesas(sede);   
}

function crearPedido(id_mesa) {
  cerrarModal();
  window.location.href = `pedidos.html?id_mesa=${id_mesa}`;
}
