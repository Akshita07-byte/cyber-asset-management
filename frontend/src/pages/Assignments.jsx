import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, RotateCcw, AlertTriangle, Calendar, CheckCircle, Search } from 'lucide-react';

const Assignments = () => {
  const { user } = useAuth();
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/assignments/?status=${statusFilter}` : '/assignments/';
      const response = await api.get(url);
      setAssignments(response.data);
    } catch (err) {
      setError("Failed to fetch assignment registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter]);

  const handleReturnAsset = async (assignment) => {
    if (window.confirm(`Confirm: Process return for asset "${assignment.asset_name}"?`)) {
      try {
        await api.post(`/assignments/${assignment.id}/return_asset/`);
        fetchAssignments();
      } catch (err) {
        alert("Return operation rejected by database.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-glass)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Retrieving allocation logs...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Asset Assignments</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track deployments, check due dates, and manage check-ins.</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <ClipboardList size={18} color="var(--accent-cyan)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Filter Allocation Status:</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'Active', 'Returned', 'Overdue'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                borderColor: statusFilter === st ? 'var(--accent-cyan)' : 'var(--border-glass)',
                color: statusFilter === st ? 'var(--accent-cyan)' : 'var(--text-primary)'
              }}
            >
              {st === '' ? 'All Logs' : st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '12px' }}>
          {error}
        </div>
      )}

      {/* Table grid */}
      <div className="glass-panel table-container">
        {assignments.length > 0 ? (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Deployed System</th>
                <th>Assigned To</th>
                <th>Assigned By</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Check-in Date</th>
                <th>Status</th>
                {isManagement && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {assignments.map((asg) => (
                <tr key={asg.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{asg.asset_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>S/N: <code style={{ color: 'var(--accent-cyan)' }}>{asg.asset_serial}</code></div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>@{asg.assigned_to_username}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>@{asg.assigned_by_username || 'system'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{new Date(asg.assigned_date).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: asg.status === 'Overdue' ? '600' : 'normal', color: asg.status === 'Overdue' ? '#ef4444' : 'inherit' }}>
                      {new Date(asg.due_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--status-available)' }}>
                      {asg.return_date ? new Date(asg.return_date).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${asg.status.toLowerCase()}`}>
                      {asg.status}
                    </span>
                  </td>
                  {isManagement && (
                    <td style={{ textAlign: 'right' }}>
                      {asg.status === 'Active' && (
                        <button
                          onClick={() => handleReturnAsset(asg)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--status-available)', gap: '0.4rem' }}
                        >
                          <RotateCcw size={12} /> Check-in
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No allocation logs registered under this filter.
          </div>
        )}
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

export default Assignments;
