const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = async (endpoint, options = {}) => {
  const authToken = typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
    credentials: 'include', // sends JWT cookie automatically
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export default api;