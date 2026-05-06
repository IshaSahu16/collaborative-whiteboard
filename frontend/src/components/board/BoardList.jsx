"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import BoardCard from "./BoardCard";

export default function BoardList({
  boards,
  onCreateBoard,
  onRename,
  onDuplicate,
  onDelete,
  onShareLink, onInviteEmail,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {/* Create new board card */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, borderColor: "#4F46E5" }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreateBoard}
        className="h-full py-4 flex flex-col items-center justify-center gap-3 bg-white rounded-xl border-2 border-dashed border-[#E5E7EB] hover:bg-[#FAFBFF] transition-colors group"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-12 h-12 flex items-center justify-center bg-[#F3F4F6] group-hover:bg-[#EEF2FF] rounded-xl transition-colors"
        >
          <Plus className="h-6 w-6 text-[#6B7280] group-hover:text-[#4F46E5] transition-colors" />
        </motion.div>
        <span className="text-sm font-medium text-[#6B7280] group-hover:text-[#4F46E5] transition-colors">
          Create new board
        </span>
      </motion.button>

      {/* Board cards */}
      {boards.map((board, index) => (
        <BoardCard
          key={board.id}
          board={board}
          index={index + 1}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onShareLink={onShareLink}
          onInviteEmail={onInviteEmail}
        />
      ))}
    </div>
  );
}
