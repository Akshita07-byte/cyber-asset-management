import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Printer, Download, BarChart2, ShieldAlert } from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/dashboard/stats/');
        setStats(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const downloadReport = (type) => {
    const token = localStorage.getItem('access_token');
    // We can fetch the CSV report by creating a direct link or downloading via axios.
    // Fetching via axios is more secure because we can pass the Authorization header!
    api.get(`/reports/export/?type=${type}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error("Export failed:", error);
        alert("Failed to export report CSV.");
      });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-glass)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Compiling inventory reports...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const kpis = stats?.kpis || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }} className="reports-page">
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Export system statistics, compile logs, and download compliance audits.</p>
        </div>
        <button onClick={handlePrint} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
          <Printer size={18} /> Print Report
        </button>
      </div>

      {/* Export Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }} className="no-print">
        
        {/* Assets CSV Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              marginBottom: '1rem'
            }}>
              <FileSpreadsheet size={20} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Asset Ledger Export</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Download full list of registered computing units, router devices, licenses, serial numbers, valuation pricing, and warranty contracts.</p>
          </div>
          <button onClick={() => downloadReport('assets')} className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }}>
            <Download size={16} /> Download CSV Ledger
          </button>
        </div>

        {/* Maintenance CSV Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              marginBottom: '1rem'
            }}>
              <FileSpreadsheet size={20} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Maintenance Logs Export</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Download complete invoice list of scheduled calibrations, support logs, cost statements, repair descriptions, and technician performance metrics.</p>
          </div>
          <button onClick={() => downloadReport('maintenance')} className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }} id="maint-btn">
            <Download size={16} /> Download CSV Logs
          </button>
        </div>
      </div>

      {/* Printable Report Preview */}
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header (visible on print) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-glass)', paddingBottom: '1.5rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }} className="glow-text">SYSTEM INVENTORY COMPLIANCE AUDIT</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Generated on: {new Date().toLocaleString()} | Operator: @{user?.username}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>CYBER-ASSET ENTERPRISE</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: Operational</span>
          </div>
        </div>

        {/* Audit Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Volume</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>{kpis.total_assets || 0}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Systems Registered</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Capital Pricing</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--accent-cyan)' }}>
              ${parseFloat(kpis.total_value || 0).toLocaleString()}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Combined Value Ledger</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Deployments</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>{kpis.assigned_assets || 0}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned to Personnel</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Warranty Vulnerabilities</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: kpis.expired_warranties > 0 ? '#ef4444' : 'inherit' }}>
              {kpis.expired_warranties || 0}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expired Warranties</span>
          </div>
        </div>

        {/* Compliance checklist */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Audit Verification Statement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <p>1. All system hardware items listed in the database have been indexed with unique cryptographic-safe serial numbers.</p>
            <p>2. Active deployments have been signed off by designated supervisors and correspond with valid employee credentials.</p>
            <p>3. Repairs and firmware calibrations are logged under authenticated technician records with active invoice balances.</p>
            <p>4. System database connections are encrypted with modern TLS parameters and JWT session token handshakes.</p>
          </div>
        </div>

        {/* Signature Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px dashed var(--border-glass)', paddingTop: '2rem' }}>
          <div>
            <div style={{ width: '200px', height: '1px', background: 'var(--text-secondary)' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Authorized Audit Officer Signature</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ width: '200px', height: '1px', background: 'var(--text-secondary)', marginLeft: 'auto' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>System Control Representative Sign-off</p>
          </div>
        </div>
      </div>

      <style>{`
        #maint-btn {
          background: linear-gradient(135deg, #f59e0b, #d97706) !important;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.3) !important;
          color: #0b0d19 !important;
        }
        #maint-btn:hover {
          transform: scale(1.03) !important;
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.6) !important;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          .glass-panel {
            border: none !important;
            padding: 0 !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Reports;
