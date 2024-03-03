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
            SELECT item_key, item_desc, count(*) AS frequency
            FROM classifiedItems
            WHERE trip_id IN (
            SELECT trip_id
            FROM trips
            WHERE user_id = $1
            )
            GROUP BY item_key, item_desc
            ORDER BY frequency DESC
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
            SELECT item_key, item_desc, count(*) AS frequency
            FROM classifiedItems
            GROUP BY item_key, item_desc
            ORDER BY frequency DESC
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
        return await getPopularItems();
    }

    return frequentlyPurchased.slice(0, 3);
}

const getRecommendations = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request for get recommendation from ", callingUser);

        // call singleRecommendation
        const recommendations = recommendItems(callingUser); //userid

        console.log("not implemented yet :(");
        res.status(200).json({"message":"not implemented yet :("});

        // let recommendation = {};
        
        console.log('Query result:', recommendations);
        res.status(200).json(recommendations);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

export {
    getRecommendations
};