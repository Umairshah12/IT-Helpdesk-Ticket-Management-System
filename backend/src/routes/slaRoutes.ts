import { Router } from 'express';
import { slaController } from '../controllers/slaController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { slaPolicySchema } from '../validators/categoryValidators';

const router = Router();

router.use(authenticate);

router.get('/policies', slaController.getPolicies);
router.post(
  '/policies',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  validate(slaPolicySchema),
  slaController.createPolicy
);
router.put(
  '/policies/:id',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  validate(slaPolicySchema.partial()),
  slaController.updatePolicy
);
router.get('/compliance', slaController.getSLACompliance);

export default router;

