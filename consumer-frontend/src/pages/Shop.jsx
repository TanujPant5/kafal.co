import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API}/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory) params.category = activeCategory;
        if (searchTerm) params.search = searchTerm;

        const res = await axios.get(`${API}/products`, { params });
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [activeCategory, searchTerm]);

  const handleCategoryClick = (catId) => {
    if (catId === activeCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="page-container shop-page">
      <h1 className="heading-primary shop-title">Shop</h1>

      {/* Search */}
      <div className="search-bar" id="shop-search">
        <Search size={18} className="search-bar-icon" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {/* Category Filter Pills */}
      <div className="category-pills" id="category-filters">
        <button
          className={`category-pill ${!activeCategory ? 'active' : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`category-pill ${activeCategory === cat._id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <hr className="divider-thin" />

      {/* Products Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏔️</div>
          <p>No products found</p>
          <p className="text-muted">Try a different search or category</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
