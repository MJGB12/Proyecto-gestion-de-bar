const token = localStorage.getItem("token");

function buscarReporte() {
  const inicio = document.getElementById("fecha_inicio").value;
  const fin = document.getElementById("fecha_fin").value;

  fetch(`/api/reportes/ventas/fecha?fecha_inicio=${inicio}&fecha_fin=${fin}`, {
    headers: { "Authorization": "Bearer " + token }
  })
  .then(res => res.json())
  .then(data => pintarTabla(data));
}

function pintarTabla(ventas) {
  const tbody = document.querySelector("#tablaVentas tbody");
  tbody.innerHTML = "";

  ventas.forEach(v => {
    tbody.innerHTML += `
      <tr>
        <td>${v.id_venta}</td>
        <td>$${v.total_venta}</td>
        <td>${v.fecha_venta}</td>
        <td>${v.id_cajero}</td>
      </tr>`;
  });
}

function descargarCSV() {
  window.open("/api/reportes/export/csv", "_blank");
}

function descargarPDF() {
  window.open("/api/reportes/export/pdf", "_blank");
}

document.getElementById("formReporte").addEventListener("submit", (event) => {
    event.preventDefault();
    buscarReporte();
});

document.getElementById("btnCSV").addEventListener("click", () => {
    descargarCSV();
});

document.getElementById("btnPDF").addEventListener("click", () => {
    descargarPDF();
});
