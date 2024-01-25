const pool = require('../db.js');

const getUserById = ((req, res) => {
    try {
        const userId = req.params.userId;

        console.log("received request user with userId: ", userId);

        const query = 'SELECT * FROM users WHERE user_id = $1';
        const values = [userId];

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error ' + err);
                return;
            }

            if (result.rows.length === 0) {
                res.status(500).send('No user found with userId: ', userId);
            }

            console.log('Query result:', result.rows);
            res.status(200).json(result.rows);
        });

    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        throw error;
    }

})

const setNewUser = ((req, res) => {
    try{
        const userData = req.body;

        console.log("received request for new user ", userData.email, "\nbody: ", userData);

        const query = 'INSERT INTO users (first_name, last_name, email, password, home_base_lon, home_base_lat) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id';
        const values = [userData.firstName, userData.lastName, userData.email, userData.password, userData.homeBase.longitude, userData.homeBase.latitude];

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error ' + err);
                return;
            }
            console.log('Query result:', result.rows);
            res.status(200).json(result.rows);
        });

    }catch (e){
        console.error(e);
        res.status(500).send('Server error');
    }

})

// DEPRECIATED
const setLocation = ((req, res) => {
    try {
        const userId = req.params.userId;
        const { name, latitude, longitude } = req.body;

        console.log("received location set for user: " + userId);

        // Validate latitude and longitude
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).send('Invalid latitude or longitude values.');
        }

        // const query = 'INSERT INTO locations (user_id, name, geo_point) VALUES ($1, $2, ST_SetSRID(ST_Point($3, $4), 4326))';
        // const values = [userId, name, longitude, latitude];

        // await pool.query(query, values);

        res.status(200).send('Location added successfully for user ' + userId);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }

})



module.exports = {
  getUserById,
  setLocation,
  setNewUser
}