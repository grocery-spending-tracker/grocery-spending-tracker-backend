const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');


const cachePath = path.join(__dirname, 'cache.json');

function readCache() {
    if (fs.existsSync(cachePath)) {
        const cacheRaw = fs.readFileSync(cachePath);
        return JSON.parse(cacheRaw);
    }
    return {};
}

function writeCache(cache) {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

async function getProductDetails(sku) {

    const cache = readCache();
    if (cache[sku]) {
        console.log('Returning cached details for SKU:', sku);
        return cache[sku];
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const productDetails = { store: "Fortinos", brand: null, name: null, price: null, was_price: null, product_number: null, image_url: null };

    try {
        const url = `https://www.fortinos.ca/search?search-bar=${sku}`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        try {
            productDetails.brand = await page.$eval(".product-name__item--brand", el => el.textContent.trim());
        } catch (error) {
            console.log("Brand not found");
        }

        try {
            productDetails.name = await page.$eval(".product-name__item--name", el => el.textContent.trim());
        } catch (error) {
            console.log("Name not found");
        }

        try {
            productDetails.price = await page.$eval(".selling-price-list__item__price--now-price__value", el => el.textContent.trim());
        } catch (error) {
            console.log("Price not found");
        }

        try {
            const productLink = await page.$(".product-tile__details__info__name__link");
            productDetails.product_number = await page.evaluate(el => el.href.split('/').pop(), productLink);
        } catch (error) {
            console.log("Product link or number not found");
        }

        try {
            productDetails.image_url = await page.$eval(".responsive-image--product-tile-image", img => img.src.trim());
        } catch (error) {
            console.log("Image URL not found");
        }

        cache[sku] = productDetails;
        writeCache(cache);

    } catch (error) {
        console.error(`Error fetching product details for SKU ${sku}:`, error);
    } finally {
        await browser.close();
    }

    return productDetails;
}

module.exports = getProductDetails;
