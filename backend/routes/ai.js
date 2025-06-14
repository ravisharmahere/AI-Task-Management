import express from 'express';
import * as AIController from '../controllers/ai.controller.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(auth);

router.post('/optimize', AIController.optimizeTask);
router.post('/assign', AIController.suggestAssignment);
router.post('/summary', AIController.generateSummary);

export default router;
