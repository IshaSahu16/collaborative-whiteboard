import api from '../lib/api';

export const registerUser = (data) =>
  api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const loginUser = (data) =>
  api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const logoutUser = () =>
  api('/api/auth/logout', {
    method: 'POST',
  });

export const getCurrentUser = () =>
  api('/api/auth/me');