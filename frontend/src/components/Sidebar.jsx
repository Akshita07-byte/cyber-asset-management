import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Laptop, 
  Building2, 
  ClipboardList, 
  Wrench, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  UserCheck
} from 'lucide-react';

const Sidebar = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'assets', name: 'Asset Management', icon: Laptop, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'vendors', name: 'Vendors Directory', icon: Building2, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'assignments', name: 'Assignments', icon: ClipboardList, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'maintenance', name: 'Maintenance Center', icon: Wrench, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3, roles: ['Admin', 'Manager'] },
    { id: 'settings', name: 'Profile Settings', icon: Settings, roles: ['Admin', 'Manager', 'Employee'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="glass-panel sidebar" style={{
      width: '260px',
      height: '100vh',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderLeft: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      borderRadius: '0',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
          }}>
            <Laptop size={20} color="#0a0b10" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }} className="glow-text">CYBER-ASSET</h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>v1.0 ENTERPRISE</span>
          </div>
        </div>

        {/* User Card */}
        <div className="glass-card" style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--accent-cyan)'
          }}>
            <UserCheck size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', margin: 0 }}>
              {user?.role.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: isActive ? 'var(--bg-glass-hover)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--border-glass-glow)' : 'transparent',
                  borderRadius: 'var(--border-radius-sm)',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} /> Light Workspace
            </>
          ) : (
            <>
              <Moon size={16} /> Cyber Workspace
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}
        >
          <LogOut size={16} /> Disconnect
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
