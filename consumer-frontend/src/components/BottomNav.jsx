import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './BottomNav.css';

const BottomNav = () => {
  const { cartCount } = useCart();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: ShoppingBag, label: 'Shop' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { to: '/profile', icon: Package, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          end={item.to === '/'}
        >
          <span className="bottom-nav-icon-wrap">
            <item.icon size={22} strokeWidth={1.5} />
            {item.badge > 0 && (
              <span className="bottom-nav-badge">{item.badge > 9 ? '9+' : item.badge}</span>
            )}
          </span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
