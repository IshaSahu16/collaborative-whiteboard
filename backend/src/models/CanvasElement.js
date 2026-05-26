import mongoose from 'mongoose';

const canvasElementSchema = new mongoose.Schema({
  page: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['rectangle', 'circle', 'line', 'triangle', 'pentagon', 'hexagon', 'pencil', 'text', 'arrow', 'image'],
    required: true,
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const CanvasElement = mongoose.model('CanvasElement', canvasElementSchema);
export default CanvasElement;