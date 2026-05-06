import Board from '../models/Board.js';
import { errorResponse } from '../utils/apiResponse.js';

export const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const board = await Board.findById(req.params.boardId);
      if (!board) return errorResponse(res, 404, 'Board not found');

      const isOwner = board.owner.toString() === req.user._id.toString();
      if (isOwner) return next();

      const member = board.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );
      if (!member || !roles.includes(member.role)) {
        return errorResponse(res, 403, 'Access denied: insufficient permissions');
      }

      req.userRole = member.role;
      return next();
    } catch (err) {
      console.error('ROLE MIDDLEWARE ERROR:', err);
      return errorResponse(res, 500, err.message);
    }
  };
};