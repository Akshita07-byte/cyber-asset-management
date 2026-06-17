import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Laptop, 
  ClipboardCheck, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Wrench,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const Dashboard = ({ setCurrentTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats/');
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Could not load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-glass)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Booting analytics terminal...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', margin: 'auto' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const monthlyTrend = stats?.monthly_trend || [];
  const categories = stats?.categories || [];
  const recentActivities = stats?.recent_activities || [];

  // Color palette for charts
  const CHART_COLORS = ['#00f0ff', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b'];

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(kpis.total_value || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Intro Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Core Analytics Workspace</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back, <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{user?.first_name || user?.username}</span>. Check system status and pending assignments.</p>
      </div>

      {/* KPIs Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Total Assets */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(0, 240, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 240, 255, 0.2)'
          }}>
            <Laptop size={22} color="var(--accent-cyan)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>System Inventory</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.1rem 0' }}>{kpis.total_assets || 0}</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Registered Assets</span>
          </div>
        </div>

        {/* Assigned Assets */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <ClipboardCheck size={22} color="var(--accent-blue)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Deployments</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.1rem 0' }}>{kpis.assigned_assets || 0}</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)' }}>Currently Assigned</span>
          </div>
        </div>

        {/* Assets Under Maintenance */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <Wrench size={22} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Maintenance Center</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.1rem 0' }}>{kpis.maintenance_assets || 0}</h3>
            <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>In Calibration</span>
          </div>
        </div>

        {/* Expired Warranties */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Warranty Expiry</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.1rem 0' }}>{kpis.expired_warranties || 0}</h3>
            <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>Needs Review</span>
          </div>
        </div>

        {/* Total Value */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <TrendingUp size={22} color="var(--accent-purple)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Asset Valuation</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.1rem 0' }}>{formattedValue}</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)' }}>Current Net Value</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Feed Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Maintenance Trend Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Maintenance Operations Cost</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Costs and activity timeline for the last 6 months</span>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--accent-cyan)', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="cost" name="Cost ($)" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No maintenance log trend data available.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Asset Distribution</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Breakdown by category</span>
          </div>
          <div style={{ width: '100%', height: '180px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="category"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: 'var(--border-radius-sm)', color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No assets registered.
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
            {categories.slice(0, 4).map((item, idx) => (
              <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  <span>{item.category}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log and Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem' }}>
        
        {/* Recent Audit Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Telemetry & Audit Log</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recent operations across database cluster</span>
            </div>
            <Activity size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((log) => (
                <div key={log.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--border-glass)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: log.action.includes('ASSIGN') ? 'var(--status-assigned)' :
                               log.action.includes('RETURN') ? 'var(--status-available)' :
                               log.action.includes('CREATE') ? 'var(--accent-cyan)' : 'var(--status-maintenance)',
                    marginTop: '0.35rem'
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>{log.username || 'System'}</span> performed <strong style={{ fontSize: '0.75rem', opacity: 0.8 }}>{log.action}</strong>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.1rem 0' }}>{log.details}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No events recorded.
              </div>
            )}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Quick Operations</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>System links and exports</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={() => setCurrentTab('assets')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'var(--transition-smooth)'
              }}
              className="quick-op-btn"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Database size={16} color="var(--accent-cyan)" /> Deploy New Asset
              </span>
              <ChevronRight size={16} />
            </button>
            
            <button 
              onClick={() => setCurrentTab('maintenance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'var(--transition-smooth)'
              }}
              className="quick-op-btn"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Wrench size={16} color="#f59e0b" /> Request Calibration
              </span>
              <ChevronRight size={16} />
            </button>

            {user?.role !== 'Employee' && (
              <button 
                onClick={() => setCurrentTab('reports')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'var(--transition-smooth)'
                }}
                className="quick-op-btn"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <TrendingUp size={16} color="var(--accent-purple)" /> Export Audit Report
                </span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
          
          <style>{`
            .quick-op-btn:hover {
              border-color: var(--accent-cyan) !important;
              color: var(--accent-cyan) !important;
              background: var(--bg-glass-hover) !important;
            }
          `}</style>
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

export default Dashboard;
