// Client-side Socket.IO – connects to backend (e.g. Railway). Set NEXT_PUBLIC_SOCKET_URL to backend URL.
'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

let socketInstance: Socket | null = null;
const isDev = process.env.NODE_ENV !== 'production';

function debugLog(...args: unknown[]) {
  if (isDev) console.log(...args);
}

function debugError(...args: unknown[]) {
  if (isDev) console.error(...args);
}

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!socketInstance) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      window.location.origin;
    debugLog('🔌 Initializing socket connection to:', socketUrl);
    socketInstance = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
    });

    // Set up global connection handlers
    socketInstance.on('connect', () => {
      debugLog('✅ Socket connected, ID:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      debugLog('❌ Socket disconnected, reason:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      debugError('❌ Socket connection error:', error);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      debugLog('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      debugLog('🔄 Reconnection attempt', attemptNumber);
    });

    socketInstance.on('reconnect_error', (error) => {
      debugError('❌ Reconnection error:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      debugError('❌ Reconnection failed');
    });
  }

  return socketInstance;
}

export function useSocket() {
  const [socket] = useState<Socket | null>(() =>
    typeof window === 'undefined' ? null : getSocket(),
  );
  const [isConnected, setIsConnected] = useState(socket?.connected ?? false);

  useEffect(() => {
    if (!socket) {
      return;
    }

    // Update connection state
    const handleConnect = () => {
      debugLog('✅ useSocket: Socket connected, ID:', socket?.id);
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      debugLog('❌ useSocket: Socket disconnected, reason:', reason);
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return { socket, isConnected };
}
