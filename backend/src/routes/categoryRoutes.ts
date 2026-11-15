import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { categorySchema } from '../validators/categoryValidators';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.getCategories);
router.post(
  '/',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  validate(categorySchema),
  categoryController.createCategory
);
router.put(
  '/:id',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  validate(categorySchema.partial()),
  categoryController.updateCategory
);
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), categoryController.deleteCategory);

export default router;

