const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../data/productos.json');

// Helper para leer y escribir en archivos
const readFile = () => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeFile = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Rutas
router.get('/', (req, res) => {
    const { limit = 10, page = 1, sort, query, category, status } = req.query;

    let products = readFile();

    // Filtrado por búsqueda (query) en título, descripción o categoría
    if (query) {
        products = products.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Filtrado por categoría
    if (category) {
        products = products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Filtrado por disponibilidad (status)
    if (status !== undefined) {
        const isAvailable = status === 'true' ? true : false;
        products = products.filter(product => product.status === isAvailable);
    }

    // Ordenamiento por precio (sort)
    if (sort) {
        if (sort === 'asc') {
            products.sort((a, b) => a.price - b.price);  // Ascendente
        } else if (sort === 'desc') {
            products.sort((a, b) => b.price - a.price);  // Descendente
        }
    }

    // Paginación
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const currentPage = Number(page);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;

    const paginatedProducts = products.slice(startIndex, endIndex);

    // Indicadores de páginas previas y siguientes
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const prevPage = hasPrevPage ? currentPage - 1 : null;
    const nextPage = hasNextPage ? currentPage + 1 : null;
    const prevLink = hasPrevPage ? `/api/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${query}&category=${category}&status=${status}` : null;
    const nextLink = hasNextPage ? `/api/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${query}&category=${category}&status=${status}` : null;

    // Respuesta
    res.json({
        status: 'success',
        payload: paginatedProducts,
        totalPages,
        prevPage,
        nextPage,
        page: currentPage,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink
    });
});

router.get('/:pid', (req, res) => {
    const products = readFile();
    const product = products.find(p => p.id === Number(req.params.pid));
    product ? res.json({ status: 'success', payload: product }) : res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
});

router.post('/', (req, res) => {
    const products = readFile();
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).send({ status: 'error', message: 'Todos los campos excepto thumbnails son obligatorios.' });
    }

    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || []
    };

    products.push(newProduct);
    writeFile(products);
    res.status(201).json({ status: 'success', payload: newProduct });
});

router.put('/:pid', (req, res) => {
    const products = readFile();
    const productIndex = products.findIndex(p => p.id === Number(req.params.pid));
    if (productIndex === -1) return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });

    const updatedProduct = { ...products[productIndex], ...req.body, id: products[productIndex].id };
    products[productIndex] = updatedProduct;
    writeFile(products);
    res.json({ status: 'success', payload: updatedProduct });
});

router.delete('/:pid', (req, res) => {
    const products = readFile();
    const updatedProducts = products.filter(p => p.id !== Number(req.params.pid));
    if (products.length === updatedProducts.length) return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });

    writeFile(updatedProducts);
    res.status(204).send();
});

module.exports = router;
