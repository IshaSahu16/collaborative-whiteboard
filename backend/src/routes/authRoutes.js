import express from 'express';
import {
	register,
	login,
	logout,
	getMe,
	forgotPassword,
	resetPassword,
	updateProfile,
	updatePassword,
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;