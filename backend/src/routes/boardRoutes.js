import express from 'express';
import { createBoard, getMyBoards, getBoardById, updateBoard, deleteBoard, getBoardByShareLink, joinBoardByShareLink } from '../controllers/boardController.js';
import protect from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ✅ Public routes — NO auth needed (before protect middleware)
router.get('/join/:shareLink', getBoardByShareLink);

// ✅ Protected routes — auth needed
router.use(protect);
router.post('/join/:shareLink', joinBoardByShareLink); // joining needs auth

router.post('/', createBoard);
router.get('/', getMyBoards);
router.get('/:boardId', requireRole('owner', 'editor', 'viewer'), getBoardById);
router.put('/:boardId', requireRole('owner'), updateBoard);
router.delete('/:boardId', requireRole('owner'), deleteBoard);

export default router;