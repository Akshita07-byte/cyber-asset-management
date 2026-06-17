import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, User, Info, CheckCircle } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  
  // Form states
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [dept, setDept] = useState(user?.department || '');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);

    const result = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      department: dept
    });
    setLoading(false);

    if (result.success) {
      setMsg("Cyber profile registry updated successfully.");
    } else {
      setError(result.error);
    }
  };

  const getRolePrivileges = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          "Full administrative system provisioning and deletions",
          "Modify personnel security profiles & roles",
          "Read-write vendor database & contracts",
          "Allocate assets & sign-off compliance runs",
          "Audit full system telemetry & database logs"
        ];
      case 'Manager':
        return [
          "Provision and retire asset items in inventory",
          "Register and manage suppliers / vendors",
          "Schedule maintenance runs & sign-off calibrations",
          "Allocate systems to personnel and process check-ins",
          "Restricted: Cannot edit users or audit system telemetry logs"
        ];
      case 'Employee':
      default:
        return [
          "View personal profile & assigned systems",
          "Request maintenance checkups for assigned hardware",
          "Restricted: Read-only views of vendors & asset inventories",
          "Restricted: Cannot provision assets, edit vendors, or list users"
        ];
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure personal workspace preferences and check role authorization permissions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Profile Details Edit Form */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Personal Details</h3>
          </div>

          {msg && (
            <div style={{ padding: '0.75rem', background: 'var(--status-available-bg)', color: '#10b981', borderRadius: '6px', fontSize: '0.85rem' }}>
              {msg}
            </div>
          )}
          {error && (
            <div style={{ padding: '0.75rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>First Name</label>
                <input type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Name</label>
                <input type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Contact Phone</label>
                <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department</label>
                <input type="text" className="form-input" value={dept} onChange={(e) => setDept(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', opacity: 0.75 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Username (Read Only)</label>
                <input type="text" className="form-input" value={user?.username} disabled style={{ cursor: 'not-allowed' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address (Read Only)</label>
                <input type="email" className="form-input" value={user?.email} disabled style={{ cursor: 'not-allowed' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? "Updating credentials..." : "Commit Profile Changes"}
            </button>
          </form>
        </div>

        {/* Security Role Panel */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security Level</h3>
          </div>

          <div style={{ background: 'rgba(0, 240, 255, 0.03)', border: '1px dashed var(--border-glass-glow)', borderRadius: '12px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Assigned Policy Role</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{user?.role}</p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Active Authorization Scopes:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {getRolePrivileges().map((priv, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <CheckCircle size={12} color={priv.startsWith("Restricted") ? "#ef4444" : "var(--status-available)"} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <span style={{ color: priv.startsWith("Restricted") ? "var(--text-muted)" : "var(--text-secondary)" }}>{priv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
