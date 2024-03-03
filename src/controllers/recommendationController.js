import pool from '../db.js';
import Auth from "../util/authentication.js";

/**
 * Function to get frequently purchased items for a user
 * @param {number} userId
 * @returns {Promise<Array<object>>}
 */
async function getFrequentlyPurchasedItems(userId) {
    try {
        const client = await pool.connect();
        const query = `
            SELECT ci.item_key, ci.item_name, ci.price, ci.image_url, t.location, t.date_time, count(*) AS frequency
            FROM classifiedItems ci
            JOIN trips t ON ci.trip_id = t.trip_id
            WHERE t.user_id = $1
            GROUP BY ci.item_key, ci.item_name, ci.price, ci.image_url, t.location, t.date_time
            ORDER BY frequency DESC, ci.price ASC
            LIMIT 10;
        `;
        const result = await client.query(query, [userId]);
        client.release();
    
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
        const client = await pool.connect();
        const query = `
            WITH lowest_prices AS (
                SELECT item_key, MIN(price) AS lowest_price
                FROM classifiedItems
                GROUP BY item_key
            )
            SELECT ci.item_key, ci.item_name, ci.price, ci.image_url, t.location, t.date_time, count(*) AS frequency, 
                lp.lowest_price
            FROM classifiedItems ci
            JOIN trips t ON ci.trip_id = t.trip_id
            JOIN lowest_prices lp ON ci.item_key = lp.item_key
            WHERE t.user_id = $1 
                AND ci.price > lp.lowest_price
            GROUP BY ci.item_key, ci.item_name, ci.price, ci.image_url, t.location, t.date_time
            ORDER BY frequency DESC, lowest_price ASC
            LIMIT 10;
        `;

        const result = await client.query(query, [userId]);
        client.release();
    
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
        const client = await pool.connect();
        const query = `
            SELECT ci.item_key, ci.item_name, ci.image_url, t.location, t.date_time, count(*) AS frequency
            FROM classifiedItems ci
            JOIN trips t ON ci.trip_id = t.trip_id 
            GROUP BY ci.item_key, ci.item_name, ci.price, ci.image_url, t.location, t.date_time
            ORDER BY frequency DESC, ci.price ASC
            LIMIT 10;
        `;
        const result = await client.query(query);
        client.release();
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

const getRecommendations = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request for get recommendation from ", callingUser);

        // call singleRecommendation
        const recommendations = await recommendItems(callingUser); //userid

        // console.log("not implemented yet :(");
        // res.status(200).json({"message":"not implemented yet :("});

        // let recommendation = {};
        
        console.log('Query result:', recommendations);
        res.status(200).json(recommendations);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

const getRecommendationsLowestAvailable = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request for get recommendation from ", callingUser);

        // call singleRecommendation
        const recommendations = await recommendLowestPriceItems(callingUser); //userid

        // console.log("not implemented yet :(");
        // res.status(200).json({"message":"not implemented yet :("});

        // let recommendation = {};
        
        console.log('Query result:', recommendations);
        res.status(200).json(recommendations);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

export {
    getRecommendationsLowestAvailable,
    getRecommendations
};