import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Wrench, Calendar, DollarSign, Plus, CheckCircle, XCircle, X } from 'lucide-react';

const Maintenance = () => {
  const { user } = useAuth();
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';

  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Schedule form states
  const [schedAsset, setSchedAsset] = useState('');
  const [schedDesc, setSchedDesc] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedBy, setSchedBy] = useState('');
  const [schedError, setSchedError] = useState('');

  // Complete form states
  const [compCost, setCompCost] = useState('');
  const [compNotes, setCompNotes] = useState('');
  const [compError, setCompError] = useState('');

  const fetchRecords = async () => {
    try {
      const response = await api.get('/maintenance/');
      setRecords(response.data);
    } catch (err) {
      setError("Failed to fetch maintenance repository logs.");
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets/');
      setAssets(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRecords(), fetchAssets()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenSchedule = () => {
    setSchedAsset('');
    setSchedDesc('');
    setSchedDate('');
    setSchedBy('');
    setSchedError('');
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSchedError('');

    const recordData = {
      asset: parseInt(schedAsset),
      description: schedDesc,
      scheduled_date: schedDate,
      performed_by: schedBy || null,
      status: 'Scheduled'
    };

    try {
      await api.post('/maintenance/', recordData);
      setShowScheduleModal(false);
      fetchRecords();
      fetchAssets(); // Refresh asset statuses
    } catch (err) {
      setSchedError(Object.values(err.response?.data || {}).flat().join(" ") || "Scheduling transaction rejected.");
    }
  };

  const handleOpenComplete = (record) => {
    setSelectedRecord(record);
    setCompCost('');
    setCompNotes('');
    setCompError('');
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setCompError('');

    const completeData = {
      cost: parseFloat(compCost),
      notes: compNotes || null,
      completed_date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      asset: selectedRecord.asset,
      description: selectedRecord.description,
      scheduled_date: selectedRecord.scheduled_date
    };

    try {
      await api.put(`/maintenance/${selectedRecord.id}/`, completeData);
      setShowCompleteModal(false);
      fetchRecords();
      fetchAssets(); // Refresh asset statuses
    } catch (err) {
      setCompError(Object.values(err.response?.data || {}).flat().join(" ") || "Completion status update rejected.");
    }
  };

  const handleCancelMaintenance = async (record) => {
    if (window.confirm("Verify: Do you want to cancel this scheduled maintenance run?")) {
      const cancelData = {
        ...record,
        status: 'Cancelled'
      };
      try {
        await api.put(`/maintenance/${record.id}/`, cancelData);
        fetchRecords();
        fetchAssets();
      } catch (err) {
        alert("Cancellation request rejected by database cluster.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-glass)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Synchronizing maintenance logs...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Maintenance Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Schedule calibrations, track hardware debugging runs, and manage compliance repairs.</p>
        </div>
        <button onClick={handleOpenSchedule} className="btn btn-primary">
          <Plus size={18} /> Schedule Maintenance
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '12px' }}>
          {error}
        </div>
      )}

      {/* Maintenance Table */}
      <div className="glass-panel table-container">
        {records.length > 0 ? (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Target System</th>
                <th>Maintenance Spec</th>
                <th>Agent Team</th>
                <th>Scheduled Run</th>
                <th>Completed Date</th>
                <th>Invoice Cost</th>
                <th>Status</th>
                {isManagement && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.asset_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>S/N: <code style={{ color: 'var(--accent-cyan)' }}>{r.asset_serial}</code></div>
                  </td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.85rem' }} title={r.description}>{r.description}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{r.performed_by || 'Internal Support'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{new Date(r.scheduled_date).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{r.completed_date ? new Date(r.completed_date).toLocaleDateString() : '—'}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{r.cost > 0 ? `$${parseFloat(r.cost).toLocaleString()}` : '—'}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase().replace(" ", "")}`}>
                      {r.status}
                    </span>
                  </td>
                  {isManagement && (
                    <td style={{ textAlign: 'right' }}>
                      {['Scheduled', 'In Progress'].includes(r.status) && (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenComplete(r)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--status-available)', gap: '0.25rem' }}
                            title="Complete Maintenance"
                          >
                            <CheckCircle size={12} /> Sign-off
                          </button>
                          <button
                            onClick={() => handleCancelMaintenance(r)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: '#ef4444', gap: '0.25rem' }}
                            title="Cancel Job"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No maintenance registers found in history log.
          </div>
        )}
      </div>

      {/* MODAL 1: SCHEDULE MAINTENANCE */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="glow-text">Schedule Calibration</h2>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <X size={20} />
              </button>
            </div>

            {schedError && (
              <div style={{ padding: '0.75rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {schedError}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Select Target System</label>
                <select className="form-input" style={{ background: 'var(--bg-secondary)' }} value={schedAsset} onChange={(e) => setSchedAsset(e.target.value)} required>
                  <option value="">Choose Asset...</option>
                  {assets.filter(a => a.status !== 'Retired').map(a => (
                    <option key={a.id} value={a.id}>{a.name} (S/N: {a.serial_number} - Status: {a.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Maintenance Specifics (Description)</label>
                <textarea className="form-input" style={{ resize: 'none', height: '80px' }} value={schedDesc} onChange={(e) => setSchedDesc(e.target.value)} placeholder="Hardware diagnostics, software updates..." required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scheduled Date</label>
                  <input type="date" className="form-input" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned Team</label>
                  <input type="text" className="form-input" placeholder="Nova Support" value={schedBy} onChange={(e) => setSchedBy(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                Initiate Maintenance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPLETE SIGN-OFF */}
      {showCompleteModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="glow-text">Complete Job Sign-off</h2>
              <button onClick={() => setShowCompleteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <X size={20} />
              </button>
            </div>

            {compError && (
              <div style={{ padding: '0.75rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {compError}
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Target System</label>
                <div style={{ fontWeight: 600 }}>{selectedRecord.asset_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedRecord.description}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Total Job Invoice Cost ($)</label>
                <input type="number" step="0.01" className="form-input" placeholder="150.00" value={compCost} onChange={(e) => setCompCost(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Repair Resolution Notes</label>
                <textarea className="form-input" style={{ resize: 'none', height: '80px' }} value={compNotes} onChange={(e) => setCompNotes(e.target.value)} placeholder="Firmware updated to v9.1, diagnostics resolved..." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                Sign-off Resolution
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
