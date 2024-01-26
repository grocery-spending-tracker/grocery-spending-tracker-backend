const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController.js')

router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})

router.get("/:userId", userController.getUserById)

router.post("/new-user", userController.setNewUser)

router.patch("/:userId", userController.updateUserById)

router.delete("/:userId", userController.deleteUserById)


// router.get("/userIdByEmail", userController.getUserIdByEmail)

module.exports = router