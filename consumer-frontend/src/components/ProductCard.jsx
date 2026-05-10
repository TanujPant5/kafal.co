import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.isOutOfStock) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
      });
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card animate-fade-up" id={`product-${product._id}`}>
      <div className="image-warm-wrap product-card-img-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="product-card-image" loading="lazy" />
        ) : (
          <div className="placeholder-img"><span>No image</span></div>
        )}
        {/* Quick add button overlay */}
        {!product.isOutOfStock && (
          <button className="product-card-quick-add" onClick={handleQuickAdd} title="Add to cart">
            <ShoppingCart size={16} />
          </button>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-bottom">
          <div className="product-card-price">₹{product.price}</div>
          {product.isOutOfStock && (
            <span className="badge badge-error">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
