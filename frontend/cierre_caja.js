function realizarCierre() {
  const total_real = parseFloat(document.getElementById("total_real").value);
  const observaciones = document.getElementById("obs").value;

  fetch("/api/cierre-caja", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ total_real, observaciones })
  })
  .then(async res => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("usuario");
      alert("Tu sesión no es válida o no tienes permiso.");
      window.location.href = "login.html";
      return null;
    }
    return res.json();
  })
  .then(data => {
    if (!data) return;
    alert(data.mensaje);
    cargarCierres();
  })
  .catch(error => {
    console.error(error);
    alert("Error al realizar el cierre de caja.");
  });
}

function cargarCierres() {
  fetch("/api/cierre-caja", {
    credentials: "include"
  })
    .then(async res => {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("usuario");
        alert("Tu sesión no es válida o no tienes permiso.");
        window.location.href = "login.html";
        return null;
      }
      if (!res.ok) throw new Error("No se pudieron cargar los cierres");
      return res.json();
    })
    .then(data => {
      if (data) pintarTabla(data);
    })
    .catch(error => {
      console.error(error);
      alert("Error al cargar los cierres de caja.");
    });
}

function pintarTabla(cierres) {
  const tbody = document.querySelector("#tablaCierres tbody");
  tbody.innerHTML = "";

  cierres.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td>${c.id_cierre}</td>
        <td>${c.total_sistema}</td>
        <td>${c.total_real}</td>
        <td>${c.diferencia}</td>
        <td>${c.fecha_cierre}</td>
      </tr>`;
  });
}

cargarCierres();

document.getElementById("formCierre")?.addEventListener("submit", event => {
  event.preventDefault();
  realizarCierre();
});

