import express from 'express';
import { getTeacherDashboard } from '../controllers/teacherMyclassesController.js';
import { verifyTeacher } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', verifyTeacher, getTeacherDashboard);

export default router;
