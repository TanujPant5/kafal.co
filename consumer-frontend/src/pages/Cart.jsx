import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="page-container cart-page">
        <h1 className="heading-primary" style={{ marginBottom: 'var(--space-lg)' }}>Cart</h1>
        <div className="empty-state">
          <div className="empty-state-icon">
            <ShoppingBag size={40} strokeWidth={1} />
          </div>
          <p style={{ marginBottom: '8px' }}>Your cart is empty</p>
          <p className="text-muted" style={{ marginBottom: '16px' }}>Browse products and add something you like</p>
          <Link to="/shop" className="btn btn-primary">Browse shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container cart-page">
      <h1 className="heading-primary">Cart</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
        {cartCount} {cartCount === 1 ? 'item' : 'items'}
      </p>

      {/* Cart Items */}
      <div className="cart-items" id="cart-items-list">
        {cart.map((item) => (
          <div key={item._id} className="cart-item">
            {item.image ? (
              <img src={item.image} alt={item.name} className="cart-item-image" />
            ) : (
              <div className="cart-item-image placeholder-img" style={{ width: '80px', height: '80px', fontSize: '0.65rem' }}>
                No img
              </div>
            )}
            <div className="cart-item-details">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">₹{item.price}</div>
              <div className="cart-item-controls">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item._id)}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="order-summary" id="order-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{cartTotal}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span className="text-muted">Calculated at checkout</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span className="price" style={{ fontSize: '1.1rem' }}>₹{cartTotal}</span>
        </div>
        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: 'var(--space-md)' }}
          onClick={() => navigate('/checkout')}
          id="checkout-button"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
