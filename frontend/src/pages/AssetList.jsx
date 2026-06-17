import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  UserPlus, 
  RotateCcw,
  AlertCircle,
  X,
  ShieldCheck
} from 'lucide-react';

const AssetList = () => {
  const { user } = useAuth();
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';
  
  // Data States
  const [assets, setAssets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form states (Add/Edit)
  const [isEdit, setIsEdit] = useState(false);
  const [formSN, setFormSN] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Computing');
  const [formModel, setFormModel] = useState('');
  const [formStatus, setFormStatus] = useState('Available');
  const [formPrice, setFormPrice] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formWarranty, setFormWarranty] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  // Assignment form states
  const [assignUser, setAssignUser] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignError, setAssignError] = useState('');

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets/');
      setAssets(response.data);
    } catch (err) {
      setError("Unable to retrieve asset repository.");
    }
  };

  const fetchAuxData = async () => {
    if (isManagement) {
      try {
        const [vRes, uRes] = await Promise.all([
          api.get('/vendors/'),
          api.get('/users/')
        ]);
        setVendors(vRes.data);
        setUsers(uRes.data);
      } catch (err) {
        console.error("Error loading auxiliary data:", err);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchAssets(), fetchAuxData()]);
      setLoading(false);
    };
    init();
  }, []);

  // Filter Assets locally or fetch with query params
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) || 
                          asset.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                          (asset.model && asset.model.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === '' || asset.category === category;
    const matchesStatus = statusFilter === '' || asset.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormSN('');
    setFormName('');
    setFormCategory('Computing');
    setFormModel('');
    setFormStatus('Available');
    setFormPrice('');
    setFormPurchaseDate('');
    setFormWarranty('');
    setFormVendor('');
    setFormDesc('');
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (asset) => {
    setIsEdit(true);
    setSelectedAsset(asset);
    setFormSN(asset.serial_number);
    setFormName(asset.name);
    setFormCategory(asset.category);
    setFormModel(asset.model || '');
    setFormStatus(asset.status);
    setFormPrice(asset.price);
    setFormPurchaseDate(asset.purchase_date);
    setFormWarranty(asset.warranty_expiry || '');
    setFormVendor(asset.vendor || '');
    setFormDesc(asset.description || '');
    setFormError('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const assetData = {
      serial_number: formSN,
      name: formName,
      category: formCategory,
      model: formModel || null,
      status: formStatus,
      price: parseFloat(formPrice),
      purchase_date: formPurchaseDate,
      warranty_expiry: formWarranty || null,
      vendor: formVendor || null,
      description: formDesc || null
    };

    try {
      if (isEdit) {
        await api.put(`/assets/${selectedAsset.id}/`, assetData);
      } else {
        await api.post('/assets/', assetData);
      }
      setShowFormModal(false);
      fetchAssets();
    } catch (err) {
      setFormError(Object.values(err.response?.data || {}).flat().join(" ") || "Operation failed.");
    }
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm("Verify: Are you sure you want to retire and remove this asset from database?")) {
      try {
        await api.delete(`/assets/${id}/`);
        fetchAssets();
      } catch (err) {
        alert("Retirement transaction rejected by server.");
      }
    }
  };

  const handleOpenAssign = (asset) => {
    setSelectedAsset(asset);
    setAssignUser('');
    setAssignDueDate('');
    setAssignNotes('');
    setAssignError('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignError('');

    const assignmentData = {
      asset: selectedAsset.id,
      assigned_to: parseInt(assignUser),
      due_date: assignDueDate,
      notes: assignNotes || null
    };

    try {
      await api.post('/assignments/', assignmentData);
      setShowAssignModal(false);
      fetchAssets();
    } catch (err) {
      setAssignError(Object.values(err.response?.data || {}).flat().join(" ") || "Deployment allocation rejected.");
    }
  };

  const handleReturnAsset = async (asset) => {
    if (window.confirm(`Verify: Return asset "${asset.name}" back to inventory?`)) {
      try {
        // Fetch active assignment for this asset
        const response = await api.get('/assignments/?status=Active');
        const activeAssign = response.data.find(a => a.asset === asset.id);
        
        if (activeAssign) {
          await api.post(`/assignments/${activeAssign.id}/return_asset/`);
          fetchAssets();
        } else {
          alert("Could not locate active assignment record.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to complete asset return.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Title Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Asset Repository</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Deploy, assign, and audit enterprise hardware and software licenses.</p>
        </div>
        {isManagement && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} /> Provision Asset
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by name, model, serial number..." 
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-secondary)" />
          
          <select className="form-input" style={{ width: '160px', background: 'var(--bg-secondary)' }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Computing">Computing Devices</option>
            <option value="Network">Network Equipment</option>
            <option value="Software">Software & Licenses</option>
            <option value="Mobile">Mobile Devices</option>
            <option value="Furniture">Office Furniture</option>
            <option value="Other">Other Assets</option>
          </select>

          <select className="form-input" style={{ width: '150px', background: 'var(--bg-secondary)' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Asset Data Table */}
      <div className="glass-panel table-container">
        {filteredAssets.length > 0 ? (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Asset Identity</th>
                <th>Category</th>
                <th>S/N</th>
                <th>Status</th>
                <th>Purchase Value</th>
                <th>Warranty Expiry</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{asset.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{asset.model || 'Generic Model'}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{asset.category}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{asset.serial_number}</code>
                  </td>
                  <td>
                    <span className={`badge badge-${asset.status.toLowerCase()}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                      ${parseFloat(asset.price).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: new Date(asset.warranty_expiry) < new Date() ? '#ef4444' : 'inherit' }}>
                      {asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => { setSelectedAsset(asset); setShowDetailModal(true); }}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem', borderRadius: '6px' }}
                        title="View Full Spec Sheet"
                      >
                        <Eye size={14} />
                      </button>

                      {isManagement && (
                        <>
                          {asset.status === 'Available' && (
                            <button 
                              onClick={() => handleOpenAssign(asset)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', borderRadius: '6px', color: 'var(--accent-cyan)' }}
                              title="Assign Asset"
                            >
                              <UserPlus size={14} />
                            </button>
                          )}
                          
                          {asset.status === 'Assigned' && (
                            <button 
                              onClick={() => handleReturnAsset(asset)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', borderRadius: '6px', color: 'var(--status-available)' }}
                              title="Process Return"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}

                          <button 
                            onClick={() => handleOpenEdit(asset)}
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '6px' }}
                            title="Edit Details"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button 
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '6px', color: '#ef4444' }}
                            title="Retire Asset"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No matching assets found in local registry.
          </div>
        )}
      </div>

      {/* MODAL 1: SPEC DETAILS */}
      {showDetailModal && selectedAsset && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="glow-text">System Spec Sheet</h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Asset Name / Model</span>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedAsset.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedAsset.model || 'Generic Specification'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Serial Number</span>
                  <p><code style={{ color: 'var(--accent-cyan)' }}>{selectedAsset.serial_number}</code></p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allocation Status</span>
                  <p><span className={`badge badge-${selectedAsset.status.toLowerCase()}`}>{selectedAsset.status}</span></p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Purchase Value</span>
                  <p style={{ fontWeight: 500 }}>${parseFloat(selectedAsset.price).toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Purchase Date</span>
                  <p style={{ fontSize: '0.9rem' }}>{new Date(selectedAsset.purchase_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Warranty Expiry</span>
                <p style={{ fontSize: '0.9rem', color: new Date(selectedAsset.warranty_expiry) < new Date() ? '#ef4444' : '#10b981' }}>
                  {selectedAsset.warranty_expiry ? `${new Date(selectedAsset.warranty_expiry).toLocaleDateString()} (${new Date(selectedAsset.warranty_expiry) < new Date() ? 'EXPIRED' : 'ACTIVE'})` : 'No Warranty Listed'}
                </p>
              </div>

              {selectedAsset.vendor_name && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registered Vendor</span>
                  <p style={{ fontWeight: 500 }}>{selectedAsset.vendor_name}</p>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configuration Details</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                  {selectedAsset.description || "No config description registered."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGNMENT ALLOCATION */}
      {showAssignModal && selectedAsset && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="glow-text">Asset Allocation Terminal</h2>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <X size={20} />
              </button>
            </div>

            {assignError && (
              <div style={{ padding: '0.75rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {assignError}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Selected System</label>
                <div style={{ fontWeight: 600 }}>{selectedAsset.name} (S/N: {selectedAsset.serial_number})</div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Allocate To (Personnel)</label>
                <select className="form-input" style={{ background: 'var(--bg-secondary)' }} value={assignUser} onChange={(e) => setAssignUser(e.target.value)} required>
                  <option value="">Select Employee...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.first_name} {u.last_name} - {u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Due Date</label>
                <input type="date" className="form-input" value={assignDueDate} onChange={(e) => setAssignDueDate(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Deployment Notes</label>
                <textarea className="form-input" style={{ resize: 'none', height: '80px' }} value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} placeholder="System usage purposes..." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                Authorize Allocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PROVISION FORM (ADD/EDIT) */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '2rem', maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="glow-text">{isEdit ? "Update Asset Record" : "Provision New Asset"}</h2>
              <button onClick={() => setShowFormModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem', background: 'var(--status-retired-bg)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '460px', overflowY: 'auto', paddingRight: '0.4rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Asset Name</label>
                  <input type="text" className="form-input" placeholder="Quantum Blade PC" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Model/Spec</label>
                  <input type="text" className="form-input" placeholder="QBW-900X" value={formModel} onChange={(e) => setFormModel(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Serial Number (Unique)</label>
                  <input type="text" className="form-input" placeholder="QBL-2026-..." value={formSN} onChange={(e) => setFormSN(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category</label>
                  <select className="form-input" style={{ background: 'var(--bg-secondary)' }} value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    <option value="Computing">Computing Devices</option>
                    <option value="Network">Network Equipment</option>
                    <option value="Software">Software & Licenses</option>
                    <option value="Mobile">Mobile Devices</option>
                    <option value="Furniture">Office Furniture</option>
                    <option value="Other">Other Assets</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Purchase Price ($)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="1200.00" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inventory Status</label>
                  <select className="form-input" style={{ background: 'var(--bg-secondary)' }} value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Purchase Date</label>
                  <input type="date" className="form-input" value={formPurchaseDate} onChange={(e) => setFormPurchaseDate(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Warranty Expiry</label>
                  <input type="date" className="form-input" value={formWarranty} onChange={(e) => setFormWarranty(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Supplier / Vendor</label>
                <select className="form-input" style={{ background: 'var(--bg-secondary)' }} value={formVendor} onChange={(e) => setFormVendor(e.target.value)}>
                  <option value="">No Vendor Assigned</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} (Rating: {v.rating})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configuration Description</label>
                <textarea className="form-input" style={{ resize: 'none', height: '80px' }} placeholder="Hardware specifics, memory, core configurations..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
                {isEdit ? "Update System Records" : "Authorize System Seeding"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;
