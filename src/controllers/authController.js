const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const auth = require('../util/authentication.js');


const getKey = ((req, res) => {
    try {
        const userData = req.body;

        console.log("received get request for token on user: " + userData.user_id);

        const query = "SELECT user_id, email FROM users WHERE email = $1 AND password = $2";
        const values = [userData.email, userData.password];

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query', err);
                res.status(500).send('Database Error ' + err);
                return;
            }

            if (result.rows[0] == null) {
                res.status(500).send('Incorrect credentials for user: ' + userData.email);
                return;
            }

            console.log(result.rows[0]["user_id"]);
            user_id = result.rows[0]["user_id"];
            email = result.rows[0]["email"];

            const token = auth.signToken(userData.user_id);

            res.json({ user_id, email, token });
        });

    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
})

module.exports = {
  getKey
}