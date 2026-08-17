import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem('token');

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection error:', err.message);
    });
  } else {
    // Refresh auth token if changed
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinNegotiationRoom = (
  negotiationId: string,
  callback?: (response: { success: boolean; message: string; negotiationId?: string; roomName?: string }) => void
) => {
  const s = getSocket();
  s.emit('negotiation:join', negotiationId, callback);
};

export const subscribeToOffers = (
  callback: (data: { negotiationId: string; offer: any }) => void
) => {
  const s = getSocket();
  s.off('negotiation:offer');
  s.on('negotiation:offer', callback);
  return () => {
    s.off('negotiation:offer', callback);
  };
};

export const subscribeToStatus = (
  callback: (data: { negotiationId: string; status: string; agreedBudget?: number; updatedBy: any }) => void
) => {
  const s = getSocket();
  s.off('negotiation:status');
  s.on('negotiation:status', callback);
  return () => {
    s.off('negotiation:status', callback);
  };
};
