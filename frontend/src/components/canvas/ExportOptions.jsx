'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, FileImage, FileText } from 'lucide-react';

export default function ExportOptions({ isOpen, onClose }) {
  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `whiteboard-${Date.now()}.png`;
      link.click();
      onClose();
    }
  };

  const handleExportPDF = () => {
    // Note: Requires jspdf library
    console.log('[v0] PDF export would require jspdf library');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Whiteboard</DialogTitle>
        </DialogHeader>

        <motion.div className="space-y-3 py-4">
          <motion.button
            onClick={handleExportPNG}
            className="w-full p-4 border-2 border-[#E5E7EB] rounded-lg hover:border-[#4F46E5] hover:bg-[#EEF2FF] transition-colors text-left space-y-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <FileImage className="h-5 w-5 text-[#4F46E5]" />
              <span className="font-medium text-[#111827]">Export as PNG</span>
            </div>
            <p className="text-sm text-[#6B7280]">High quality image format</p>
          </motion.button>

          <motion.button
            onClick={handleExportPDF}
            className="w-full p-4 border-2 border-[#E5E7EB] rounded-lg hover:border-[#4F46E5] hover:bg-[#EEF2FF] transition-colors text-left space-y-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#4F46E5]" />
              <span className="font-medium text-[#111827]">Export as PDF</span>
            </div>
            <p className="text-sm text-[#6B7280]">Document format</p>
          </motion.button>
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}