'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ActiveUsers({ users = [], className = '' }) {
  const maxAvatars = 4;
  const displayed = users.slice(0, maxAvatars);
  const overflowCount = Math.max(0, users.length - displayed.length);

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      className={`fixed left-1/2 top-3 z-40 flex w-[92%] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-[#E5E7EB] bg-white/95 px-3 py-2 shadow-lg backdrop-blur md:top-4 md:w-auto md:gap-4 md:rounded-2xl md:px-4 md:py-3 max-md:top-auto max-md:bottom-3 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Online
        </span>
        <span className="text-sm font-medium text-[#111827]">
          {users.length === 0
            ? 'You are alone'
            : `${users.length} ${users.length === 1 ? 'person' : 'people'}`}
        </span>
      </div>

      <motion.div className="flex -space-x-2" variants={containerVariants}>
        {displayed.map((user) => (
          <motion.div
            key={user.id}
            variants={itemVariants}
            title={user.name}
          >
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        ))}
        {overflowCount > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#EEF2FF] text-xs font-semibold text-[#4F46E5]">
              +{overflowCount}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}