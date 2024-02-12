const express = require('express')
const router = express.Router()

router.use((req, res, next) => {
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nRecieved for /classification/')
    console.log('Time: ', Date.now())
    next()
})

// router.post("/login", authController.getKey)

module.exports = router