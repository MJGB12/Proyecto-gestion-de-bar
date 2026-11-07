
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    const form = document.getElementById("formPedido");
    const listaProductos = document.getElementById("listaProductos");
    const selectProducto = document.getElementById("selectProducto");
    const tablaBody = document.getElementById("tablaPedidos");
    const btnAgregar = document.getElementById("btnAgregar");
    const inputMesa = document.getElementById("id_mesa");
    const inputMesero = document.getElementById("id_mesero");
    const inputCantidad = document.getElementById("cantidad");

    let productosPedido = [];

    function formatMoney(n) {
        return Number(n || 0).toFixed(2);
    }

    function crearBoton(texto, clase, accion) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = clase;
        boton.textContent = texto;
        boton.addEventListener("click", accion);
        return boton;
    }

    async function cargarProductos() {
        try {
            const res = await fetch("/api/productos", {
                headers: { credentials: "include" }
            });

            if (!res.ok) throw new Error("No se pudieron cargar los productos");

            const data = await res.json();
            selectProducto.innerHTML = "";

            const inicial = document.createElement("option");
            inicial.value = "";
            inicial.textContent = "Selecciona producto";
            selectProducto.appendChild(inicial);

            data.forEach(p => {
                const opcion = document.createElement("option");
                opcion.value = p.id_producto;
                opcion.dataset.precio = p.precio;
                opcion.textContent = `${p.nombre_producto} - $${formatMoney(p.precio)}`;
                selectProducto.appendChild(opcion);
            });
        } catch (err) {
            console.error("Error cargando productos:", err);
            alert("Error cargando productos: " + err.message);
            selectProducto.innerHTML = "";
            const opcion = document.createElement("option");
            opcion.textContent = "No se pudieron cargar productos";
            selectProducto.appendChild(opcion);
        }
    }

    btnAgregar.addEventListener("click", () => {
        const id_producto = Number(selectProducto.value);
        const cantidad = Number(inputCantidad.value);
        const opcion = selectProducto.options[selectProducto.selectedIndex];

        if (!opcion || !opcion.value) {
            alert("Selecciona un producto válido");
            return;
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            alert("Ingresa una cantidad válida");
            return;
        }

        productosPedido.push({
            id_producto,
            cantidad,
            nombre: opcion.textContent.split(" - ")[0],
            precio: Number(opcion.dataset.precio) || 0
        });

        actualizarLista();
        inputCantidad.value = "";
    });

    function actualizarLista() {
        listaProductos.innerHTML = "";

        productosPedido.forEach((p, index) => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";

            const descripcion = document.createElement("span");
            descripcion.textContent =
                `${p.nombre} (x${p.cantidad}) - $${formatMoney(p.precio * p.cantidad)}`;

            const btnEliminar = crearBoton(
                "🗑️",
                "btn btn-sm btn-danger",
                () => {
                    productosPedido.splice(index, 1);
                    actualizarLista();
                }
            );

            li.append(descripcion, btnEliminar);
            listaProductos.appendChild(li);
        });
    }

    form.addEventListener("submit", async e => {
        e.preventDefault();

        if (productosPedido.length === 0) {
            alert("Agrega al menos un producto");
            return;
        }

        const id_mesa = Number(inputMesa.value);
        const id_mesero = Number(inputMesero.value);

        if (!Number.isInteger(id_mesa) || !Number.isInteger(id_mesero)) {
            alert("Mesa o ID de mesero inválido");
            return;
        }

        const datos = {
            id_mesa,
            id_mesero,
            productos: productosPedido.map(p => ({
                id_producto: p.id_producto,
                cantidad: p.cantidad
            }))
        };

        try {
            const res = await fetch("/api/pedidos", {
                method: "POST",
                headers: {
                    credentials: "include",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            const data = await res.json();

            if (!res.ok) {
                alert("❌ " + (data.mensaje || JSON.stringify(data)));
                return;
            }

            alert("Pedido registrado correctamente");
            productosPedido = [];
            actualizarLista();
            form.reset();
            await cargarPedidos();
        } catch (err) {
            console.error(err);
            alert("Error al registrar pedido: " + err.message);
        }
    });

    async function cargarPedidos() {
        try {
            const res = await fetch("/api/pedidos", {
                headers: { credentials: "include" }
            });

            if (res.status === 401 || res.status === 403) {
                alert("Tu sesión no es válida o no tienes permiso");
                localStorage.removeItem("token");
                window.location.href = "login.html";
                return;
            }

            if (!res.ok) throw new Error("No se pudieron cargar los pedidos");

            const data = await res.json();
            tablaBody.innerHTML = "";

            data.forEach(p => {
                const fila = document.createElement("tr");
                const estado = p.estado || "Pendiente";

                const clasesEstado = {
                    Listo: "success",
                    Preparando: "warning",
                    Pendiente: "secondary",
                    Cerrado: "dark"
                };

                const celdaId = document.createElement("td");
                celdaId.textContent = p.id_pedido;

                const celdaMesa = document.createElement("td");
                celdaMesa.textContent = p.mesaData?.numero_mesa ?? p.id_mesa;

                const celdaMesero = document.createElement("td");
                celdaMesero.textContent = p.meseroData?.nombre_usuario ?? p.id_mesero;

                const celdaTotal = document.createElement("td");
                celdaTotal.textContent = `$${formatMoney(p.total)}`;

                const celdaEstado = document.createElement("td");
                const badge = document.createElement("span");
                badge.className = `badge bg-${clasesEstado[estado] || "secondary"}`;
                badge.textContent = estado;
                celdaEstado.appendChild(badge);

                const acciones = document.createElement("td");

                const btnPreparar = crearBoton(
                    "⏳ Preparar",
                    "btn btn-sm btn-warning me-1",
                    () => actualizarEstado(p.id_pedido, "Preparando")
                );

                const btnListo = crearBoton(
                    "✅ Listo",
                    "btn btn-sm btn-success me-1",
                    () => actualizarEstado(p.id_pedido, "Listo")
                );

                const btnCerrar = crearBoton(
                    "Cerrar pedido",
                    "btn btn-sm btn-success",
                    () => cerrarPedidoFrontend(p.id_pedido)
                );

                acciones.append(btnPreparar, btnListo, btnCerrar);
                fila.append(
                    celdaId,
                    celdaMesa,
                    celdaMesero,
                    celdaTotal,
                    celdaEstado,
                    acciones
                );

                tablaBody.appendChild(fila);
            });
        } catch (err) {
            console.error("Error cargando pedidos:", err);
            alert("Error cargando pedidos: " + err.message);
        }
    }

    async function actualizarEstado(id, estado) {
        try {
            const res = await fetch(`/api/pedidos/${id}/estado`, {
                method: "PUT",
                headers: {
                    credentials: "include",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ estado })
            });

            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + (data.mensaje || JSON.stringify(data)));
                return;
            }

            alert(data.mensaje || "Estado actualizado correctamente");
            await cargarPedidos();
        } catch (err) {
            console.error(err);
            alert("Error actualizando estado: " + err.message);
        }
    }

    async function cerrarPedidoFrontend(idPedido) {
        const metodo = prompt(
            "Método de pago (Efectivo / Tarjeta / Nequi):",
            "Efectivo"
        );

        if (metodo === null) return;

        const metodoPago = metodo.trim();

        if (!metodoPago) {
            alert("Debes indicar un método de pago");
            return;
        }

        try {
            const res = await fetch(`/api/pedidos/cerrar/${idPedido}`, {
                method: "PUT",
                headers: {
                    credentials: "include",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ metodo_pago: metodoPago })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.mensaje || "Error al cerrar el pedido");
                return;
            }

            alert("Pedido cerrado y venta registrada correctamente");
            await cargarPedidos();
        } catch (err) {
            console.error("Error al cerrar pedido:", err);
            alert("Error de red al cerrar el pedido");
        }
    }

    cargarProductos();
    cargarPedidos();
});

