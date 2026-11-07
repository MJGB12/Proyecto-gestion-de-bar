const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
  window.location.href = "login.html";
} else {
  document.getElementById("bienvenida").textContent =
    `Bienvenido, ${usuario.nombre} (Rol: ${usuario.rol})`;
}

document.getElementById("logout").addEventListener("click", async () => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      alert("No se pudo cerrar la sesión correctamente.");
      return;
    }

    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  } catch (error) {
    alert("Error de conexión al cerrar sesión.");
  }
});

