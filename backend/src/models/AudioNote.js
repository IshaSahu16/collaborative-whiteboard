import mongoose from 'mongoose';

const audioNoteSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  page: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audioUrl: { type: String, required: true },
  publicId: { type: String },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  duration: { type: Number },
  label: { type: String, default: 'Audio Note' },
}, { timestamps: true });

const AudioNote = mongoose.model('AudioNote', audioNoteSchema);
export default AudioNote;