import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  updateRoleSchema,
} from '../validators/userValidators';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SUPER_ADMIN', 'ADMIN']), userController.getUsers);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), validate(createUserSchema), userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), validate(updateUserSchema), userController.updateUser);
router.patch(
  '/:id/status',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  validate(updateStatusSchema),
  userController.updateStatus
);
router.patch('/:id/role', authorize(['SUPER_ADMIN']), validate(updateRoleSchema), userController.updateRole);

export default router;

