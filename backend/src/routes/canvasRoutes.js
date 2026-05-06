import express from 'express';
import { getPageElements, saveElement, deleteElement, uploadAudioNote } from '../controllers/canvasController.js';
import protect from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);
router.get('/pages/:pageId/elements', requireRole('owner', 'editor', 'viewer'), getPageElements);
router.post('/elements', requireRole('owner', 'editor'), saveElement);
router.delete('/elements/:elementId', requireRole('owner', 'editor'), deleteElement);
router.post('/audio', requireRole('owner', 'editor'), upload.single('audio'), uploadAudioNote);

export default router;