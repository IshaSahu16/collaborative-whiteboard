'use client';

import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function LiveCursors({ cursors = [] }) {
  return (
    <>
      {cursors.map((cursor) => (
        <motion.div
          key={cursor.userId}
          className="pointer-events-none fixed left-0 top-0 z-50"
          animate={{
            x: cursor.x,
            y: cursor.y,
          }}
          transition={{
            type: 'spring',
            stiffness: 160,
            damping: 22,
            mass: 1.1,
          }}
        >
          <div className="flex items-center gap-2">
            <MousePointer2
              className="h-5 w-5 drop-shadow-lg"
              style={{ color: cursor.color || '#4F46E5' }}
            />

            {/* User label */}
            <motion.div
              className="bg-white rounded-full shadow-md border-2 px-2 py-1"
              style={{ borderColor: cursor.color || '#4F46E5' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={cursor.avatar} />
                  <AvatarFallback className="text-xs">
                    {cursor.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-[#111827]">
                  {cursor.name}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </>
  );
}