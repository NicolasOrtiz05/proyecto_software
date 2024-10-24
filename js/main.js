import { database, storage, ref, getDownloadURL, dbRef, get } from './firebase-config.js';

let productos = [];

// Función para cargar productos desde Firebase Database

function cargarProductosFirebase() {
    const dbReference = dbRef(database, 'productos');
    get(dbReference).then(snapshot => {
        if (snapshot.exists()) {
            productos = Object.values(snapshot.val());
            cargarProductos(productos);
        } else {
            console.log("No hay productos disponibles en Firebase");
        }
    }).catch(error => {
        console.error("Error al cargar productos desde Firebase", error);
    });
}

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");

function cargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";

    // Cargar imágenes en un array antes de renderizar
    const imagePromises = productosElegidos.map(producto => {
        // Determinar la carpeta según el tipo de producto
        let carpeta = '';
        switch (producto.tipo) {
            case 'celulares':
                carpeta = 'celulares';
                break;
            case 'computadores':
                carpeta = 'computadores';
                break;
            case 'audifonos':
                carpeta = 'audifonos';
                break;
            default:
                carpeta = '';
                break;
        }

        if (carpeta) {
            
            const storageRef = ref(storage, `/${carpeta}/${producto.imagen}`);
            return getDownloadURL(storageRef).then(url => {
                return { ...producto, url };
            }).catch(error => {
                console.warn(`No se encontró imagen para el producto ${producto.id} en la carpeta ${carpeta}`, error);
                return null; // No cargamos el producto si no hay imagen
            });
        } else {
            return Promise.resolve(null); // Omitir productos sin tipo válido
        }
    });

    // Espera a que todas las imágenes se carguen
    Promise.all(imagePromises).then(productosConImagenes => {
        productosConImagenes.filter(producto => producto !== null).forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("producto");
            div.innerHTML = `
                <img class="producto-imagen" src="${producto.url}" alt="${producto.titulo}">
                <div class="producto-detalles">
                    <h3 class="producto-titulo">${producto.titulo}</h3>
                    <p class="producto-precio">$${producto.precio}</p>
                    <button class="producto-agregar" id="${producto.id}">Agregar</button>
                </div>
            `;
            contenedorProductos.append(div);
        });

        actualizarBotonesAgregar();
    });
}

botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
            const productosFiltrados = productos.filter(producto => producto.tipo === e.currentTarget.id);
            tituloPrincipal.innerText = e.currentTarget.innerText;
            cargarProductos(productosFiltrados);
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(productos);
        }
    });
});

function actualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

let productosEnCarrito = [];
let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
}

function agregarAlCarrito(e) {
    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #2F579C, #617ebd)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem',
            y: '1.5rem'
        },
    }).showToast();

    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    if (productosEnCarrito.some(producto => producto.id === idBoton)) {
        const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
        productosEnCarrito[index].cantidad++;
    } else {
        productoAgregado.cantidad = 1;
        productosEnCarrito.push(productoAgregado);
    }

    actualizarNumerito();
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}

// Llamar a la función para cargar los productos desde Firebase
cargarProductosFirebase();