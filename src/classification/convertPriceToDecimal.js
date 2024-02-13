const fs = require('fs');

function extractDecimalNumber(inputString) {
    if (inputString == null) {
        return null;
    }
    const regex = /\$([\d,]+\.?\d*)/;
    const match = inputString.match(regex);

    if (match) {
        const numberAsString = match[1].replace(/,/g, '');
        return parseFloat(numberAsString);
    }

    return null; // Return null if no matching pattern is found
}

function convertPriceToDecimal(priceStr) {
    if (!priceStr) return null;

    const matches = extractDecimalNumber(priceStr);

    return matches;
}

const productsData = fs.readFileSync('./products.json', 'utf8');
const products = JSON.parse(productsData);

products.forEach(product => {
    product.price = convertPriceToDecimal(product.price);
    product.was_price = convertPriceToDecimal(product.was_price);
});

fs.writeFileSync('./updated_products.json', JSON.stringify(products, null, 2), 'utf8');

console.log('Prices converted to decimals and saved to updated_products.json');