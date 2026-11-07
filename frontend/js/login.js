const form = document.getElementById("formLogin");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const documento = document.getElementById("documento").value.trim();
  const contrasenia = document.getElementById("contrasenia").value.trim();

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ documento, contrasenia })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      mensaje.innerHTML = `<div class="text-success">✔ ${data.mensaje}</div>`;
      setTimeout(() => window.location.href = "dashboard.html", 1000);
    } else {
      mensaje.innerHTML = `<div class="text-danger">❌ ${data.mensaje}</div>`;
    }
  } catch (error) {
    mensaje.innerHTML = `<div class="text-danger">Error de conexión</div>`;
  }
});
