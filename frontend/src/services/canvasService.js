import api from '../lib/api';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getBoardPages = (boardId) =>
	api(`/api/boards/${boardId}/pages`);

export const createBoardPage = (boardId, data) =>
	api(`/api/boards/${boardId}/pages`, {
		method: 'POST',
		body: JSON.stringify(data),
	});

export const deleteBoardPage = (boardId, pageId) =>
	api(`/api/boards/${boardId}/pages/${pageId}`, {
		method: 'DELETE',
	});

export const getPageElements = (boardId, pageId) =>
	api(`/api/boards/${boardId}/canvas/pages/${pageId}/elements`);

export const saveElement = (boardId, data) =>
	api(`/api/boards/${boardId}/canvas/elements`, {
		method: 'POST',
		body: JSON.stringify(data),
	});

export const deleteElement = (boardId, elementId) =>
	api(`/api/boards/${boardId}/canvas/elements/${elementId}`, {
		method: 'DELETE',
	});

export const getAudioNotes = (boardId, pageId) =>
	api(`/api/boards/${boardId}/canvas/pages/${pageId}/audio`);

export const deleteAudioNote = (boardId, audioNoteId) =>
	api(`/api/boards/${boardId}/canvas/audio/${audioNoteId}`, {
		method: 'DELETE',
	});

export const uploadAudioNote = async (boardId, { pageId, x, y, label, file }) => {
	const form = new FormData();
	form.append('audio', file);
	form.append('pageId', pageId);
	form.append('x', String(x));
	form.append('y', String(y));
	if (label) form.append('label', label);

	const res = await fetch(`${BASE_URL}/api/boards/${boardId}/canvas/audio`, {
		method: 'POST',
		credentials: 'include',
		body: form,
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.message || 'Failed to upload audio');
	}
	return data;
};
