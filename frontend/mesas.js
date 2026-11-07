document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("mesaGrid");
    const modalSede = document.getElementById("modalSede");

    const sedeGuardada = localStorage.getItem("sedeSeleccionada");

    if (!sedeGuardada && modalSede) {
        new bootstrap.Modal(modalSede).show();
    } else if (sedeGuardada) {
        cargarMesas(sedeGuardada);
    }

    document.getElementById("btnGuardarSede")?.addEventListener("click", () => {
        const sede = document.getElementById("selectSede").value;

        if (!sede) {
            alert("Selecciona una sede.");
            return;
        }

        localStorage.setItem("sedeSeleccionada", sede);

        bootstrap.Modal.getInstance(modalSede)?.hide();
        cargarMesas(sede);
    });

    document.getElementById("cambiarSede")?.addEventListener("click", () => {
        localStorage.removeItem("sedeSeleccionada");
        new bootstrap.Modal(modalSede).show();
    });

    async function cargarMesas(idSede) {
        if (!idSede) {
            idSede = localStorage.getItem("sedeSeleccionada");
        }

        try {
            const res = await fetch(`/api/mesas/por-sede/${idSede}`, {
                credentials: "include"
            });

            if (!res.ok) {
                throw new Error(`Error al cargar mesas: ${res.status}`);
            }

            const mesas = await res.json();
            grid.replaceChildren();

            mesas.forEach(mesa => {
                const div = document.createElement("div");
                div.className = "mesa-card";

                if (mesa.estado === "Disponible") {
                    div.classList.add("disponible");
                } else if (mesa.estado === "Ocupada") {
                    div.classList.add("ocupada");
                } else {
                    div.classList.add("pendiente");
                }

                const numero = document.createElement("div");
                numero.textContent = `Mesa ${mesa.numero_mesa}`;

                const estado = document.createElement("div");
                estado.className = "estado-texto";
                estado.textContent = mesa.estado;

                div.append(numero, estado);
                div.addEventListener("click", () => abrirOpcionesMesa(mesa));

                grid.appendChild(div);
            });
        } catch (error) {
            console.error(error);
            alert("No fue posible cargar las mesas.");
        }
    }

    function crearBoton(texto, clase, accion) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = `btn ${clase} w-100 mb-2`;
        boton.textContent = texto;
        boton.addEventListener("click", accion);
        return boton;
    }

    function abrirOpcionesMesa(mesa) {
        cerrarModal();

        const overlay = document.createElement("div");
        overlay.className = "mesa-opciones-overlay";

        const contenido = document.createElement("div");
        contenido.className = "mesa-opciones-contenido";

        const titulo = document.createElement("h5");
        titulo.textContent = `Mesa ${mesa.numero_mesa}`;

        const opciones = document.createElement("div");
        opciones.className = "my-3";

        if (mesa.estado === "Disponible") {
            opciones.append(
                crearBoton("🪑 Ocupar mesa", "btn-warning", () =>
                    cambiarEstado(mesa.id_mesa, "Ocupada")
                ),
                crearBoton("🧾 Crear pedido", "btn-primary", () =>
                    crearPedido(mesa.id_mesa)
                )
            );
        } else if (mesa.estado === "Ocupada") {
            opciones.append(
                crearBoton("💰 Cuenta pendiente", "btn-success", () =>
                    cambiarEstado(mesa.id_mesa, "Pendiente")
                ),
                crearBoton("✅ Liberar mesa", "btn-secondary", () =>
                    cambiarEstado(mesa.id_mesa, "Disponible")
                )
            );
        } else {
            opciones.append(
                crearBoton("✅ Liberar mesa", "btn-secondary", () =>
                    cambiarEstado(mesa.id_mesa, "Disponible")
                )
            );
        }

        const cerrar = crearBoton("Cerrar", "btn-outline-light", cerrarModal);
        cerrar.classList.remove("mb-2");

        contenido.append(titulo, opciones, cerrar);
        overlay.appendChild(contenido);

        overlay.addEventListener("click", event => {
            if (event.target === overlay) cerrarModal();
        });

        document.body.appendChild(overlay);
    }

    function cerrarModal() {
        document.querySelector(".mesa-opciones-overlay")?.remove();
    }

    async function cambiarEstado(id, estado) {
        try {
            const res = await fetch(`/api/mesas/${id}/estado`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ estado })
            });

            if (!res.ok) {
                throw new Error(`Error al cambiar estado: ${res.status}`);
            }

            cerrarModal();
            cargarMesas(localStorage.getItem("sedeSeleccionada"));
        } catch (error) {
            console.error(error);
            alert("No fue posible cambiar el estado de la mesa.");
        }
    }

    function crearPedido(idMesa) {
        cerrarModal();
        window.location.href = `pedidos.html?id_mesa=${idMesa}`;
    }
});
