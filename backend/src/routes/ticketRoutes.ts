import { Router } from 'express';
import { ticketController } from '../controllers/ticketController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { uploadAttachment } from '../middleware/uploadMiddleware';
import {
  createTicketSchema,
  updateStatusSchema,
  updatePrioritySchema,
  assignTicketSchema,
  addCommentSchema,
  resolveTicketSchema,
  reopenTicketSchema,
  rateTicketSchema,
} from '../validators/ticketValidators';

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

// Export CSV
router.get('/export/csv', ticketController.exportCsv);

// Listing and Creation
router.get('/', ticketController.getTickets);
router.post('/', validate(createTicketSchema), ticketController.createTicket);

// Single Ticket Operations
router.get('/:id', ticketController.getTicketById);
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), ticketController.updateTicket);

// Lifecycle Transitions & Actions
router.patch('/:id/status', validate(updateStatusSchema), ticketController.updateStatus);
router.patch(
  '/:id/priority',
  authorize(['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN']),
  validate(updatePrioritySchema),
  ticketController.updatePriority
);
router.patch(
  '/:id/assign',
  authorize(['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN']),
  validate(assignTicketSchema),
  ticketController.assignTicket
);

// Comments and Attachments
router.post('/:id/comments', validate(addCommentSchema), ticketController.addComment);
router.post('/:id/attachments', uploadAttachment.single('file'), ticketController.uploadAttachment);

// Resolve & Reopen
router.patch('/:id/resolve', validate(resolveTicketSchema), ticketController.resolveTicket);
router.patch('/:id/reopen', validate(reopenTicketSchema), ticketController.reopenTicket);

// Rating
router.post('/:id/rate', validate(rateTicketSchema), ticketController.rateTicket);

export default router;

