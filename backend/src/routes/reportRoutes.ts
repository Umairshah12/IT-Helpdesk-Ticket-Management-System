import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', reportController.getDashboardStats);
router.get('/tickets/trends', reportController.getTicketTrends);
router.get('/departments', authorize(['SUPER_ADMIN', 'ADMIN']), reportController.getDepartmentReports);
router.get('/technicians', authorize(['SUPER_ADMIN', 'ADMIN']), reportController.getTechnicianReports);

export default router;

