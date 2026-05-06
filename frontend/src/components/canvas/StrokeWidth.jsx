'use client';

import { motion } from 'framer-motion';
import useCanvasStore from '@/store/canvasStore';

export default function StrokeWidth() {
  const { strokeWidth, setStrokeWidth } = useCanvasStore();

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <label className="text-xs font-semibold text-[#6B7280] block">
        Width: {strokeWidth}px
      </label>
      <input
        type="range"
        min="1"
        max="8"
        value={strokeWidth}
        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
        className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
      />
      <div className="flex gap-1 justify-between text-[10px] text-[#9CA3AF]">
        <span>1</span>
        <span>8</span>
      </div>
    </motion.div>
  );
}