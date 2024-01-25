const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController.js')

router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})

router.get("/:userId", userController.getUserById)

router.post("/:userId/add-location", userController.setLocation)

router.post("/new-user", userController.setNewUser)

module.exports = router