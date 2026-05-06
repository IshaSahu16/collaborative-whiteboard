'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy } from 'lucide-react';
import useCanvasStore from '@/store/canvasStore';

export default function PagePanel() {
  const { pages = [], currentPageId, addPage, setCurrentPage, deletePage, duplicatePage } =
    useCanvasStore();

  return (
    <motion.div
      className="fixed bottom-4 left-4 right-4 z-40 max-h-64 overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-lg sm:left-auto sm:w-80 md:top-24 md:bottom-auto md:right-4 md:left-auto md:w-72 md:max-h-[calc(100vh-7rem)]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-[#111827]">Pages</h3>
          <motion.button
            onClick={addPage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="h-4 w-4 text-[#4F46E5]" />
          </motion.button>
        </div>

        {pages.length === 0 ? (
          <Button onClick={addPage} className="w-full bg-[#4F46E5] hover:bg-[#4338CA]">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
        ) : (
          <div className="space-y-1">
            {pages.map((page, index) => (
              <motion.div
                key={page.id}
                className={`p-2 rounded border-2 ${
                  currentPageId === page.id
                    ? 'border-[#4F46E5] bg-[#EEF2FF]'
                    : 'border-[#E5E7EB] bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(page.id)}
                    className="flex-1 text-left text-sm font-medium text-[#111827] hover:text-[#4F46E5]"
                  >
                    Page {index + 1}
                  </button>
                  <div className="flex gap-1">
                    <motion.button
                      onClick={() => duplicatePage(page.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy className="h-3 w-3 text-[#6B7280]" />
                    </motion.button>
                    {pages.length > 1 && (
                      <motion.button
                        onClick={() => deletePage(page.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="h-3 w-3 text-[#DC2626]" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}