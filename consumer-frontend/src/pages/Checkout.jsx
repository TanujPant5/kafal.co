import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null); // { success, orderId, message }
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const phone = localStorage.getItem('kafal_user_phone');
      if (phone) {
        try {
          const { data } = await axios.get(`${API}/users/${phone}`);
          setForm(prev => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address?.street || prev.address,
            city: data.address?.city || prev.city,
            state: data.address?.state || prev.state,
            pincode: data.address?.pincode || prev.pincode,
          }));
        } catch (err) {
          console.error('Failed to load user profile for checkout', err);
        }
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, email, phone, address, city, state, pincode } = form;
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      return 'All fields are required.';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address.';
    }
    if (!/^\d{10}$/.test(phone)) {
      return 'Please enter a valid 10-digit phone number.';
    }
    if (!/^\d{6}$/.test(pincode)) {
      return 'Please enter a valid 6-digit pincode.';
    }
    return null;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Failed to load payment gateway. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const items = cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { data } = await axios.post(`${API}/orders/create`, {
        items,
        customer: form,
        totalAmount: cartTotal,
      });

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency,
        name: 'kafal.co',
        description: 'Mountain goods from Uttarakhand',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${API}/orders/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items,
              customer: form,
              totalAmount: cartTotal,
            });

            setOrderResult({
              success: true,
              orderId: verifyRes.data.orderId,
              message: 'Order placed successfully!',
            });
            clearCart();
          } catch (err) {
            setOrderResult({
              success: false,
              message: 'Payment verification failed. Please contact support.',
            });
          }
          setLoading(false);
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: '#C0392B',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled. You can try again.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setLoading(false);
        setOrderResult({
          success: false,
          message: `Payment failed: ${response.error.description}. Please try again.`,
        });
      });
      razorpay.open();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  // Success state
  if (orderResult?.success) {
    return (
      <div className="page-container checkout-page">
        <div className="message-success">
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '12px' }} />
          <h1>Order confirmed!</h1>
          <p style={{ marginBottom: '8px' }}>Your order ID is:</p>
          <p style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '16px' }}>
            {orderResult.orderId}
          </p>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            Save this ID to track your order. A confirmation will be sent to your email.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn-primary">Track order</Link>
            <Link to="/shop" className="btn btn-secondary">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  // Error result state (payment failed)
  if (orderResult && !orderResult.success) {
    return (
      <div className="page-container checkout-page">
        <div className="message-error">
          <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '12px' }} />
          <h1>Payment failed</h1>
          <p className="text-muted" style={{ marginBottom: '24px' }}>{orderResult.message}</p>
          <button className="btn btn-primary" onClick={() => setOrderResult(null)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container checkout-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} strokeWidth={1.5} />
        <span>Back to cart</span>
      </button>

      <h1 className="heading-primary" style={{ marginBottom: 'var(--space-lg)' }}>Checkout</h1>

      {/* Order Items Summary */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 className="heading-section">Your order</h2>
        {cart.map((item) => (
          <div key={item._id} className="order-item-row">
            <span>{item.name} × {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="order-item-row" style={{ fontWeight: '500', borderBottom: 'none', paddingTop: '8px' }}>
          <span>Total</span>
          <span className="price">₹{cartTotal}</span>
        </div>
      </div>

      <hr className="divider-thin" />

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="checkout-form" id="checkout-form">
        <h2 className="heading-section" style={{ marginBottom: 'var(--space-md)' }}>Delivery details</h2>

        {error && (
          <div className="checkout-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="name">Full name</label>
          <input type="text" name="name" id="name" className="input-field" value={form.name} onChange={handleChange} placeholder="Your full name" />
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input type="email" name="email" id="email" className="input-field" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="phone">Phone</label>
            <input type="tel" name="phone" id="phone" className="input-field" value={form.phone} onChange={handleChange} placeholder="10-digit number" />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="address">Address</label>
          <textarea name="address" id="address" className="input-field" value={form.address} onChange={handleChange} placeholder="Street address" rows="2" style={{ resize: 'vertical' }} />
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label" htmlFor="city">City</label>
            <input type="text" name="city" id="city" className="input-field" value={form.city} onChange={handleChange} placeholder="City" />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="state">State</label>
            <input type="text" name="state" id="state" className="input-field" value={form.state} onChange={handleChange} placeholder="State" />
          </div>
        </div>

        <div className="input-group" style={{ maxWidth: '200px' }}>
          <label className="input-label" htmlFor="pincode">Pincode</label>
          <input type="text" name="pincode" id="pincode" className="input-field" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
          id="pay-button"
          style={{ marginTop: 'var(--space-md)' }}
        >
          {loading ? 'Processing...' : `Pay ₹${cartTotal}`}
        </button>

        <p className="text-muted" style={{ textAlign: 'center', marginTop: 'var(--space-sm)' }}>
          Secured by Razorpay. You'll be redirected to complete payment.
        </p>
      </form>
    </div>
  );
};

export default Checkout;
