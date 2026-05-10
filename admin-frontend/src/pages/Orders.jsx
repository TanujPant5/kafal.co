import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('kafal_admin_token')}` },
});

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const { data } = await axios.get(`${API}/admin/orders`, {
        ...getAuthHeaders(),
        params,
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${API}/admin/orders/${orderId}/status`,
        { status: newStatus },
        getAuthHeaders()
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div>
      <h1 className="admin-page-title">Orders</h1>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="input-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Filter:</label>
          <select
            className="select-field"
            style={{ width: 'auto', minWidth: '140px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            id="status-filter"
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          No orders found
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" id="orders-table">
            <thead>
              <tr>
                <th></th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <>
                  <tr key={order._id}>
                    <td>
                      <button
                        onClick={() => toggleExpand(order._id)}
                        style={{ background: 'none', color: 'var(--muted)', padding: '2px' }}
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </td>
                    <td style={{ fontWeight: '500' }}>{order.orderId}</td>
                    <td>{order.customer?.name}</td>
                    <td>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: '500' }}>₹{order.totalAmount}</td>
                    <td>
                      <span className={`status-pill status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td>
                      <select
                        className="select-field"
                        style={{ width: 'auto', fontSize: '0.8rem', padding: '4px 8px' }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr key={`${order._id}-expand`}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div className="order-expand">
                          <div className="order-expand-items">
                            <strong style={{ fontSize: '0.8rem' }}>Items:</strong>
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="order-expand-item">
                                <span>{item.name} × {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="order-expand-customer">
                            <strong>Customer:</strong> {order.customer?.name}<br />
                            <strong>Email:</strong> {order.customer?.email}<br />
                            <strong>Phone:</strong> {order.customer?.phone}<br />
                            <strong>Address:</strong> {order.customer?.address}, {order.customer?.city}, {order.customer?.state} — {order.customer?.pincode}
                          </div>
                          {order.razorpayPaymentId && (
                            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                              Payment ID: {order.razorpayPaymentId}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
