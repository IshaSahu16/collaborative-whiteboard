"use client";

import { useState, useEffect } from "react";
import BoardList from "@/components/board/BoardList";
import CreateBoardModal from "@/components/board/CreateBoardModal";
import DeleteBoardModal from "@/components/board/DeleteBoardModal";
import useBoardStore from "@/store/boardStore";
import ShareBoardModal from "@/components/board/ShareBoardModal";
import InviteEmailModal from "@/components/board/InviteEmailModal";

export default function BoardsPage() {
  const { boards, fetchBoards, addBoard, updateBoard, deleteBoard, duplicateBoard } =
    useBoardStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);     // ← add
  const [inviteTarget, setInviteTarget] = useState(null);   // ← add

  // ← Add this
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async (data) => {
    await addBoard(data);
  };

  const handleRename = async (board) => {
    const newTitle = prompt("Enter new board title:", board.title);
    if (newTitle && newTitle.trim()) {
      await updateBoard(board.id, { title: newTitle.trim() });
    }
  };

  const handleDuplicate = async (board) => {
    await duplicateBoard(board.id);
  };

  const handleDelete = async (board) => {
    await deleteBoard(board.id);
  };

  const handleShareLink = (board) => {
    setShareLinkBoard(board);
  };

  const handleInviteEmail = (board) => {
    setInviteEmailBoard(board);
  };


  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111827]">Your Boards</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Create and collaborate on whiteboards with your team
        </p>
      </div>

      <BoardList
        boards={boards}
        onCreateBoard={() => setIsCreateModalOpen(true)}
        onRename={handleRename}
        onDuplicate={handleDuplicate}
        onDelete={setDeleteTarget}
         onShareLink={setShareTarget}       // ← add
        onInviteEmail={setInviteTarget}
      />

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBoard}
      />

      <DeleteBoardModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        board={deleteTarget}
        onDelete={handleDelete}
      />

      <ShareBoardModal
        isOpen={!!shareTarget}
        onClose={() => setShareTarget(null)}
        board={shareTarget}
      />

      {/* Invite Modal */}
      <InviteEmailModal
        isOpen={!!inviteTarget}
        onClose={() => setInviteTarget(null)}
        board={inviteTarget}
      />
    </div>
  );
}