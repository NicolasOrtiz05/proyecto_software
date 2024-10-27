import { database, storage, ref, getDownloadURL, dbRef, get, set, remove, uploadBytes } from './firebase-config.js';
import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import Producto from './producto.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = './autenticacion.html';
    }
});

const productosContainer = document.getElementById('productos-container');
const logoutBtn = document.getElementById('logout-btn');
let editingProductId = null;

// Cargar productos
function cargarProductos() {
    const dbReference = dbRef(database, 'productos');
    get(dbReference).then(snapshot => {
        if (snapshot.exists()) {
            const productos = Object.values(snapshot.val());
            cargarProductosConImagenes(productos);
        } else {
            productosContainer.innerHTML = '<p class="no-productos">No hay productos disponibles</p>';
        }
    }).catch(error => {
        console.error('Error al obtener productos:', error);
        Toastify({
            text: "Error al cargar productos",
            style: {
                background: "linear-gradient(to right, #ff0000, #ff5555)",
            }
        }).showToast();
    });
}

function cargarProductosConImagenes(productos) {
    productosContainer.innerHTML = "";

    const imagePromises = productos.map(producto => {
        const storageReference = ref(storage, `/${producto.tipo}/${producto.imagen}`);
        return getDownloadURL(storageReference).then(url => {
            return { ...producto, url };
        }).catch(error => {
            console.warn(`No se encontró imagen para el producto ${producto.id}`, error);
            return null;
        });
    });

    Promise.all(imagePromises).then(productosConImagenes => {
        productosConImagenes.filter(producto => producto !== null).forEach(producto => {
            const div = document.createElement('div');
            div.className = 'producto-card';
            div.innerHTML = `
                <div class="producto-info">
                    <h4>${producto.titulo}</h4>
                    <p>$${producto.precio}</p>
                    <p>${producto.tipo}</p>
                    <img src="${producto.url}" alt="${producto.titulo}" class="producto-imagen-admin">
                </div>
                <div class="producto-acciones">
                    <button onclick="editarProducto('${producto.id}')" class="btn-edit">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button onclick="eliminarProducto('${producto.id}')" class="btn-delete">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            `;
            productosContainer.appendChild(div);
        });
    });
}

// Añadir producto
document.getElementById('btn-add-product').addEventListener('click', () => {
    const productoTitulo = document.getElementById('producto-titulo').value;
    const productoPrecio = document.getElementById('producto-precio').value;
    const productoTipo = document.getElementById('producto-tipo').value;
    const productoImagen = document.getElementById('producto-imagen').files[0];

    if (!productoTitulo || !productoPrecio || !productoTipo || !productoImagen) {
        Toastify({
            text: "Por favor completa todos los campos",
            style: {
                background: "linear-gradient(to right, #ff0000, #ff5555)",
            }
        }).showToast();
        return;
    }

    const productoId = 'producto_' + new Date().getTime();
    const storageReference = ref(storage, `/${productoTipo}/${productoImagen.name}`);

    uploadBytes(storageReference, productoImagen).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
            const nuevoProducto = new Producto(productoId, productoTitulo, Number(productoPrecio), productoImagen.name, productoTipo);

            set(dbRef(database, 'productos/' + productoId), {
                id: nuevoProducto.id,
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
                document.getElementById('producto-tipo').value = '';
                document.getElementById('producto-imagen').value = '';
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
    }).catch((error) => {
        console.error('Error al subir imagen:', error);
        Toastify({
            text: "Error al subir imagen",
            style: {
                background: "linear-gradient(to right, #ff0000, #ff5555)",
            }
        }).showToast();
    });
});

// Se edita el producto
window.editarProducto = function (productoId) {
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
                    <select id="edit-tipo" class="swal2-input">
                        <option value="celulares" ${producto.tipo === 'celulares' ? 'selected' : ''}>Celulares</option>
                        <option value="computadores" ${producto.tipo === 'computadores' ? 'selected' : ''}>Computadores</option>
                        <option value="audifonos" ${producto.tipo === 'audifonos' ? 'selected' : ''}>Audífonos</option>
                        <!-- Añade más opciones según sea necesario -->
                    </select>
                    <input 
                        type="file" 
                        id="edit-imagen" 
                        class="swal2-input"
                    >
                `,
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const titulo = document.getElementById('edit-titulo').value;
                    const precio = document.getElementById('edit-precio').value;
                    const tipo = document.getElementById('edit-tipo').value;
                    const imagen = document.getElementById('edit-imagen').files[0];
                    if (!titulo || !precio || !tipo) {
                        Swal.showValidationMessage('Por favor completa todos los campos');
                        return false;
                    }
                    return { titulo, precio, tipo, imagen };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const { titulo, precio, tipo, imagen } = result.value;

                    if (imagen) {
                        const storageReference = ref(storage, `/${tipo}/${imagen.name}`);
                        uploadBytes(storageReference, imagen).then((snapshot) => {
                            getDownloadURL(snapshot.ref).then((url) => {
                                set(dbRef(database, 'productos/' + productoId), {
                                    titulo: titulo,
                                    precio: Number(precio),
                                    tipo: tipo,
                                    imagen: imagen.name
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
                            });
                        }).catch((error) => {
                            console.error('Error al subir imagen:', error);
                            Toastify({
                                text: "Error al subir imagen",
                                style: {
                                    background: "linear-gradient(to right, #ff0000, #ff5555)",
                                }
                            }).showToast();
                        });
                    } else {
                        set(dbRef(database, 'productos/' + productoId), {
                            titulo: titulo,
                            precio: Number(precio),
                            tipo: tipo,
                            imagen: producto.imagen
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

// Eliminar producto
window.eliminarProducto = function (productoId) {
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