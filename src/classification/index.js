const classifyItem = require('./classifyItem').classifyItem;
const convertPriceToDecimal = require('./convertPriceToDecimal').convertPriceToDecimal;
const fuzzyMatching = require('./fuzzyMatching').fuzzyMatching;
const getProductDetails = require('./getProductDetails').getProductDetails;
const productUtils = require('./productUtils').productUtils;

module.exports = {
  classifyItem,
  convertPriceToDecimal,
  fuzzyMatching,
  getProductDetails,
  productUtils,
  // You can also export the data if necessary
  products: require('./products.json'),
  updated_products: require('./updated_products.json'),
  // Add more exports here if needed
};