const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../data/carrito.json');
const productFilePath = path.join(__dirname, '../data/productos.json');

// Helper para leer y escribir en archivos
const readFile = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const writeFile = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Función para obtener el producto por id
const getProductById = (productId) => {
    const products = readFile(productFilePath);
    return products.find(product => product.id === productId);
};

// Ruta: GET /api/carts/:cid - Obtener los productos del carrito, con el detalle completo de los productos
router.get('/:cid', (req, res) => {
    const carts = readFile(filePath);
    const cart = carts.find(c => c.id === Number(req.params.cid));

    if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

    // "Populate" los productos, obteniendo los detalles completos de cada producto por su id
    const populatedProducts = cart.products.map(productInCart => {
        const productDetails = getProductById(productInCart.product);
        return {
            ...productInCart,
            productDetails: productDetails || null  // Añadir detalles del producto o null si no se encuentra
        };
    });

    res.json({ status: 'success', payload: populatedProducts });
});

// Ruta: DELETE /api/carts/:cid/products/:pid - Eliminar un producto del carrito
router.delete('/:cid/products/:pid', (req, res) => {
    const carts = readFile(filePath);
    const cart = carts.find(c => c.id === Number(req.params.cid));

    if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

    // Filtrar los productos que no coincidan con el id del producto a eliminar
    const updatedProducts = cart.products.filter(p => p.product !== Number(req.params.pid));

    if (cart.products.length === updatedProducts.length) {
        return res.status(404).send({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    cart.products = updatedProducts;
    writeFile(filePath, carts);
    res.status(204).send();
});

// Ruta: PUT /api/carts/:cid - Actualizar el carrito con un arreglo completo de productos
router.put('/:cid', (req, res) => {
    const carts = readFile(filePath);
    const cart = carts.find(c => c.id === Number(req.params.cid));

    if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

    const { products } = req.body;

    // Validar que el arreglo de productos esté bien formado
    if (!Array.isArray(products)) {
        return res.status(400).send({ status: 'error', message: 'El cuerpo de la solicitud debe contener un arreglo de productos' });
    }

    // Validar que cada producto tenga un id válido
    const invalidProducts = products.filter(p => !getProductById(p.product));
    if (invalidProducts.length > 0) {
        return res.status(400).send({ status: 'error', message: 'Algunos productos no existen en el inventario' });
    }

    cart.products = products;
    writeFile(filePath, carts);
    res.json({ status: 'success', payload: cart });
});

// Ruta: PUT /api/carts/:cid/products/:pid - Actualizar la cantidad de un producto específico en el carrito
router.put('/:cid/products/:pid', (req, res) => {
    const carts = readFile(filePath);
    const cart = carts.find(c => c.id === Number(req.params.cid));

    if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

    const { quantity } = req.body;
    if (quantity <= 0) return res.status(400).send({ status: 'error', message: 'La cantidad debe ser mayor que cero' });

    const productInCart = cart.products.find(p => p.product === Number(req.params.pid));

    if (!productInCart) return res.status(404).send({ status: 'error', message: 'Producto no encontrado en el carrito' });

    productInCart.quantity = quantity;
    writeFile(filePath, carts);
    res.json({ status: 'success', payload: productInCart });
});

// Ruta: DELETE /api/carts/:cid - Eliminar todos los productos del carrito
router.delete('/:cid', (req, res) => {
    const carts = readFile(filePath);
    const cartIndex = carts.findIndex(c => c.id === Number(req.params.cid));

    if (cartIndex === -1) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

    carts[cartIndex].products = [];  // Vaciar el carrito
    writeFile(filePath, carts);
    res.status(204).send();
});

module.exports = router;
