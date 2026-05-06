import { create } from 'zustand';
import {
  getBoardPages,
  createBoardPage,
  deleteBoardPage,
  getPageElements,
  getAudioNotes,
  saveElement,
  deleteElement as deleteElementApi,
  uploadAudioNote,
  deleteAudioNote as deleteAudioNoteApi,
} from '../services/canvasService';

const mapElementsToState = (elements) => {
  const strokes = [];
  const shapes = [];
  const texts = [];

  elements.forEach((el) => {
    const data = el.data || {};
    if (el.type === 'pencil') {
      strokes.push({
        id: el._id,
        backendId: el._id,
        tool: data.tool || 'pen',
        points: data.points || [],
        color: data.color || '#000000',
        width: data.width || 4,
      });
      return;
    }

    if (['rectangle', 'circle', 'line'].includes(el.type)) {
      shapes.push({
        id: el._id,
        backendId: el._id,
        type: el.type,
        startX: data.startX ?? 0,
        startY: data.startY ?? 0,
        endX: data.endX ?? 0,
        endY: data.endY ?? 0,
        color: data.color || '#000000',
        width: data.width || 2,
      });
      return;
    }

    if (el.type === 'text') {
      texts.push({
        id: el._id,
        backendId: el._id,
        text: data.text || '',
        position: data.position || { x: 0, y: 0 },
        color: data.color || '#000000',
        fontSize: data.fontSize || 16,
      });
    }
  });

  return { strokes, shapes, texts };
};

