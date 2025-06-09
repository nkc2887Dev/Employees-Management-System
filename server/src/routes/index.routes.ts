import { Router } from 'express';
import express from 'express';
import employeeRoutes from './employee.routes';
import departmentRoutes from './department.routes';
const router = Router();

// Static file serving
router.use('/uploads', express.static('uploads'));

// Routes
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);

export default router;
