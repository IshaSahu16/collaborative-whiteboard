'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  MousePointer2, Pen, Eraser, Type, Square, Circle, Minus,
  Undo2, Redo2, Trash2, Download, ZoomIn, ZoomOut,
  ChevronUp, ChevronDown, Home,
} from 'lucide-react';
import useCanvasStore from '@/store/canvasStore';
import ColorPicker from './ColorPicker';
import StrokeWidth from './StrokeWidth';

const tools = [
  { id: 'cursor', label: 'Select / Pan', icon: MousePointer2 },
  { id: 'pen', label: 'Pen', icon: Pen },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'circle', label: 'Ellipse', icon: Circle },
  { id: 'line', label: 'Line', icon: Minus },
];

function ToolBtn({ t, active, onClick, disabled = false }) {
  const Icon = t.icon;
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      title={t.label}
      aria-label={t.label}
      className={`
        flex flex-col items-center justify-center gap-0.5
        rounded-xl p-2 transition-colors duration-150
        ${disabled ? 'cursor-not-allowed opacity-45' : ''}
        ${active
          ? 'bg-[#4F46E5] text-white shadow-sm'
          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'}
      `}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span className="hidden text-[9px] font-medium leading-none md:block">
        {t.label.split(' ')[0]}
      </span>
    </motion.button>
  );
}

function ActionBtn({ icon: Icon, onClick, title, danger = false, className = '', disabled = false }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`
        flex items-center justify-center rounded-xl p-2.5 transition-colors
        ${disabled ? 'cursor-not-allowed opacity-45' : ''}
        ${danger
          ? 'text-[#DC2626] hover:bg-red-50'
          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'}
        ${className}
      `}
    >
      <Icon className="h-[18px] w-[18px]" />
    </motion.button>
  );
}

// ─── Mobile bottom bar ─────────────────────────────────────────────────────────
function MobilePresence({ users = [] }) {
  if (!users.length) return null;
  const shown = users.slice(0, 3);
  const extra = Math.max(0, users.length - shown.length);

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2 py-1">
      <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
      <div className="flex -space-x-2">
        {shown.map((user) => (
          <div
            key={user.id}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#EEF2FF] text-[10px] font-semibold text-[#4F46E5]"
            title={user.name}
          >
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        ))}
        {extra > 0 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#F3F4F6] text-[10px] font-semibold text-[#6B7280]">
            +{extra}
          </div>
        )}
      </div>
      <span className="text-xs font-semibold text-[#111827]">{users.length}</span>
    </div>
  );
}

