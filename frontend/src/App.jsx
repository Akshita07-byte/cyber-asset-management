import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import Vendors from './pages/Vendors';
import Assignments from './pages/Assignments';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import SettingsPage from './pages/SettingsPage';
import QRScanner from './pages/QRScanner';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [autoOpenAssetId, setAutoOpenAssetId] = useState(null);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0b10',
        color: '#f3f4f6',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.05)',
          borderTopColor: '#00f0ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.2em', color: '#00f0ff' }}>
          CYBER-ASSET DECRYPTING HANDSHAKE...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Render tab component dynamically
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'assets':
        return (
          <AssetList 
            autoOpenAssetId={autoOpenAssetId}
            onClearAutoOpen={() => setAutoOpenAssetId(null)}
          />
        );
      case 'scanner':
        return (
          <QRScanner 
            onScanSuccess={(assetId) => {
              setAutoOpenAssetId(assetId);
              setCurrentTab('assets');
            }}
          />
        );
      case 'vendors':
        return <Vendors />;
      case 'assignments':
        return <Assignments />;
      case 'maintenance':
        return <Maintenance />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="main-content">
        {renderTabContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
