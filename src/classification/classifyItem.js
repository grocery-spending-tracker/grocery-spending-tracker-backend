const fuzzyMatching = require('./fuzzyMatching');
const getProductDetails = require('./getProductDetails');
const { loadProducts, addProduct } = require('./productUtils');


function extractDecimalNumber(inputString) {
    if (inputString == null) {
        return null;
    }

    const regex = /\$?([\d,]+\.?\d*)/;
    const match = inputString.match(regex);
    if (match) {

        const numberAsString = match[1].replace(/,/g, '');
        return parseFloat(numberAsString);
    }

    return null; // Return null if no matching pattern is found
}

async function classifyItem(inputItem) {
    const products = loadProducts();

    const match = fuzzyMatching(inputItem, products);

    const threshold = 0.4;

    let classifiedItem;
    
    if (match[0].match && match[0].score < threshold) {
        try {
            classifiedItem = {
                // store: inputItem[0].store,
                brand: match[0].match.brand,
                name: match[0].match.name,
                price: match[0].match.price,
                was_price: match[0].match.was_price,
                product_number: match[0].match.product_number,
                image_url: match[0].match.image_url
            };
        }
        catch(e){
            console.log("fuzzy returning null");
        }


        console.log("Fuzzy matched item with a score of ", match[0].score) 

    } else {

        try {
            const details = await getProductDetails(inputItem[0].item_key);
            classifiedItem = {
                // store: "Fortinos",
                brand: details.brand,
                name: details.name,
                price: extractDecimalNumber(inputItem[0].price),
                list_price: extractDecimalNumber(details.price),
                // was_price: extractDecimalNumber(details.was_price),
                product_number: details.product_number,
                image_url: details.image_url
            };

            console.log("Successfully scraped product information") 
        } catch {
            console.log("Failed to scrape product information")
        }
        
        const productExists = products.some(product => product.product_number === classifiedItem.product_number);
        if (!productExists) {
            addProduct(classifiedItem);
            console.log("Added classified product item")
        }
    }

    return classifiedItem;
}

// // Example input item
// const inputItem = [{
//     // store: "Fortinos",
//     item_key: "06038318640",
//     item_desc: "PCO CREMINI 227",
//     price: "1.99"
// }];
//
// classifyItem(inputItem)
//     .then(classifiedItem => console.log(classifiedItem))
//     .catch(error => console.error(error));


module.exports = classifyItem;
