'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ActiveUsers({ users = [] }) {
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
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-[#E5E7EB] p-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[#6B7280]">
          {users.length === 0
            ? 'You are alone'
            : `${users.length} ${users.length === 1 ? 'person' : 'people'} here`}
        </span>

        <motion.div className="flex -space-x-2" variants={containerVariants}>
          {users.map((user) => (
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
        </motion.div>
      </div>
    </motion.div>
  );
}