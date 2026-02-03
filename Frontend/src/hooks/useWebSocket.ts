import { useEffect, useRef, useState, useCallback } from 'react';
import type { Attack } from '../types';

interface UseWebSocketReturn {
    isConnected: boolean;
    attacks: Attack[];
    connect: () => void;
    disconnect: () => void;
}

export const useWebSocket = (url: string = 'ws://localhost:8000/ws/attacks'): UseWebSocketReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [attacks, setAttacks] = useState<Attack[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Only add if it's an attack object (has id and category)
                    if (data.id && data.category) {
                        console.log('📨 New attack received:', data);
                        setAttacks((prev) => [data, ...prev].slice(0, 50));
                    }
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };

            wsRef.current.onclose = () => {
                console.log('❌ WebSocket disconnected');
                setIsConnected(false);

                // Auto-reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    connect();
                }, 3000);
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            setIsConnected(false);
        }
    }, [url]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
    }, []);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return { isConnected, attacks, connect, disconnect };
};
