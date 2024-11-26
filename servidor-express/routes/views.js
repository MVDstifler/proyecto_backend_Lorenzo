const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const productsPath = path.join(__dirname, '../data/productos.json');

// Ruta para "home"
router.get('/', (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    res.render('home', { products });
});

// Ruta para "realTimeProducts"
router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

module.exports = router;
