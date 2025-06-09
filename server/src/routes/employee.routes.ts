import { Router } from 'express';
import { validateRequest } from '../middlewares/validate.middleware';
import { employeeSchema, employeeUpdateSchema } from '../validations/schemas';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} from '../controllers/employee.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.post('/', upload.single('photo'), validateRequest(employeeSchema), createEmployee);
router.put('/:id', upload.single('photo'), validateRequest(employeeUpdateSchema), updateEmployee);

router.get('/', getAllEmployees);
router.get('/stats', getEmployeeStats);
router.get('/:id', getEmployeeById);
router.delete('/:id', deleteEmployee);

export default router;
