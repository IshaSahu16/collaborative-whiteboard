'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, X } from 'lucide-react';

export default function AudioNotePin({ audioUrl, position, onDelete, className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

  const togglePlayback = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      className={`fixed z-30 rounded-lg border-2 border-[#4F46E5] bg-white p-2 shadow-lg sm:p-3 space-y-2 min-w-[140px] sm:min-w-[180px] max-w-[70vw] ${className}`}
      style={{
        left: `clamp(12px, ${position.x}px, calc(100vw - 12px))`,
        top: `clamp(12px, ${position.y}px, calc(100vh - 160px))`,
        width: 'clamp(140px, 60vw, 220px)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      draggable
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#111827]">Audio Note</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex gap-2">
        <motion.button
          onClick={togglePlayback}
          className="flex-1 bg-[#4F46E5] text-white rounded px-2 py-1 flex items-center justify-center gap-1 text-sm hover:bg-[#4338CA] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3 w-3" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Play
            </>
          )}
        </motion.button>
      </div>

      <audio
        ref={setAudioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </motion.div>
  );
}