"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const thumbnailColors = [
  { id: "indigo", value: "#4F46E5", bg: "bg-[#4F46E5]" },
  { id: "blue", value: "#2563EB", bg: "bg-[#2563EB]" },
  { id: "green", value: "#059669", bg: "bg-[#059669]" },
  { id: "orange", value: "#EA580C", bg: "bg-[#EA580C]" },
  { id: "pink", value: "#DB2777", bg: "bg-[#DB2777]" },
  { id: "purple", value: "#7C3AED", bg: "bg-[#7C3AED]" },
];

export default function CreateBoardModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: false,
    thumbnail: "indigo",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Board title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const selectedColor = thumbnailColors.find(
        (c) => c.id === formData.thumbnail
      );

      await onCreate?.({
        title: formData.title.trim() || "Untitled Board",
        description: formData.description.trim(),
        isPublic: formData.isPublic,
        thumbnail: selectedColor?.value || "#4F46E5",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        isPublic: false,
        thumbnail: "indigo",
      });
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || "Failed to create board" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (data) => {
  await addBoard(data); // ← passes {title, description, isPublic, thumbnail}
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      isPublic: false,
      thumbnail: "indigo",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#111827]">Create new board</DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            Set up your board with a title, description, and visibility
            settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#111827]">
              Board title <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter board title..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
                errors.title ? "border-[#DC2626] focus:border-[#DC2626]" : ""
              }`}
              autoFocus
            />
            <AnimatePresence>
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-[#DC2626]"
                >
                  {errors.title}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#111827]">
              Description{" "}
              <span className="text-[#6B7280] font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for your board..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`min-h-20 resize-none border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] ${
                errors.description
                  ? "border-[#DC2626] focus:border-[#DC2626]"
                  : ""
              }`}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <AnimatePresence>
                {errors.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-[#DC2626]"
                  >
                    {errors.description}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-xs text-[#9CA3AF] ml-auto">
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* Thumbnail Color */}
          <div className="space-y-2">
            <Label className="text-[#111827]">Thumbnail color</Label>
            <div className="flex items-center gap-2">
              {thumbnailColors.map((color) => (
                <motion.button
                  key={color.id}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInputChange("thumbnail", color.id)}
                  className={`relative w-8 h-8 rounded-lg ${color.bg} transition-all ${
                    formData.thumbnail === color.id
                      ? "ring-2 ring-offset-2 ring-[#4F46E5]"
                      : ""
                  }`}
                  aria-label={`Select ${color.id} color`}
                >
                  <AnimatePresence>
                    {formData.thumbnail === color.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="space-y-2">
            <Label className="text-[#111827]">Visibility</Label>
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: formData.isPublic ? "#ECFDF5" : "#F3F4F6",
                  }}
                  className="p-2 rounded-lg"
                >
                  {formData.isPublic ? (
                    <Globe className="h-5 w-5 text-[#059669]" />
                  ) : (
                    <Lock className="h-5 w-5 text-[#6B7280]" />
                  )}
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {formData.isPublic ? "Public board" : "Private board"}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formData.isPublic
                      ? "Anyone with the link can view this board"
                      : "Only you and invited members can access"}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublic", checked)
                }
                className="data-[state=checked]:bg-[#4F46E5]"
              />
            </div>
          </div>

          {/* Submit Error */}
          <AnimatePresence>
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
              >
                <p className="text-sm text-[#DC2626]">{errors.submit}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[#E5E7EB] mx-4 text-[#374151] hover:bg-[#F3F4F6]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Creating...
                </span>
              ) : (
                "Create board"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
