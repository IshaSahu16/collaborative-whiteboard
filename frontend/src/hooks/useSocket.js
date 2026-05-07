import { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';
import useCanvasStore from '@/store/canvasStore';

const hashColor = (value) => {
	if (!value) return '#4F46E5';
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) {
		hash = value.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = Math.abs(hash) % 360;
	return `hsl(${hue}, 70%, 50%)`;
};

export default function useSocket({ boardId, user }) {
	const socketRef = useRef(null);
	const rafRef = useRef(null);
	const pendingCursorRef = useRef(null);
	const clientIdRef = useRef(null);
	const knownUsersRef = useRef({});

	const [knownUsers, setKnownUsers] = useState({});
	const [cursors, setCursors] = useState({});
	const [localCursor, setLocalCursor] = useState(null);

	const {
		startRemoteStroke,
		updateRemoteStroke,
		commitRemoteStroke,
		startRemoteShape,
		updateRemoteShape,
		commitRemoteShape,
		deleteElementLocal,
		updateShapePositionLocal,
		updateTextPositionLocal,
		undo,
	} = useCanvasStore();

	useEffect(() => {
		if (!boardId || !user) return undefined;

		if (!clientIdRef.current) {
			const stored = typeof window !== 'undefined' ? window.localStorage.getItem('collabCanvasClientId') : null;
			if (stored) clientIdRef.current = stored;
			else if (typeof window !== 'undefined') {
				const nextId = `guest-${crypto.randomUUID()}`;
				window.localStorage.setItem('collabCanvasClientId', nextId);
				clientIdRef.current = nextId;
			}
		}

		const identity = { _id: user._id || user.id, name: user.name || 'User' };

		const socket = getSocket();
		socketRef.current = socket;

		socket.emit('board:join', { boardId, user: identity });

		const handleCursorMove = (data) => {
			if (!data?.userId) return;
			setCursors((prev) => ({
				...prev,
				[data.userId]: {
					userId: data.userId,
					name: data.name || prev[data.userId]?.name || knownUsersRef.current[data.userId]?.name || 'User',
					x: data.x,
					y: data.y,
					color: hashColor(data.userId),
				},
			}));
		};

		const handleUserJoined = (data) => {
			if (!data?.userId) return;
			setKnownUsers((prev) => {
				const next = {
					...prev,
					[data.userId]: {
						id: data.userId,
						name: data.name || 'Guest',
					},
				};
				knownUsersRef.current = next;
				return next;
			});
		};

		const handleUserLeft = (data) => {
			if (!data?.userId) return;
			setKnownUsers((prev) => {
				const next = { ...prev };
				delete next[data.userId];
				knownUsersRef.current = next;
				return next;
			});
			setCursors((prev) => {
				const next = { ...prev };
				delete next[data.userId];
				return next;
			});
		};

		const handleRoomPresence = (payload) => {
			const list = Array.isArray(payload?.users) ? payload.users : [];
			const next = {};
			list.forEach((item) => {
				if (!item?.id) return;
				next[item.id] = { id: item.id, name: item.name || 'Guest' };
			});
			knownUsersRef.current = next;
			setKnownUsers(next);
		};

		const handleDrawStart = (data) => {
			if (!data?.userId) return;
			if (data.kind === 'pencil') {
				startRemoteStroke(data.userId, {
					id: data.strokeId,
					tool: data.tool || 'pen',
					point: data.point,
					color: data.color,
					width: data.width,
				});
			} else if (data.kind === 'shape') {
				startRemoteShape(data.userId, {
					id: data.shapeId,
					type: data.shapeType,
					startX: data.startX,
					startY: data.startY,
					endX: data.endX,
					endY: data.endY,
					color: data.color,
					width: data.width,
				});
			}
		};

		const handleDrawMove = (data) => {
			if (!data?.userId) return;
			if (data.kind === 'pencil') {
				updateRemoteStroke(data.userId, data.point);
			} else if (data.kind === 'shape') {
				updateRemoteShape(data.userId, { endX: data.endX, endY: data.endY });
			}
		};

		const handleDrawEnd = (data) => {
			if (!data?.userId) return;
			if (data.kind === 'pencil') {
				commitRemoteStroke(data.userId);
			} else if (data.kind === 'shape') {
				commitRemoteShape(data.userId);
			}
		};

		const handleElementDelete = (data) => {
			if (!data?.elementId || !data?.elementType) return;
			deleteElementLocal(data.elementType, data.elementId);
		};

		const handleElementMove = (data) => {
			if (!data?.elementId || !data?.elementType) return;
			if (data.elementType === 'shape') {
				updateShapePositionLocal(data.elementId, data.coords || {});
			} else if (data.elementType === 'text') {
				updateTextPositionLocal(data.elementId, data.position || {});
			}
		};

		socket.on('cursor:move', handleCursorMove);
		socket.on('user:joined', handleUserJoined);
		socket.on('user:left', handleUserLeft);
		socket.on('room:presence', handleRoomPresence);
		socket.on('draw:start', handleDrawStart);
		socket.on('draw:move', handleDrawMove);
		socket.on('draw:end', handleDrawEnd);
		socket.on('element:delete', handleElementDelete);
		socket.on('element:move', handleElementMove);
		socket.on('canvas:undo', undo);

		return () => {
			socket.emit('board:leave', { boardId });
			socket.off('cursor:move', handleCursorMove);
			socket.off('user:joined', handleUserJoined);
			socket.off('user:left', handleUserLeft);
			socket.off('room:presence', handleRoomPresence);
			socket.off('draw:start', handleDrawStart);
			socket.off('draw:move', handleDrawMove);
			socket.off('draw:end', handleDrawEnd);
			socket.off('element:delete', handleElementDelete);
			socket.off('element:move', handleElementMove);
			socket.off('canvas:undo', undo);
		};
	}, [boardId, user, startRemoteStroke, updateRemoteStroke, commitRemoteStroke, startRemoteShape, updateRemoteShape, commitRemoteShape, deleteElementLocal, updateShapePositionLocal, updateTextPositionLocal, undo]);

	const sendCursorMove = (payload) => {
		if (!socketRef.current || !boardId || !user) return;
		const userId = user?._id || user?.id || clientIdRef.current;
		const name = user?.name || 'User';
		setLocalCursor({
			userId,
			name,
			x: payload.x,
			y: payload.y,
			color: hashColor(userId),
		});
		pendingCursorRef.current = payload;
		if (rafRef.current) return;
		rafRef.current = requestAnimationFrame(() => {
			const latest = pendingCursorRef.current;
			if (latest) {
				socketRef.current.emit('cursor:move', {
					boardId,
					userId,
					name,
					x: latest.x,
					y: latest.y,
				});
			}
			rafRef.current = null;
		});
	};

	const sendDrawStart = (payload) => {
		if (!socketRef.current || !boardId || !user) return;
		const userId = user?._id || user?.id || clientIdRef.current;
		socketRef.current.emit('draw:start', { boardId, userId, ...payload });
	};

	const sendDrawMove = (payload) => {
		if (!socketRef.current || !boardId || !user) return;
		const userId = user?._id || user?.id || clientIdRef.current;
		socketRef.current.emit('draw:move', { boardId, userId, ...payload });
	};

	const sendDrawEnd = (payload) => {
		if (!socketRef.current || !boardId || !user) return;
		const userId = user?._id || user?.id || clientIdRef.current;
		socketRef.current.emit('draw:end', { boardId, userId, ...payload });
	};

	const sendElementDelete = (payload) => {
		if (!socketRef.current || !boardId || !user) return;
		const userId = user?._id || user?.id || clientIdRef.current;
		socketRef.current.emit('element:delete', { boardId, userId, ...payload });
	};

	const sendElementMove = (payload) => {
		if (!socketRef.current || !boardId || !user) return;
		const userId = user?._id || user?.id || clientIdRef.current;
		socketRef.current.emit('element:move', { boardId, userId, ...payload });
	};

	const users = useMemo(() => {
		const list = [];
		const selfId = user?._id || user?.id;
		if (selfId) {
			list.push({ id: selfId, name: user?.name || 'You', avatar: user?.avatar });
		}
		Object.values(knownUsers).forEach((u) => {
			if (u.id !== selfId) list.push(u);
		});
		return list;
	}, [knownUsers, user]);

	const cursorList = useMemo(() => {
		const list = Object.values(cursors);
		if (localCursor && !list.find((c) => c.userId === localCursor.userId)) {
			list.push(localCursor);
		}
		return list;
	}, [cursors, localCursor]);

	return {
		cursors: cursorList,
		users,
		sendCursorMove,
		sendDrawStart,
		sendDrawMove,
		sendDrawEnd,
		sendElementDelete,
		sendElementMove,
	};
}
