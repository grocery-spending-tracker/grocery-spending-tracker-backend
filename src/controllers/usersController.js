import pool from '../db.js';
import Auth from "../util/authentication.js";
//import classifyItem from '../classification/classifyItem.js';
import Classification from "../grocery-spending-tracker-classification/src/main.js";
import classifyItem from "grocery-spending-tracker-classification/src/classification/classifyItem.js";

/**
 * Takes user object in body and adds to database
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} user_id
 */
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

/**
 * Takes JWT token in header
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} user object
 */
const getUser = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("Received request to get user with userId:", callingUser);

        const query = 'SELECT * FROM users WHERE user_id = $1';
        const values = [callingUser];

        // Await the query result
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            res.status(404).send('No user found with userId: ' + callingUser); // Using 404 Not Found for no result
            return;
        }

        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Database Error ' + error);
    }
};

/**
 * Takes JWT token in header and user object in body, returns user object
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} user object
 */
const updateUser = async (req, res) => {
    try {
        const userData = req.body;

        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to update user with userId: ", callingUser);

        if("home_base" in userData){
            userData["home_base_lon"] = userData.home_base["longitude"];
            userData["home_base_lat"] = userData.home_base["latitude"];
            delete userData["home_base"];
        }

        const setClauses = Object.keys(userData).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const query = `UPDATE users SET ${setClauses} WHERE user_id = $1 RETURNING *`;
        const values = [callingUser, ...Object.values(userData)];

        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

/**
 * Takes JWT token in header and deletes user from db
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} user object
 */
const deleteUserById = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to delete user with userId: ", callingUser);

        const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
        const values = [callingUser];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            res.status(500).send('No user found with userId: ' + callingUser);
            return;
        }

        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

/**
 * Takes JWT token in header and goal object in body, adds goal to db
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} goal_id
 */
const setGoal = async (req, res) => {
    try {
        const goalData = req.body;

        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to set goal for user_id:", callingUser, "\nbody: ", goalData);

        const query = 'INSERT INTO goals (user_id, start_date, end_date, budget, goal_name, goal_desc, periodic) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING goal_id';
        const values = [
            callingUser,
            goalData["start_date"],
            goalData["end_date"],
            goalData["budget"],
            goalData["goal_name"],
            goalData["goal_desc"],
            goalData["periodic"]
        ];

        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error when adding trip: ' + err);
    }
};

/**
 * Takes JWT token in header, goal_id in params, and goal object in body, updates goal to db
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} goal object
 */
const updateGoal = async (req, res) => {
    try {
        const goal_id = req.params["goal_id"];

        const goalData = req.body;

        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to update goal for user_id:", callingUser, "\ngoal_id: ", goal_id, "\nbody: ", goalData);

        const setClauses = Object.keys(goalData).map((key, index) => `${key} = $${index + 2}`).join(', ');

        const query = `UPDATE goals SET ${setClauses} WHERE user_id = $1 RETURNING *`;
        const values = [callingUser, ...Object.values(goalData)];

        // do users check

        const result = await pool.query(query, values);
        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error when adding trip: ' + err);
    }
};

/**
 * Takes JWT token in header and returns all goal objects referencing user in jwt
 * @param req http_req
 * @param res http_res
 * @returns {Promise<Array<object>>} list of all user goals
 */
const getGoals = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
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

/**
 * Takes JWT token in header and goal_id in params, returns goal after deleting from db
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} goal object
 */
const deleteGoal = async (req, res) => {
    try {
        const goal_id = req.params["goal_id"];

        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request to delete goal for user_id: " + callingUser + " and goal_id: " + goal_id);

        const query = 'DELETE FROM goals WHERE user_id = $1 AND goal_id = $2 RETURNING goal_id;';
        const values = [callingUser, goal_id];

        const result = await pool.query(query, values);

        if(result.rows.length === 0){
            res.status(500).send('no goal under user_id: ' + callingUser + " and goal_id: " + goal_id);
            return;
        }

        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

/**
 * Takes JWT token in header and trip object in body, adds trip to db
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} trip_id
 */
const addTrip = async (req, res) => {
    try {
        const tripData = req.body;

        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("Received request for new trip for user_id:", callingUser, "\nbody: ", tripData);

        const query = 'INSERT INTO trips (user_id, date_time, location, subtotal, total, trip_desc) VALUES ($1, $2, $3, $4, $5, $6) RETURNING trip_id';
        const values = [callingUser, tripData.date_time, tripData.location, tripData.subtotal, tripData.total, tripData.trip_desc];

        let tripId;

        try{
            const result = await pool.query(query, values); // Use await to wait for the query to finish
            tripId = result.rows[0]["trip_id"];
        }catch(err){
            console.error('Error executing query', err);
            res.status(500).send('Database Error when adding trip: ' + err);
            return;
        }

        // add items to db referencing new trip
        for (let item of tripData.items) {
            try{
                await addItem(item, tripId); // Wait for each item to be added
            }catch(err){
                res.status(500).send(err);
                return;
            }
        }

        console.log('Query result:', { trip_id: tripId });
        res.status(200).json({ trip_id: tripId });
    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
};

/**
 * Takes JWT token in header and returns all trips referencing the user_id in jwt
 * @param req http_req
 * @param res http_res
 * @returns {Promise<Array<object>>} list of all trips
 */
const getTrips = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
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

/**
 * Takes JWT token in header and trip_id in param, removes reference to user in specified trip
 * @param req http_req
 * @param res http_res
 * @returns {Promise<object>} trip_id
 */
const stripTripOfUser = async (req, res) => {
    try {
        const trip_id = req.params["trip_id"];

        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("Received request to delete a trip: ", trip_id, " for user_id:", callingUser);

        const query = 'UPDATE trips SET user_id = NULL WHERE trip_id = $2 AND user_id = $1 RETURNING trip_id';
        const values = [callingUser, trip_id];

        let result;
        try{
            result = await pool.query(query, values); // Use await to wait for the query to finish
        }catch(err){
            console.error('Error executing query', err);
            res.status(500).send('Database Error when adding trip: ' + err);
            return;
        }

        if(result.rows.length === 0){
            res.status(500).send('no trip under user_id: ' + callingUser + " and trip_id: " + trip_id);
            return;
        }

        console.log('Query result:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
};

/**
 * adds item to table referencing given trip_id
 * @param item
 * @param tripId
 * @returns {Promise<object>} item_id
 */
async function addItem(item, tripId) {
    const item_query = 'INSERT INTO items (trip_id, item_desc, item_key, price, taxed) VALUES ($1, $2, $3, $4, $5) RETURNING item_id';
    const item_values = [tripId, item.item_desc, item.item_key, item.price, item.taxed];

    // omit await so that classify does not hold up http response
    classifyItemAsync(item, tripId); // intentional no await

    try {
        const result = await pool.query(item_query, item_values);
        return result.rows[0]["item_id"];
    } catch (err) {
        console.error('Error executing query', err);
        throw new Error('Database Error when adding item: ' + err);
    }
}

/**
 * classifies item and adds to classification table referencing given trip_id
 * @param item
 * @param tripId
 * @returns {Promise<object>} classified_item_id
 */
async function classifyItemAsync(item, tripId) {
    try{
        // classify item
        var itemCp = structuredClone(item);
        var classifiedItem = (await Classification.processItem([itemCp]))[0];

        classifiedItem["item_desc"] = item["item_desc"];
        classifiedItem["item_key"] = item["item_key"];
        classifiedItem["taxed"] = item["taxed"];
        classifiedItem["trip_id"] = tripId;

        const class_query = 'INSERT INTO classifiedItems (trip_id, item_key, item_desc, price, listed_price, item_brand, item_name, item_product_number, image_url, taxed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING classified_item_id';
        const class_values = [tripId, classifiedItem.item_key, classifiedItem.item_desc,  classifiedItem.price, classifiedItem.list_price, classifiedItem.brand, classifiedItem.name, classifiedItem.product_number, classifiedItem.image_url, classifiedItem.taxed];

        try {
            const result = await pool.query(class_query, class_values);
            console.log("sent to table with classified_item_id: " + result.rows[0]["classified_item_id"]);
            // return result.rows[0]["classified_item_id"];
        } catch (err) {
            console.error('Error executing query', err);
            throw new Error('Database Error when adding classified_item: ' + err);
        }
    }catch(e){
        console.log("Error classifying item: " + e);
    }
}

export {
    createNewUser,
    getUser,
    updateUser,
    deleteUserById,
    addTrip,
    getTrips,
    stripTripOfUser,
    setGoal,
    getGoals,
    updateGoal,
    deleteGoal
};