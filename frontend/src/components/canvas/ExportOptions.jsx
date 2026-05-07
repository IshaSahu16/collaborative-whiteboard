'use client';

import { useState } from 'react';
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
import { exportCanvasAsPdf, exportCanvasAsPng } from '@/utils/exportUtils';

export default function ExportOptions({ isOpen, onClose }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPNG = () => {
    try {
      setIsExporting(true);
      exportCanvasAsPng();
      onClose();
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      exportCanvasAsPdf();
      onClose();
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
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
            disabled={isExporting}
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
            disabled={isExporting}
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