const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const JWT_PRIVATE = process.env.JWT_PRIVATE || fs.readFileSync('private_key.pem', 'utf8');
const signOptions = {
    expiresIn: '1h', // Token expires in 1 hour
    algorithm: 'RS256' // Use RSASSA-PKCS1-v1_5
};

const getKey = ((req, res) => {
try {
    const userData = req.body;

        console.log("received get request for token on user: " + userData.user_id);

        console.log(JWT_PRIVATE);


        // const query = 'INSERT INTO locations (user_id, name, geo_point) VALUES ($1, $2, ST_SetSRID(ST_Point($3, $4), 4326))';
        // const values = [userId, name, longitude, latitude];

        if (verifyCredentials(userData.user_id, userData.password)) {
            const token = jwt.sign({ username: userData.user_id }, JWT_PRIVATE, signOptions); // Expires in 1 hour
            console.log('Token:', token);
            res.json({ token });
        } else {
            res.status(401).send('Username or password is incorrect');
        }

    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
})


// return true if password exists
function verifyCredentials(userId, password){

    // get password

    const user = {}//users.find(u => u.user_id === user_id && u.password === password);

    //temp
    user.user_id = userId
    ///

    // decrypt

    // compare

    // respont

    
    return true;

    // const query = 'INSERT INTO items (trip_id, item_desc, price, taxed) VALUES ($1, $2, $3, $4) RETURNING item_id';
    // const values = [tripId, item.item_desc, item.price, item.taxed];

    // pool.query(query, values, (err, result) => {
    //     if (err) {
    //         console.error('Error executing query', err);
    //         res.status(500).send('Database Error when adding item: ' + err);
    //         return;
    //     }
    //     return result.rows[0]["item_id"];
    // });

}


module.exports = {
  getKey
}