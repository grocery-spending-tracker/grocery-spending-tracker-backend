const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/submit-item-list', (req, res) => {
    const userData = req.body;
    console.log('Received data:', userData);
    
    // Process the data here
    // ...

    res.status(200).send('Data received successfully');
});

app.post('/new-user', (req, res) => {
    const userData = req.body;
    console.log('Received data:', userData);
    
    // Process the data here
    // ...

    res.status(200).send('Data received successfully');
});

// POST endpoint to receive location data with userId in URL
app.post('/users/:userId/add-location', async (req, res) => {
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
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})