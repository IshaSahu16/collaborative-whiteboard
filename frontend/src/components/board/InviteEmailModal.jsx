'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Mail, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { addMember } from '@/services/memberService';
import useBoardStore from '@/store/boardStore';

export default function InviteEmailModal({ isOpen, onClose, board }) {
  const [emails, setEmails] = useState(['']);
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { fetchBoards } = useBoardStore();

  if (!board) return null;

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
    setError('');
  };

  const handleAddEmail = () => {
    if (emails.length < 10) setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails.length > 0 ? newEmails : ['']);
  };

  const validateEmails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter((e) => e.trim() !== '');
    if (validEmails.length === 0) {
      setError('Please enter at least one email address');
      return false;
    }
    const invalid = validEmails.filter((e) => !emailRegex.test(e));
    if (invalid.length > 0) {
      setError(`Invalid email: ${invalid[0]}`);
      return false;
    }
    return true;
  };

  const handleInvite = async () => {
    if (!validateEmails()) return;
    setLoading(true);
    setError('');

    const validEmails = emails.filter((e) => e.trim() !== '');
    const results = [];

    // Add each email one by one
    for (const email of validEmails) {
      try {
        await addMember(board._id || board.id, { email, role });
        results.push({ email, success: true });
      } catch (err) {
        results.push({ email, success: false, error: err.message });
      }
    }

    const failed = results.filter((r) => !r.success);
    const succeeded = results.filter((r) => r.success);

    if (failed.length > 0) {
      setError(`Failed for: ${failed.map((f) => f.email).join(', ')} — ${failed[0].error}`);
    }

    if (succeeded.length > 0) {
      setSuccess(`Successfully added ${succeeded.length} member(s)!`);
      await fetchBoards(); // refresh boards to show new members
      setTimeout(() => {
        setEmails(['']);
        setSuccess('');
        setError('');
        onClose();
      }, 1500);
    }

    setLoading(false);
  };

  const handleClose = () => {
    setEmails(['']);
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#111827]">{`Invite to "${board.title}"`}</DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            Add members by their registered email address
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Email Inputs */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <Label className="text-[#111827]">Email Addresses</Label>
            {emails.map((email, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2"
              >
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  className="border-[#E5E7EB] focus:border-[#4F46E5]"
                />
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEmail(index)}
                    className="h-10 w-10 text-[#6B7280] hover:text-[#DC2626]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add More */}
          {emails.length < 10 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddEmail}
              className="w-full border-[#E5E7EB] text-[#4F46E5] hover:bg-[#EEF2FF]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Email
            </Button>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-[#111827]">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="border-[#E5E7EB]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer — Can view only</SelectItem>
                <SelectItem value="editor">Editor — Can draw and edit</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[#9CA3AF]">
              Note: Only registered BoardFlow users can be added
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600">{success}</p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-[#E5E7EB]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={loading}
              className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</>
              ) : (
                <><Mail className="h-4 w-4 mr-2" />Add Members</>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}