function MobileToolbar({ users, canEdit }) {
  const { tool, setTool, undo, redo, clearCanvas, zoom, zoomIn, zoomOut, setZoom, setPanOffset } = useCanvasStore();
  const [expanded, setExpanded] = useState(false);

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'whiteboard.png';
    link.click();
  };

  const resetView = () => { setZoom(1); setPanOffset({ x: 0, y: 0 }); };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="border-t border-[#E5E7EB] bg-white/98 px-3 py-3 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Tools & Actions
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setExpanded(false)}
                className="rounded-full border border-[#E5E7EB] bg-white p-1 text-[#6B7280]"
                aria-label="Close toolbar"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Tool grid */}
            <div className="mb-2 grid grid-cols-4 gap-1 sm:grid-cols-7">
              {tools.map((t) => (
                <ToolBtn
                  key={t.id}
                  t={t}
                  active={tool === t.id}
                  disabled={!canEdit && t.id !== 'cursor'}
                  onClick={() => {
                    if (!canEdit && t.id !== 'cursor') return;
                    setTool(t.id);
                    setExpanded(false);
                  }}
                />
              ))}
            </div>

            {/* Color + stroke */}
            {canEdit && (
              <div className="mb-2 flex items-center gap-3 border-t border-[#F3F4F6] pt-2">
                <div className="flex-1"><ColorPicker /></div>
                <div className="flex-1"><StrokeWidth /></div>
              </div>
            )}

            {/* Actions grid */}
            <div className="grid grid-cols-4 gap-1 border-t border-[#F3F4F6] pt-2">
              <ActionBtn icon={ZoomOut} onClick={zoomOut} title="Zoom Out" />
              <ActionBtn icon={ZoomIn} onClick={zoomIn} title="Zoom In" />
              <button
                onClick={resetView}
                className="col-span-2 flex items-center justify-center rounded-xl px-2 py-2 text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF2FF]"
              >
                {Math.round(zoom * 100)}%
              </button>
              <div className="col-span-2 flex items-center justify-center">
                <MobilePresence users={users} />
              </div>
              <ActionBtn icon={Download} onClick={handleExport} title="Export" />
              <ActionBtn icon={Trash2} onClick={clearCanvas} title="Clear" danger disabled={!canEdit} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky bottom bar — always visible */}
      <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-white/98 px-3 py-2 backdrop-blur-md">
        {/* Quick tool pills */}
        <div className="flex gap-0.5">
          {tools.slice(0, 4).map((t) => {
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  if (!canEdit && t.id !== 'cursor') return;
                  setTool(t.id);
                }}
                disabled={!canEdit && t.id !== 'cursor'}
                className={`rounded-lg p-2.5 ${tool === t.id ? 'bg-[#4F46E5] text-white' : 'text-[#6B7280]'} ${!canEdit && t.id !== 'cursor' ? 'cursor-not-allowed opacity-45' : ''}`}
              >
                <Icon className="h-5 w-5" />
              </motion.button>
            );
          })}
        </div>

        {/* Undo / Redo quick */}
        <div className="flex gap-0.5">
          <ActionBtn icon={Undo2} onClick={undo} title="Undo" disabled={!canEdit} />
          <ActionBtn icon={Redo2} onClick={redo} title="Redo" disabled={!canEdit} />
        </div>

        {/* Expand toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 rounded-xl bg-[#4F46E5] px-3 py-2 text-xs font-semibold text-white shadow"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          More
        </motion.button>
      </div>
    </div>
  );
}

// ─── Desktop sidebar ───────────────────────────────────────────────────────────
function DesktopToolbar({ canEdit }) {
  const { tool, setTool, undo, redo, clearCanvas, zoom, zoomIn, zoomOut, setZoom, setPanOffset } = useCanvasStore();

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'whiteboard.png';
    link.click();
  };

  const resetView = () => { setZoom(1); setPanOffset({ x: 0, y: 0 }); };

  return (
    <motion.div
  className="fixed left-3 top-[72px] z-40 hidden flex-col rounded-2xl border border-[#E5E7EB] bg-white/98 p-3 shadow-xl backdrop-blur-md md:flex"
  initial={{ y: -40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  {/* 🔝 TOP ROW: Tools + Zoom + Actions */}
  <div className="flex items-start gap-3 border-b border-[#F3F4F6] pb-3">

    {/* 🛠 Tools */}
    <div className="flex gap-1 flex-wrap">
      {tools.map((t) => (
        <ToolBtn
          key={t.id}
          t={t}
          active={tool === t.id}
          disabled={!canEdit && t.id !== 'cursor'}
          onClick={() => {
            if (!canEdit && t.id !== 'cursor') return;
            setTool(t.id);
          }}
        />
      ))}
    </div>

    {/* 🔍 Zoom */}
    <div className="flex flex-col items-center px-2 border-l border-[#F3F4F6]">
      <div className="mb-1 text-[10px] font-semibold text-[#4F46E5]">
        {Math.round(zoom * 100)}%
      </div>
      <div className="flex gap-1">
        <ActionBtn icon={ZoomIn} onClick={zoomIn} title="Zoom In" />
        <ActionBtn icon={ZoomOut} onClick={zoomOut} title="Zoom Out" />
        <ActionBtn icon={Home} onClick={resetView} title="Reset View" />
      </div>
    </div>

    {/* ⚡ Actions */}
    <div className="flex gap-1 px-2 border-l border-[#F3F4F6]">
      <ActionBtn icon={Undo2} onClick={undo} title="Undo" disabled={!canEdit} />
      <ActionBtn icon={Redo2} onClick={redo} title="Redo" disabled={!canEdit} />
      <ActionBtn icon={Download} onClick={handleExport} title="Export PNG" />
      <ActionBtn icon={Trash2} onClick={clearCanvas} title="Clear Canvas" danger disabled={!canEdit} />
    </div>

    {canEdit && (
      <div className="pt-3 flex items-center gap-4">
        <ColorPicker compact />
        <StrokeWidth compact />
      </div>
    )}
  </div>

 
</motion.div>
  );
}

export default function Toolbar({ users = [], canEdit = true }) {
  return (
    <>
      <DesktopToolbar canEdit={canEdit} />
      <MobileToolbar users={users} canEdit={canEdit} />
    </>
  );
}