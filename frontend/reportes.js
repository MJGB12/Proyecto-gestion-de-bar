
async function buscarReporte() {
  const inicio = document.getElementById("fecha_inicio").value;
  const fin = document.getElementById("fecha_fin").value;

  try {
    const res = await fetch(
      `/api/reportes/ventas/fecha?fecha_inicio=${encodeURIComponent(inicio)}&fecha_fin=${encodeURIComponent(fin)}`,
      { credentials: "include" }
    );

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("usuario");
      alert("Tu sesión no es válida o no tienes permiso.");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) throw new Error("No se pudo consultar el reporte");

    const data = await res.json();
    pintarTabla(data);
  } catch (error) {
    console.error(error);
    alert("Error al consultar el reporte.");
  }
}

function pintarTabla(ventas) {
  const tbody = document.querySelector("#tablaVentas tbody");
  tbody.innerHTML = "";

  ventas.forEach(v => {
    const fila = document.createElement("tr");

    [v.id_venta, `$${v.total_venta}`, v.fecha_venta, v.id_cajero]
      .forEach(valor => {
        const celda = document.createElement("td");
        celda.textContent = valor ?? "";
        fila.appendChild(celda);
      });

    tbody.appendChild(fila);
  });
}

function descargarCSV() {
  window.open("/api/reportes/export/csv", "_blank");
}

function descargarPDF() {
  window.open("/api/reportes/export/pdf", "_blank");
}

document.getElementById("formReporte").addEventListener("submit", event => {
  event.preventDefault();
  buscarReporte();
});

document.getElementById("btnCSV").addEventListener("click", descargarCSV);
document.getElementById("btnPDF").addEventListener("click", descargarPDF);
