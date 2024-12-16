const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const productsPath = path.join(__dirname, '../data/productos.json');
const cartPath = path.join(__dirname, '../data/carrito.json');

// Helper para leer los productos desde el archivo
const readProductsFile = () => JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Ruta para "home" (mostrar productos con paginación)
router.get('/products', (req, res) => {
    const { limit = 10, page = 1, sort = 'asc', query = '' } = req.query;

    // Leer los productos
    const products = readProductsFile();

    // Filtrar productos por nombre o categoría
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );

    // Ordenar productos por precio
    const sortedProducts = filteredProducts.sort((a, b) => {
        if (sort === 'asc') return a.price - b.price;
        return b.price - a.price;
    });

    // Paginación de productos
    const totalProducts = sortedProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const currentPage = Number(page);
    const paginatedProducts = sortedProducts.slice((currentPage - 1) * limit, currentPage * limit);

    res.render('index', {
        products: paginatedProducts,
        totalPages,
        currentPage,
        limit,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        query,
        sort
    });
});

// Ruta para "ver detalles completos de un producto"
router.get('/products/:pid', (req, res) => {
    const products = readProductsFile();
    const product = products.find(p => p.id === Number(req.params.pid));

    if (!product) return res.status(404).send('Producto no encontrado');

    res.render('productDetail', { product });
});

// Ruta para "ver carrito específico"
router.get('/carts/:cid', (req, res) => {
    const carts = JSON.parse(fs.readFileSync(cartPath, 'utf-8'));
    const cart = carts.find(c => c.id === Number(req.params.cid));

    if (!cart) return res.status(404).send('Carrito no encontrado');

    const productsInCart = cart.products.map(p => {
        const product = readProductsFile().find(product => product.id === p.product);
        return { ...p, productDetails: product };
    });

    res.render('cartDetail', { cartId: req.params.cid, products: productsInCart });
});

// 
