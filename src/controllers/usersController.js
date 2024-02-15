import pool from '../db.js';
import Auth from "../util/authentication.js";
//import classifyItem from '../classification/classifyItem.js';

const createNewUser = async (req, res) => {
    try {
        const userData = req.body;
        console.log("received request for new user ", userData.email, "\nbody: ", userData);

        const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING user_id';
        const values = [userData.first_name, userData.last_name, userData.email, userData.password];

        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        const callingUser = Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("Received request to get user with userId:", userId);

        const query = 'SELECT * FROM users WHERE user_id = $1';
        const values = [userId];

        // Await the query result
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            res.status(404).send('No user found with userId: ' + userId); // Using 404 Not Found for no result
            return;
        }

        console.log('Query result:', result.rows[0]);
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Database Error ' + error);
    }
};


const updateUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userData = req.body;

        const callingUser = authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to update user with userId: ", userId);

        if("home_base" in userData){
            userData["home_base_lon"] = userData.home_base["longitude"];
            userData["home_base_lat"] = userData.home_base["latitude"];
            delete userData["home_base"];
        }

        const setClauses = Object.keys(userData).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const query = `UPDATE users SET ${setClauses} WHERE user_id = $1 RETURNING *`;
        const values = [userId, ...Object.values(userData)];

        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

const deleteUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        const callingUser = authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to delete user with userId: ", userId);

        const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
        const values = [userId];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            res.status(500).send('No user found with userId: ' + userId);
            return;
        }

        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};


const setGoal = async (req, res) => {
    try {
        const goalData = req.body;

        const callingUser = authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to set goal for user_id:", callingUser, "\nbody: ", goalData);

        const query = 'INSERT INTO goals (user_id, start_date, end_date, budget) VALUES ($1, $2, $3, $4) RETURNING goal_id';
        const values = [callingUser, goalData.start_date, goalData.end_date, goalData.budget];

        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error when adding trip: ' + err);
    }
};

const getGoals = async (req, res) => {
    try {
        const callingUser = authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to get goals for user_id:", callingUser);

        const query = 'SELECT * FROM goals WHERE user_id = $1';
        const values = [callingUser];

        const result = await pool.query(query, values);

        console.log('Query result:', result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

const addTrip = async (req, res) => {
    try {
        const tripData = req.body;

        const callingUser = authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("Received request for new trip for user_id:", callingUser, "\nbody: ", tripData);

        const query = 'INSERT INTO trips (user_id, date_time, location, subtotal, total, trip_desc) VALUES ($1, $2, $3, $4, $5, $6) RETURNING trip_id';
        const values = [callingUser, tripData.date_time, tripData.location, tripData.subtotal, tripData.total, tripData.trip_desc];

        const result = await pool.query(query, values); // Use await to wait for the query to finish
        const tripId = result.rows[0]["trip_id"];

        // Assuming addItem is converted to an async function
        for (let item of tripData.items) {
            await addItem(item, tripId); // Wait for each item to be added
        }

        console.log('Query result:', { trip_id: tripId });
        res.status(200).json({ trip_id: tripId });
    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
};
const getTrips = async (req, res) => {
    try {
        const callingUser = authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request for get trip for user_id:", callingUser);

        const query = 'SELECT * FROM trips WHERE user_id = $1 ORDER BY date_time, trip_id';
        const values = [callingUser];

        const tripsRes = await pool.query(query, values);

        // Use Promise.all to wait for all trips to have their items fetched
        const tripsWithItems = await Promise.all(tripsRes.rows.map(async trip => {
            const itemsQuery = `SELECT * FROM items WHERE trip_id = $1;`;
            const itemsRes = await pool.query(itemsQuery, [trip.trip_id]);
            return { ...trip, items: itemsRes.rows }; // Combine trip with its items
        }));

        console.log('Query result:', JSON.stringify(tripsWithItems, null, 2));
        res.status(200).json(tripsWithItems);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

async function addItem(item, tripId) {
    const item_query = 'INSERT INTO items (trip_id, item_desc, item_key, price, taxed) VALUES ($1, $2, $3, $4, $5) RETURNING item_id';
    const item_values = [tripId, item.item_desc, item.item_key, item.price, item.taxed];

    // classification
    // try{
    //     var itemCp = structuredClone(item);
    //     var classifiedItem = await classifyItem([itemCp]);
    //
    //     classifiedItem["item_desc"] = item["item_desc"];
    //     classifiedItem["item_key"] = item["item_key"];
    //     classifiedItem["taxed"] = item["taxed"];
    //     classifiedItem["trip_id"] = tripId;
    //
    //     const class_query = 'INSERT INTO classifiedItems (trip_id, item_key, item_desc, price, listed_price, item_brand, item_name, item_product_number, image_url, taxed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING classified_item_id';
    //     const class_values = [tripId, classifiedItem.item_key, classifiedItem.item_desc,  classifiedItem.price, classifiedItem.list_price, classifiedItem.brand, classifiedItem.name, classifiedItem.product_number, classifiedItem.image_url, classifiedItem.taxed];
    //
    //     try {
    //         const result = await pool.query(class_query, class_values);
    //         console.log("sent to table with classified_item_id: " + result.rows[0]["classified_item_id"]);
    //         // return result.rows[0]["classified_item_id"];
    //     } catch (err) {
    //         console.error('Error executing query', err);
    //         throw new Error('Database Error when adding classified_item: ' + err);
    //     }
    // }catch(e){
    //     console.log("Error classifying item: " + e);
    // }

    try {
        const result = await pool.query(item_query, item_values);
        return result.rows[0]["item_id"];
    } catch (err) {
        console.error('Error executing query', err);
        throw new Error('Database Error when adding item: ' + err);
    }
}

export {
    createNewUser,
    getUserById,
    updateUserById,
    deleteUserById,
    addTrip,
    getTrips,
    setGoal,
    getGoals
};