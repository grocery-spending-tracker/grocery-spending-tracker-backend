const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

// require('dotenv').config();

const router = express.Router()

var rsa = require('./util/rsaCipher.js');

// console.log(rsa.getPublicKey())

app.use(express.json());

const users = require('./routers/usersRouter.js')
const auth = require('./routers/authenticationRouter.js')
const classification = require('./routers/classificationRouter.js')
const recommendation = require('./routers/recommendationRouter.js')

app.use('/users', users)
app.use('/auth', auth)
app.use('/classification', classification)
app.use('/recommendation', recommendation)

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})