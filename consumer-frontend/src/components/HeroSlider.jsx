import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import './HeroSlider.css';

const fallbackSlides = [
  {
    title: 'पहाड़ों की असली पहचान',
    subtitle: 'Authentic Pahadi goods — janeu, pichodi, aipan art, and more — handcrafted in the hills of Uttarakhand.',
    bg: 'linear-gradient(135deg, #3B2F2F 0%, #5C3D2E 50%, #2E1F1A 100%)',
  },
  {
    title: 'Rooted in Tradition',
    subtitle: 'Every piece carries generations of Kumaoni and Garhwali heritage. Handmade, never mass-produced.',
    bg: 'linear-gradient(135deg, #2E3B2E 0%, #3B5E45 50%, #1A2E1A 100%)',
  },
  {
    title: 'असली पहाड़ी, असली परंपरा',
    subtitle: 'Sacred threads, traditional fabrics, devotional items, and Pahadi essentials — delivered to your door.',
    bg: 'linear-gradient(135deg, #4A1A1A 0%, #6B2D2D 50%, #3A1515 100%)',
  },
];

const bgCycle = [
  'linear-gradient(135deg, #3B2F2F 0%, #5C3D2E 50%, #2E1F1A 100%)',
  'linear-gradient(135deg, #2E3B2E 0%, #3B5E45 50%, #1A2E1A 100%)',
  'linear-gradient(135deg, #4A1A1A 0%, #6B2D2D 50%, #3A1515 100%)',
  'linear-gradient(135deg, #2E2B3B 0%, #3D3B5E 50%, #1A1A2E 100%)',
];

const HeroSlider = ({ products = [] }) => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Build slides from actual products if available, else use fallback
  const slides = products.length > 0
    ? products.map((p, i) => ({
        title: p.name,
        subtitle: p.description || 'Authentic Pahadi goods from Uttarakhand.',
        productImage: p.images?.[0] || null,
        productPrice: p.price,
        productId: p._id,
        bg: bgCycle[i % bgCycle.length],
      }))
    : fallbackSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setAnimating(false);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (idx) => {
    if (idx === current || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  };

  const goPrev = () => goTo((current - 1 + slides.length) % slides.length);
  const goNext = () => goTo((current + 1) % slides.length);

  const slide = slides[current];

  return (
    <section className="hero-slider" style={{ background: slide.bg }}>
      <div className={`hero-slider-content ${animating ? 'fade-out' : 'fade-in'}`}>
        <div className="hero-text-side">
          <span className="hero-tag">kafal.co — Authentic Pahadi Goods</span>
          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-subtitle">{slide.subtitle}</p>
          <div className="hero-actions">
            {slide.productId ? (
              <Link to={`/product/${slide.productId}`} className="hero-btn-primary">
                View Product <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/shop" className="hero-btn-primary">
                Shop Now <ArrowRight size={16} />
              </Link>
            )}
            <Link to="/shop" className="hero-btn-secondary">
              Browse All
            </Link>
          </div>
        </div>

        {slide.productImage && (
          <div className="hero-product-side">
            <Link to={`/product/${slide.productId}`} className="hero-product-card">
              <img src={slide.productImage} alt={slide.title} className="hero-product-img" />
              <div className="hero-product-info">
                <span className="hero-product-name">{slide.title}</span>
                {slide.productPrice && <span className="hero-product-price">₹{slide.productPrice}</span>}
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Arrow controls */}
      {slides.length > 1 && (
        <>
          <button className="hero-arrow hero-arrow-left" onClick={goPrev} aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <button className="hero-arrow hero-arrow-right" onClick={goNext} aria-label="Next slide">
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="hero-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`hero-dot ${idx === current ? 'active' : ''}`}
            onClick={() => goTo(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
