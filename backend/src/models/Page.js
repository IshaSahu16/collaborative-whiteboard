import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  pageNumber: { type: Number, required: true, default: 1 },
  title: { type: String, default: 'Page 1' },
  background: { type: String, default: '#ffffff' },
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);
export default Page;