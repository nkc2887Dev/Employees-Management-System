import { Router } from 'express';
import express from 'express';
import employeeRoutes from './employee.routes';
import departmentRoutes from './department.routes';
const router = Router();

router.use('/uploads', express.static('uploads'));

router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);

export default router;
