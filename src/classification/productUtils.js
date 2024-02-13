const fs = require('fs');

const productsFilePath = './products.json';

function loadProducts() {
    try {
        const rawData = fs.readFileSync(productsFilePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

function addProduct(newProduct) {
    const products = loadProducts();
    products.push(newProduct);
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
        console.log('Product added successfully.');
    } catch (error) {
        console.error('Error saving the new product:', error);
    }
}

module.exports = { loadProducts, addProduct };
