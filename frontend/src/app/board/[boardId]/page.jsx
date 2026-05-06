'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mic, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Canvas from '@/components/canvas/Canvas';
import Toolbar from '@/components/canvas/Toolbar';
import PagePanel from '@/components/canvas/PagePanel';
import ActiveUsers from '@/components/canvas/ActiveUsers';
import LiveCursors from '@/components/canvas/LiveCursors';
import ExportOptions from '@/components/canvas/ExportOptions';
import AudioNote from '@/components/canvas/AudioNote';
import AudioNotePin from '@/components/canvas/AudioNotePin';
import useSocket from '@/hooks/useSocket';
import useAuthStore from '@/store/authStore';
import useCanvasStore from '@/store/canvasStore';
import { getBoardById } from '@/services/boardService';

export default function BoardPage() {
	const params = useParams();
	const boardId = params?.boardId;

	const { user } = useAuthStore();
	const { audioNotes, addAudioNote, deleteAudioNote, initializeBoard } = useCanvasStore();
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
	const [isLoadingBoard, setIsLoadingBoard] = useState(true);
	const [isExportOpen, setIsExportOpen] = useState(false);
	const [isAudioOpen, setIsAudioOpen] = useState(false);

	useEffect(() => {
		const loadBoard = async () => {
			if (!boardId) {
				setIsLoadingBoard(false);
				return;
			}

			setIsLoadingBoard(true);
			try {
				const res = await getBoardById(boardId);
				setBoardTitle(res?.data?.title || 'Untitled Board');
			} catch (error) {
				console.error('Failed to load board:', error);
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
		<div className="flex h-screen w-full flex-col overflow-hidden bg-[#F8FAFC]">
			<div className="z-30 flex items-center justify-between border-b border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur">
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
						<p className="text-xs text-[#6B7280]">Board ID: {boardId}</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => setIsAudioOpen(true)}>
						<Mic className="h-4 w-4" />
						Audio Note
					</Button>
					<Button size="sm" onClick={() => setIsExportOpen(true)}>
						<Download className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className="relative flex-1 overflow-hidden">
				<Canvas
					onCursorMove={sendCursorMove}
					onDrawStart={sendDrawStart}
					onDrawMove={sendDrawMove}
					onDrawEnd={sendDrawEnd}
					onElementDelete={sendElementDelete}
					onElementMove={sendElementMove}
				/>
			</div>
			<Toolbar />
			<PagePanel />
			<ActiveUsers users={users.length ? users : activeUsers} />
			<LiveCursors cursors={cursors} />

			{audioNotes.map((note) => (
				<AudioNotePin
					key={note.id}
					audioUrl={note.url}
					position={note.position}
					onDelete={() => deleteAudioNote(note.id)}
				/>
			))}

			<ExportOptions isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
			<AudioNote
				isOpen={isAudioOpen}
				onClose={() => setIsAudioOpen(false)}
				onSave={handleSaveAudio}
			/>
		</div>
	);
}
