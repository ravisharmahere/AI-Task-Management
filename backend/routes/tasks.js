import express from 'express';
import * as taskController from '../controllers/task.controller.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(auth);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
