const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../data/carrito.json');
const productsPath = path.join(__dirname, '../data/productos.json');

// Helper para leer y escribir en archivos
const readFile = (path) => JSON.parse(fs.readFileSync(path, 'utf-8'));
const writeFile = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, 2));

// Rutas
router.post('/', (req, res) => {
    const carts = readFile(filePath);
    const newCart = {
        id: carts.length ? carts[carts.length - 1].id + 1 : 1,
        products: []
    };
    carts.push(newCart);
    writeFile(filePath, carts);
    res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
    const carts = readFile(filePath);
    const cart = carts.find(c => c.id === Number(req.params.cid));
    cart ? res.json(cart.products) : res.status(404).send('Carrito no encontrado');
});

router.post('/:cid/product/:pid', (req, res) => {
    const carts = readFile(filePath);
    const products = readFile(productsPath);

    const cart = carts.find(c => c.id === Number(req.params.cid));
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const product = products.find(p => p.id === Number(req.params.pid));
    if (!product) return res.status(404).send('Producto no encontrado');

    const productInCart = cart.products.find(p => p.product === product.id);
    if (productInCart) {
        productInCart.quantity++;
    } else {
        cart.products.push({ product: product.id, quantity: 1 });
    }

    writeFile(filePath, carts);
    res.status(201).json(cart);
});

module.exports = router;
