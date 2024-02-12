const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController.js')

router.use((req, res, next) => {
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nRecieved for /users/')
    console.log('Time: ', Date.now())
    next()
})

// separate?
router.post("/goal", userController.setGoal)
router.get("/goal", userController.getGoals)

// separate?
router.get("/trip", userController.getTrips)
router.post("/trip", userController.addTrip) // reduced

router.post("/new-user", userController.setNewUser)

router.get("/:userId", userController.getUserById)
router.patch("/:userId", userController.updateUserById)
router.delete("/:userId", userController.deleteUserById)

// router.get("/userIdByEmail", userController.getUserIdByEmail)

module.exports = router