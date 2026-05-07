import Board from '../models/Board.js';
import Page from '../models/Page.js';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createBoard = async (req, res) => {
  const { title, description, isPublic, thumbnail } = req.body; // ← add isPublic, thumbnail
  try {
    const board = await Board.create({
      title,
      description,
      isPublic,       // ← add
      thumbnail,      // ← add
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
      shareLink: uuidv4(),
    });
    await Page.create({ board: board._id, pageNumber: 1, title: 'Page 1' });
    successResponse(res, 201, 'Board created', board);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({ 'members.user': req.user._id })
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });
    successResponse(res, 200, 'Boards fetched', boards);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar');
    if (!board) return errorResponse(res, 404, 'Board not found');
    successResponse(res, 200, 'Board fetched', board);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const updateBoard = async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(
      req.params.boardId, req.body, { new: true }
    );
    successResponse(res, 200, 'Board updated', board);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const deleteBoard = async (req, res) => {
  try {
    await Board.findByIdAndDelete(req.params.boardId);
    successResponse(res, 200, 'Board deleted');
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const getBoardByShareLink = async (req, res) => {
  try {
    const board = await Board.findOne({ shareLink: req.params.shareLink })
      .populate('owner', 'name email')
      .select('title description owner members shareLink');
    if (!board) return errorResponse(res, 404, 'Invalid invite link');
    successResponse(res, 200, 'Board found', {
      title: board.title,
      description: board.description,
      owner: board.owner,
      memberCount: board.members.length,
    });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const joinBoardByShareLink = async (req, res) => {
  try {
    const board = await Board.findOne({ shareLink: req.params.shareLink });
    if (!board) return errorResponse(res, 404, 'Invalid invite link');

    const alreadyMember = board.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return successResponse(res, 200, 'Already a member', { boardId: board._id });
    }

    board.members.push({ user: req.user._id, role: 'viewer' });
    await board.save();
    successResponse(res, 200, 'Joined successfully', { boardId: board._id });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

