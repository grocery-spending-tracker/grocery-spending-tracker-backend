const express = require('express')
const app = express()
const port = 3000

const router = express.Router()

app.use(express.json());

const users = require('./routers/usersRouter.js')

app.use('/users', users)

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.post('/submit-item-list', (req, res) => {
//     const userData = req.body;
//     console.log('Received data:', userData);
    
//     // Process the data here
//     // ...

//     res.status(200).send('Data received successfully');
// });

// app.post('/users/:userId/new-user', (req, res) => {
//     try{
//         const userId = req.params.userId;
//         const userData = req.body;
//         console.log("received request for new user ", userId, "\nbody: ", userData);

    
//         // Process the data here
//         // ...

//         res.status(200).send('Data received successfully');

//     }catch (e){
//         console.error(e);
//         res.status(500).send('Server error');
//     }

// });

// POST endpoint to receive location data with userId in URL
// app.post('/users/:userId/add-location', userController.userController);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})