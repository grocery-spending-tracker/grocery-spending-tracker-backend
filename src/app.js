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

app.post('/set-user-location', (req, res) => {
    const userData = req.body;
    console.log('Received data:', userData);
    
    // Process the data here
    // ...

    res.status(200).send('Data received successfully');
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})