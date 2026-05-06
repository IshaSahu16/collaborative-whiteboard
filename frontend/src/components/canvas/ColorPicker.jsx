'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import useCanvasStore from '@/store/canvasStore';

const presetColors = [
  '#000000', // Black
  '#4F46E5', // Indigo
  '#DC2626', // Red
  '#16A34A', // Green
  '#2563EB', // Blue
  '#F59E0B', // Amber
  '#EC4899', // Pink
];

export default function ColorPicker() {
  const { color, setColor } = useCanvasStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        className="w-10 h-10 rounded-lg border-2 border-[#E5E7EB] hover:border-[#4F46E5] transition-colors"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronDown className="h-4 w-4 absolute bottom-1 right-1 text-black opacity-50" />
      </motion.button>

      {isOpen && (
        <motion.div
          className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-[#E5E7EB] p-3 space-y-3 z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {/* Preset Colors */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#6B7280]">Presets</p>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((col) => (
                <motion.button
                  key={col}
                  className={`w-6 h-6 rounded border-2 ${
                    color === col ? 'border-[#4F46E5]' : 'border-[#E5E7EB]'
                  }`}
                  style={{ backgroundColor: col }}
                  onClick={() => handleColorChange(col)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
            <p className="text-xs font-semibold text-[#6B7280]">Custom</p>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <button
                onClick={() => handleColorChange(customColor)}
                className="flex-1 px-2 py-1 text-xs bg-[#4F46E5] text-white rounded hover:bg-[#4338CA] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}