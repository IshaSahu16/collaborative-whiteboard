'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { getBoardByShareLink, joinBoardByShareLink } from '@/services/boardService';
import useAuthStore from '@/store/authStore';

export default function InvitePage() {
  const { shareLink } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  // Fetch board info
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await getBoardByShareLink(shareLink);
        setBoard(res.data);
      } catch (err) {
        setError('This invite link is invalid or has expired');
      } finally {
        setLoading(false);
      }
    };
    if (shareLink) fetchBoard();
  }, [shareLink]);

  // Auto join if user is logged in
  useEffect(() => {
    const autoJoin = async () => {
      if (user && board && !joined && !error && !joining) {
        setJoining(true);
        try {
          const res = await joinBoardByShareLink(shareLink);
          setJoined(true);
          localStorage.removeItem('pendingInvite');
          setTimeout(() => {
            router.push(`/board/${res.data.boardId}`);
          }, 1500);
        } catch (err) {
          if (err.message?.includes('Already a member')) {
            // Already member — just go to boards
            router.push('/boards');
          } else {
            setError(err.message || 'Failed to join board');
          }
        } finally {
          setJoining(false);
        }
      }
    };

    if (!loading && !authLoading) autoJoin();
  }, [user, board, loading, authLoading]);

  const handleJoin = async () => {
    if (!user) {
      localStorage.setItem('pendingInvite', shareLink);
      router.push(`/login?redirect=/invite/${shareLink}`);
      return;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] w-full max-w-md p-8 text-center"
      >
        {/* Logo */}
        <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-6 h-6 text-white" />
        </div>

        {error ? (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#111827] mb-2">Invalid Link</h2>
            <p className="text-[#6B7280] mb-6">{error}</p>
            <button
              onClick={() => router.push('/boards')}
              className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors"
            >
              Go to Boards
            </button>
          </>
        ) : joined || joining ? (
          <>
            {joined ? (
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            ) : (
              <Loader2 className="w-12 h-12 text-[#4F46E5] animate-spin mx-auto mb-4" />
            )}
            <h2 className="text-xl font-bold text-[#111827] mb-2">
              {joined ? 'Joined Successfully!' : 'Joining board...'}
            </h2>
            <p className="text-[#6B7280]">
              {joined ? 'Redirecting to board...' : 'Please wait...'}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#111827] mb-2">
              You've been invited!
            </h2>
            <p className="text-[#6B7280] mb-6">
              Join <strong>"{board?.title}"</strong> to start collaborating
            </p>

            <div className="bg-[#F4F6FB] rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Board</span>
                <span className="font-medium text-[#111827]">{board?.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Owner</span>
                <span className="font-medium text-[#111827]">{board?.owner?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Members</span>
                <span className="font-medium text-[#111827]">{board?.memberCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Your Role</span>
                <span className="font-medium text-[#4F46E5]">Viewer</span>
              </div>
            </div>

            {!user && (
              <p className="text-sm text-[#6B7280] mb-4">
                You'll need to login first to join this board
              </p>
            )}

            {!user && (
              <button
                onClick={handleJoin}
                className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2"
              >
                Login to Join
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}