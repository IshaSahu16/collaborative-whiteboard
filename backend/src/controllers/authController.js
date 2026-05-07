import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import crypto from 'crypto';
import { sendResetEmail } from '../config/email.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return errorResponse(res, 400, 'Please provide name, email and password');

  if (password.length < 6)
    return errorResponse(res, 400, 'Password must be at least 6 characters');

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return errorResponse(res, 400, 'Email already registered');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(res, user._id);

    return successResponse(res, 201, 'Registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return errorResponse(res, 400, 'Please provide email and password');

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return errorResponse(res, 401, 'Invalid email or password');

    const token = generateToken(res, user._id);
    return successResponse(res, 200, 'Logged in successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Forgot Password — sends reset email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, 'No account found with this email');

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash it before saving to DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send email with raw token (not hashed)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendResetEmail(email, resetUrl);

    return successResponse(res, 200, 'Reset link sent to your email');
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    return errorResponse(res, 500, err.message);
  }
};

// Reset Password — sets new password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the token from URL to compare with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return errorResponse(res, 400, 'Reset link is invalid or has expired');

    // Set new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return successResponse(res, 200, 'Password reset successfully');
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  return successResponse(res, 200, 'Logged out successfully');
};

export const getMe = async (req, res) => {
  return successResponse(res, 200, 'User fetched', req.user);
};

export const updateProfile = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return errorResponse(res, 400, 'Name is required');
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.name = name.trim();
    await user.save();

    return successResponse(res, 200, 'Profile updated', {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return errorResponse(res, 400, 'Current and new password are required');
  }

  if (newPassword.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters');
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return errorResponse(res, 401, 'Current password is incorrect');

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return successResponse(res, 200, 'Password updated successfully');
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};