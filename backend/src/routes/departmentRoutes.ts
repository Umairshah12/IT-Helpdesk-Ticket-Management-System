import { Router } from 'express';
import { departmentController } from '../controllers/departmentController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { departmentSchema } from '../validators/departmentValidators';

const router = Router();

router.use(authenticate);

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post(
  '/',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  validate(departmentSchema),
  departmentController.createDepartment
);
router.put(
  '/:id',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  validate(departmentSchema.partial()),
  departmentController.updateDepartment
);
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), departmentController.deleteDepartment);

export default router;

