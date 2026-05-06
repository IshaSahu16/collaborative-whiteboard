import api from '../lib/api';

export const addMember = (boardId, data) =>
  api(`/api/boards/${boardId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateMemberRole = (boardId, data) =>
  api(`/api/boards/${boardId}/members`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const removeMember = (boardId, userId) =>
  api(`/api/boards/${boardId}/members/${userId}`, {
    method: 'DELETE',
  });