import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import axios from 'axios';
import './OrderTracking.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderTracking = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('orderId'); // orderId or email
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const params = {};
      if (searchType === 'orderId') {
        params.orderId = query.trim();
      } else {
        params.email = query.trim();
      }

      const res = await axios.get(`${API}/orders/track`, { params });
      setOrders(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setOrders([]);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch orders.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      paid: 'Paid',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  return (
    <div className="page-container order-tracking-page">
      <h1 className="heading-primary" style={{ marginBottom: 'var(--space-sm)' }}>Track your order</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
        Enter your order ID or email to check the status of your order.
      </p>

      <form onSubmit={handleSearch} className="track-order-form" id="track-order-form">
        {/* Search type toggle */}
        <div className="track-toggle">
          <button
            type="button"
            className={`track-toggle-btn ${searchType === 'orderId' ? 'active' : ''}`}
            onClick={() => { setSearchType('orderId'); setQuery(''); }}
          >
            Order ID
          </button>
          <button
            type="button"
            className={`track-toggle-btn ${searchType === 'email' ? 'active' : ''}`}
            onClick={() => { setSearchType('email'); setQuery(''); }}
          >
            Email
          </button>
        </div>

        <div className="search-bar" style={{ marginTop: 'var(--space-md)' }}>
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            placeholder={searchType === 'orderId' ? 'e.g. KFL-A3X9B2' : 'you@example.com'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 'var(--space-sm)' }}>
          {loading ? 'Searching...' : 'Track order'}
        </button>
      </form>

      {error && (
        <div className="checkout-error" style={{ maxWidth: '480px', margin: '16px auto' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && orders.length === 0 && !error && (
        <div className="empty-state">
          <Package size={40} strokeWidth={1} style={{ opacity: 0.4, marginBottom: '8px' }} />
          <p>No orders found</p>
          <p className="text-muted">Double-check your order ID or email</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="order-results">
          {orders.map((order) => (
            <div key={order._id} className="order-result" id={`order-${order.orderId}`}>
              <div className="order-result-header">
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{order.orderId}</div>
                  <div className="text-muted">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>
                </div>
                <span className={`status-pill status-${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <hr className="divider-thin" style={{ margin: '12px 0' }} />

              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: '500' }}>
                <span>Total</span>
                <span className="price">₹{order.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
