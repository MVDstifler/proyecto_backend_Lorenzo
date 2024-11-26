const express = require('express');
const { Server } = require('socket.io'); // Importar socket.io
const path = require('path');
const handlebars = require('express-handlebars');

const app = express();
const PORT = 8080;


// Configurar tabla de estilos
app.use(express.static('public'));


// Configurar Handlebars
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas principales
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Crear servidor HTTP con websockets
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
const io = new Server(server);

// Websockets
let products = [];
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Emitir lista inicial de productos
    socket.emit('productList', products);

    // Escuchar cuando se agregue un producto
    socket.on('addProduct', (newProduct) => {
        products.push(newProduct);
        io.emit('productList', products); // Emitir actualización a todos los clientes
    });

    // Escuchar cuando se elimine un producto
    socket.on('deleteProduct', (productId) => {
        products = products.filter((product) => product.id !== productId);
        io.emit('productList', products); // Emitir actualización a todos los clientes
    });
});
