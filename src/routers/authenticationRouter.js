import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.use((req, res, next) => {
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nReceived for /auth/');
    console.log('Time: ', Date.now());
    next();
})

router.post("/login", authController.login);

export default router;