const Fuse = require('fuse.js');
const { loadProducts, addProduct } = require('./productUtils');


function fuzzyMatching(inputData, products) {
    const enhancedProducts = products.map(p => ({
        ...p,
        brandName: `${p.brand} ${p.name}`
    }));

    const fuseByName = new Fuse(products, { keys: ["name"], includeScore: true });
    const fuseByPrice = new Fuse(products, { keys: ["price"], includeScore: true });
    const fuseByBrandName = new Fuse(enhancedProducts, { keys: ["brandName"], includeScore: true });

    const nameWeight = 0.6;
    const priceWeight = 0.4;

    const matchedProducts = inputData.map(inputItem => {
        const resultsByName = fuseByName.search(inputItem.item_desc);
        const resultsByPrice = fuseByPrice.search(inputItem.price);
        const resultsByBrandName = fuseByBrandName.search(inputItem.item_desc);
        
        let combinedResults = [];
        
        resultsByName.forEach(nameResult => {
            resultsByBrandName.forEach(brandNameResult => {
                if (nameResult.item.product_number === brandNameResult.item.product_number) {
                    if (nameResult.score > brandNameResult.score) {
                        nameResult = brandNameResult;
                    }
                }
            });
            resultsByPrice.forEach(priceResult => {
                if (nameResult.item === priceResult.item) {
                    let combinedScore = (nameResult.score * nameWeight) + (priceResult.score * priceWeight);
                    combinedResults.push({ item: nameResult.item, score: combinedScore });
                }
            });
        });

        combinedResults.sort((a, b) => a.score - b.score);
        
        if (combinedResults.length > 0) {
            return { input: inputItem, match: combinedResults[0].item, score: combinedResults[0].score };
        } else {
            return { input: inputItem, match: null, score: null };
        }
    });
    
    return matchedProducts;
}


module.exports = fuzzyMatching;