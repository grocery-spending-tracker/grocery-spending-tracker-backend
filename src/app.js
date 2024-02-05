const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

const router = express.Router()

var rsa = require('./util/rsaCipher.js');

console.log(rsa.getPublicKey())

app.use(express.json());

const users = require('./routers/usersRouter.js')
const auth = require('./routers/authenticationRouter.js')

app.use('/users', users)
app.use('/auth', auth)

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})