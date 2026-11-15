import { Router } from 'express';
import { settingController } from '../controllers/settingController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SUPER_ADMIN']), settingController.getSettings);
router.put('/', authorize(['SUPER_ADMIN']), settingController.updateSettings);

export default router;

