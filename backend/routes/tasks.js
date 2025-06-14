import express from 'express';
import * as TaskController from '../controllers/task.controller.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(auth);

router.get('/', TaskController.getTasks);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export default router;
