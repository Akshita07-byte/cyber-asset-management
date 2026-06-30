import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertTriangle, RefreshCw, X, ShieldAlert } from 'lucide-react';

const QRScanner = ({ onScanSuccess }) => {
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null); // 'granted', 'denied', or null
  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  const startScanner = async () => {
    setError('');
    try {
      // Request camera permissions by getting cameras
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setError("No camera devices detected on this system.");
        setCameraPermission('denied');
        return;
      }
      setCameraPermission('granted');

      // Create instance
      const html5Qrcode = new Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      // Start scanning
      setIsScanning(true);
      await html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Verbose error logging can be ignored in UI
        }
      );
    } catch (err) {
      console.error("Scanner initialization failed:", err);
      setError("Failed to access camera. Please grant permission and reload.");
      setCameraPermission('denied');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const handleScanSuccess = async (decodedText) => {
    // Parse decoded text
    console.log("QR Code Scanned:", decodedText);
    
    // Check if the QR code text contains an asset details URL or pattern
    // Pattern matches: http://localhost:5173/assets/{id} or /assets/{id} or just numeric ID
    const urlPattern = /\/assets\/(\d+)/;
    const match = decodedText.match(urlPattern);
    
    let assetId = null;
    if (match && match[1]) {
      assetId = parseInt(match[1]);
    } else if (/^\d+$/.test(decodedText.trim())) {
      // If the QR contains just a raw numeric ID
      assetId = parseInt(decodedText.trim());
    }

    if (assetId) {
      // Scan success feedback
      stopScanner();
      onScanSuccess(assetId);
    } else {
      setError(`Decoded data: "${decodedText}" is not a valid asset signature.`);
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Title Panel */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>QR Sensor Terminal</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Scan physical asset tags using your camera to pull up configuration datasheets.</p>
      </div>

      {/* Camera Viewport Panel */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Scanner target viewport wrapper */}
        <div style={{ 
          position: 'relative', 
          width: '320px', 
          height: '320px', 
          borderRadius: 'var(--border-radius-md)', 
          overflow: 'hidden', 
          background: 'rgba(0,0,0,0.4)',
          border: '2px solid var(--border-glass)',
          boxShadow: isScanning ? '0 0 25px rgba(0, 240, 255, 0.15)' : 'none',
          transition: 'var(--transition-smooth)'
        }}>
          {/* Scanning animation line */}
          {isScanning && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(to right, transparent, var(--accent-cyan), transparent)',
              boxShadow: '0 0 10px var(--accent-cyan)',
              zIndex: 10,
              animation: 'scanLine 2.5s linear infinite'
            }} />
          )}

          {/* Video feed element */}
          <div id="reader" style={{ width: '100%', height: '100%' }}></div>

          {/* Scanner State Screen overlays */}
          {!isScanning && (
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '1rem',
              color: 'var(--text-secondary)',
              padding: '2rem',
              textAlign: 'center',
              background: 'rgba(10, 11, 16, 0.9)'
            }}>
              <Camera size={48} color="var(--text-muted)" />
              {cameraPermission === 'denied' ? (
                <div>
                  <p style={{ fontWeight: 600, color: '#ef4444' }}>Camera Blocked</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Please enable browser camera permissions for this domain to use the scanner.</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600 }}>Terminal Offline</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Click start below to activate scanner camera feed.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error messaging */}
        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '0.75rem', 
            padding: '0.75rem 1rem', 
            background: 'var(--status-retired-bg)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: 'var(--border-radius-sm)', 
            color: '#ef4444', 
            fontSize: '0.85rem',
            width: '100%',
            maxWidth: '400px'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isScanning ? (
            <button onClick={startScanner} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <RefreshCw size={16} /> Activate Camera
            </button>
          ) : (
            <button onClick={stopScanner} className="btn btn-danger" style={{ gap: '0.5rem' }}>
              <X size={16} /> Deactivate Camera
            </button>
          )}
        </div>

      </div>

      {/* Instructions card */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          borderRadius: '8px', 
          background: 'rgba(0, 240, 255, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--accent-cyan)'
        }}>
          <ShieldAlert size={18} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Operator Notice</strong>: Secure authentication tokens (JWT) are enforced. Scanner operations are recorded under your session audit trail automatically.
        </div>
      </div>

      {/* Scanning laser line styling */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
