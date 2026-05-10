import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Package, MapPin, Edit2 } from 'lucide-react';
import axios from 'axios';
import './Profile.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const navigate = useNavigate();
  const [userPhone, setUserPhone] = useState(localStorage.getItem('kafal_user_phone'));
  
  // Login / Register state
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    address: { street: '', city: '', state: '', pincode: '' }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userPhone) {
      fetchProfileData(userPhone);
    } else {
      setIsLoading(false);
    }
  }, [userPhone]);

  const fetchProfileData = async (phone) => {
    setIsLoading(true);
    try {
      const [profileRes, ordersRes] = await Promise.all([
        axios.get(`${API}/users/${phone}`),
        axios.get(`${API}/users/${phone}/orders`)
      ]);
      setProfile(profileRes.data);
      setOrders(ordersRes.data);
      setEditForm({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        address: {
          street: profileRes.data.address?.street || '',
          city: profileRes.data.address?.city || '',
          state: profileRes.data.address?.state || '',
          pincode: profileRes.data.address?.pincode || ''
        }
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      // If user not found, log them out
      if (err.response?.status === 404) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    try {
      const { data } = await axios.post(`${API}/users/login`, {
        phone: phoneInput,
        name: isNewUser ? nameInput : undefined
      });
      
      localStorage.setItem('kafal_user_phone', data.user.phone);
      setUserPhone(data.user.phone);
      setIsNewUser(false);
      setPhoneInput('');
      setNameInput('');
    } catch (err) {
      if (err.response?.data?.isNew) {
        setIsNewUser(true);
        setLoginError('Welcome! Please provide your name to continue.');
      } else {
        setLoginError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kafal_user_phone');
    setUserPhone(null);
    setProfile(null);
    setOrders([]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await axios.put(`${API}/users/${userPhone}`, editForm);
      setProfile(data.user);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save profile updates.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading"><div className="spinner"></div>Loading profile...</div>
      </div>
    );
  }

  // Not logged in view
  if (!userPhone) {
    return (
      <div className="page-container animate-fade-in" style={{ maxWidth: '480px', paddingTop: 'var(--space-2xl)' }}>
        <div className="profile-auth-card">
          <div className="profile-auth-header">
            <div className="profile-auth-icon"><User size={28} /></div>
            <h2>{isNewUser ? 'Complete Registration' : 'Login / Register'}</h2>
            <p className="text-muted">Enter your phone number to access your account and orders.</p>
          </div>
          
          {loginError && <div className="profile-auth-error">{loginError}</div>}
          
          <form onSubmit={handleAuth} className="profile-auth-form">
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="10-digit mobile number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                maxLength="10"
                disabled={isNewUser && phoneInput.length === 10}
                required
              />
            </div>
            
            {isNewUser && (
              <div className="input-group animate-fade-up">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                />
              </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-full" disabled={isLoginLoading || phoneInput.length !== 10}>
              {isLoginLoading ? 'Please wait...' : isNewUser ? 'Create Account' : 'Continue'}
            </button>
            
            {isNewUser && (
              <button 
                type="button" 
                className="btn btn-secondary btn-full" 
                style={{ marginTop: '8px' }}
                onClick={() => { setIsNewUser(false); setLoginError(''); }}
              >
                Back
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Logged in view
  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: 'var(--space-xl)' }}>
      <div className="profile-header">
        <h1 className="heading-primary">My Account</h1>
        <button onClick={handleLogout} className="btn btn-secondary btn-small">
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="profile-layout">
        {/* User Details Section */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-card-header">
              <h3><User size={18} /> Personal Details</h3>
              {!isEditing && (
                <button className="btn-icon" onClick={() => setIsEditing(true)} aria-label="Edit Profile">
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="profile-edit-form animate-fade-in">
                <div className="input-group">
                  <label className="input-label">Name</label>
                  <input type="text" name="name" className="input-field" value={editForm.name} onChange={handleEditChange} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input type="email" name="email" className="input-field" value={editForm.email} onChange={handleEditChange} />
                </div>
                
                <h4 style={{ margin: '16px 0 8px', fontSize: '0.9rem' }}>Address</h4>
                <div className="input-group">
                  <label className="input-label">Street</label>
                  <input type="text" name="address.street" className="input-field" value={editForm.address.street} onChange={handleEditChange} />
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">City</label>
                    <input type="text" name="address.city" className="input-field" value={editForm.address.city} onChange={handleEditChange} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">State</label>
                    <input type="text" name="address.state" className="input-field" value={editForm.address.state} onChange={handleEditChange} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Pincode</label>
                  <input type="text" name="address.pincode" className="input-field" value={editForm.address.pincode} onChange={handleEditChange} />
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details animate-fade-in">
                <div className="detail-row">
                  <span className="text-muted">Name</span>
                  <strong>{profile?.name}</strong>
                </div>
                <div className="detail-row">
                  <span className="text-muted">Phone</span>
                  <strong>+91 {profile?.phone}</strong>
                </div>
                {profile?.email && (
                  <div className="detail-row">
                    <span className="text-muted">Email</span>
                    <strong>{profile?.email}</strong>
                  </div>
                )}
                
                <div className="divider-thin"></div>
                
                <div className="detail-row" style={{ alignItems: 'flex-start' }}>
                  <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> Address
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    {profile?.address?.street ? (
                      <>
                        {profile.address.street}<br/>
                        {profile.address.city}, {profile.address.state} - {profile.address.pincode}
                      </>
                    ) : (
                      <span className="text-muted">No address added yet.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order History Section */}
        <div className="profile-main">
          <div className="profile-card">
            <div className="profile-card-header">
              <h3><Package size={18} /> Order History</h3>
            </div>
            
            {orders.length === 0 ? (
              <div className="empty-state">
                <Package className="empty-state-icon" />
                <p>No orders yet.</p>
                <Link to="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>Start Shopping</Link>
              </div>
            ) : (
              <div className="order-history-list stagger-children">
                {orders.map(order => (
                  <div key={order._id} className="history-order-card animate-fade-up">
                    <div className="history-order-header">
                      <div>
                        <div style={{ fontWeight: '500' }}>Order #{order.orderId}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="price">₹{order.totalAmount}</div>
                        <span className={`status-pill status-${order.status}`}>{order.status}</span>
                      </div>
                    </div>
                    
                    <div className="history-order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="history-item-row">
                          <span className="history-item-name">{item.quantity}x {item.name}</span>
                          <span className="history-item-price">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
