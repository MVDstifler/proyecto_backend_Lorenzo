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
    const { limit } = req.query;
    const products = readFile();
    if (limit) return res.json(products.slice(0, Number(limit)));
    res.json(products);
});

router.get('/:pid', (req, res) => {
    const products = readFile();
    const product = products.find(p => p.id === Number(req.params.pid));
    product ? res.json(product) : res.status(404).send('Producto no encontrado');
});

router.post('/', (req, res) => {
    const products = readFile();
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).send('Todos los campos excepto thumbnails son obligatorios.');
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
    res.status(201).json(newProduct);
});

router.put('/:pid', (req, res) => {
    const products = readFile();
    const productIndex = products.findIndex(p => p.id === Number(req.params.pid));
    if (productIndex === -1) return res.status(404).send('Producto no encontrado');

    const updatedProduct = { ...products[productIndex], ...req.body, id: products[productIndex].id };
    products[productIndex] = updatedProduct;
    writeFile(products);
    res.json(updatedProduct);
});

router.delete('/:pid', (req, res) => {
    const products = readFile();
    const updatedProducts = products.filter(p => p.id !== Number(req.params.pid));
    if (products.length === updatedProducts.length) return res.status(404).send('Producto no encontrado');

    writeFile(updatedProducts);
    res.status(204).send();
});

module.exports = router;
