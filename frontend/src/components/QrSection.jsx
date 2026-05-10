import React, { useState } from 'react';
import { Scanner, useDevices } from '@yudiel/react-qr-scanner';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { QrCode, CheckCircle, AlertTriangle, RefreshCw, KeyRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const QrSection = () => {
  const { emitLocation } = useSocket();
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState('scan'); 
  
  const [generatedToken, setGeneratedToken] = useState(null);
  const [manualName, setManualName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const devices = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  const handleGenerateSession = async () => {
     if (!manualName) return alert("Por favor ingresa el nombre de la persona o dispositivo a monitorear");
     setIsLoading(true);
     try {
       const res = await fetch('/api/sessions/generate', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ deviceName: manualName })
       });
       const data = await res.json();
       if(data.success) {
         setGeneratedToken(data.data.token);
       }
     } catch (e) {
       console.error(e);
     }
     setIsLoading(false);
  };

  // Determinar enlace absoluto para el QR
  const absoluteJoinUrl = generatedToken ? `${window.location.origin}/join/${generatedToken}` : '';

  const handleScan = (result) => {
    if (result && result.length > 0) {
      try {
        const text = result[0].rawValue;
        setScanResult({ type: 'success', message: `Detectado: ${text}` });
        setIsScanning(false);
        
        // Try to parse object if JSON
        let deviceData = { deviceId: text, name: 'Dispositivo QR' };
        try {
           const parsed = JSON.parse(text);
           deviceData = { ...deviceData, ...parsed };
        } catch (e) {}

        // Mock registration by sending current location from the dashboard device
        if ('geolocation' in navigator) {
           navigator.geolocation.getCurrentPosition((pos) => {
              emitLocation({
                 deviceId: deviceData.deviceId,
                 name: deviceData.name,
                 lat: pos.coords.latitude,
                 lon: pos.coords.longitude
              });
              setScanResult({ type: 'success', message: '✅ Dispositivo Vinculado y Localizado!' });
           });
        }
      } catch (err) {
        setScanResult({ type: 'error', message: 'QR inválido' });
      }
    }
  };

  const registerManual = () => {
     if (!manualName) return alert("Ingresa un nombre");
     if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
           emitLocation({
              deviceId: manualId,
              name: manualName,
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
           });
           setScanResult({ type: 'success', message: `✅ ${manualName} vinculado exitosamente.` });
           setManualName('');
        });
     }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}
    >
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => setMode('scan')}
            style={{ flex: 1, padding: '1.25rem', background: mode === 'scan' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', color: mode === 'scan' ? '#fff' : '#94a3b8', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={18} /> Escanear QR
          </button>
          <button 
            onClick={() => setMode('generate')}
            style={{ flex: 1, padding: '1.25rem', background: mode === 'generate' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', color: mode === 'generate' ? '#fff' : '#94a3b8', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={18} /> Generar / Manual
          </button>
        </div>

        <div style={{ padding: '2rem', textAlign: 'center' }}>
          {mode === 'scan' ? (
            <div>
              <h2 style={{ marginBottom: '0.5rem' }}>Vincular Dispositivo</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>Escanea el código para activar el rastreo</p>
              
              {isScanning ? (
                <div style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '1rem', overflow: 'hidden', position: 'relative', border: '2px solid var(--accent-primary)' }}>
                  
                  {/* Selector Manual de Cámara si hay múltiples disponibles */}
                  {devices && devices.length > 1 && (
                    <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: '80%' }}>
                      <select 
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.5rem', outline: 'none', fontSize: '0.8rem' }}
                      >
                        <option value="">🔍 Auto-Seleccionar Cámara</option>
                        {devices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>{d.label || `Cámara ${d.deviceId.slice(0, 5)}`}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Scanner
                    onScan={handleScan}
                    onError={(err) => console.error(err)}
                    constraints={selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: 'environment' }}
                  />
                  <button 
                    onClick={() => { setIsScanning(false); setSelectedDeviceId(''); }} 
                    className="btn-secondary" 
                    style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)' }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  
                  {/* Selector PREVIO al escaneo si hay dispositivos detectados */}
                  {devices && devices.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left', width: '100%', maxWidth: '300px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Elegir Cámara Preferida:</label>
                      <select 
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}
                      >
                        <option value="">Predeterminada (Trasera)</option>
                        {devices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>{d.label || `Cámara ${d.deviceId.slice(0,5)}`}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={{ 
                    width: '180px', height: '180px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem'
                  }}>
                    <QrCode size={64} style={{ opacity: 0.3 }} />
                  </div>
                  <button className="btn-primary" onClick={() => { setScanResult(null); setIsScanning(true); }}>
                    Iniciar Escáner
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ maxWidth: '450px', margin: '0 auto' }}>
              <h2 style={{ marginBottom: '1rem' }}>Crear Sesión de Monitoreo</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
                 Define un identificador para generar un enlace de acceso seguro y temporal.
              </p>
              
              {!generatedToken ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                    <div>
                       <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Nombre del Acompañado / Dispositivo</label>
                       <input 
                          type="text" 
                          placeholder="Ej. Mi Hijo, Juan Pérez" 
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          style={{ 
                             width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                             padding: '1rem', borderRadius: '0.75rem', color: 'white', outline: 'none', fontSize: '1rem'
                          }}
                       />
                    </div>
                    <button 
                      className="btn-primary" 
                      style={{ justifyContent: 'center', marginTop: '0.5rem', padding: '1rem' }} 
                      onClick={handleGenerateSession}
                      disabled={isLoading}
                    >
                       {isLoading ? 'Generando...' : 'Generar Sesión Segura'}
                    </button>
                 </div>
              ) : (
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1.5rem', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
                       <QRCodeSVG 
                          value={absoluteJoinUrl} 
                          size={200}
                          fgColor="#0f172a"
                          bgColor="#ffffff"
                       />
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                       <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem', color: '#10b981', fontSize: '0.9rem', textAlign: 'center' }}>
                          ✅ Sesión para "{manualName}" Generada con éxito.
                       </div>
                       
                       <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Enlace Directo</label>
                       <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input 
                             type="text" 
                             readOnly 
                             value={absoluteJoinUrl}
                             style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                          />
                          <button onClick={() => navigator.clipboard.writeText(absoluteJoinUrl).then(() => alert('Copiado'))} className="btn-secondary" style={{ padding: '0.75rem' }}>Copiar</button>
                       </div>

                       <button 
                          onClick={() => { setGeneratedToken(null); setManualName(''); }} 
                          style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                       >
                          Generar otra sesión
                       </button>
                    </div>
                 </motion.div>
              )}
            </div>
          )}

          {scanResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '2rem',
                padding: '1rem',
                borderRadius: '0.75rem',
                background: scanResult.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: scanResult.type === 'success' ? '#10b981' : '#ef4444',
                border: `1px solid ${scanResult.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {scanResult.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              {scanResult.message}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QrSection;
