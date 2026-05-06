import api from '../lib/api';

export const getMyBoards = () =>
  api('/api/boards');

export const createBoard = (data) =>
  api('/api/boards', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const deleteBoard = (boardId) =>
  api(`/api/boards/${boardId}`, {
    method: 'DELETE',
  });

export const getBoardById = (boardId) =>
  api(`/api/boards/${boardId}`);

export const updateBoard = (boardId, data) =>
  api(`/api/boards/${boardId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// export const getShareLink = (shareLink) =>
//   `${window.location.origin}/invite/${shareLink}`;

export const joinBoard = (shareLink) =>
  api(`/api/boards/join/${shareLink}`, { method: 'POST' });

export const getBoardByShareLink = (shareLink) =>
  api(`/api/boards/join/${shareLink}`);

export const joinBoardByShareLink = (shareLink) =>
  api(`/api/boards/join/${shareLink}`, { method: 'POST' });

export const getShareableLink = (shareLink) =>
  `${window.location.origin}/invite/${shareLink}`;