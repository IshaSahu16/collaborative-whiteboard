'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Globe } from 'lucide-react';
import { getShareableLink } from '@/services/boardService';
import { updateMemberRole } from '@/services/memberService';
import useAuthStore from '@/store/authStore';
import useBoardStore from '@/store/boardStore';

export default function ShareBoardModal({ isOpen, onClose, board }) {
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState([]);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const { user } = useAuthStore();
  const { fetchBoards } = useBoardStore();

  useEffect(() => {
    if (!board) {
      setMembers([]);
      return;
    }
    setMembers(board.members || []);
  }, [board]);

  if (!board) return null;

  const isPublicBoard = !!board.isPublic;
  // Use actual shareLink from backend
  const shareLink = board.shareLink
    ? getShareableLink(board.shareLink)
    : `${window?.location?.origin}/invite/${board.shareLink}`;

  const ownerId = typeof board.owner === 'object' ? board.owner?._id : board.owner;
  const isOwner = user?._id && ownerId && user._id.toString() === ownerId.toString();

  const getMemberId = (member) =>
    typeof member.user === 'object' ? member.user?._id : member.user;

  const handleRoleChange = async (member, nextRole) => {
    const memberId = getMemberId(member);
    if (!memberId) return;
    try {
      setUpdatingUserId(memberId.toString());
      await updateMemberRole(board._id || board.id, { userId: memberId, role: nextRole });
      setMembers((prev) =>
        prev.map((m) =>
          getMemberId(m)?.toString() === memberId.toString()
            ? { ...m, role: nextRole }
            : m
        )
      );
      await fetchBoards();
    } catch (err) {
      console.error('Failed to update role:', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#111827]">{`Share "${board.title}"`}</DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            {isPublicBoard
              ? "Anyone with this link joins as a Viewer"
              : "This board is private. Share by email instead."}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Link Section */}
          <div className="space-y-2">
            <Label className="text-[#111827]">Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={isPublicBoard ? shareLink : "Private board"}
                readOnly
                className="text-sm bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]"
              />
              <Button
                onClick={handleCopyLink}
                disabled={!isPublicBoard}
                variant="outline"
                className="px-3 border-[#E5E7EB] hover:bg-[#F3F4F6] shrink-0"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">Copied!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="h-4 w-4 text-[#6B7280]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Info Box */}
          {isPublicBoard && (
            <div className="p-3 bg-[#EEF2FF] rounded-lg border border-[#E0E7FF]">
              <div className="flex gap-2">
                <Globe className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <p className="text-sm text-[#4F46E5]">
                  Anyone with this link can join the board as a Viewer.
                  The board owner can change their role anytime.
                </p>
              </div>
            </div>
          )}

          {/* Members List */}
          {members.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[#111827]">
                Current Members ({members.length})
              </Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {members.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#F9FAFB]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#4F46E5] rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {member.user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {member.user?.email || ''}
                        </p>
                      </div>
                    </div>
                    {isOwner && member.role !== 'owner' ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member, value)}
                        disabled={updatingUserId === getMemberId(member)?.toString()}
                      >
                        <SelectTrigger className="h-8 w-28 border-[#E5E7EB] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        member.role === 'owner'
                          ? 'bg-[#EEF2FF] text-[#4F46E5]'
                          : member.role === 'editor'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}>
                        {member.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={onClose}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white"
          >
            Done
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}