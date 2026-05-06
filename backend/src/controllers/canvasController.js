import CanvasElement from '../models/CanvasElement.js';
import AudioNote from '../models/AudioNote.js';
import cloudinary from '../config/cloudinary.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getPageElements = async (req, res) => {
  try {
    const elements = await CanvasElement.find({
      page: req.params.pageId,
      isDeleted: false,
    }).populate('createdBy', 'name avatar');
    successResponse(res, 200, 'Elements fetched', elements);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const saveElement = async (req, res) => {
  const { type, data, pageId } = req.body;
  try {
    const element = await CanvasElement.create({
      page: pageId,
      board: req.params.boardId,
      createdBy: req.user._id,
      type,
      data,
    });
    successResponse(res, 201, 'Element saved', element);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const deleteElement = async (req, res) => {
  try {
    await CanvasElement.findByIdAndUpdate(
      req.params.elementId, { isDeleted: true }
    );
    successResponse(res, 200, 'Element deleted');
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

export const uploadAudioNote = async (req, res) => {
  const { x, y, pageId, label } = req.body;
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'whiteboard/audio', resource_type: 'video' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const audioNote = await AudioNote.create({
      board: req.params.boardId,
      page: pageId,
      createdBy: req.user._id,
      audioUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      position: { x, y },
      label,
    });

    successResponse(res, 201, 'Audio note uploaded', audioNote);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};