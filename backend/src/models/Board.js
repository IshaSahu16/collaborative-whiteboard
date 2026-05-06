import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' },
});

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, default: 'Untitled Board' },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  isPublic: { type: Boolean, default: false },
  thumbnail: { type: String, default: '' },
  shareLink: { type: String, unique: true, sparse: true },
}, { timestamps: true });

const Board = mongoose.model('Board', boardSchema);
export default Board;