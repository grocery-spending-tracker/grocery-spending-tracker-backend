import express from 'express';
import * as recommendationController from '../controllers/recommendationController.js';

const router = express.Router();

router.use((req, res, next) => {
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nReceived for /recommendation/');
    console.log('Time: ', Date.now());
    next();
})

router.get("/", recommendationController.getRecommendations);
router.get("/lowest", recommendationController.getRecommendationsLowestAvailable);

export default router;