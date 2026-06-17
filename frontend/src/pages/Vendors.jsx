import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, User, Star, X } from 'lucide-react';

const Vendors = () => {
  const { user } = useAuth();
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState('5.00');
  const [formError, setFormError] = useState('');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendors/');
      setVendors(response.data);
    } catch (err) {
      setError("Failed to download vendor roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setRating('5.00');
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (v) => {
    setIsEdit(true);
    setSelectedVendor(v);
    setName(v.name);
    setContactPerson(v.contact_person || '');
    setEmail(v.email || '');
    setPhone(v.phone || '');
    setAddress(v.address || '');
    setRating(v.rating);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const vendorData = {
      name,
      contact_person: contactPerson || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      rating: parseFloat(rating)
    };

    try {
      if (isEdit) {
        await api.put(`/vendors/${selectedVendor.id}/`, vendorData);
      } else {
        await api.post('/vendors/', vendorData);
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      setFormError(Object.values(err.response?.data || {}).flat().join(" ") || "Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Verify: Are you sure you want to delete this vendor record? All associated asset contracts might lose referencing.")) {
      try {
        await api.delete(`/vendors/${id}/`);
        fetchVendors();
      } catch (err) {
        alert("Deletion rejected by database cluster.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-glass)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Downloading vendor registers...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Vendors Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage suppliers, maintenance contracts, and procurement details.</p>
        </div>
        {isManagement && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} /> Register Supplier
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '12px' }}>
          {error}
        </div>
      )}

      {/* Grid Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {vendors.map(v => (
          <div key={v.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {/* Vendor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{v.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Supplier</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>
                <Star size={12} fill="#f59e0b" /> {parseFloat(v.rating).toFixed(1)}
              </div>
            </div>

            {/* Info details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={14} color="var(--accent-cyan)" />
                <span>{v.contact_person || 'No Lead Listed'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={14} color="var(--accent-cyan)" />
                <span>{v.email || 'No Email Listed'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={14} color="var(--accent-cyan)" />
                <span>{v.phone || 'No Phone Listed'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={14} color="var(--accent-cyan)" style={{ marginTop: '0.2rem' }} />
                <span>{v.address || 'No Address Registered'}</span>
              </div>
            </div>

            {/* Actions */}
            {isManagement && (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => handleOpenEdit(v)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(v.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', color: '#ef4444' }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FORM MODAL (ADD/EDIT) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="glow-text">{isEdit ? "Update Vendor Profile" : "Register New Vendor"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Supplier Name</label>
                <input type="text" className="form-input" placeholder="Quantum Dynamics Group" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contact Agent</label>
                  <input type="text" className="form-input" placeholder="Sarah Jenkins" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quality Rating (1-5)</label>
                  <input type="number" step="0.1" min="1" max="5" className="form-input" value={rating} onChange={(e) => setRating(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</label>
                  <input type="email" className="form-input" placeholder="contracts@quantum.io" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone</label>
                  <input type="text" className="form-input" placeholder="+1..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HQ Address</label>
                <textarea className="form-input" style={{ resize: 'none', height: '60px' }} placeholder="HQ logistics address..." value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
                {isEdit ? "Update Vendor Profile" : "Register Vendor Details"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Vendors;
