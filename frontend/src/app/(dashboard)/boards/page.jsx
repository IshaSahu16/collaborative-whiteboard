"use client";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
     getFilteredBoards,
    searchQuery,
    setSearchQuery,
  } = useBoardStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [inviteTarget, setInviteTarget] = useState(null);

  const filteredBoards = getFilteredBoards();
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
      {/* <div className="mb-8">
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
      /> */}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111827]">Your Boards</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {filteredBoards.length} board{filteredBoards.length !== 1 ? 's' : ''}
          {searchQuery ? ` found for "${searchQuery}"` : ' total'}
        </p>
      </div>

      {/* Mobile search */}
      <div className="mb-6 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* No results */}
      {searchQuery && filteredBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#9CA3AF]" />
          </div>
          <h3 className="text-lg font-semibold text-[#111827] mb-2">
            No boards found
          </h3>
          <p className="text-[#6B7280] text-sm">
            No boards match "<strong>{searchQuery}</strong>"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-sm text-[#4F46E5] hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <BoardList
          boards={filteredBoards}
          onCreateBoard={() => setIsCreateModalOpen(true)}
          onRename={handleRename}
          onDuplicate={handleDuplicate}
          onDelete={setDeleteTarget}
          onShareLink={setShareTarget}
          onInviteEmail={setInviteTarget}
        />
      )}

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