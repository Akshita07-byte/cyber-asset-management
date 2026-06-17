import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Laptop, Key, User, Shield, Info, Phone, Building } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  
  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regRole, setRegRole] = useState('Employee');
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const result = await login(loginUsername, loginPassword);
    setLoginLoading(false);

    if (!result.success) {
      setLoginError(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);

    const userData = {
      username: regUsername,
      password: regPassword,
      email: regEmail,
      first_name: regFirstName,
      last_name: regLastName,
      role: regRole,
      phone_number: regPhone,
      department: regDept
    };

    const result = await register(userData);
    setRegLoading(false);

    if (result.success) {
      setRegSuccess("Account registered successfully! You can now log in.");
      // Clear inputs
      setRegUsername('');
      setRegPassword('');
      setRegEmail('');
      setRegFirstName('');
      setRegLastName('');
      setRegPhone('');
      setRegDept('');
      setIsLogin(true);
    } else {
      setRegError(result.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #111424 0%, #05060b 100%)',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)'
          }}>
            <Laptop size={28} color="#0a0b10" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }} className="gradient-text">CYBER-ASSET</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enterprise Assets Control & Monitoring Hub</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)' }}>
          <button 
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: isLogin ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: isLogin ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'var(--transition-smooth)'
            }}
          >
            Access Portal
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: !isLogin ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: !isLogin ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'var(--transition-smooth)'
            }}
          >
            Create Credentials
          </button>
        </div>

        {/* Form rendering */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {loginError && (
              <div style={{ padding: '0.75rem', background: 'var(--status-retired-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--border-radius-sm)', color: '#ef4444', fontSize: '0.85rem' }}>
                {loginError}
              </div>
            )}
            {regSuccess && (
              <div style={{ padding: '0.75rem', background: 'var(--status-available-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--border-radius-sm)', color: '#10b981', fontSize: '0.85rem' }}>
                {regSuccess}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="admin, manager, or employee" 
                  style={{ paddingLeft: '2.5rem' }} 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Security Key (Password)</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••••••" 
                  style={{ paddingLeft: '2.5rem' }} 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
              disabled={loginLoading}
            >
              {loginLoading ? "Authorizing..." : "Initiate Connection"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {regError && (
              <div style={{ padding: '0.75rem', background: 'var(--status-retired-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--border-radius-sm)', color: '#ef4444', fontSize: '0.85rem' }}>
                {regError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>First Name</label>
                <input type="text" className="form-input" placeholder="Sarah" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Last Name</label>
                <input type="text" className="form-input" placeholder="Connor" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Username</label>
              <input type="text" className="form-input" placeholder="sconnor" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" className="form-input" placeholder="sconnor@cyber.net" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Security Key (Password)</label>
              <input type="password" className="form-input" placeholder="Min. 8 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assigned Role</label>
              <select className="form-input" style={{ background: '#0a0b10' }} value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                <option value="Employee">Employee (Asset View only)</option>
                <option value="Manager">Manager (Edit Assets/Vendors)</option>
                <option value="Admin">Administrator (Full Access)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone</label>
                <input type="text" className="form-input" placeholder="+1..." value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Department</label>
                <input type="text" className="form-input" placeholder="Research" value={regDept} onChange={(e) => setRegDept(e.target.value)} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
              disabled={regLoading}
            >
              {regLoading ? "Creating Record..." : "Register Credentials"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
