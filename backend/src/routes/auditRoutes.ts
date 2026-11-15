import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticate);

// Super Admin Only
router.get('/', authorize(['SUPER_ADMIN']), auditController.getAuditLogs);

export default router;

