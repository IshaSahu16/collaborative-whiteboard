import express from 'express';
import { getBoardPages, createBoardPage, deleteBoardPage } from '../controllers/pageController.js';
import protect from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);
router.get('/', requireRole('owner', 'editor', 'viewer'), getBoardPages);
router.post('/', requireRole('owner', 'editor'), createBoardPage);
router.delete('/:pageId', requireRole('owner', 'editor'), deleteBoardPage);

export default router;
