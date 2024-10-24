import { database, dbRef, set, get, remove, child } from './firebase-config.js';
import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import Producto from './producto.js';


onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = './autenticacion.html';
    }
});

const productosContainer = document.getElementById('productos-container');
const logoutBtn = document.getElementById('logout-btn');
const modalEditForm = document.getElementById('modal-edit-form');
let editingProductId = null;

// Cargar productos
function cargarProductos() {
    get(dbRef(database, 'productos')).then((snapshot) => {
        if (snapshot.exists()) {
            const productos = snapshot.val();
            productosContainer.innerHTML = '';

            for (const id in productos) {
                const producto = productos[id];
                const div = document.createElement('div');
                div.className = 'producto   -card';
                div.innerHTML = `
                    <div class="producto-info">
                        <h4>${producto.titulo}</h4>
                        <p>$${producto.precio}</p>
                    </div>
                    <div class="producto-acciones">
                        <button onclick="editarProducto('${id}')" class="btn-edit">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button onclick="eliminarProducto('${id}')" class="btn-delete">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                `;
                productosContainer.appendChild(div);
            }
        } else {
            productosContainer.innerHTML = '<p class="no-productos">No hay productos disponibles</p>';
        }
    }).catch((error) => {
        console.error('Error al obtener productos:', error);
        Toastify({
            text: "Error al cargar productos",
            style: {
                background: "linear-gradient(to right, #ff0000, #ff5555)",
            }
        }).showToast();
    });
}

// Se edita el producto
window.editarProducto = function(productoId) {
    editingProductId = productoId;
    
    
    get(dbRef(database, 'productos/' + productoId)).then((snapshot) => {
        if (snapshot.exists()) {
            const producto = snapshot.val();
            
           
            Swal.fire({
                title: 'Editar Producto',
                html: `
                    <input 
                        type="text" 
                        id="edit-titulo" 
                        class="swal2-input" 
                        placeholder="Título del producto" 
                        value="${producto.titulo}"
                    >
                    <input 
                        type="number" 
                        id="edit-precio" 
                        class="swal2-input" 
                        placeholder="Precio del producto" 
                        value="${producto.precio}"
                    >
                `,
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const titulo = document.getElementById('edit-titulo').value;
                    const precio = document.getElementById('edit-precio').value;
                    if (!titulo || !precio) {
                        Swal.showValidationMessage('Por favor completa todos los campos');
                        return false;
                    }
                    return { titulo, precio };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const { titulo, precio } = result.value;
                    
                    
                    set(dbRef(database, 'productos/' + productoId), {
                        titulo: titulo,
                        precio: Number(precio)
                    }).then(() => {
                        Toastify({
                            text: "Producto actualizado exitosamente",
                            style: {
                                background: "linear-gradient(to right, #00b09b, #96c93d)",
                            }
                        }).showToast();
                        cargarProductos();
                    }).catch((error) => {
                        console.error('Error al actualizar producto:', error);
                        Toastify({
                            text: "Error al actualizar producto",
                            style: {
                                background: "linear-gradient(to right, #ff0000, #ff5555)",
                            }
                        }).showToast();
                    });
                }
            });
        }
    }).catch((error) => {
        console.error('Error al obtener producto:', error);
        Toastify({
            text: "Error al cargar datos del producto",
            style: {
                background: "linear-gradient(to right, #ff0000, #ff5555)",
            }
        }).showToast();
    });
};

// Añadir producto
document.getElementById('btn-add-product').addEventListener('click', () => {
    const productoTitulo = document.getElementById('producto-titulo').value;
    const productoPrecio = document.getElementById('producto-precio').value;
    
    if (!productoTitulo || !productoPrecio) {
        Toastify({
            text: "Por favor completa todos los campos",
            style: {
                background: "linear-gradient(to right, #ff0000, #ff5555)",
            }
        }).showToast();
        return;
    }

    const productoId = 'producto_' + new Date().getTime();
    const nuevoProducto = new Producto(productoId, productoTitulo, Number(productoPrecio), '', ''); // Crea una instancia de Producto

    // Guardar en Firebase usando la instancia de Producto
    set(dbRef(database, 'productos/' + productoId), {
        titulo: nuevoProducto.titulo,
        precio: nuevoProducto.precio,
        imagen: nuevoProducto.imagen,
        tipo: nuevoProducto.tipo
    }).then(() => {
        Toastify({
            text: "Producto añadido exitosamente",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
        cargarProductos();
        document.getElementById('producto-titulo').value = '';
        document.getElementById('producto-precio').value = '';
    }).catch((error) => {
        console.error('Error al añadir producto:', error);
        Toastify({
            text: "Error al añadir producto",
            style: {
                background: "linear-gradient(to right, #ff0000, #ff5555)",
            }
        }).showToast();
    });
});

// Eliminar producto
window.eliminarProducto = function(productoId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            remove(dbRef(database, 'productos/' + productoId))
                .then(() => {
                    Toastify({
                        text: "Producto eliminado exitosamente",
                        style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)",
                        }
                    }).showToast();
                    cargarProductos();
                })
                .catch((error) => {
                    console.error('Error al eliminar producto:', error);
                    Toastify({
                        text: "Error al eliminar producto",
                        style: {
                            background: "linear-gradient(to right, #ff0000, #ff5555)",
                        }
                    }).showToast();
                });
        }
    });
};

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            signOut(auth)
                .then(() => {
                    window.location.href = './autenticacion.html';
                })
                .catch((error) => {
                    console.error('Error al cerrar sesión:', error);
                    Toastify({
                        text: "Error al cerrar sesión",
                        style: {
                            background: "linear-gradient(to right, #ff0000, #ff5555)",
                        }
                    }).showToast();
                });
        }
    });
});


cargarProductos();
