import Page from '../models/Page.js';
import CanvasElement from '../models/CanvasElement.js';
import AudioNote from '../models/AudioNote.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getBoardPages = async (req, res) => {
  try {
    const pages = await Page.find({ board: req.params.boardId }).sort({ pageNumber: 1 });
    return successResponse(res, 200, 'Pages fetched', pages);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const createBoardPage = async (req, res) => {
  const { title, background } = req.body;
  try {
    const count = await Page.countDocuments({ board: req.params.boardId });
    const pageNumber = count + 1;
    const page = await Page.create({
      board: req.params.boardId,
      pageNumber,
      title: title || `Page ${pageNumber}`,
      background: background || '#ffffff',
    });
    return successResponse(res, 201, 'Page created', page);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const deleteBoardPage = async (req, res) => {
  try {
    const totalPages = await Page.countDocuments({ board: req.params.boardId });
    if (totalPages <= 1) {
      return errorResponse(res, 400, 'At least one page must remain');
    }

    const page = await Page.findOne({ _id: req.params.pageId, board: req.params.boardId });
    if (!page) return errorResponse(res, 404, 'Page not found');

    await CanvasElement.deleteMany({ page: page._id });
    await AudioNote.deleteMany({ page: page._id });
    await Page.deleteOne({ _id: page._id });

    return successResponse(res, 200, 'Page deleted');
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
