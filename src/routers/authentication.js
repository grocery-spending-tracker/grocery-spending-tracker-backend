const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController.js')

router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})

router.get("/get-token", authController.getUserById)

module.exports = router