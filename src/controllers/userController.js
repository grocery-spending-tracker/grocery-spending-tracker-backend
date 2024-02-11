const pool = require('../db.js');
const fs = require('fs');
const auth = require('../util/authentication.js');

const setNewUser = ((req, res) => {
    try{
        const userData = req.body;

        // if(!auth.authenticateRequest(req, res)) return;

        console.log("received request for new user ", userData.email, "\nbody: ", userData);

        const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING user_id';
        const values = [
            userData.first_name, 
            userData.last_name, 
            userData.email, 
            userData.password
            ];

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error ' + err);
                return;
            }
            console.log('Query result:', result.rows[0]);
            res.status(200).json(result.rows[0]);
        });

    }catch (e){
        console.error(e);
        res.status(500).send('Server error');
    }
});

// TODO: for debugging only DEV
const getUserById = ((req, res) => {
    try {
        const userId = req.params.userId;

        if(auth.authenticateRequest(req, res) < 0) return;
    
        console.log("received request to get user with userId: ", userId);

        const query = 'SELECT * FROM users WHERE user_id = $1';
        const values = [userId];

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error ' + err);
                return;
            }

            if (result.rows.length === 0) {
                res.status(500).send('No user found with userId: ' + userId);
                return;
            }

            console.log('Query result:', result.rows[0]);
            res.status(200).send(result.rows[0]);
        });

    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        throw error;
    }
});

const updateUserById = ((req, res) => {
    try {
        const userId = req.params.userId;
        const userData = req.body;

        const callingUser = auth.authenticateRequest(req, res);
        if(callingUser < 0) return;

        if(callingUser != userId && callingUser != 1){ //TODO: sussy
            res.status(500).send('Can only update for yourself');
            return;
        }

        console.log("received request to update user with userId: ", userId);

        if("home_base" in userData){
            userData["home_base_lon"] = userData.home_base["longitude"];
            userData["home_base_lat"] = userData.home_base["latitude"];
            delete userData["home_base"];
        }

        const setClauses = Object.keys(userData)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');

        const query = `UPDATE users SET ${setClauses} WHERE user_id = $1 RETURNING *`;
        const values = [userId, ...Object.values(userData)];

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error ' + err);
                return;
            }

            console.log('Query result:', result.rows[0]);
            res.status(200).json(result.rows[0]);
        });

    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
});

const deleteUserById = ((req, res) => {
    try {
        const userId = req.params.userId;

        const callingUser = auth.authenticateRequest(req, res);
        if(callingUser < 0) return;

        if(callingUser != userId && callingUser != 1){ //TODO: sussy
            res.status(500).send('Can only delete yourself');
            return;
        }

        console.log("received request to delete user with userId: ", userId);

        const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
        const values = [userId];

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error ' + err);
                return;
            }

            if (result.rows.length === 0) {
                res.status(500).send('No user found with userId: ' + userId);
                return;
            }

            console.log('Query result:', result.rows[0]);
            res.status(200).json(result.rows[0]);
        });

    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        throw error;
    }
});

const addTrip = ((req, res) => {
    try{
        const userId = req.params.userId;
        const tripData = req.body;

        const callingUser = auth.authenticateRequest(req, res);
        if(callingUser < 0) return;

        if(callingUser != userId && callingUser != 1){ //TODO: sussy
            res.status(500).send('Can only add trip for yourself');
            return;
        }

        console.log("received request for new trip for user_id:", userId , "\nbody: ", tripData);

        const query = 'INSERT INTO trips (user_id, date_time, location, subtotal, total, trip_desc) VALUES ($1, $2, $3, $4, $5, $6) RETURNING trip_id';
        const values = [userId, tripData.date_time, tripData.location, tripData.subtotal, tripData.total, tripData.trip_desc];

        var response = {};

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error when adding trip: ' + err);
                return;
            }
            response["trip_id"] = result.rows[0]["trip_id"];

            tripData.items.forEach((item) => {
                var id = addItem(item, response["trip_id"]);
            });

            console.log('Query result:', response);
            res.status(200).json(response);
        });

    }catch (e){
        console.error(e);
        res.status(500).send('Server error');
    }
});

const getTrips = ((req, res) => {

    try{
        const userId = req.params.userId;
        const tripData = req.body;

        const callingUser = auth.authenticateRequest(req, res);
        if(callingUser < 0) return;

        console.log("received request for get trip for user_id:", callingUser);

        const query = 'SELECT * FROM trips WHERE user_id = $1 ORDER BY date_time, trip_id';
        const values = [callingUser];

        // this block came from gpt4
        pool.query(query, values)
            .then(tripsRes => {
                // Map each trip to a Promise that resolves with the trip and its items
                const tripItemPromises = tripsRes.rows.map(trip => {
                const itemsQuery = `SELECT * FROM items WHERE trip_id = $1;`;
                return pool.query(itemsQuery, [trip.trip_id])
                    .then(itemsRes => {
                        return { ...trip, items: itemsRes.rows }; // Combine trip with its items
                    });
                });
              
                // Wait for all trip-item combinations to be resolved
                return Promise.all(tripItemPromises);
            })
            .then(tripsWithItems => {
                console.log('Query result:', JSON.stringify(tripsWithItems, null, 2));
                res.status(200).json(tripsWithItems);
                // You can return or process tripsWithItems as needed here
            })
            .catch(err => {
                console.error('Error executing query', err.stack);
            });

    }catch (e){
        console.error(e);
        res.status(500).send('Server error');
    }

});

function addItem(item, tripId){

    const query = 'INSERT INTO items (trip_id, item_desc, item_key, price, taxed) VALUES ($1, $2, $3, $4, $5) RETURNING item_id';
    const values = [tripId, item.item_desc, item.item_key, item.price, item.taxed];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error executing query', err);
            res.status(500).send('Database Error when adding item: ' + err);
            return;
        }
        return result.rows[0]["item_id"];
    });

}

module.exports = {
    setNewUser,
    getUserById,
    updateUserById,
    deleteUserById,
    addTrip,
    getTrips
}