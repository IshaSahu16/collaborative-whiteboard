import Board from '../models/Board.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const addMember = async (req, res) => {
  const { email, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, 'User not found');

    const board = await Board.findById(req.params.boardId);
    const alreadyMember = board.members.find(
      (m) => m.user.toString() === user._id.toString()
    );
    if (alreadyMember) return errorResponse(res, 400, 'User already a member');

    board.members.push({ user: user._id, role: role || 'viewer' });
    await board.save();
    successResponse(res, 200, 'Member added', board);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const updateMemberRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) return errorResponse(res, 404, 'Board not found');

    const allowedRoles = ['viewer', 'editor'];
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, 400, 'Invalid role');
    }

    const member = board.members.find((m) => m.user.toString() === userId);
    if (!member) return errorResponse(res, 404, 'Member not found');

    if (member.role === 'owner') {
      return errorResponse(res, 400, 'Owner role cannot be changed');
    }

    member.role = role;
    await board.save();
    successResponse(res, 200, 'Role updated', board);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const removeMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    board.members = board.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await board.save();
    successResponse(res, 200, 'Member removed');
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};