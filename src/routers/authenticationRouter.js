const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController.js')

router.use((req, res, next) => {
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nRecieved for /auth/')
    console.log('Time: ', Date.now())
    next()
})

router.post("/login", authController.getKey)

module.exports = router