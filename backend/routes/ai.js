import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(auth);

router.post('/optimize', aiController.optimizeTask);
router.post('/assign', aiController.suggestAssignment);

export default router;
