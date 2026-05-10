import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import QrSection from './components/QrSection';
import JoinSession from './components/JoinSession';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/join/:token" element={<JoinSession />} />
          <Route path="*" element={
            <div style={{ minHeight: '100vh', padding: '1rem 0' }}>
              <Navbar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/scanner" element={<QrSection />} />
              </Routes>
            </div>
          } />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
