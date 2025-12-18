import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

type WebSocketContextType = {
    lastMessage: any;
    isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const connect = () => {
        // Use a publicly accessible URL if needed, for now localhost
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//localhost:8000/api/v1/ws`;

        try {
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('WebSocket Connected');
                setIsConnected(true);
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                } catch (e) {
                    console.error("Failed to parse WS message", e);
                }
            };

            socket.onclose = () => {
                console.log('WebSocket Disconnected');
                setIsConnected(false);
                // Reconnect after 3s
                reconnectTimeoutRef.current = setTimeout(connect, 3000);
            };

            socket.onerror = (err) => {
                console.error('WebSocket Error', err);
                socket.close();
            };
        } catch (error) {
            console.error("WS Connection failed", error);
        }
    };

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) socketRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ lastMessage, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
