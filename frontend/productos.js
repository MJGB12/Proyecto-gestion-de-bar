
const tablaBody = document.querySelector("#tablaProductos tbody");
const form = document.getElementById("formProducto");
const btnOrdenar = document.getElementById("ordenarPrecio");

let productos = [];
let ordenAscendente = true;

async function comprobarSesion(res) {
    if (res.status === 401 || res.status === 403) {
        alert("Tu sesión no es válida o no tienes permiso.");
        localStorage.removeItem("usuario");
        window.location.href = "login.html";
        return true;
    }
    return false;
}

function quickSortProductos(arr, clave) {
    if (arr.length <= 1) return arr;

    const pivote = Number(arr[arr.length - 1][clave]);
    const menores = [];
    const mayores = [];

    for (let i = 0; i < arr.length - 1; i++) {
        if (Number(arr[i][clave]) <= pivote) menores.push(arr[i]);
        else mayores.push(arr[i]);
    }

    return [
        ...quickSortProductos(menores, clave),
        arr[arr.length - 1],
        ...quickSortProductos(mayores, clave)
    ];
}

function crearCelda(valor) {
    const td = document.createElement("td");
    td.textContent = valor ?? "-";
    return td;
}

function crearBoton(texto, clase, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = clase;
    boton.textContent = texto;
    boton.addEventListener("click", accion);
    return boton;
}

function mostrarProductos(lista) {
    tablaBody.innerHTML = "";

    lista.forEach(p => {
        const fila = document.createElement("tr");

        fila.appendChild(crearCelda(p.id_producto));
        fila.appendChild(crearCelda(p.nombre_producto));
        fila.appendChild(crearCelda(p.categoria));
        fila.appendChild(crearCelda(p.marca));
        fila.appendChild(crearCelda(p.tamaño_volumen));
        fila.appendChild(crearCelda(`$${p.precio}`));
        fila.appendChild(crearCelda(p.cantidad));
        fila.appendChild(crearCelda(p.sedeData?.nombre_sede || p.id_sede));

        const acciones = document.createElement("td");

        const btnEditar = crearBoton(
            "✏️ Editar",
            "btn btn-sm btn-info me-2",
            () => editarProducto(p.id_producto)
        );

        const btnEliminar = crearBoton(
            "🗑️ Eliminar",
            "btn btn-sm btn-danger",
            () => eliminarProducto(p.id_producto)
        );

        acciones.append(btnEditar, btnEliminar);
        fila.appendChild(acciones);
        tablaBody.appendChild(fila);
    });
}

async function cargarProductos() {
    try {
        const res = await fetch("/api/productos", {
            credentials: "include"
        });

        if (await comprobarSesion(res)) return;
        if (!res.ok) throw new Error("No se pudieron cargar los productos");

        productos = await res.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("Error al cargar el inventario");
    }
}

btnOrdenar.addEventListener("click", () => {
    productos = quickSortProductos(productos, "precio");

    if (!ordenAscendente) productos.reverse();

    ordenAscendente = !ordenAscendente;
    mostrarProductos(productos);

    btnOrdenar.textContent = ordenAscendente
        ? "Ordenar por precio (menor a mayor)"
        : "Ordenar por precio (mayor a menor)";
});

form.addEventListener("submit", async e => {
    e.preventDefault();

    try {
        const formData = Object.fromEntries(new FormData(form));
        formData.precio = Number(formData.precio);
        formData.cantidad = Number(formData.cantidad);

        const res = await fetch("/api/productos", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (await comprobarSesion(res)) return;
        if (!res.ok) throw new Error("Error al registrar producto");

        alert("Producto registrado correctamente");
        form.reset();
        await cargarProductos();
    } catch (error) {
        console.error(error);
        alert("No fue posible registrar el producto");
    }
});

async function editarProducto(id) {
    const nuevoPrecio = prompt("Nuevo precio:");
    if (nuevoPrecio === null) return;

    const nuevaCantidad = prompt("Nueva cantidad:");
    if (nuevaCantidad === null) return;

    if (
        nuevoPrecio.trim() === "" ||
        nuevaCantidad.trim() === "" ||
        !Number.isFinite(Number(nuevoPrecio)) ||
        !Number.isInteger(Number(nuevaCantidad)) ||
        Number(nuevoPrecio) < 0 ||
        Number(nuevaCantidad) < 0
    ) {
        alert("Ingresa un precio y una cantidad válidos");
        return;
    }

    try {
        const res = await fetch(`/api/productos/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                precio: Number(nuevoPrecio),
                cantidad: Number(nuevaCantidad)
            })
        });

        if (await comprobarSesion(res)) return;
        if (!res.ok) throw new Error("No se pudo actualizar el producto");

        alert("Producto actualizado correctamente");
        await cargarProductos();
    } catch (error) {
        console.error(error);
        alert("Error al actualizar el producto");
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
        const res = await fetch(`/api/productos/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (await comprobarSesion(res)) return;
        if (!res.ok) throw new Error("No se pudo eliminar el producto");

        alert("Producto eliminado correctamente");
        await cargarProductos();
    } catch (error) {
        console.error(error);
        alert("Error al eliminar el producto");
    }
}

cargarProductos();
