const pool = require('../db.js');

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


module.exports = {
  getKey
}