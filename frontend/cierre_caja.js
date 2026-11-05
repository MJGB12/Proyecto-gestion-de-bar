const token = localStorage.getItem("token");

function realizarCierre() {
  const total_real = parseFloat(document.getElementById("total_real").value);
  const observaciones = document.getElementById("obs").value;

  fetch("/api/cierre-caja", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ total_real, observaciones })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.mensaje);
    cargarCierres();
  });
}

function cargarCierres() {
  fetch("/api/cierre-caja", {
    headers: { "Authorization": "Bearer " + token }
  })
    .then(r => r.json())
    .then(data => pintarTabla(data));
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

document.getElementById("formCierre")?.addEventListener("submit", (event) => {
    event.preventDefault();
    realizarCierre();
});
