import { create } from 'zustand';
import {
  getMyBoards,
  createBoard,
  deleteBoard,
  updateBoard,
} from '../services/boardService';

const useBoardStore = create((set, get) => ({
  boards: [],
  isLoading: false,
  error: null,

  // Fetch all boards from backend
  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getMyBoards();
      // Map _id to id for frontend compatibility
      const boards = res.data.map((b) => ({
        ...b,
        id: b._id,
        lastEdited: new Date(b.updatedAt),
        membersCount: b.members?.length || 1,
        color: 'indigo', // default color
      }));
      set({ boards, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Create board
  addBoard: async (data) => {
    set({ isLoading: true });
    try {
      const res = await createBoard(data);
      const newBoard = {
        ...res.data,
        id: res.data._id,
        lastEdited: new Date(res.data.updatedAt),
        membersCount: 1,
        color: data.thumbnail || 'indigo',
      };
      set((state) => ({
        boards: [newBoard, ...state.boards],
        isLoading: false,
      }));
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      throw new Error(err.message);
    }
  },

  // Update board
  updateBoard: async (boardId, data) => {
    try {
      const res = await updateBoard(boardId, data);
      set((state) => ({
        boards: state.boards.map((b) =>
          b.id === boardId
            ? { ...b, ...data, lastEdited: new Date() }
            : b
        ),
      }));
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // Delete board
  deleteBoard: async (boardId) => {
    try {
      await deleteBoard(boardId);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId),
      }));
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // Duplicate board (creates new board with same title)
  duplicateBoard: async (boardId) => {
    const board = get().boards.find((b) => b.id === boardId);
    if (!board) return;
    try {
      const res = await createBoard({
        title: `${board.title} (Copy)`,
        description: board.description,
      });
      const newBoard = {
        ...res.data,
        id: res.data._id,
        lastEdited: new Date(res.data.updatedAt),
        membersCount: 1,
      };
      set((state) => ({
        boards: [newBoard, ...state.boards],
      }));
    } catch (err) {
      throw new Error(err.message);
    }
  },
}));

export default useBoardStore;