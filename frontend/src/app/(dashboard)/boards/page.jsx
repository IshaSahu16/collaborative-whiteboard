"use client";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import BoardList from "@/components/board/BoardList";
import CreateBoardModal from "@/components/board/CreateBoardModal";
import DeleteBoardModal from "@/components/board/DeleteBoardModal";
import ShareBoardModal from "@/components/board/ShareBoardModal";
import InviteEmailModal from "@/components/board/InviteEmailModal";

import useBoardStore from "@/store/boardStore";
import useAuthStore from "@/store/authStore";

export default function BoardsPage() {
  const router = useRouter();

  // const { user, fetchUser, isLoading } = useAuthStore();
  const { user, isLoading } = useAuthStore();

  const {
    boards,
    fetchBoards,
    addBoard,
    updateBoard,
    deleteBoard,
    duplicateBoard,
  } = useBoardStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [inviteTarget, setInviteTarget] = useState(null);
  // const [authChecked, setAuthChecked] = useState(false);

  // Fetch logged-in user
  // useEffect(() => {
  //   let isMounted = true;

  //   const initAuth = async () => {
  //     await fetchUser();
  //     if (isMounted) {
  //       setAuthChecked(true);
  //     }
  //   };

  //   initAuth();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [fetchUser]);

  // Redirect if not authenticated
  // useEffect(() => {
  //   if (authChecked && !isLoading && !user) {
  //     router.push("/login");
  //   }
  // }, [authChecked, isLoading, user, router]);

  // Fetch boards after auth confirmed
  // useEffect(() => {
  //   if (authChecked && user) {
  //     fetchBoards();
  //   }
  // }, [authChecked, user, fetchBoards]);

  // if (!authChecked || isLoading || !user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       Loading...
  //     </div>
  //   );
  // }

  useEffect(() => {
  if (!isLoading && !user) {
    router.push('/login');
  }
}, [isLoading, user, router]);

useEffect(() => {
  if (user) {
    fetchBoards();
  }
}, [user]);

if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

if (!user) return null;

  const handleCreateBoard = async (data) => {
    await addBoard(data);
  };

  const handleRename = async (board) => {
    const newTitle = prompt("Enter new board title:", board.title);

    if (newTitle && newTitle.trim()) {
      await updateBoard(board.id, {
        title: newTitle.trim(),
      });
    }
  };

  const handleDuplicate = async (board) => {
    await duplicateBoard(board.id);
  };

  const handleDelete = async (board) => {
    await deleteBoard(board.id);
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111827]">
          Your Boards
        </h1>

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
        onShareLink={setShareTarget}
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

      <InviteEmailModal
        isOpen={!!inviteTarget}
        onClose={() => setInviteTarget(null)}
        board={inviteTarget}
      />
    </div>
  );
}