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

// todo: separate?
router.get("/trip", usersController.getTrips);
router.post("/trip", usersController.addTrip);

router.post("/new-user", usersController.createNewUser);

router.get("/:userId", usersController.getUser);
router.patch("/:userId", usersController.updateUser);
router.delete("/:userId", usersController.deleteUserById);

export default router;