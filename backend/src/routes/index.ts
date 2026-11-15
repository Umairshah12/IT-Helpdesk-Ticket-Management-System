import { Router } from 'express';
import authRoutes from './authRoutes';
import ticketRoutes from './ticketRoutes';
import userRoutes from './userRoutes';
import departmentRoutes from './departmentRoutes';
import categoryRoutes from './categoryRoutes';
import technicianRoutes from './technicianRoutes';
import slaRoutes from './slaRoutes';
import reportRoutes from './reportRoutes';
import notificationRoutes from './notificationRoutes';
import auditRoutes from './auditRoutes';
import settingRoutes from './settingRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/technicians', technicianRoutes);
router.use('/sla', slaRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/settings', settingRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Helpdesk Pro Enterprise REST API',
    version: '1.0.0',
  });
});

export default router;

