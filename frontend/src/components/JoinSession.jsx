import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Camera, MapPin, Power, AlertCircle, CheckCircle } from 'lucide-react';

const JoinSession = () => {
  const { token } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [step, setStep] = useState('loading'); // 'loading', 'consent', 'active', 'error'
  const [statusMsg, setStatusMsg] = useState('');
  
  const socketRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    // 1. Validar Token con API
    fetch(`/api/sessions/${token}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setSessionData(res.data);
          setStep('consent');
        } else {
          setStep('error');
          setStatusMsg(res.error || 'El enlace no es válido.');
        }
      })
      .catch(() => {
        setStep('error');
        setStatusMsg('Fallo de conexión con el servidor.');
      });

    return () => cleanup();
  }, [token]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const handleStartSharing = async () => {
    setStep('loading');
    setStatusMsg('Pidiendo permisos...');

    try {
      // 1. Pedir Permisos Multimedia
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      // 2. Conectar Socket e Ingresar a la Sala de la Sesión
      const socket = io(window.location.origin, { path: '/socket.io' });
      socketRef.current = socket;

      socket.on('connect', () => {
        // Informamos al servidor que somos este dispositivo
        socket.emit('registerSessionDevice', { token, name: sessionData.deviceName });
      });

      // 3. Configurar WatchPosition para GPS continuo
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            socket.emit('updateLocation', {
              deviceId: token,
              name: sessionData.deviceName || 'Dispositivo Remoto',
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
            });
          },
          (err) => console.warn('Error de geolocalización:', err),
          { enableHighAccuracy: true }
        );
      }

      // Enviar Stream en WebRTC Simple (Broadcaster)
      // Para esta Demo, replicamos el envío al socket para signalización básica 
      socket.on('requestOffer', async (data) => {
          const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          socket.emit('offer', { to: data.from, offer: pc.localDescription });
          
          socket.on('answer', async (ans) => {
             if(ans.from === data.from) {
                 await pc.setRemoteDescription(new RTCSessionDescription(ans.answer));
             }
          });
      });

      setStep('active');
      
      // Asignar video local para feedback visual
      setTimeout(() => {
        if(videoRef.current) videoRef.current.srcObject = stream;
      }, 100);

    } catch (err) {
      console.error(err);
      setStep('consent');
      alert("Es obligatorio aceptar permisos de Cámara, Micrófono y GPS para iniciar esta sesión de seguridad.");
    }
  };

  const handleFinish = () => {
    cleanup();
    window.location.reload(); // Simplemente reiniciar interfaz o redirigir
  };

  if (step === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
           <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
           <p>{statusMsg || 'Cargando...'}</p>
           <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center', color: '#fff' }}>
        <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Enlace Inválido</h2>
        <p style={{ color: '#94a3b8' }}>{statusMsg}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        {step === 'consent' && (
          <motion.div
            key="consent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card"
            style={{ padding: '2rem', marginTop: '2rem' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <ShieldCheck size={40} className="brand-gradient" />
              </div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Monitoreo de Seguridad</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Has sido invitado a una sesión de acompañamiento en tiempo real.</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
               <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '1rem' }}>Esta sesión compartirá:</h3>
               <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                 <MapPin size={18} color="#60a5fa" />
                 <span>Ubicación GPS en tiempo real</span>
               </div>
               <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                 <Camera size={18} color="#a78bfa" />
                 <span>Transmisión de Video y Micrófono</span>
               </div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.85rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }}/>
              <p>Solo el tutor autorizado que generó este enlace tendrá acceso visual a los datos. Puedes finalizar la transmisión cerrando esta pestaña en cualquier momento.</p>
            </div>

            <button onClick={handleStartSharing} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '1rem' }}>
              Aceptar e Iniciar Sesión
            </button>
          </motion.div>
        )}

        {step === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                <span style={{ fontWeight: 600 }}>Transmisión Activa</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {token.slice(0,6)}</span>
            </div>

            <div style={{ flex: 1, position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', background: '#000', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', minHeight: '300px' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '0.5rem', borderRadius: '50%' }}><Camera size={20} color="#fff" /></div>
                 <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '0.5rem', borderRadius: '50%' }}><MapPin size={20} color="#fff" /></div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Compartiendo en Vivo</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Mantén esta pantalla encendida para asegurar la máxima precisión de ubicación.</p>
              <button onClick={handleFinish} style={{ background: '#ef4444', width: '100%', border: 'none', padding: '1rem', color: '#fff', borderRadius: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Power size={18} /> Finalizar y Desconectar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default JoinSession;
