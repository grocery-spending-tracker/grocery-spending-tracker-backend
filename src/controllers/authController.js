const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const JWT_PRIVATE = process.env.JWT_PRIVATE.replace(/\\n/g, '\n') || fs.readFileSync('private_key.pem', 'utf8');

const signOptions = {
    expiresIn: '1h', // Token expires in 1 hour
    algorithm: 'RS256' // Use RSASSA-PKCS1-v1_5
};

const getKey = ((req, res) => {
    try {
        const userData = req.body;

        console.log("received get request for token on user: " + userData.user_id);

        const query = "SELECT EXISTS (SELECT 1 FROM users WHERE user_id = $1 AND password = $2) AS user_exists";
        const values = [userData.user_id, userData.password];
        //SELECT EXISTS (SELECT 1 FROM usersWHERE user_id = $1 AND password = $2) AS user_exists;

        

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



            const token = jwt.sign({ username: userData.user_id }, JWT_PRIVATE, signOptions); // Expires in 1 hour
            console.log('Token:', token);
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