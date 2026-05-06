"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteBoardModal({ isOpen, onClose, board, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete?.(board);
      onClose();
    } catch (err) {
      console.error("Failed to delete board:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
          >
            <AlertTriangle className="h-6 w-6 text-[#DC2626]" />
          </motion.div>
          <DialogTitle>Delete board</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete{" "}
            <span className="font-medium text-[#111827]">{board?.title}</span>?
            This action cannot be undone and all board data will be permanently
            removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
