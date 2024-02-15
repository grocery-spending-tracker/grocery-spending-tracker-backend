import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router()

router.use((req, res, next) => {
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nRecieved for /users/');
    console.log('Time: ', Date.now());
    next();
})

// todo: separate
router.post("/goal", userController.setGoal);
router.get("/goal", userController.getGoals);

// todo: separate
router.get("/trip", userController.getTrips);
router.post("/trip", userController.addTrip); // reduced

router.post("/new-user", userController.setNewUser);

router.get("/:userId", userController.getUserById);
router.patch("/:userId", userController.updateUserById);
router.delete("/:userId", userController.deleteUserById);

export default router;