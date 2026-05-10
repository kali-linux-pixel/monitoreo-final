import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import DeviceMap from './DeviceMap';
import { Map as MapIcon, Video, Users, Battery, Signal, Play, Square } from 'lucide-react';

const Dashboard = () => {
  const { socket, devices, isConnected } = useSocket();
  const { localStream, startLocalStream, stopStreams } = useWebRTC(socket);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const handleToggleStream = async () => {
    if (!isStreaming) {
      try {
        await startLocalStream();
        setIsStreaming(true);
      } catch (e) {
        alert("Error al iniciar la cámara: " + e.message);
      }
    } else {
      stopStreams();
      setIsStreaming(false);
    }
  };

  const videoRef = React.useRef();
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isStreaming]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid-dashboard"
    >
      {/* Header Stats */}
      <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '1.5rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Dispositivos</span>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users className="brand-gradient" /> {devices.length}
          </h2>
        </div>
        <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Estado Servidor</span>
          <h2 style={{ fontSize: '1.25rem', color: isConnected ? '#10b981' : '#ef4444', marginTop: '0.5rem' }}>
            {isConnected ? 'EN LÍNEA' : 'DESCONECTADO'}
          </h2>
        </div>
      </div>

      {/* MAP VIEW */}
      <div className="glass-card" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', height: '500px' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapIcon size={20} className="brand-gradient"/>
          <h3 style={{ fontSize: '1.1rem' }}>Rastreo Global</h3>
        </div>
        <div style={{ flex: 1, padding: '1rem', position: 'relative' }}>
          <DeviceMap devices={devices} />
        </div>
      </div>

      {/* DEVICE LIST */}
      <div className="glass-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', height: '500px' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Actividad Reciente</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <AnimatePresence>
            {devices.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
                Esperando actividad...
              </div>
            ) : (
              devices.map((dev, idx) => (
                <motion.div
                  key={dev.deviceId || idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600 }}>{dev.name || 'Dispositivo'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>ID: {dev.deviceId}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#60a5fa', fontSize: '0.85rem' }}>
                      {dev.location?.lat?.toFixed(4)}, {dev.location?.lon?.toFixed(4)}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <Signal size={12} /> Activo
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* STREAMING VIEW */}
      <div className="glass-card" style={{ gridColumn: 'span 12', padding: '1.5rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Video size={20} className="brand-gradient" />
            <h3 style={{ fontSize: '1.25rem' }}>Centro de Transmisión</h3>
          </div>
          <button 
            onClick={handleToggleStream} 
            className={isStreaming ? "btn-secondary" : "btn-primary"}
          >
            {isStreaming ? <><Square size={18} fill="#fff"/> Detener Cámara</> : <><Play size={18} fill="#fff"/> Iniciar Cámara</>}
          </button>
        </div>
        
        <div style={{
          aspectRatio: '16/9',
          maxWidth: '800px',
          margin: '0 auto',
          background: '#000',
          borderRadius: '1rem',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
        }}>
          {isStreaming ? (
             <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <Video size={48} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>La cámara está apagada</p>
            </div>
          )}
          {isStreaming && (
             <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(239, 68, 68, 0.8)', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }}></div> REC
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
