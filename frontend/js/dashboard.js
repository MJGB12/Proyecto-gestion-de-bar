
const usuario = JSON.parse(localStorage.getItem("usuario"));
const token = localStorage.getItem("token");

if (!usuario || !token) {
    window.location.href = "login.html";
} else {
    document.getElementById("bienvenida").textContent =
        `Bienvenido, ${usuario.nombre} (Rol: ${usuario.rol})`;
}

document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});
