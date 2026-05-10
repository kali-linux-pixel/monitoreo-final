import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Vite proxy translates this to http://localhost:3000 during dev
    const socketInstance = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to monitor server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socketInstance.on('locationUpdate', (data) => {
      setDevices(prev => {
        const index = prev.findIndex(d => d.deviceId === data.deviceId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data, lastSeen: new Date() };
          return updated;
        }
        return [...prev, { ...data, lastSeen: new Date() }];
      });
    });

    setSocket(socketInstance);

    // Fetch existing devices initially from API
    fetch('/api/devices')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setDevices(data);
      })
      .catch(err => console.error('Failed to fetch devices', err));

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emitLocation = (data) => {
    if (socket) {
      socket.emit('updateLocation', data);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, devices, isConnected, emitLocation }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
