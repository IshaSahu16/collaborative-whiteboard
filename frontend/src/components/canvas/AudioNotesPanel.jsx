'use client';

import { Button } from '@/components/ui/button';
import { Headphones, Trash2 } from 'lucide-react';

export default function AudioNotesPanel({ notes = [], onDelete }) {
  return (
    <div className="fixed bottom-4 right-4 z-40 hidden w-80 max-h-[40vh] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-lg md:block">
      <div className="mb-3 flex items-center gap-2">
        <Headphones className="h-4 w-4 text-[#4F46E5]" />
        <h3 className="text-sm font-semibold text-[#111827]">Audio notes</h3>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E5E7EB] p-3 text-center text-xs text-[#6B7280]">
          No audio notes yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-[#E5E7EB] bg-white p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[#111827]">Audio note</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(note.id)}
                  className="h-7 w-7 text-[#DC2626]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <audio controls className="w-full">
                <source src={note.url} />
              </audio>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
