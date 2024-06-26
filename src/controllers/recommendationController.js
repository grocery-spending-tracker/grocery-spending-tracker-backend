import pool from '../db.js';
import Auth from "../util/authentication.js";

/**
 * Function to get frequently purchased items for a user
 * @param {number} userId
 * @returns {Promise<Array<object>>}
 */
async function getFrequentlyPurchasedItems(userId) {
    try {
        const query = `
            SELECT 
                ci.item_key,
                MIN(ci.item_name) AS item_name, -- Assuming item_name doesn't vary for the same item_key, or it's acceptable to select any.
                MIN(ci.price) AS price, -- Selects the minimum price for each unique item_key.
                MIN(ci.image_url) AS image_url, -- Assuming one image_url per item_key, or it's acceptable to select any.
                MIN(t.location) AS location, -- Arbitrarily selects a location; adjust as needed.
                MAX(t.date_time) AS date_time, -- Selects the latest date_time for each item_key.
                COUNT(*) AS frequency
            FROM classifiedItems ci
            JOIN trips t ON ci.trip_id = t.trip_id
            WHERE t.user_id = $1
            GROUP BY ci.item_key
            ORDER BY frequency DESC, MIN(ci.price) ASC
            LIMIT 10;
        `;
        const result = await pool.query(query, [userId]);

        if (!result.rows.length) {
            return [];
        }
    
        return result.rows;
    } catch (error) {
        console.error('Error fetching frequently purchased items:', error);
        return [];
    }
}

/**
 * Function to get frequently purchased items that has a lower price comaprison for a user
 * @param {number} userId
 * @returns {Promise<Array<object>>}
 */
async function getLowestPriceFrequentlyPurchasedItems(userId) {
    try {
        const query = `
            WITH lowest_prices AS (
                SELECT item_key, MIN(price) AS lowest_price
                FROM classifiedItems
                GROUP BY item_key
            )
            SELECT DISTINCT fi.item_key, fi.item_name, fi.price, fi.image_url, t.location, t.date_time, lp.lowest_price, count(*) AS frequency
            FROM (
                SELECT classifiedItems.*, ROW_NUMBER() OVER (PARTITION BY classifiedItems.item_key ORDER BY classifiedItems.price DESC) AS row_num
                FROM classifiedItems
                JOIN trips t ON classifiedItems.trip_id = t.trip_id
                WHERE t.user_id = $1
            ) AS fi
            JOIN lowest_prices lp ON fi.item_key = lp.item_key
            JOIN trips t ON fi.trip_id = t.trip_id
            WHERE fi.row_num = 1 AND fi.price > lp.lowest_price
            GROUP BY fi.item_key, fi.item_name, fi.price, fi.image_url, t.location, t.date_time, lp.lowest_price
            ORDER BY frequency DESC, lp.lowest_price ASC
            LIMIT 10;
        `;

        const result = await pool.query(query, [userId]);

        if (!result.rows.length) {
            return [];
        }
    
        return result.rows;
    } catch (error) {
        console.error('Error fetching frequently purchased items:', error);
        return [];
    }
}

/**
 * Function to get frequently purchased items for a user
 * @returns {Promise<Array<object>>}
 */
async function getPopularItems() {
    try {
        const query = `
            SELECT ci.item_key, ci.item_name, ci.image_url, t.location, t.date_time, count(*) AS frequency
            FROM classifiedItems ci
            JOIN trips t ON ci.trip_id = t.trip_id 
            GROUP BY ci.item_key, ci.item_name, ci.price, ci.image_url, t.location, t.date_time
            ORDER BY frequency DESC, ci.price ASC
            LIMIT 10;
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching popular items:', error);
        return [];
    }
}
  
/**
 * Function to recommend items based on frequently purchased items
 * @param {number} userId
 * @returns {Promise<Array<object>>}
 */
async function recommendItems(userId) {
    const frequentlyPurchased = await getFrequentlyPurchasedItems(userId);
    if (!frequentlyPurchased.length) {
        const frequentlyPurchasedFromAllUsers = await getPopularItems();
        return frequentlyPurchasedFromAllUsers.slice(0, 3);
    }

    return frequentlyPurchased.slice(0, 3);
}

/**
 * Function to recommend items based on lowest price and frequently purchased items
 * @param {number} userId
 * @returns {Promise<Array<object>>}
 */
async function recommendLowestPriceItems(userId) {
    const frequentlyPurchased = await getLowestPriceFrequentlyPurchasedItems(userId);

    return frequentlyPurchased.slice(0, 3);
}

/**
 * Returns recommendations for items the user frequently buys
 * @param req http_req
 * @param res http_res
 * @returns {Promise<Array<object>>} recommendations
 */
const getRecommendations = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request for get recommendation from ", callingUser);

        const recommendations = await recommendItems(callingUser); //userid

        console.log('Query result:', recommendations);
        res.status(200).json(recommendations);
    } catch (err) {
        // console.error('Error executing query', err);
        // res.status(500).send('Database Error ' + err);
        console.error(err);
        res.status(500).send('Server Error: ' + err);
    }
};

/**
 * Returns recommendations with their lowest price and location
 * @param req http_req
 * @param res http_res
 * @returns {Promise<Array<object>>} recommendations with lowest prices
 */
const getRecommendationsLowestAvailable = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request for get recommendation from ", callingUser);

        const recommendations = await recommendLowestPriceItems(callingUser); //userid

        console.log('Query result:', recommendations);
        res.status(200).json(recommendations);
    } catch (err) {
        // console.error('Error executing query', err);
        // res.status(500).send('Database Error ' + err);
        console.error(err);
        res.status(500).send('Server Error: ' + err);
    }
};

export {
    getRecommendationsLowestAvailable,
    getRecommendations
};