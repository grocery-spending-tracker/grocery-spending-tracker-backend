import express from 'express';
import * as usersController from '../controllers/usersController.js';

const router = express.Router()

router.use((req, res, next) => {
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nReceived for /users/');
    console.log('Time: ', Date.now());
    next();
})

// todo: separate?
router.post("/goal", usersController.setGoal);
router.get("/goal", usersController.getGoals);
router.delete("/goal/:goal_id", usersController.deleteGoal);

// todo: separate?
router.get("/trip", usersController.getTrips);
router.post("/trip", usersController.addTrip);
router.delete("/trip/:trip_id", usersController.stripTripOfUser)

router.post("/", usersController.createNewUser);
router.get("/", usersController.getUser);
router.patch("/", usersController.updateUser);
router.delete("/", usersController.deleteUserById);

export default router;