import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ScanQrCode, Activity, Shield } from 'lucide-react';

const Navbar = () => {
  return (
    <nav style={{
      position: 'sticky',
      top: '1rem',
      margin: '0 1.5rem 1.5rem',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem'
    }} className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Shield className="brand-gradient" size={32} style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }} />
        <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="brand-gradient">
          NEXUS WATCH
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <NavLink 
          to="/" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            color: isActive ? '#fff' : '#94a3b8',
            background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease',
            fontWeight: 600
          })}
        >
          <LayoutDashboard size={18} />
          Panel
        </NavLink>
        
        <NavLink 
          to="/scanner" 
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            color: isActive ? '#fff' : '#94a3b8',
            background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease',
            fontWeight: 600
          })}
        >
          <ScanQrCode size={18} />
          Scanner
        </NavLink>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          boxShadow: '0 0 8px #10b981'
        }} />
        <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>Sistema Activo</span>
      </div>
    </nav>
  );
};

export default Navbar;
