const pool = require('../db.js');
const jwt = require('jsonwebtoken');

const getKey = ((req, res) => {
try {
    const userData = req.body;

        console.log("received get request for user: " + userId);

        // const query = 'INSERT INTO locations (user_id, name, geo_point) VALUES ($1, $2, ST_SetSRID(ST_Point($3, $4), 4326))';
        // const values = [userId, name, longitude, latitude];

        // await pool.query(query, values);
        body = {userId: userId, name:"Sawyer"}
        res.json(body);
        // res.status(200).send('Location added successfully for user ' + userId);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
})


// return true if password exists
function findUser(userId, password){

    const JWT_SECRET = process.env.JWT_SECRET;

    // get password

    const user = {}//users.find(u => u.user_id === user_id && u.password === password);

    // decrypt

    // compare

    // respont

    if (user) {
        const token = jwt.sign({ username: user.user_id }, JWT_SECRET, { expiresIn: '3h' }); // Expires in 1 hour
        res.json({ token });
    } else {
        res.status(401).send('Username or password is incorrect');
    }


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