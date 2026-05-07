import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

const protect = async (req, res, next) => {
  try {
    let token = req.cookies.jwt;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return errorResponse(res, 401, 'Not authorized, no token');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) return errorResponse(res, 401, 'User not found');
    
    return next();
  } catch (error) {
    console.error('AUTH MIDDLEWARE ERROR:', error);
    return errorResponse(res, 401, 'Token invalid or expired');
  }
};

export default protect;