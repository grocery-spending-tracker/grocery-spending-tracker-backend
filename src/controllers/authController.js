const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const auth = require('../util/authentication.js');


const getKey = ((req, res) => {
    try {
        const userData = req.body;

        console.log("received get request for token on user: " + userData.user_id);

        const query = "SELECT EXISTS (SELECT 1 FROM users WHERE user_id = $1 AND password = $2) AS user_exists";
        const values = [userData.user_id, userData.password];

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error ' + err);
                return;
            }

            if (!result.rows[0]["user_exists"]) {
                res.status(500).send('Incorrect credentials for user: ' + userData.user_id);
                return;
            }

            const token = auth.signToken(userData.user_id);

            res.json({ token });
        });

    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
})

module.exports = {
  getKey
}