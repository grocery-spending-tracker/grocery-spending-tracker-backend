const setLocation = ((req, res) => {
  console.log("aerqearvaerva");
  try {
        const userId = req.params.userId;
        const { name, latitude, longitude } = req.body;

        console.log("received request for user " + userId);

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
  setLocation
}