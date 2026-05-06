import express from 'express';
import { addMember, updateMemberRole, removeMember } from '../controllers/memberController.js';
import protect from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);
router.post('/', requireRole('owner'), addMember);
router.put('/', requireRole('owner'), updateMemberRole);
router.delete('/:userId', requireRole('owner'), removeMember);

export default router;