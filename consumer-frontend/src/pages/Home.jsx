import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import HeroSlider from '../components/HeroSlider';
import FeatureBar from '../components/FeatureBar';
import ProductCard from '../components/ProductCard';
import './Home.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/categories`),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featured = products.slice(0, 8);
  const latest = products.slice(0, 4);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Slideshow — shows actual products */}
      <HeroSlider products={featured.slice(0, 4)} />

      {/* Feature Highlights */}
      <FeatureBar />



      {/* Featured Products — horizontal scroll */}
      {featured.length > 0 && (
        <section className="home-section page-container animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h2 className="heading-section">Fresh Picks</h2>
            <Link to="/shop" className="section-link">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="scroll-section">
            <div className="scroll-row stagger-children">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Story / About Section */}
      <section className="home-story animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="home-story-inner page-container">
          <span className="home-story-tag">Our Heritage</span>
          <h2 className="home-story-title">असली पहाड़ी, असली परंपरा</h2>
          <p className="home-story-text text-hindi">
            कुमाऊं और गढ़वाल की सदियों पुरानी परंपरा को आपके घर तक लाना — यही हमारा मकसद है।
            जनेऊ, पिछौड़ी, ऐपण, और पहाड़ी पूजा सामग्री — सब कुछ असली और हाथ से बना हुआ।
          </p>
          <p className="home-story-text-en">
            Authentic Kumaoni and Garhwali heritage goods — sacred threads (janeu), traditional pichodi fabrics,
            handpainted Aipan art, and devotional essentials. Every piece is handcrafted by local artisans in Uttarakhand.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Explore Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* New Arrivals Grid */}
      {latest.length > 0 && (
        <section className="home-section page-container animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="section-header">
            <h2 className="heading-section">New Arrivals</h2>
            <Link to="/shop" className="section-link">Shop all <ArrowRight size={14} /></Link>
          </div>
          <div className="product-grid stagger-children">
            {latest.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="home-bottom-cta animate-fade-up" style={{ animationDelay: '0.5s' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 className="home-bottom-cta-title">पहाड़ की परंपरा, अब आपके द्वार</h2>
          <p className="text-muted" style={{ marginBottom: '16px', maxWidth: '440px', marginInline: 'auto' }}>
            Authentic Pahadi goods delivered to your doorstep. Handcrafted by artisans, rooted in tradition. Free shipping on orders above ₹499.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
