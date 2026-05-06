import { io } from 'socket.io-client';

const SOCKET_URL =
	process.env.NEXT_PUBLIC_SOCKET_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:5000';

let socketInstance = null;

export const getSocket = () => {
	if (!socketInstance) {
		socketInstance = io(SOCKET_URL, {
			withCredentials: true,
			transports: ['websocket'],
		});
	}
	return socketInstance;
};

export const disconnectSocket = () => {
	if (socketInstance) {
		socketInstance.disconnect();
		socketInstance = null;
	}
};
