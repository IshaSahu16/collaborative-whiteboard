'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Headphones } from 'lucide-react';

export default function AudioNotesList({ isOpen, onClose, notes = [], onDelete }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-[#4F46E5]" />
            Pinned audio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E5E7EB] p-4 text-center text-sm text-[#6B7280]">
              No audio notes yet.
            </div>
          ) : (
            notes.map((note) => (
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
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