const useCanvasStore = create((set, get) => ({
  // Board context
  boardId: null,
  isSyncing: false,
  syncError: null,

  // Tool state
  tool: 'pen',
  color: '#000000',
  strokeWidth: 4,
  zoom: 1,
  panOffset: { x: 0, y: 0 },

  // Drawing elements
  strokes: [],
  shapes: [],
  texts: [],
  audioNotes: [],

  // Remote in-progress elements keyed by userId
  remoteStrokes: {},
  remoteShapes: {},

  // Active drawing state
  activeStroke: null,
  activeShape: null,

  // History for undo/redo
  history: [{ strokes: [], shapes: [], texts: [], audioNotes: [] }],
  historyIndex: 0,

  // Pages
  pages: [],
  currentPageId: null,

  // Tool setters
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 0.15, 5) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 0.15, 0.2) })),
  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(5, zoom)) }),
  setPanOffset: (panOffset) => set({ panOffset }),

  // ── Backend sync helpers ────────────────────────────────────────────────

  setBoardId: (boardId) => set({ boardId }),

  initializeBoard: async (boardId) => {
    set({ boardId });
    await get().loadPages(boardId);
  },

  loadPages: async (boardId) => {
    set({ isSyncing: true, syncError: null });
    try {
      const res = await getBoardPages(boardId);
      const pages = (res.data || []).map((page) => ({
        id: page._id,
        name: page.title || `Page ${page.pageNumber}`,
        pageNumber: page.pageNumber,
        background: page.background,
      }));
      const currentPageId = pages[0]?.id || null;
      set({ pages, currentPageId });
      if (currentPageId) {
        await get().loadPageElements(boardId, currentPageId);
      }
      set({ isSyncing: false });
    } catch (err) {
      set({ isSyncing: false, syncError: err.message || 'Failed to load pages' });
    }
  },

  loadPageElements: async (boardId, pageId) => {
    set({ isSyncing: true, syncError: null });
    try {
      const [elementsRes, audioRes] = await Promise.all([
        getPageElements(boardId, pageId),
        getAudioNotes(boardId, pageId),
      ]);
      const { strokes, shapes, texts } = mapElementsToState(elementsRes.data || []);
      const audioNotes = (audioRes.data || []).map((note) => ({
        id: note._id,
        url: note.audioUrl,
        position: note.position,
        label: note.label,
      }));
      set({
        strokes,
        shapes,
        texts,
        audioNotes,
        activeStroke: null,
        activeShape: null,
        history: [{ strokes, shapes, texts, audioNotes }],
        historyIndex: 0,
        currentPageId: pageId,
        isSyncing: false,
      });
    } catch (err) {
      set({ isSyncing: false, syncError: err.message || 'Failed to load page' });
    }
  },

  attachBackendId: (type, localId, backendId) => {
    if (!backendId) return;
    if (type === 'stroke') {
      set((state) => ({
        strokes: state.strokes.map((s) => (s.id === localId ? { ...s, backendId } : s)),
      }));
      return;
    }
    if (type === 'shape') {
      set((state) => ({
        shapes: state.shapes.map((s) => (s.id === localId ? { ...s, backendId } : s)),
      }));
      return;
    }
    if (type === 'text') {
      set((state) => ({
        texts: state.texts.map((t) => (t.id === localId ? { ...t, backendId } : t)),
      }));
    }
  },

  saveElementRemote: async (type, data, localId) => {
    const { boardId, currentPageId } = get();
    if (!boardId || !currentPageId) return;
    try {
      const res = await saveElement(boardId, { type, data, pageId: currentPageId });
      if (res?.data?._id) get().attachBackendId(type === 'pencil' ? 'stroke' : type, localId, res.data._id);
    } catch (err) {
      set({ syncError: err.message || 'Failed to save element' });
    }
  },

  deleteElementRemote: async (elementId) => {
    const { boardId } = get();
    if (!boardId || !elementId) return;
    try {
      await deleteElementApi(boardId, elementId);
    } catch (err) {
      set({ syncError: err.message || 'Failed to delete element' });
    }
  },

  // ── Remote draw helpers ────────────────────────────────────────────────

  startRemoteStroke: (userId, payload) => {
    if (!userId) return;
    set((state) => ({
      remoteStrokes: {
        ...state.remoteStrokes,
        [userId]: {
          id: payload.id || `${userId}-stroke`,
          tool: payload.tool || 'pen',
          points: payload.point ? [payload.point] : [],
          color: payload.color || '#000000',
          width: payload.width || 4,
        },
      },
    }));
  },

  updateRemoteStroke: (userId, point) => {
    if (!userId || !point) return;
    set((state) => {
      const current = state.remoteStrokes[userId];
      if (!current) return state;
      return {
        remoteStrokes: {
          ...state.remoteStrokes,
          [userId]: {
            ...current,
            points: [...current.points, point],
          },
        },
      };
    });
  },

  commitRemoteStroke: (userId) => {
    if (!userId) return;
    set((state) => {
      const current = state.remoteStrokes[userId];
      if (!current) return state;
      const nextStrokes = [...state.strokes, current];
      const nextRemote = { ...state.remoteStrokes };
      delete nextRemote[userId];
      return { strokes: nextStrokes, remoteStrokes: nextRemote };
    });
  },

  startRemoteShape: (userId, payload) => {
    if (!userId) return;
    set((state) => ({
      remoteShapes: {
        ...state.remoteShapes,
        [userId]: {
          id: payload.id || `${userId}-shape`,
          type: payload.type,
          startX: payload.startX ?? 0,
          startY: payload.startY ?? 0,
          endX: payload.endX ?? payload.startX ?? 0,
          endY: payload.endY ?? payload.startY ?? 0,
          color: payload.color || '#000000',
          width: payload.width || 2,
        },
      },
    }));
  },

  updateRemoteShape: (userId, coords) => {
    if (!userId) return;
    set((state) => {
      const current = state.remoteShapes[userId];
      if (!current) return state;
      return {
        remoteShapes: {
          ...state.remoteShapes,
          [userId]: {
            ...current,
            ...coords,
          },
        },
      };
    });
  },

  commitRemoteShape: (userId) => {
    if (!userId) return;
    set((state) => {
      const current = state.remoteShapes[userId];
      if (!current) return state;
      const nextShapes = [...state.shapes, current];
      const nextRemote = { ...state.remoteShapes };
      delete nextRemote[userId];
      return { shapes: nextShapes, remoteShapes: nextRemote };
    });
  },

  // ── ACTIVE (in-progress) drawing ─────────────────────────────────────────

  beginStroke: (tool, point, color, width, idOverride) => {
    set({ activeStroke: { id: idOverride || Date.now(), backendId: null, tool, points: [point], color, width } });
  },

  updateActiveStroke: (point) => {
    const { activeStroke } = get();
    if (!activeStroke) return;
    set({ activeStroke: { ...activeStroke, points: [...activeStroke.points, point] } });
  },

  commitStroke: async () => {
    const { activeStroke, strokes, history, historyIndex } = get();
    if (!activeStroke || activeStroke.points.length < 2) {
      set({ activeStroke: null });
      return;
    }

    const newStrokes = [...strokes, activeStroke];
    const newHistory = history.slice(0, historyIndex + 1);
    const { shapes, texts, audioNotes } = get();
    newHistory.push({ strokes: newStrokes, shapes, texts, audioNotes });
    set({
      strokes: newStrokes,
      activeStroke: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    await get().saveElementRemote(
      'pencil',
      {
        tool: activeStroke.tool,
        points: activeStroke.points,
        color: activeStroke.color,
        width: activeStroke.width,
      },
      activeStroke.id
    );
  },

  beginShape: (type, startX, startY, color, width, idOverride) => {
    set({
      activeShape: {
        id: idOverride || Date.now(),
        backendId: null,
        type,
        startX,
        startY,
        endX: startX,
        endY: startY,
        color,
        width,
      },
    });
  },

  updateActiveShape: (endX, endY) => {
    const { activeShape } = get();
    if (!activeShape) return;
    set({ activeShape: { ...activeShape, endX, endY } });
  },

  commitShape: async () => {
    const { activeShape, shapes, history, historyIndex } = get();
    if (!activeShape) return;

    const newShapes = [...shapes, activeShape];
    const newHistory = history.slice(0, historyIndex + 1);
    const { strokes, texts, audioNotes } = get();
    newHistory.push({ strokes, shapes: newShapes, texts, audioNotes });
    set({
      shapes: newShapes,
      activeShape: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    await get().saveElementRemote(
      activeShape.type,
      {
        startX: activeShape.startX,
        startY: activeShape.startY,
        endX: activeShape.endX,
        endY: activeShape.endY,
        color: activeShape.color,
        width: activeShape.width,
      },
      activeShape.id
    );
  },

  cancelActive: () => set({ activeStroke: null, activeShape: null }),

  // ── Committed element operations ─────────────────────────────────────────

  addText: async (text, position, color, fontSize) => {
    const localId = Date.now();
    set((state) => {
      const newTexts = [...state.texts, { id: localId, backendId: null, text, position, color, fontSize }];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ strokes: state.strokes, shapes: state.shapes, texts: newTexts, audioNotes: state.audioNotes });
      return { texts: newTexts, history: newHistory, historyIndex: newHistory.length - 1 };
    });

    await get().saveElementRemote('text', { text, position, color, fontSize }, localId);
  },

  updateShapePosition: (id, coords) => {
    set((state) => {
      const newShapes = state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...coords } : shape
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ strokes: state.strokes, shapes: newShapes, texts: state.texts, audioNotes: state.audioNotes });
      return { shapes: newShapes, history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  updateShapePositionLocal: (id, coords) => {
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...coords } : shape
      ),
    }));
  },

  updateTextPosition: (id, position) => {
    set((state) => {
      const newTexts = state.texts.map((t) =>
        t.id === id ? { ...t, position } : t
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ strokes: state.strokes, shapes: state.shapes, texts: newTexts, audioNotes: state.audioNotes });
      return { texts: newTexts, history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  updateTextPositionLocal: (id, position) => {
    set((state) => ({
      texts: state.texts.map((t) =>
        t.id === id ? { ...t, position } : t
      ),
    }));
  },

  deleteElement: (type, id) => {
    const element = type === 'stroke'
      ? get().strokes.find((s) => s.id === id)
      : type === 'shape'
        ? get().shapes.find((s) => s.id === id)
        : get().texts.find((t) => t.id === id);
    const backendId = element?.backendId || element?.id;

    set((state) => {
      const newStrokes = type === 'stroke' ? state.strokes.filter((s) => s.id !== id) : state.strokes;
      const newShapes = type === 'shape' ? state.shapes.filter((s) => s.id !== id) : state.shapes;
      const newTexts = type === 'text' ? state.texts.filter((t) => t.id !== id) : state.texts;
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ strokes: newStrokes, shapes: newShapes, texts: newTexts, audioNotes: state.audioNotes });
      return { strokes: newStrokes, shapes: newShapes, texts: newTexts, history: newHistory, historyIndex: newHistory.length - 1 };
    });

    if (backendId) get().deleteElementRemote(backendId);
  },

  deleteElementLocal: (type, id) => {
    set((state) => {
      const newStrokes = type === 'stroke' ? state.strokes.filter((s) => s.id !== id) : state.strokes;
      const newShapes = type === 'shape' ? state.shapes.filter((s) => s.id !== id) : state.shapes;
      const newTexts = type === 'text' ? state.texts.filter((t) => t.id !== id) : state.texts;
      return { strokes: newStrokes, shapes: newShapes, texts: newTexts };
    });
  },

  addAudioNote: async (file, position, previewUrl, label) => {
    const { boardId, currentPageId } = get();
    if (!boardId || !currentPageId) return;
    const tempId = `local-${Date.now()}`;
    set((state) => ({
      isSyncing: true,
      syncError: null,
      audioNotes: [
        ...state.audioNotes,
        {
          id: tempId,
          url: previewUrl,
          position,
          label,
        },
      ],
    }));
    try {
      const res = await uploadAudioNote(boardId, {
        pageId: currentPageId,
        x: position.x,
        y: position.y,
        label,
        file,
      });
      const note = res.data;
      set((state) => ({
        audioNotes: state.audioNotes.map((item) =>
          item.id === tempId
            ? {
              id: note._id,
              url: note.audioUrl,
              position: note.position,
              label: note.label,
            }
            : item
        ),
        isSyncing: false,
      }));
    } catch (err) {
      set((state) => ({
        isSyncing: false,
        syncError: err.message || 'Failed to upload audio note',
        audioNotes: state.audioNotes.filter((note) => note.id !== tempId),
      }));
    }
  },

  deleteAudioNote: async (id) => {
    const { boardId } = get();
    if (!boardId) return;
    if (String(id).startsWith('local-')) {
      set((state) => ({
        audioNotes: state.audioNotes.filter((note) => note.id !== id),
      }));
      return;
    }
    set({ isSyncing: true, syncError: null });
    try {
      await deleteAudioNoteApi(boardId, id);
      set((state) => ({
        audioNotes: state.audioNotes.filter((note) => note.id !== id),
        isSyncing: false,
      }));
    } catch (err) {
      set({ isSyncing: false, syncError: err.message || 'Failed to delete audio note' });
    }
  },

  // ── Undo / Redo ──────────────────────────────────────────────────────────

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const prev = state.history[state.historyIndex - 1];
      return { ...prev, historyIndex: state.historyIndex - 1 };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const next = state.history[state.historyIndex + 1];
      return { ...next, historyIndex: state.historyIndex + 1 };
    });
  },

  clearCanvas: () => {
    set({
      strokes: [],
      shapes: [],
      texts: [],
      audioNotes: [],
      activeStroke: null,
      activeShape: null,
      history: [{ strokes: [], shapes: [], texts: [], audioNotes: [] }],
      historyIndex: 0,
    });
  },

  // ── Page management ──────────────────────────────────────────────────────

  addPage: async () => {
    const { boardId, pages } = get();
    if (!boardId) return;
    set({ isSyncing: true, syncError: null });
    try {
      const res = await createBoardPage(boardId, { title: `Page ${pages.length + 1}` });
      const page = res.data;
      const newPage = {
        id: page._id,
        name: page.title || `Page ${page.pageNumber}`,
        pageNumber: page.pageNumber,
        background: page.background,
      };
      set({
        pages: [...pages, newPage],
        currentPageId: newPage.id,
        strokes: [],
        shapes: [],
        texts: [],
        history: [{ strokes: [], shapes: [], texts: [], audioNotes: get().audioNotes }],
        historyIndex: 0,
        isSyncing: false,
      });
    } catch (err) {
      set({ isSyncing: false, syncError: err.message || 'Failed to create page' });
    }
  },

  setCurrentPage: async (pageId) => {
    const { boardId } = get();
    set({ currentPageId: pageId });
    if (boardId && pageId) await get().loadPageElements(boardId, pageId);
  },

  deletePage: async (pageId) => {
    const { boardId, pages, currentPageId } = get();
    if (!boardId || pages.length === 1) return;
    set({ isSyncing: true, syncError: null });
    try {
      await deleteBoardPage(boardId, pageId);
      const newPages = pages.filter((p) => p.id !== pageId);
      const nextPageId = currentPageId === pageId ? newPages[0]?.id : currentPageId;
      set({ pages: newPages, currentPageId: nextPageId, isSyncing: false });
      if (nextPageId) await get().loadPageElements(boardId, nextPageId);
    } catch (err) {
      set({ isSyncing: false, syncError: err.message || 'Failed to delete page' });
    }
  },

  duplicatePage: async (pageId) => {
    const { boardId, pages, strokes, shapes, texts } = get();
    if (!boardId) return;
    const srcPage = pages.find((p) => p.id === pageId);
    if (!srcPage) return;
    set({ isSyncing: true, syncError: null });
    try {
      const res = await createBoardPage(boardId, { title: `${srcPage.name} (Copy)` });
      const page = res.data;
      const newPage = {
        id: page._id,
        name: page.title || `Page ${page.pageNumber}`,
        pageNumber: page.pageNumber,
        background: page.background,
      };

      const elementsToCopy = [
        ...strokes.map((s) => ({ type: 'pencil', data: { tool: s.tool, points: s.points, color: s.color, width: s.width } })),
        ...shapes.map((s) => ({ type: s.type, data: { startX: s.startX, startY: s.startY, endX: s.endX, endY: s.endY, color: s.color, width: s.width } })),
        ...texts.map((t) => ({ type: 'text', data: { text: t.text, position: t.position, color: t.color, fontSize: t.fontSize } })),
      ];

      await Promise.all(
        elementsToCopy.map((el) => saveElement(boardId, { ...el, pageId: newPage.id }))
      );

      set({ pages: [...pages, newPage], currentPageId: newPage.id, isSyncing: false });
      await get().loadPageElements(boardId, newPage.id);
    } catch (err) {
      set({ isSyncing: false, syncError: err.message || 'Failed to duplicate page' });
    }
  },
}));

export default useCanvasStore;