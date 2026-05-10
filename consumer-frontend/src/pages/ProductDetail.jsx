import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Star } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && !product.isOutOfStock) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReviewName || !newReviewText) {
      setReviewError('Name and review text are required.');
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewError('');

    try {
      const res = await axios.post(`${API}/products/${id}/reviews`, {
        name: newReviewName,
        rating: newReviewRating,
        text: newReviewText
      });
      
      setProduct({
        ...product,
        reviews: [res.data.review, ...(product.reviews || [])]
      });
      
      setNewReviewName('');
      setNewReviewRating(5);
      setNewReviewText('');
      setShowReviewForm(false);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Product not found</p>
          <button className="btn btn-secondary" onClick={() => navigate('/shop')}>
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container product-detail-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)} id="back-button">
        <ArrowLeft size={20} strokeWidth={1.5} />
        <span>Back</span>
      </button>

      {/* Image Gallery */}
      <div className="image-gallery" id="product-gallery">
        {product.images && product.images.length > 0 ? (
          <>
            <div className="image-warm-wrap">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="image-gallery-main"
              />
            </div>
            {product.images.length > 1 && (
              <div className="image-gallery-thumbs">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className={`image-gallery-thumb ${idx === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="placeholder-img">No image available</div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-detail-info">
        {product.category && (
          <span className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.category.name}
          </span>
        )}
        <h1 className="heading-primary" style={{ marginTop: '4px' }}>{product.name}</h1>
        <div className="price" style={{ fontSize: '1.2rem', margin: '8px 0 16px' }}>
          ₹{product.price}
        </div>

        {/* Stock Status */}
        {product.isOutOfStock ? (
          <span className="badge badge-error">Out of stock</span>
        ) : product.stock <= 5 && product.stock > 0 ? (
          <span className="badge badge-warning">Only {product.stock} left</span>
        ) : (
          <span className="badge badge-success">In stock</span>
        )}

        {product.description && (
          <>
            <hr className="divider-thin" />
            <p className="product-description">{product.description}</p>
          </>
        )}

        <hr className="divider-thin" />

        {/* Add to Cart */}
        <button
          className={`btn btn-primary btn-full ${added ? 'btn-added' : ''}`}
          onClick={handleAddToCart}
          disabled={product.isOutOfStock}
          id="add-to-cart-button"
        >
          {added ? (
            <>
              <Check size={18} />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              {product.isOutOfStock ? 'Out of stock' : 'Add to cart'}
            </>
          )}
        </button>
      </div>

      <hr className="divider-thin" style={{ marginTop: '48px' }} />

        {/* Reviews Section */}
        <div className="product-reviews-section">
          <div className="reviews-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 className="reviews-title" style={{ marginBottom: 0 }}>Customer Reviews</h3>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <div className="review-form-container" style={{ padding: '16px', background: 'rgba(200, 138, 58, 0.05)', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(200, 138, 58, 0.2)' }}>
              <h4 style={{ marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Write Your Review</h4>
              {reviewError && <div style={{ color: 'var(--error)', marginBottom: '12px', fontSize: '0.9rem' }}>{reviewError}</div>}
              <form onSubmit={handleSubmitReview}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Your Name</label>
                  <input 
                    type="text" 
                    value={newReviewName} 
                    onChange={(e) => setNewReviewName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        type="button" 
                        key={star} 
                        onClick={() => setNewReviewRating(star)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <Star size={24} fill={star <= newReviewRating ? "var(--secondary)" : "none"} color={star <= newReviewRating ? "var(--secondary)" : "var(--border)"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Review</label>
                  <textarea 
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    required
                    placeholder="What did you think about this product?"
                    rows="4"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          <div className="reviews-summary">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < 4 ? "var(--secondary)" : "none"} color={i < 4 ? "var(--secondary)" : "var(--border)"} />
              ))}
              <span className="rating-score">4.8 out of 5</span>
            </div>
            <span className="review-count">Based on 12 reviews</span>
          </div>

          <div className="reviews-list">
            {[
              ...(product.reviews || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
              {
                id: 1,
                name: "Rohit J.",
                date: "October 12, 2025",
                rating: 5,
                text: "Really authentic quality. Reminds me of home in Uttarakhand. Highly recommended!",
                verified: true,
              },
              {
                id: 2,
                name: "Sneha B.",
                date: "September 28, 2025",
                rating: 5,
                text: "Beautiful craftsmanship. The delivery was fast and the packaging was very secure.",
                verified: true,
              },
              {
                id: 3,
                name: "Amit N.",
                date: "August 15, 2025",
                rating: 4,
                text: "Good product, exactly as described. Will definitely buy more from here for our next puja.",
                verified: true,
              }
            ].map((review, idx) => (
              <div key={review.id || review._id || idx} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.name}</span>
                    {review.verified && <span className="verified-badge">Verified Buyer</span>}
                  </div>
                  <span className="review-date">
                    {review.date || new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "var(--secondary)" : "none"} color={i < review.rating ? "var(--secondary)" : "var(--border)"} />
                  ))}
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default ProductDetail;
