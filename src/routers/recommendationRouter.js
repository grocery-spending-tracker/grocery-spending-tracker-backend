import express from 'express';
const router = express.Router()

router.use((req, res, next) => {
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nRecieved for /recommendation/')
    console.log('Time: ', Date.now())
    next()
})

// router.post("/login", authController.getKey)

export default router;