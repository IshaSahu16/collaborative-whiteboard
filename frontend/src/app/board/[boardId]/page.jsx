'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mic, Download, ArrowLeft, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Canvas from '@/components/canvas/Canvas';
import Toolbar from '@/components/canvas/Toolbar';
import PagePanel from '@/components/canvas/PagePanel';
import ActiveUsers from '@/components/canvas/ActiveUsers';
import LiveCursors from '@/components/canvas/LiveCursors';
import ExportOptions from '@/components/canvas/ExportOptions';
import AudioNote from '@/components/canvas/AudioNote';
import AudioNotePin from '@/components/canvas/AudioNotePin';
import AudioNotesList from '@/components/canvas/AudioNotesList';
import AudioNotesPanel from '@/components/canvas/AudioNotesPanel';
import useSocket from '@/hooks/useSocket';
import useAuthStore from '@/store/authStore';
import useCanvasStore from '@/store/canvasStore';
import { getBoardById } from '@/services/boardService';

export default function BoardPage() {
	const params = useParams();
	const boardId = params?.boardId;

	const { user } = useAuthStore();
	const { audioNotes, addAudioNote, deleteAudioNote, initializeBoard, setTool } = useCanvasStore();
	const {
		cursors,
		users,
		sendCursorMove,
		sendDrawStart,
		sendDrawMove,
		sendDrawEnd,
		sendElementDelete,
			sendElementMove,
	} = useSocket({ boardId, user });

	const [boardTitle, setBoardTitle] = useState('Untitled Board');
	const [boardData, setBoardData] = useState(null);
	const [isLoadingBoard, setIsLoadingBoard] = useState(true);
	const [isExportOpen, setIsExportOpen] = useState(false);
	const [isAudioOpen, setIsAudioOpen] = useState(false);
	const [isAudioListOpen, setIsAudioListOpen] = useState(false);

	useEffect(() => {
		const loadBoard = async () => {
			if (!boardId) {
				setIsLoadingBoard(false);
				return;
			}

			setIsLoadingBoard(true);
			try {
				const res = await getBoardById(boardId);
				setBoardData(res?.data || null);
				setBoardTitle(res?.data?.title || 'Untitled Board');
			} catch (error) {
				console.error('Failed to load board:', error);
				setBoardData(null);
				setBoardTitle('Untitled Board');
			} finally {
				setIsLoadingBoard(false);
			}
		};

		loadBoard();
	}, [boardId]);

	useEffect(() => {
		if (!boardId) return;
		initializeBoard(boardId);
	}, [boardId, initializeBoard]);

	const role = useMemo(() => {
		if (!boardData || !user) return 'viewer';

		const userId = String(user._id || user.id || '');
		if (!userId) return 'viewer';

		const ownerId = typeof boardData.owner === 'object' ? boardData.owner?._id : boardData.owner;
		if (ownerId && String(ownerId) === userId) return 'owner';

		const member = Array.isArray(boardData.members)
			? boardData.members.find((m) => {
					const memberUserId = typeof m.user === 'object' ? m.user?._id : m.user;
					return memberUserId && String(memberUserId) === userId;
			  })
			: null;

		return member?.role || 'viewer';
	}, [boardData, user]);

	const canEdit = role === 'owner' || role === 'editor';

	useEffect(() => {
		if (!canEdit) {
			setTool('cursor');
		}
	}, [canEdit, setTool]);

	const activeUsers = useMemo(() => {
		if (!user) return [];
		return [
			{
				id: user.id || user._id || 'me',
				name: user.name || 'You',
				avatar: user.avatar,
			},
		];
	}, [user]);

	const handleSaveAudio = (audioBlob, previewUrl) => {
		const position = {
			x: Math.max(window.innerWidth / 2 - 90, 24),
			y: Math.max(window.innerHeight / 2 - 120, 24),
		};
		addAudioNote(audioBlob, position, previewUrl);
	};

	return (
		<div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#F8FAFC]">
			<div className="z-30 flex flex-col gap-3 border-b border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<Button asChild variant="ghost" size="sm">
						<Link href="/boards">
							<ArrowLeft className="h-4 w-4" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="text-sm font-semibold text-[#111827]">
							{isLoadingBoard ? 'Loading board...' : boardTitle}
						</h1>
						<p className="text-xs text-[#6B7280]">
							Board ID: {boardId} · Role: {role}
						</p>
					</div>
				</div>

				<div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
					<Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setIsAudioOpen(true)}>
						<Mic className="h-4 w-4" />
						Audio Note
					</Button>
					<Button size="sm" className="w-full sm:w-auto" onClick={() => setIsExportOpen(true)}>
						<Download className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className="relative flex-1 overflow-hidden pb-28 md:pb-0">
				<Canvas
					canEdit={canEdit}
					onCursorMove={sendCursorMove}
					onDrawStart={sendDrawStart}
					onDrawMove={sendDrawMove}
					onDrawEnd={sendDrawEnd}
					onElementDelete={sendElementDelete}
					onElementMove={sendElementMove}
				/>
			</div>
			<button
				onClick={() => setIsAudioListOpen(true)}
				className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/95 px-3 py-2 text-xs font-semibold text-[#111827] shadow-lg backdrop-blur md:hidden"
			>
				<Headphones className="h-4 w-4 text-[#4F46E5]" />
				Audio
			</button>
			<Toolbar users={users.length ? users : activeUsers} canEdit={canEdit} />
			<PagePanel />
			<ActiveUsers users={users.length ? users : activeUsers} className="max-md:hidden" />
			<LiveCursors cursors={cursors} />

			<AudioNotesPanel
				notes={audioNotes}
				onDelete={deleteAudioNote}
			/>

			<ExportOptions isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
			<AudioNote
				isOpen={isAudioOpen}
				onClose={() => setIsAudioOpen(false)}
				onSave={handleSaveAudio}
			/>
			<AudioNotesList
				isOpen={isAudioListOpen}
				onClose={() => setIsAudioListOpen(false)}
				notes={audioNotes}
				onDelete={deleteAudioNote}
			/>
		</div>
	);
}
