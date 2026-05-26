'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Pen, Eraser, Type, Square, Circle, Minus } from 'lucide-react';
import useCanvasStore from '@/store/canvasStore';
import { drawPerfectFreehandStroke } from '@/utils/drawingUtils';
import { detectShapeFromStroke } from '@/utils/shapeCorrection';
import { getRoughCanvas } from '@/lib/roughjs';

const toolIcons = {
  cursor: MousePointer2,
  pen: Pen,
  eraser: Eraser,
  text: Type,
  rectangle: Square,
  circle: Circle,
  line: Minus,
};

const drawGrid = (ctx, width, height, pan, zoom) => {
  const step = 30;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  const startX = Math.floor(-pan.x / zoom / step) * step;
  const startY = Math.floor(-pan.y / zoom / step) * step;
  const endX = startX + width / zoom + step * 2;
  const endY = startY + height / zoom + step * 2;
  for (let x = startX; x < endX; x += step) {
    for (let y = startY; y < endY; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};

const drawShape = (ctx, shape, roughCanvas) => {
  ctx.save();
  const { startX, startY, endX, endY } = shape;
  const w = endX - startX;
  const h = endY - startY;
  const useRough = shape.rough && roughCanvas;

  if (useRough) {
    const roughness = 1.1;
    const options = {
      stroke: shape.color,
      strokeWidth: shape.width,
      roughness,
      seed: Number.isFinite(shape.roughSeed) ? shape.roughSeed : 1,
    };
    if (shape.type === 'rectangle') {
      roughCanvas.rectangle(startX, startY, w, h, options);
    } else if (shape.type === 'circle') {
      roughCanvas.ellipse(startX + w / 2, startY + h / 2, Math.abs(w), Math.abs(h), options);
    } else if (shape.type === 'line') {
      roughCanvas.line(startX, startY, endX, endY, options);
    }
  } else {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (shape.type === 'rectangle') {
      ctx.strokeRect(startX, startY, w, h);
    } else if (shape.type === 'circle') {
      const rx = Math.abs(w) / 2;
      const ry = Math.abs(h) / 2;
      ctx.beginPath();
      ctx.ellipse(startX + w / 2, startY + h / 2, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
  ctx.restore();
};

const drawText = (ctx, textItem) => {
  ctx.save();
  ctx.fillStyle = textItem.color;
  ctx.font = `${textItem.fontSize || 16}px sans-serif`;
  ctx.textBaseline = 'top';
  const lines = String(textItem.text || '').split('\n');
  const lineHeight = Math.round((textItem.fontSize || 16) * 1.4);
  lines.forEach((line, i) => {
    ctx.fillText(line, textItem.position.x, textItem.position.y + i * lineHeight);
  });
  ctx.restore();
};

// ─── Eraser radius (in canvas units) ──────────────────────────────────────────
const ERASER_RADIUS = 20;

export default function Canvas({
  canEdit = true,
  onCursorMove = () => {},
  onDrawStart = () => {},
  onDrawMove = () => {},
  onDrawEnd = () => {},
  onElementDelete = () => {},
  onElementMove = () => {},
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);

  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [draftText, setDraftText] = useState(null); // { x, y, value }
  const [dragTextState, setDragTextState] = useState(null);
  const [dragShapeState, setDragShapeState] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Pinch-zoom state
  const pinchRef = useRef(null); // { dist, midX, midY }

  const {
    tool,
    color,
    strokeWidth,
    zoom,
    panOffset,
    setZoom,
    setPanOffset,
    strokes,
    shapes,
    texts,
    remoteStrokes,
    remoteShapes,
    activeStroke,
    activeShape,
    beginStroke,
    updateActiveStroke,
    commitStroke,
    beginShape,
    updateActiveShape,
    commitShape,
    cancelActive,
    clearActiveStroke,
    addText,
    updateShapePosition,
    updateTextPosition,
    deleteElement,
  } = useCanvasStore();

  // ─── Render ────────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const roughCanvas = getRoughCanvas(canvas);
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvasSize;
    if (!width || !height) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Apply pan + zoom
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw grid (subtle dots)
    drawGrid(ctx, width, height, panOffset, zoom);

    // Committed strokes
    strokes.forEach((stroke) => drawPerfectFreehandStroke(ctx, stroke));
    Object.values(remoteStrokes).forEach((stroke) => drawPerfectFreehandStroke(ctx, stroke));

    // Active (in-progress) stroke
    if (activeStroke) drawPerfectFreehandStroke(ctx, activeStroke);

    // Committed shapes
    [...shapes, ...Object.values(remoteShapes), ...(activeShape ? [activeShape] : [])].forEach((shape) => {
      drawShape(ctx, shape, roughCanvas);
    });

    // Texts
    texts.forEach((textItem) => drawText(ctx, textItem));

    ctx.restore();

    // Eraser cursor preview (screen space)
    if (tool === 'eraser') {
      // drawn separately in pointer-move if needed
    }
  }, [strokes, shapes, texts, remoteStrokes, remoteShapes, activeStroke, activeShape, zoom, panOffset, canvasSize, tool]);

  useEffect(() => {
    render();
  }, [render]);

  // ─── Coordinate mapping ────────────────────────────────────────────────────
  // Screen px → canvas world units (accounting for pan + zoom)
  const screenToWorld = useCallback((sx, sy) => {
    return {
      x: (sx - panOffset.x) / zoom,
      y: (sy - panOffset.y) / zoom,
    };
  }, [panOffset, zoom]);

  const getEventCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { sx: 0, sy: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      sx: clientX - rect.left,
      sy: clientY - rect.top,
    };
  };

  // ─── Hit detection (world coords) ─────────────────────────────────────────
  const findTextAtPoint = useCallback((wx, wy) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      ctx.font = `${t.fontSize || 16}px sans-serif`;
      const lines = String(t.text || '').split('\n');
      const lineHeight = (t.fontSize || 16) * 1.4;
      const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width), 10);
      const totalH = lines.length * lineHeight;
      if (
        wx >= t.position.x - 8 &&
        wx <= t.position.x + maxW + 8 &&
        wy >= t.position.y - 6 &&
        wy <= t.position.y + totalH + 6
      ) {
        return t;
      }
    }
    return null;
  }, [texts]);

  const findShapeAtPoint = useCallback((wx, wy) => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      const minX = Math.min(s.startX, s.endX) - 10;
      const maxX = Math.max(s.startX, s.endX) + 10;
      const minY = Math.min(s.startY, s.endY) - 10;
      const maxY = Math.max(s.startY, s.endY) + 10;
      if (wx >= minX && wx <= maxX && wy >= minY && wy <= maxY) return s;
    }
    return null;
  }, [shapes]);

  // ─── Eraser: remove strokes/shapes whose points are near (wx,wy) ──────────
  const eraseAtPoint = useCallback((wx, wy) => {
    const { strokes: st, shapes: sh, deleteElement: del } = useCanvasStore.getState();

    st.forEach((stroke) => {
      const hit = stroke.points.some(
        (p) => Math.hypot(p.x - wx, p.y - wy) < ERASER_RADIUS
      );
      if (hit) {
        del('stroke', stroke.id);
        onElementDelete({ elementType: 'stroke', elementId: stroke.backendId || stroke.id });
      }
    });

    sh.forEach((shape) => {
      const cx = (shape.startX + shape.endX) / 2;
      const cy = (shape.startY + shape.endY) / 2;
      if (Math.hypot(cx - wx, cy - wy) < ERASER_RADIUS + 20) {
        del('shape', shape.id);
        onElementDelete({ elementType: 'shape', elementId: shape.backendId || shape.id });
      }
    });
  }, [onElementDelete]);

  // ─── Pan dragging (cursor tool on empty space) ─────────────────────────────
  const panDragRef = useRef(null); // { startSx, startSy, startPanX, startPanY }

  // ─── Pointer down ──────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    // Ignore multi-touch (handled by pinch)
    // if (e.touches && e.touches.length === 2) return;

    // const { sx, sy } = getEventCoords(e);
    // const { x: wx, y: wy } = screenToWorld(sx, sy);

    // if (tool === 'text') {
    //   if (!canEdit) return;
    //   setDraftText({ x: wx, y: wy, value: '' });
    //   return;
    // }
    if (e.touches && e.touches.length === 2) return;

  const isTouchEvent = Boolean(e.touches && e.touches.length);

  // Prevent default for touch to avoid scroll interference
  if (isTouchEvent) e.preventDefault();

  const { sx, sy } = getEventCoords(e);
  const { x: wx, y: wy } = screenToWorld(sx, sy);

  if (tool === 'text') {
    if (!canEdit) return;
    // For touch, create the draft here. Desktop uses click handler.
    if (!isTouchEvent) return;
    // Stop propagation so touch doesn't trigger pan
    e.stopPropagation();
    setDraftText({ x: wx, y: wy, value: '' });
    return;
  }

    if (tool === 'cursor') {
      if (canEdit) {
        const hitText = findTextAtPoint(wx, wy);
        if (hitText) {
          setIsDraggingText(true);
          setDragTextState({ id: hitText.id, offsetX: wx - hitText.position.x, offsetY: wy - hitText.position.y });
          return;
        }
        const hitShape = findShapeAtPoint(wx, wy);
        if (hitShape) {
          setIsDraggingShape(true);
          setDragShapeState({
            id: hitShape.id,
            offsetX: wx - hitShape.startX,
            offsetY: wy - hitShape.startY,
            w: hitShape.endX - hitShape.startX,
            h: hitShape.endY - hitShape.startY,
          });
          return;
        }
      }
      // Pan
      panDragRef.current = { startSx: sx, startSy: sy, startPanX: panOffset.x, startPanY: panOffset.y };
      setIsPointerDown(true);
      return;
    }

    if (!canEdit) return;

    setIsPointerDown(true);

    if (tool === 'eraser') {
      eraseAtPoint(wx, wy);
      return;
    }

    if (tool === 'pen') {
      const strokeId = Date.now();
      beginStroke('pen', { x: wx, y: wy }, color, strokeWidth, strokeId);
      onDrawStart({
        kind: 'pencil',
        strokeId,
        tool: 'pen',
        point: { x: wx, y: wy },
        color,
        width: strokeWidth,
      });
    } else if (['rectangle', 'circle', 'line'].includes(tool)) {
      const shapeId = Date.now();
      beginShape(tool, wx, wy, color, strokeWidth, shapeId);
      onDrawStart({
        kind: 'shape',
        shapeId,
        shapeType: tool,
        startX: wx,
        startY: wy,
        endX: wx,
        endY: wy,
        color,
        width: strokeWidth,
      });
    }
  }, [tool, canEdit, color, strokeWidth, screenToWorld, panOffset, findTextAtPoint, findShapeAtPoint, eraseAtPoint, beginStroke, beginShape, onDrawStart]);

  const handleCanvasClick = useCallback((e) => {
    if (tool !== 'text' || !canEdit || draftText) return;
    if (e.target !== canvasRef.current) return;
    const { sx, sy } = getEventCoords(e);
    const { x: wx, y: wy } = screenToWorld(sx, sy);
    setDraftText({ x: wx, y: wy, value: '' });
  }, [tool, canEdit, draftText, screenToWorld]);

  // ─── Pointer move ──────────────────────────────────────────────────────────
  const handlePointerMove = useCallback((e) => {
    if (e.touches && e.touches.length === 2) return;

    const { sx, sy } = getEventCoords(e);
    const { x: wx, y: wy } = screenToWorld(sx, sy);

    onCursorMove({ x: sx, y: sy });

    if (isDraggingText && dragTextState && canEdit) {
      const nextPosition = { x: wx - dragTextState.offsetX, y: wy - dragTextState.offsetY };
      updateTextPosition(dragTextState.id, nextPosition);
      onElementMove({
        elementType: 'text',
        elementId: dragTextState.id,
        position: nextPosition,
      });
      return;
    }

    if (isDraggingShape && dragShapeState && canEdit) {
      const newStartX = wx - dragShapeState.offsetX;
      const newStartY = wy - dragShapeState.offsetY;
      const nextCoords = {
        startX: newStartX,
        startY: newStartY,
        endX: newStartX + dragShapeState.w,
        endY: newStartY + dragShapeState.h,
      };
      updateShapePosition(dragShapeState.id, nextCoords);
      onElementMove({
        elementType: 'shape',
        elementId: dragShapeState.id,
        coords: nextCoords,
      });
      return;
    }

    if (!isPointerDown) return;

    if (tool === 'cursor' && panDragRef.current) {
      const { startSx, startSy, startPanX, startPanY } = panDragRef.current;
      setPanOffset({ x: startPanX + (sx - startSx), y: startPanY + (sy - startSy) });
      return;
    }

    if (!canEdit) return;

    if (tool === 'eraser') {
      eraseAtPoint(wx, wy);
      return;
    }

    if (tool === 'pen') {
      updateActiveStroke({ x: wx, y: wy });
      onDrawMove({
        kind: 'pencil',
        point: { x: wx, y: wy },
      });
    } else if (['rectangle', 'circle', 'line'].includes(tool)) {
      updateActiveShape(wx, wy);
      onDrawMove({
        kind: 'shape',
        endX: wx,
        endY: wy,
      });
    }
  }, [
    isPointerDown, isDraggingText, isDraggingShape,
    dragTextState, dragShapeState,
    tool, screenToWorld,
    updateTextPosition, updateShapePosition,
    eraseAtPoint, updateActiveStroke, updateActiveShape,
    setPanOffset, onCursorMove, onDrawMove, onElementMove,
    canEdit,
  ]);

  // ─── Pointer up ────────────────────────────────────────────────────────────
  const handlePointerUp = useCallback(() => {
    if (isDraggingText) { setIsDraggingText(false); setDragTextState(null); return; }
    if (isDraggingShape) { setIsDraggingShape(false); setDragShapeState(null); return; }

    if (!isPointerDown) return;
    setIsPointerDown(false);
    panDragRef.current = null;

    if (!canEdit) {
      cancelActive();
      return;
    }

    if (tool === 'pen' && activeStroke) {
      const corrected = detectShapeFromStroke(activeStroke.points);
      onDrawEnd({ kind: 'pencil', strokeId: activeStroke.id });

      if (corrected) {
        const shapeId = Date.now();
        const shapeColor = activeStroke.color;
        const shapeWidth = activeStroke.width;
        const roughSeed = Math.floor(Math.random() * 1000000);

        clearActiveStroke();

        // Remove the temporary pen stroke on other clients
        onElementDelete({ elementType: 'stroke', elementId: activeStroke.id });

        beginShape(
          corrected.type,
          corrected.startX,
          corrected.startY,
          shapeColor,
          shapeWidth,
          shapeId,
          { rough: true, roughSeed, source: 'auto' }
        );
        updateActiveShape(corrected.endX, corrected.endY);

        onDrawStart({
          kind: 'shape',
          shapeId,
          shapeType: corrected.type,
          startX: corrected.startX,
          startY: corrected.startY,
          endX: corrected.endX,
          endY: corrected.endY,
          color: shapeColor,
          width: shapeWidth,
        });
        onDrawMove({ kind: 'shape', endX: corrected.endX, endY: corrected.endY });
        onDrawEnd({ kind: 'shape', shapeId });
        commitShape();
      } else {
        commitStroke();
      }
    } else if (['rectangle', 'circle', 'line'].includes(tool) && activeShape) {
      onDrawEnd({ kind: 'shape', shapeId: activeShape.id });
      commitShape();
    }
    else cancelActive();
  }, [isPointerDown, isDraggingText, isDraggingShape, tool, activeStroke, activeShape, onDrawEnd, commitStroke, commitShape, cancelActive, clearActiveStroke, canEdit]);

  // ─── Pinch-zoom (two fingers) ──────────────────────────────────────────────
  // const handleTouchStart = useCallback((e) => {
  //   if (e.touches.length === 2) {
  //     e.preventDefault();
  //     const t1 = e.touches[0];
  //     const t2 = e.touches[1];
  //     const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  //     const midX = (t1.clientX + t2.clientX) / 2;
  //     const midY = (t1.clientY + t2.clientY) / 2;
  //     pinchRef.current = { dist, midX, midY, startZoom: zoom, startPan: { ...panOffset } };
  //     // cancel any active drawing
  //     cancelActive();
  //     setIsPointerDown(false);
  //   } else {
  //     handlePointerDown(e);
  //   }
  // }, [zoom, panOffset, cancelActive, handlePointerDown]);
  const handleTouchStart = useCallback((e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const midX = (t1.clientX + t2.clientX) / 2;
    const midY = (t1.clientY + t2.clientY) / 2;
    pinchRef.current = { 
      dist, midX, midY, 
      startZoom: zoom, 
      startPan: { ...panOffset } 
    };
    // Only cancel active if NOT text tool
    if (tool !== 'text') {
      cancelActive();
      setIsPointerDown(false);
    }
  } else if (e.touches.length === 1) {
    // Single finger — handle normally including text tool
    handlePointerDown(e);
  }
}, [zoom, panOffset, tool, cancelActive, handlePointerDown]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scale = dist / pinchRef.current.dist;
      const newZoom = Math.max(0.2, Math.min(5, pinchRef.current.startZoom * scale));

      // Zoom toward pinch midpoint
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const midSx = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midSy = (t1.clientY + t2.clientY) / 2 - rect.top;

      const worldX = (midSx - pinchRef.current.startPan.x) / pinchRef.current.startZoom;
      const worldY = (midSy - pinchRef.current.startPan.y) / pinchRef.current.startZoom;

      setZoom(newZoom);
      setPanOffset({
        x: midSx - worldX * newZoom,
        y: midSy - worldY * newZoom,
      });
    } else {
      handlePointerMove(e);
    }
  }, [handlePointerMove, setZoom, setPanOffset]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 0) handlePointerUp();
  }, [handlePointerUp]);

  // ─── Mouse wheel zoom ──────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.2, Math.min(5, zoom * delta));

    const worldX = (sx - panOffset.x) / zoom;
    const worldY = (sy - panOffset.y) / zoom;

    setZoom(newZoom);
    setPanOffset({
      x: sx - worldX * newZoom,
      y: sy - worldY * newZoom,
    });
  }, [zoom, panOffset, setZoom, setPanOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ─── Text commit ────────────────────────────────────────────────────────────
//   const commitDraftText = () => {
//   if (!draftText) return;

//   if (!canEdit) {
//     setDraftText(null);
//     return;
//   }

//   const value = draftText.value.trim();
//   if (value) {
//     const fontSize = Math.max(14, 16 * zoom); // ✅ fix
//     addText(value, { x: draftText.x, y: draftText.y }, color, fontSize);
//   }

//   setDraftText(null);
// };
const commitDraftText = useCallback(() => {
  if (!draftText) return;

  if (!canEdit) {
    setDraftText(null);
    return;
  }

  const value = draftText.value.trim();
  if (value) {
    const fontSize = Math.max(14, 16 * zoom);
    addText(value, { x: draftText.x, y: draftText.y }, color, fontSize);
  }

  setDraftText(null);
}, [draftText, canEdit, zoom, color, addText]);

const handleDraftKeyDown = useCallback((e) => {
  if (e.key === 'Escape') { 
    e.preventDefault(); 
    setDraftText(null); 
    return; 
  }
  if (e.key === 'Enter' && !e.shiftKey) { 
    e.preventDefault(); 
    commitDraftText(); 
  }
}, [commitDraftText]);

useLayoutEffect(() => {
  if (!draftText) return;

  // Small timeout ensures textarea is rendered before focusing
  const timer = setTimeout(() => {
    const input = textInputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    // Place cursor at end
    input.selectionStart = input.value.length;
    input.selectionEnd = input.value.length;
  }, 10);

  return () => clearTimeout(timer);
}, [draftText]);

  // const handleDraftKeyDown = (e) => {
  //   if (e.key === 'Escape') { e.preventDefault(); setDraftText(null); return; }
  //   if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitDraftText(); }
  // };

  // useLayoutEffect(() => {
  //   if (!draftText) return;

  //   const input = textInputRef.current;
  //   if (!input) return;

  //   input.focus({ preventScroll: true });
  // }, [draftText]);

  // ─── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const rect = container.getBoundingClientRect();
      setCanvasSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ─── Cursor style ───────────────────────────────────────────────────────────
  const cursorStyle =
    tool === 'text'
      ? 'cursor-text'
      : tool === 'eraser'
        ? 'cursor-cell'
        : tool === 'cursor'
          ? isDraggingText || isDraggingShape || isPointerDown
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : 'cursor-crosshair';

  // ─── Draft text screen position ────────────────────────────────────────────
  const draftScreenPos = draftText
    ? {
        left: draftText.x * zoom + panOffset.x,
        top: draftText.y * zoom + panOffset.y,
      }
    : null;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Tool indicator */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full border border-[#E5E7EB] bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#111827]">
          {(() => {
            const Icon = toolIcons[tool] || MousePointer2;
            return <Icon className="h-3.5 w-3.5 text-[#4F46E5]" />;
          })()}
          <span>{tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
          <span className="text-[#9CA3AF]">· {Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 touch-none select-none ${cursorStyle}`}
        style={{ width: canvasSize.width, height: canvasSize.height }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Inline text input — positioned in screen space */}
      {/* {draftText && draftScreenPos && (
  <textarea
    ref={textInputRef}
    value={draftText.value}
    onChange={(e) =>
      setDraftText((curr) =>
        curr ? { ...curr, value: e.target.value } : curr
      )
    }
    onBlur={commitDraftText}
    onKeyDown={handleDraftKeyDown}
    onPointerDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
    autoFocus
    placeholder="Type here… (Enter to confirm, Esc to cancel)"
    className="absolute z-20 min-w-37.5 max-w-75 resize-none rounded-lg border-2 border-[#4F46E5] bg-white/95 px-3 py-2 text-base text-[#111827] shadow-xl outline-none ring-2 ring-[#4F46E5]/20 touch-auto select-text caret-[#111827]"
    style={{
      left: `${draftScreenPos.left}px`,
      top: `${draftScreenPos.top}px`,
      fontSize: `${Math.max(14, 16 * zoom)}px`,
    }}
    rows={3}
  />
)} */}
{draftText && draftScreenPos && (
  <textarea
    ref={textInputRef}
    value={draftText.value}
    onChange={(e) =>
      setDraftText((curr) =>
        curr ? { ...curr, value: e.target.value } : curr
      )
    }
    onBlur={commitDraftText}
    onKeyDown={handleDraftKeyDown}
    onPointerDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => {
      e.stopPropagation(); // ← prevent canvas touch handler
    }}
    onTouchEnd={(e) => {
      e.stopPropagation(); // ← prevent canvas touch handler
    }}
    autoFocus
    placeholder="Type here… (Enter to confirm, Esc to cancel)"
    className="absolute z-20 min-w-[200px] max-w-[400px] resize-none rounded-lg border-2 border-[#4F46E5] bg-white/95 px-3 py-2 text-base text-[#111827] shadow-xl outline-none ring-2 ring-[#4F46E5]/20 touch-auto select-text pointer-events-auto caret-[#111827]"
    style={{
      left: `${draftScreenPos.left}px`,
      top: `${draftScreenPos.top}px`,
      fontSize: `${Math.max(14, 16 * zoom)}px`,
    }}
    rows={3}
  />
)}
    </div>
  );
}