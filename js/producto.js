class Producto {
    constructor(id, titulo, precio, imagen, tipo) {
        this._id = id;
        this._titulo = titulo;
        this._precio = precio;
        this._imagen = imagen;
        this._tipo = tipo
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get titulo() {
        return this._titulo;
    }

    set titulo(value) {
        this._titulo= value;
    }

    get precio() {
        return this._precio;
    }

    set precio(value) {
        this._precio = value;
    }
    get imagen() {
        return this._imagen
    }

    set imagen(value) {
        this._imagen = value;
    }
    get tipo() {
        return this._tipo
    }

    set tipo(value) {
        this._tipo = value;
    }
    
}
export default Producto;
